/**
 * Generates a synthetic alpha matte for an uploaded image.
 *
 * The matte is a grayscale RGB image (no alpha channel) where white pixels
 * represent the foreground subject and black pixels represent the background.
 * This matches the format the real API returns, so the ComparisonSlider and
 * ProcessingPreview luminance-mask approach works identically.
 *
 * Strategy: soft radial gradient centered at 50/55% (head-room bias), scaled
 * to fill roughly 65% of the frame. This produces a plausible elliptical
 * "portrait" cutout shape for almost any photo.
 */
export async function generateMockAlphaMatte(src: string): Promise<string> {
  const img = await loadImage(src);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;

  const w = canvas.width;
  const h = canvas.height;

  // Draw a radial gradient: white center → black edge (grayscale matte)
  const cx = w * 0.5;
  const cy = h * 0.47; // slightly above center for portrait bias
  const rx = w * 0.38;
  const ry = h * 0.44;

  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Smooth falloff: 1 inside ellipse → 0 outside, with soft edge
      const t = Math.max(0, 1 - dist);
      const value = smoothstep(0, 1, t * 1.25) * 255;

      const i = (y * w + x) * 4;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255; // fully opaque (matte is RGB, not RGBA)
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");

  function smoothstep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
}

/** Use the alpha matte to composite a transparent PNG cutout. */
export async function compositeCutout(
  src: string,
  alphaMatte: string
): Promise<string> {
  const [orig, matte] = await Promise.all([loadImage(src), loadImage(alphaMatte)]);

  const canvas = document.createElement("canvas");
  canvas.width = orig.naturalWidth;
  canvas.height = orig.naturalHeight;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(orig, 0, 0);
  const origData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Draw matte at full size to sample per-pixel luminance
  const mCanvas = document.createElement("canvas");
  mCanvas.width = orig.naturalWidth;
  mCanvas.height = orig.naturalHeight;
  const mCtx = mCanvas.getContext("2d")!;
  mCtx.drawImage(matte, 0, 0, mCanvas.width, mCanvas.height);
  const matteData = mCtx.getImageData(0, 0, mCanvas.width, mCanvas.height);

  for (let i = 0; i < origData.data.length; i += 4) {
    // Luminance of the matte pixel → alpha of the output pixel
    origData.data[i + 3] = matteData.data[i]; // matte is grayscale, R = G = B
  }

  ctx.putImageData(origData, 0, 0);
  return canvas.toDataURL("image/png");
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
