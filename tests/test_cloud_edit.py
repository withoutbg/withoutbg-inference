"""Pro Smart brush: the hosted API gets the photo and the strokes only (stateless)."""

from __future__ import annotations

import io

import pytest
from PIL import Image

from withoutbg_openweights.edit import EditInputError
from withoutbg_api import cloud


def _png(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture
def pro(monkeypatch):
    monkeypatch.setenv("WITHOUTBG_API_KEY", "server-key")
    seen: dict = {}

    def fake_post(png, key, masks=None):
        seen.update(png=png, key=key, masks=masks or {})
        out = io.BytesIO()
        Image.new("L", Image.open(io.BytesIO(png)).size, 255).save(out, "PNG")
        return out.getvalue()

    monkeypatch.setattr(cloud, "_post_alpha", fake_post)
    return seen


def test_edit_sends_strokes_not_matte(pro):
    photo = Image.new("RGB", (64, 48), (10, 20, 30))
    remove = Image.new("L", (64, 48), 0)
    remove.paste(255, (40, 30, 60, 44))
    result = cloud.infer_edit(photo, {"remove_mask": _png(remove), "matte": b"ignored"})

    assert set(pro["masks"]) == {"remove_mask"}
    assert result.cutout.size == (64, 48) and result.cutout.mode == "RGBA"
    assert result.edit_context is None and result.route_pipeline == "pro"


def test_masks_resized_to_proxy(pro, monkeypatch):
    big = Image.new("RGB", (2048, 1024))
    keep = Image.new("L", (2048, 1024), 0)
    keep.paste(255, (0, 0, 100, 100))
    cloud.infer_edit(big, {"keep_mask": _png(keep)})

    with Image.open(io.BytesIO(pro["masks"]["keep_mask"])) as m:
        assert m.size == (1024, 512)
        assert m.getextrema() == (0, 255)


def test_edit_needs_a_stroke(pro):
    with pytest.raises(EditInputError):
        cloud.infer_edit(Image.new("RGB", (8, 8)), {"matte": b"x"})


def test_edit_rejects_mismatched_mask(pro):
    with pytest.raises(EditInputError):
        cloud.infer_edit(
            Image.new("RGB", (64, 48)), {"keep_mask": _png(Image.new("L", (10, 10), 255))}
        )


def test_edit_needs_server_key(monkeypatch):
    monkeypatch.delenv("WITHOUTBG_API_KEY", raising=False)
    with pytest.raises(cloud.CloudError):
        cloud.infer_edit(Image.new("RGB", (8, 8)), {"keep_mask": b""})


def test_infer_routes_pro_strokes_to_infer_edit(monkeypatch, pro):
    """engine=pro with strokes runs the stateless edit, not the plain Pro removal."""
    from withoutbg_api.routes.inference import _infer

    monkeypatch.setenv("WITHOUTBG_PRO_PASSWORD", "pw")
    photo = Image.new("RGB", (64, 48), (10, 20, 30))
    remove = Image.new("L", (64, 48), 0)
    remove.paste(255, (40, 30, 60, 44))
    result = _infer(None, photo, {"remove_mask": _png(remove)}, "pro", "pw", None)
    assert set(pro["masks"]) == {"remove_mask"}
    assert result.edit_context is None
