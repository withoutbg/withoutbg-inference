"""Prepare ONNX graphs for CUDAExecutionProvider."""

from __future__ import annotations

import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_CUDA_UNSUPPORTED_FUSED_CONV_ACTIVATIONS = frozenset({"Sigmoid"})


def cuda_compatible_model_path(model_path: Path) -> Path:
    return model_path.with_name(f"{model_path.stem}.cuda{model_path.suffix}")


def _fused_conv_activation(node) -> str | None:
    for attr in node.attribute:
        if attr.name == "activation":
            value = attr.s
            return value.decode() if isinstance(value, bytes) else value
    return None


def prepare_model_for_cuda(
    model_path: Path, output_path: Path | None = None
) -> Path:
    """Defuse FusedConv nodes that CUDA cannot execute.

    The published model is offline-optimized for CPU and contains FusedConv nodes
    with Sigmoid activation. CUDAExecutionProvider only supports ReLU in FusedConv.
    """
    import onnx
    from onnx import helper

    output_path = output_path or cuda_compatible_model_path(model_path)
    if (
        output_path.is_file()
        and output_path.stat().st_mtime >= model_path.stat().st_mtime
    ):
        return output_path

    model = onnx.load(str(model_path))
    new_nodes = []
    defused = 0

    for node in model.graph.node:
        if node.op_type != "FusedConv":
            new_nodes.append(node)
            continue

        activation = _fused_conv_activation(node)
        if activation in _CUDA_UNSUPPORTED_FUSED_CONV_ACTIVATIONS:
            conv_attrs = {
                attr.name: helper.get_attribute_value(attr)
                for attr in node.attribute
                if attr.name != "activation"
            }
            mid = f"{node.output[0]}_pre_{activation.lower()}"
            conv_node = helper.make_node(
                "Conv", node.input, [mid], f"{node.name}_conv", **conv_attrs
            )
            act_node = helper.make_node(
                activation, [mid], node.output, f"{node.name}_{activation.lower()}"
            )
            new_nodes.extend([conv_node, act_node])
            defused += 1
        else:
            new_nodes.append(node)

    if defused == 0:
        return model_path

    del model.graph.node[:]
    model.graph.node.extend(new_nodes)
    onnx.checker.check_model(model)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    onnx.save(model, str(output_path))
    logger.info(
        "Prepared CUDA-compatible model: defused=%d src=%s dst=%s",
        defused,
        model_path,
        output_path,
    )
    return output_path
