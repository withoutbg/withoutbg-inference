"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import ComparisonSlider from "./ComparisonSlider";
import type { Job } from "@/hooks/useProcessingQueue";

// ---------------------------------------------------------------------------
// Background picker (same options as before)
// ---------------------------------------------------------------------------

type BgType = "checkerboard" | "white" | "black";

const BG_OPTIONS: { type: BgType; label: string; preview: string }[] = [
  { type: "checkerboard", label: "Transparent", preview: "bg-checker" },
  { type: "white", label: "White", preview: "bg-white border border-gray-200 dark:border-gray-600" },
  { type: "black", label: "Black", preview: "bg-gray-900" },
];

function BgToolbar({
  active,
  onChange,
}: {
  active: BgType;
  onChange: (t: BgType) => void;
}) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Background style">
      {BG_OPTIONS.map((opt) => (
        <button
          key={opt.type}
          onClick={() => onChange(opt.type)}
          aria-pressed={active === opt.type}
          className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors ${
            active === opt.type
              ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          <span
            className={`h-3.5 w-3.5 rounded-sm inline-block flex-shrink-0 ${opt.preview}`}
            aria-hidden
          />
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image load helper for download
// ---------------------------------------------------------------------------

function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ---------------------------------------------------------------------------
// Main ResultModal component
// ---------------------------------------------------------------------------

interface ResultModalProps {
  job: Job;
  doneJobs: Job[];
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export default function ResultModal({
  job,
  doneJobs,
  onClose,
  onNavigate,
}: ResultModalProps) {
  const [bg, setBg] = useState<BgType>("checkerboard");
  const dialogRef = useRef<HTMLDivElement>(null);

  const currentIndex = doneJobs.findIndex((j) => j.id === job.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < doneJobs.length - 1;

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(doneJobs[currentIndex + 1].id);
  }, [hasNext, currentIndex, doneJobs, onNavigate]);

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(doneJobs[currentIndex - 1].id);
  }, [hasPrev, currentIndex, doneJobs, onNavigate]);

  // Keyboard navigation + Esc
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, goNext, goPrev]);

  // Trap scroll on body
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Focus dialog on mount
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const handleDownload = async () => {
    if (!job.processedImage) return;
    const img = await loadImageEl(job.processedImage);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    if (bg === "white") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bg === "black") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    const base = job.fileName.replace(/\.[^.]+$/, "");
    link.download = `${base}-withoutbg.png`;
    link.click();
  };

  const bgClass =
    bg === "white" ? "bg-white" : bg === "black" ? "bg-gray-900" : "bg-checker";

  if (!job.beforeImage || !job.processedImage || !job.alphaMatte) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-modal="true"
      role="dialog"
      aria-label={`Result for ${job.fileName}`}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-3xl bg-wbg-page dark:bg-wbg-page rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl outline-none flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {doneJobs.length > 1 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                {currentIndex + 1} / {doneJobs.length}
              </span>
            )}
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
              {job.fileName}
            </p>
            {job.latencyMs !== null && (
              <span className="hidden sm:inline font-mono text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                {job.latencyMs} ms
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {doneJobs.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  disabled={!hasPrev}
                  aria-label="Previous image"
                  className="rounded p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </button>
                <button
                  onClick={goNext}
                  disabled={!hasNext}
                  aria-label="Next image"
                  className="rounded p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors ml-1"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* Comparison area */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          <div className={`wbg-result-in overflow-hidden rounded-lg ${bgClass}`}>
            <ComparisonSlider
              before={job.beforeImage}
              alphaMatte={job.alphaMatte}
              altBefore="Original uploaded image"
              altCutout="Background removed result"
              aspectRatio={job.aspectRatio ?? 4 / 3}
            />
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <BgToolbar active={bg} onChange={setBg} />
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4" aria-hidden />
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
