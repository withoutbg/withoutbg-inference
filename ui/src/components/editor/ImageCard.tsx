"use client";

import { Download, RefreshCcw, X, Search } from "lucide-react";
import type { Job } from "@/hooks/useProcessingQueue";

// ---------------------------------------------------------------------------
// Phase label helper
// ---------------------------------------------------------------------------

function phaseLabel(job: Job): string {
  switch (job.phase) {
    case "uploading":
      return "Preparing…";
    case "detecting":
      return "Detecting subject…";
    case "removing-bg":
      return "Removing background…";
    case "completing":
      return "Finalizing…";
    default:
      return "Processing…";
  }
}

// ---------------------------------------------------------------------------
// Download helper
// ---------------------------------------------------------------------------

async function downloadJob(job: Job) {
  if (!job.processedImage) return;
  const link = document.createElement("a");
  link.href = job.processedImage;
  const base = job.fileName.replace(/\.[^.]+$/, "");
  link.download = `${base}-withoutbg.png`;
  link.click();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ImageCardProps {
  job: Job;
  onCompare: () => void;
  onRemove: () => void;
  onRetry: () => void;
}

export default function ImageCard({
  job,
  onCompare,
  onRemove,
  onRetry,
}: ImageCardProps) {
  const thumbnailSrc =
    job.status === "done" && job.processedImage
      ? job.processedImage
      : job.beforeImage;

  return (
    <div className="group relative flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 bg-wbg-surface overflow-hidden animate-fade-in-up">
      {/* Thumbnail area */}
      <div
        className={`relative aspect-square overflow-hidden ${
          job.status === "done" ? "bg-checker" : "bg-wbg-page"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailSrc}
          alt={job.fileName}
          className={`h-full w-full object-contain transition-opacity duration-300 ${
            job.status === "queued" ? "opacity-40" : "opacity-100"
          }`}
          draggable={false}
        />

        {/* Processing overlay */}
        {job.status === "processing" && (
          <>
            <div className="wbg-edge-glow absolute inset-0 rounded-none" aria-hidden />
            <div className="wbg-scan-line" aria-hidden />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-2 pb-1.5 pt-5">
              <div className="flex items-center gap-1.5">
                <span
                  className="wbg-dot-pulse inline-block h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0"
                  style={{ boxShadow: "0 0 8px rgba(167,123,255,0.7)" }}
                  aria-hidden
                />
                <span className="text-[10px] font-medium tracking-wide text-white leading-tight">
                  {phaseLabel(job)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Status badge — queued */}
        {job.status === "queued" && (
          <span className="absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium bg-gray-900/70 text-white">
            Queued
          </span>
        )}

        {/* Status badge — error */}
        {job.status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/40">
            <span className="rounded px-2 py-1 text-[10px] font-medium bg-red-600 text-white text-center max-w-[80%]">
              Failed
            </span>
          </div>
        )}

        {/* Hover overlay — done */}
        {job.status === "done" && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-black/30">
            <button
              onClick={onCompare}
              aria-label={`Compare result for ${job.fileName}`}
              className="inline-flex items-center gap-1 rounded-md bg-white/95 dark:bg-gray-900/95 px-2.5 py-1.5 text-xs font-medium text-gray-800 dark:text-gray-100 shadow hover:bg-white dark:hover:bg-gray-800 transition-colors"
            >
              <Search className="h-3 w-3" aria-hidden />
              Compare
            </button>
            <button
              onClick={() => downloadJob(job)}
              aria-label={`Download ${job.fileName} cutout`}
              className="inline-flex items-center gap-1 rounded-md bg-white/95 dark:bg-gray-900/95 px-2.5 py-1.5 text-xs font-medium text-gray-800 dark:text-gray-100 shadow hover:bg-white dark:hover:bg-gray-800 transition-colors"
            >
              <Download className="h-3 w-3" aria-hidden />
              Save
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-1 px-2 py-1.5 min-w-0">
        <p
          className="text-xs text-gray-600 dark:text-gray-400 truncate leading-tight"
          title={job.fileName}
        >
          {job.fileName}
        </p>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {job.status === "error" && (
            <button
              onClick={onRetry}
              aria-label={`Retry ${job.fileName}`}
              className="rounded p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <RefreshCcw className="h-3 w-3" aria-hidden />
            </button>
          )}
          <button
            onClick={onRemove}
            aria-label={`Remove ${job.fileName}`}
            className="rounded p-1 text-gray-300 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
