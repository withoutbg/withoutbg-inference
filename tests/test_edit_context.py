"""Smart brush edit context: token round trip, and edits that skip the upstream graphs.

The pipeline tests need an Open Weights v4 bundle with the stroke-edit graph:
``WITHOUTBG_TEST_BUNDLE=/path/to/withoutbg-open-weights.onnx`` (default: a
sibling ``withoutbg-hf`` checkout). They are skipped without one.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import numpy as np
import pytest
from PIL import Image, ImageDraw

from withoutbg_openweights import edit_context as ec
from withoutbg_openweights.edit import KEEP, REMOVE, UNTOUCHED

CATEGORIES = ["fine_strand", "hard_opaque"]


def test_token_round_trip():
    rng = np.random.default_rng(0)
    depth = rng.random((1, 1, 448, 448), dtype=np.float32)
    ctx = ec.EditContext("hard_opaque", "0123456789abcdef", depth)
    back = ec.decode(ec.encode(ctx), CATEGORIES, 448)
    assert back is not None
    assert back.category == "hard_opaque" and back.fingerprint == "0123456789abcdef"
    assert back.depth.shape == (1, 1, 448, 448)
    assert np.abs(back.depth - depth).max() <= 0.5 / 65535 + 1e-7


@pytest.mark.parametrize(
    "token",
    [
        None,
        "",
        "garbage",
        "wbgctx1.unknown_cat.0123456789abcdef.AAAA",
        "wbgctx1.hard_opaque.XYZ.AAAA",
        "wbgctx1.hard_opaque.0123456789abcdef.not-base64!",
        "wbgctx2.hard_opaque.0123456789abcdef.AAAA",
    ],
)
def test_bad_tokens_decode_to_none(token):
    assert ec.decode(token, CATEGORIES, 448) is None


def test_wrong_size_decodes_to_none():
    ctx = ec.EditContext("fine_strand", "0123456789abcdef", np.zeros((1, 1, 64, 64), np.float32))
    assert ec.decode(ec.encode(ctx), CATEGORIES, 448) is None


def test_fingerprint_tracks_pixels_and_shape():
    a = np.zeros((4, 6, 3), np.uint8)
    b = a.copy()
    b[0, 0, 0] = 1
    assert ec.fingerprint(a) == ec.fingerprint(a.copy())
    assert ec.fingerprint(a) != ec.fingerprint(b)
    assert ec.fingerprint(a) != ec.fingerprint(a.reshape(6, 4, 3))


# ── Pipeline (real bundle) ───────────────────────────────────────────────────


def _bundle() -> Path | None:
    default = Path(__file__).resolve().parents[2] / "withoutbg-hf" / "withoutbg-open-weights.onnx"
    path = Path(os.environ.get("WITHOUTBG_TEST_BUNDLE", default))
    sidecar = path.with_suffix(path.suffix + ".json")
    if not sidecar.is_file() or "stroke_edit" not in json.loads(sidecar.read_text()):
        return None
    return path


@pytest.fixture(scope="module")
def pipeline():
    path = _bundle()
    if path is None:
        pytest.skip("no Open Weights v4 bundle with a stroke-edit graph")
    from withoutbg_openweights.routed import RoutedPipeline

    sidecar = json.loads(path.with_suffix(path.suffix + ".json").read_text())
    pipe = RoutedPipeline(sidecar, path.parent, providers=["CPUExecutionProvider"])
    calls: dict[str, int] = {}
    for name, session in list(pipe._sessions.items()):
        pipe._sessions[name] = _Counting(session, name, calls)
    pipe.calls = calls
    return pipe


class _Counting:
    def __init__(self, session, name, calls):
        self._session, self._name, self._calls = session, name, calls

    def run(self, *args, **kwargs):
        self._calls[self._name] = self._calls.get(self._name, 0) + 1
        return self._session.run(*args, **kwargs)


def _photo(w=320, h=240) -> Image.Image:
    img = Image.new("RGB", (w, h), (40, 120, 200))
    draw = ImageDraw.Draw(img)
    draw.ellipse((90, 50, 230, 200), fill=(230, 180, 90))
    draw.rectangle((10, 10, 60, 60), fill=(250, 250, 250))
    return img


def _strokes(w=320, h=240) -> np.ndarray:
    s = np.full((h, w), UNTOUCHED, np.float32)
    s[20:50, 20:50] = REMOVE
    s[110:140, 150:170] = KEEP
    return s


def test_edit_with_context_skips_router_and_coarse(pipeline):
    image, strokes = _photo(), _strokes()
    matte_img, _ = pipeline.estimate_alpha(image)
    matte = np.asarray(matte_img, np.float32) / 255.0

    pipeline.calls.clear()
    first, route, token = pipeline.edit_alpha(image, strokes, matte)
    assert pipeline.calls.get("router") == 1 and pipeline.calls.get("coarse") == 1
    assert token.startswith("wbgctx1." + route["category"] + ".")

    pipeline.calls.clear()
    second, route2, token2 = pipeline.edit_alpha(image, strokes, matte, token)
    assert pipeline.calls == {"stroke_edit": 1}
    assert token2 == token and route2 == route
    diff = np.abs(np.asarray(first, np.int16) - np.asarray(second, np.int16))
    assert diff.max() <= 1


def test_stale_context_recomputes(pipeline):
    image, strokes = _photo(), _strokes()
    matte = np.asarray(pipeline.estimate_alpha(image)[0], np.float32) / 255.0
    _, _, token = pipeline.edit_alpha(image, strokes, matte)

    other = _photo()
    other.putpixel((0, 0), (0, 0, 0))
    pipeline.calls.clear()
    _, _, fresh = pipeline.edit_alpha(other, strokes, matte, token)
    assert pipeline.calls.get("router") == 1 and pipeline.calls.get("coarse") == 1
    assert fresh != token

    pipeline.calls.clear()
    pipeline.edit_alpha(image, strokes, matte, "garbage")
    assert pipeline.calls.get("router") == 1


def test_context_without_matte_runs_full_pipeline(pipeline):
    image, strokes = _photo(), _strokes()
    matte = np.asarray(pipeline.estimate_alpha(image)[0], np.float32) / 255.0
    _, _, token = pipeline.edit_alpha(image, strokes, matte)
    pipeline.calls.clear()
    pipeline.edit_alpha(image, strokes, None, token)
    assert pipeline.calls.get("router") == 1
