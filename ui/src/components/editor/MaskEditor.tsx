"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Loader2, Minus, Plus, Undo2, Wand2 } from "lucide-react";
import { getProStrokes, setProStrokes } from "@/lib/pro-strokes";

export type BrushMode = "keep" | "remove";

export interface MaskEditorResult {
  keepMask: string | null;
  removeMask: string | null;
}

interface MaskEditorProps {
  /** Image the masks are painted for (the prepared image the server matted). */
  image: string;
  /** Current cutout, shown under the strokes. */
  cutout: string;
  aspectRatio: number;
  busy: boolean;
  error: string | null;
  onApply: (masks: MaskEditorResult) => void;
  onCancel: () => void;
  /** Job the strokes belong to (Pro keeps them per job). */
  jobId: string;
  /** Pro engine: every Apply resends all strokes, so they stay on the canvas. */
  pro?: boolean;
}

const COLORS: Record<BrushMode, string> = {
  keep: "rgba(34, 197, 94, 0.55)",
  remove: "rgba(239, 68, 68, 0.55)",
};
const MAX_UNDO = 30;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Black canvas with white strokes (the API's mask format), or null when empty. */
function maskDataUrl(src: HTMLCanvasElement): string | null {
  const ctx = src.getContext("2d")!;
  const { data } = ctx.getImageData(0, 0, src.width, src.height);
  let marked = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0) {
      marked = true;
      break;
    }
  }
  if (!marked) return null;
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const o = out.getContext("2d")!;
  o.fillStyle = "#000";
  o.fillRect(0, 0, out.width, out.height);
  o.drawImage(src, 0, 0);
  return out.toDataURL("image/png");
}

export default function MaskEditor({
  image,
  cutout,
  aspectRatio,
  busy,
  error,
  onApply,
  onCancel,
  jobId,
  pro = false,
}: MaskEditorProps) {
  const viewRef = useRef<HTMLCanvasElement>(null);
  // Strokes per mode, at the image's own size, painted opaque white.
  const keepRef = useRef<HTMLCanvasElement | null>(null);
  const removeRef = useRef<HTMLCanvasElement | null>(null);
  const undoRef = useRef<{ keep: ImageData; remove: ImageData }[]>([]);
  const drawing = useRef<{ x: number; y: number } | null>(null);
  const [mode, setMode] = useState<BrushMode>("remove");
  const [size, setSize] = useState(24);
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [undoCount, setUndoCount] = useState(0);
  const imgSize = useRef({ w: 0, h: 0 });

  // Size the stroke canvases to the image once it loads.
  useEffect(() => {
    let alive = true;
    loadImage(image).then((img) => {
      if (!alive) return;
      imgSize.current = { w: img.naturalWidth, h: img.naturalHeight };
      for (const ref of [keepRef, removeRef]) {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        ref.current = c;
      }
      // Pro: restore the job's strokes so the next Apply resends all of them.
      const saved = pro ? getProStrokes(jobId) : undefined;
      if (saved && saved.keep.width === img.naturalWidth && saved.keep.height === img.naturalHeight) {
        keepRef.current!.getContext("2d")!.putImageData(saved.keep, 0, 0);
        removeRef.current!.getContext("2d")!.putImageData(saved.remove, 0, 0);
      }
      const view = viewRef.current;
      if (view) {
        view.width = img.naturalWidth;
        view.height = img.naturalHeight;
      }
      redraw();
      // A sensible default brush: ~4% of the long side.
      setSize(Math.max(6, Math.round(Math.max(img.naturalWidth, img.naturalHeight) * 0.04)));
      undoRef.current = [];
      setUndoCount(0);
      setDirty(false);
      setReady(true);
    });
    return () => {
      alive = false;
    };
    // Sized once per image; pro/jobId are read at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  const redraw = useCallback(() => {
    const view = viewRef.current;
    if (!view || !keepRef.current || !removeRef.current) return;
    const ctx = view.getContext("2d")!;
    ctx.clearRect(0, 0, view.width, view.height);
    for (const m of ["keep", "remove"] as BrushMode[]) {
      const src = m === "keep" ? keepRef.current : removeRef.current;
      // Tint the white strokes with the mode colour.
      const tint = document.createElement("canvas");
      tint.width = src.width;
      tint.height = src.height;
      const t = tint.getContext("2d")!;
      t.drawImage(src, 0, 0);
      t.globalCompositeOperation = "source-in";
      t.fillStyle = COLORS[m];
      t.fillRect(0, 0, tint.width, tint.height);
      ctx.drawImage(tint, 0, 0);
    }
  }, []);

  const pushUndo = () => {
    const k = keepRef.current!;
    const r = removeRef.current!;
    undoRef.current.push({
      keep: k.getContext("2d")!.getImageData(0, 0, k.width, k.height),
      remove: r.getContext("2d")!.getImageData(0, 0, r.width, r.height),
    });
    if (undoRef.current.length > MAX_UNDO) undoRef.current.shift();
    setUndoCount(undoRef.current.length);
  };

  const toImage = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * imgSize.current.w,
      y: ((e.clientY - rect.top) / rect.height) * imgSize.current.h,
    };
  };

  const paint = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const target = mode === "keep" ? keepRef.current! : removeRef.current!;
    const other = mode === "keep" ? removeRef.current! : keepRef.current!;
    for (const [c, op] of [
      [target, "source-over"],
      [other, "destination-out"],
    ] as const) {
      const ctx = c.getContext("2d")!;
      ctx.globalCompositeOperation = op;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
    redraw();
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!ready || busy) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pushUndo();
    const p = toImage(e);
    drawing.current = p;
    paint(p, p);
    setDirty(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const p = toImage(e);
    paint(drawing.current, p);
    drawing.current = p;
  };
  const onPointerUp = () => {
    drawing.current = null;
  };

  const undo = () => {
    const last = undoRef.current.pop();
    if (!last) return;
    keepRef.current!.getContext("2d")!.putImageData(last.keep, 0, 0);
    removeRef.current!.getContext("2d")!.putImageData(last.remove, 0, 0);
    setUndoCount(undoRef.current.length);
    redraw();
  };

  const clear = () => {
    pushUndo();
    for (const c of [keepRef.current!, removeRef.current!]) {
      c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    }
    setDirty(false);
    redraw();
  };

  const apply = () => {
    const keepMask = maskDataUrl(keepRef.current!);
    const removeMask = maskDataUrl(removeRef.current!);
    if (!keepMask && !removeMask) return;
    if (pro) {
      // Keep the full stroke history: this Apply and every later one send it all.
      const k = keepRef.current!;
      const r = removeRef.current!;
      setProStrokes(jobId, {
        keep: k.getContext("2d")!.getImageData(0, 0, k.width, k.height),
        remove: r.getContext("2d")!.getImageData(0, 0, r.width, r.height),
      });
    }
    onApply({ keepMask, removeMask });
  };

  // Clear the strokes once the server returns the edited cutout (open weights).
  // Pro keeps them: the next Apply sends all of them again.
  const prevCutout = useRef(cutout);
  useEffect(() => {
    if (prevCutout.current !== cutout && keepRef.current && removeRef.current) {
      if (!pro) {
        for (const c of [keepRef.current, removeRef.current]) {
          c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
        }
      }
      undoRef.current = [];
      setUndoCount(0);
      setDirty(false);
      redraw();
    }
    prevCutout.current = cutout;
  }, [cutout, pro, redraw]);

  const modeButton = (m: BrushMode, label: string, dot: string) => (
    <button
      onClick={() => setMode(m)}
      aria-pressed={mode === m}
      className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
        mode === m
          ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
      }`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </button>
  );

  return (
    <div className="space-y-3">
      <div
        className="relative w-full overflow-hidden rounded-lg bg-checker select-none"
        style={{ aspectRatio }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" aria-hidden className="absolute inset-0 h-full w-full object-contain opacity-25" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cutout} alt="Current cutout" className="absolute inset-0 h-full w-full object-contain" />
        <canvas
          ref={viewRef}
          aria-label="Paint Keep or Remove strokes"
          className={`absolute inset-0 h-full w-full object-contain touch-none ${
            busy ? "cursor-wait" : "cursor-crosshair"
          }`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Loader2 className="h-6 w-6 animate-spin text-white" aria-hidden />
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Paint <span className="font-medium text-green-600 dark:text-green-400">Keep</span> over
        parts that went missing and <span className="font-medium text-red-600 dark:text-red-400">Remove</span> over
        parts that should go. One stroke on an object is enough; the rest of the image stays as it was.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1" role="group" aria-label="Brush">
          {modeButton("keep", "Keep", "bg-green-500")}
          {modeButton("remove", "Remove", "bg-red-500")}
        </div>
        <div className="flex items-center gap-1" aria-label="Brush size">
          <button
            onClick={() => setSize((s) => Math.max(2, Math.round(s / 1.4)))}
            aria-label="Smaller brush"
            className="rounded p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden />
          </button>
          <span className="w-10 text-center font-mono text-xs text-gray-500">{size}px</span>
          <button
            onClick={() => setSize((s) => Math.min(400, Math.round(s * 1.4)))}
            aria-label="Bigger brush"
            className="rounded p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
        <button
          onClick={undo}
          disabled={!undoCount || busy}
          aria-label="Undo stroke"
          className="rounded p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 dark:hover:text-gray-100"
        >
          <Undo2 className="h-4 w-4" aria-hidden />
        </button>
        <button
          onClick={clear}
          disabled={!dirty || busy}
          aria-label="Clear strokes"
          className="rounded p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 dark:hover:text-gray-100"
        >
          <Eraser className="h-4 w-4" aria-hidden />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Done
          </button>
          {pro && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Pro: 1 credit per Apply
            </span>
          )}
          <button
            onClick={apply}
            disabled={!dirty || busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            <Wand2 className="h-4 w-4" aria-hidden />
            Apply
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
