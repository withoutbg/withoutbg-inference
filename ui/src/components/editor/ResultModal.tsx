"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { compositeCutout } from "@/lib/mock-alpha";
import { proApiUrl, proSelfHostUrl } from "@/lib/product-links";
import MaskEditor, { type MaskEditorResult } from "./MaskEditor";
import type { Job } from "@/hooks/useProcessingQueue";

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
  /** Smart brush edit; omitted when the server cannot edit. */
  onEdit?: (job: Job, keepMask: string | null, removeMask: string | null) => Promise<void>;
}

export default function ResultModal({
  job,
  doneJobs,
  onClose,
  onNavigate,
  onEdit,
}: ResultModalProps) {
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Full-resolution cutout for display; the editor caps the view at this size.
  const [full, setFull] = useState<{ src: string; width: number; height: number } | null>(null);

  useEffect(() => {
    setEditError(null);
  }, [job.id]);

  useEffect(() => {
    let alive = true;
    if (!job.alphaMatte) return;
    (async () => {
      const [src, orig] = await Promise.all([
        compositeCutout(job.beforeImage, job.alphaMatte!),
        loadImageEl(job.beforeImage),
      ]);
      if (alive) setFull({ src, width: orig.naturalWidth, height: orig.naturalHeight });
    })().catch(() => {});
    return () => {
      alive = false;
    };
  }, [job.beforeImage, job.alphaMatte]);

  const applyEdit = async ({ keepMask, removeMask }: MaskEditorResult) => {
    if (!onEdit) return;
    setEditBusy(true);
    setEditError(null);
    try {
      await onEdit(job, keepMask, removeMask);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Edit failed.");
    } finally {
      setEditBusy(false);
    }
  };
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

  if (!job.beforeImage || !job.processedImage || !job.alphaMatte) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-modal="true"
      role="dialog"
      aria-label={`Smart brush for ${job.fileName}`}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full h-[80vh] max-w-[80vw] w-[80vw] bg-wbg-page dark:bg-wbg-page rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl outline-none flex flex-col overflow-hidden"
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

        {/* Smart brush */}
        <div className="flex-1 min-h-0 p-4">
          {job.preparedImage && (
            <MaskEditor
              image={job.preparedImage}
              cutout={job.processedImage}
              displayCutout={full?.src}
              maxWidth={full?.width}
              aspectRatio={job.aspectRatio ?? 4 / 3}
              busy={editBusy}
              error={editError}
              onApply={applyEdit}
              onCancel={onClose}
              jobId={job.id}
              pro={job.engine === "pro"}
            />
          )}
        </div>

        {/* Upgrade paths, shown on open-weights results only */}
        {job.engine !== "pro" && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
            <span>Want sharper edges?</span>
            <a
              href={proApiUrl("result-modal-api")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Try withoutBG Pro API →
            </a>
            <a
              href={proSelfHostUrl("result-modal-selfhost")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              A sharper self-hosted model: Pro Self-Host →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
