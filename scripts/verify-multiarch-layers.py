#!/usr/bin/env python3
"""Fail if a multi-arch image reuses the amd64 base layer for arm64.

Manifest lists can advertise linux/arm64 while still containing amd64
binaries when an intermediate bake target omits platforms=.
"""

from __future__ import annotations

import json
import subprocess
import sys


def layer_digests(image: str, manifest_digest: str) -> list[str]:
    raw = subprocess.check_output(
        [
            "docker",
            "buildx",
            "imagetools",
            "inspect",
            f"{image}@{manifest_digest}",
            "--raw",
        ],
        text=True,
    )
    return [layer["digest"] for layer in json.loads(raw)["layers"]]


def verify(image: str) -> None:
    index = json.loads(
        subprocess.check_output(
            ["docker", "buildx", "imagetools", "inspect", image, "--raw"],
            text=True,
        )
    )
    layers_by_arch: dict[str, list[str]] = {}
    for manifest in index["manifests"]:
        platform = manifest.get("platform") or {}
        arch = platform.get("architecture")
        if arch in (None, "unknown"):
            continue
        layers_by_arch[arch] = layer_digests(image, manifest["digest"])

    if "amd64" not in layers_by_arch or "arm64" not in layers_by_arch:
        raise SystemExit(
            f"{image}: expected amd64 and arm64 manifests, got {sorted(layers_by_arch)}"
        )

    amd64_base = layers_by_arch["amd64"][0]
    arm64_base = layers_by_arch["arm64"][0]
    if amd64_base == arm64_base:
        raise SystemExit(
            f"{image}: amd64 and arm64 share base layer {amd64_base} "
            "(arm64 image is likely mislabeled amd64 content)"
        )

    print(f"{image}: amd64/arm64 base layers differ")


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print(f"usage: {argv[0]} IMAGE [IMAGE...]", file=sys.stderr)
        return 2
    for image in argv[1:]:
        verify(image)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
