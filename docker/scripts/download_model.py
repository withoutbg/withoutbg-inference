#!/usr/bin/env python3
"""Download and verify the withoutBG ONNX model from Hugging Face."""

from __future__ import annotations

import hashlib
import os
import sys
from pathlib import Path

from huggingface_hub import hf_hub_download


def main() -> None:
    if len(sys.argv) != 5:
        raise SystemExit(
            "usage: download_model.py <repo_id> <model_file> <expected_sha256> <dest_dir>"
        )

    repo_id, model_file, expected_sha256, dest_dir = sys.argv[1:5]
    token = os.environ.get("HF_TOKEN") or None
    os.makedirs(dest_dir, exist_ok=True)

    for filename in (model_file, f"{model_file}.json"):
        hf_hub_download(
            repo_id=repo_id,
            filename=filename,
            local_dir=dest_dir,
            token=token,
        )

    model_path = Path(dest_dir) / model_file
    actual_sha256 = hashlib.sha256(model_path.read_bytes()).hexdigest()
    if actual_sha256 != expected_sha256:
        raise SystemExit(
            f"SHA256 mismatch for {model_file}: "
            f"expected {expected_sha256}, got {actual_sha256}"
        )

    print(f"Downloaded and verified {model_file} ({actual_sha256})")


if __name__ == "__main__":
    main()
