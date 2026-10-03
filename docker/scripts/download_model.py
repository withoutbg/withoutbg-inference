#!/usr/bin/env python3
"""Download and verify the withoutBG ONNX model bundle from Hugging Face."""

from __future__ import annotations

import hashlib
import json
import os
import sys
from pathlib import Path, PurePosixPath, PureWindowsPath

from huggingface_hub import hf_hub_download


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _is_bundle_relative(filename: str) -> bool:
    for path in (PurePosixPath(filename), PureWindowsPath(filename)):
        if path.anchor or ".." in path.parts or not path.name:
            return False
    return True


def main() -> None:
    if len(sys.argv) not in (5, 6):
        raise SystemExit(
            "usage: download_model.py <repo_id> <model_file> <expected_sha256> <dest_dir> [revision]"
        )

    repo_id, model_file, expected_sha256, dest_dir = sys.argv[1:5]
    revision = sys.argv[5] if len(sys.argv) == 6 and sys.argv[5] else None
    token = os.environ.get("HF_TOKEN") or None
    os.makedirs(dest_dir, exist_ok=True)

    def download(filename: str) -> Path:
        return Path(
            hf_hub_download(
                repo_id=repo_id,
                filename=filename,
                revision=revision,
                local_dir=dest_dir,
                token=token,
            )
        )

    model_path = download(model_file)
    sidecar_path = download(f"{model_file}.json")
    actual_sha256 = _sha256(model_path)
    if actual_sha256 != expected_sha256:
        raise SystemExit(
            f"SHA256 mismatch for {model_file}: "
            f"expected {expected_sha256}, got {actual_sha256}"
        )

    sidecar = json.loads(sidecar_path.read_text())
    if "pipeline" in sidecar:
        # Routed bundle: model_file is the matting graph; fetch the router and BiRefNet.
        # The runtime validates the full sidecar again on load.
        for name in ("router", "birefnet"):
            spec = sidecar[name]
            if not _is_bundle_relative(spec["file"]):
                raise SystemExit("Invalid bundle asset path")
            if _sha256(download(spec["file"])) != spec["sha256"]:
                raise SystemExit(f"Bundle SHA256 mismatch: {name}")
    print(f"Downloaded and verified {model_file} ({actual_sha256}) at {revision or 'main'}")


if __name__ == "__main__":
    main()
