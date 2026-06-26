"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { RotateCcw, Download, Upload } from "lucide-react";
import JSZip from "jszip";
import { useProcessingQueue, MAX_BATCH } from "@/hooks/useProcessingQueue";
import QueueGrid from "./QueueGrid";
import ResultModal from "./ResultModal";
import StarModal from "@/components/conversion/StarModal";
import {
  milestoneToShow,
  starPromptComplete,
  type StarMilestone,
} from "@/lib/star-prompt";
import PasteShortcutKbd from "@/components/ui/PasteShortcutKbd";
import { ProductLinks } from "@/components/ui/ProductLinks";

// ---------------------------------------------------------------------------
// Main editor
// ---------------------------------------------------------------------------

export default function BackgroundRemovalEditor() {
  const { jobs, completedCount, lifetimeProcessedCount, enqueue, removeJob, retryJob, reset } =
    useProcessingQueue();

  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [starModalMilestone, setStarModalMilestone] = useState<StarMilestone | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const shownStarMilestonesRef = useRef<Set<StarMilestone>>(new Set());

  const hasJobs = jobs.length > 0;
  const doneJobs = jobs.filter((j) => j.status === "done");
  const queuedCount = jobs.filter((j) => j.status === "queued").length;
  const processingCount = jobs.filter((j) => j.status === "processing").length;
  const errorCount = jobs.filter((j) => j.status === "error").length;

  // ── Star modal trigger ───────────────────────────────────────────────────

  useEffect(() => {
    if (starPromptComplete()) return;

    const milestone = milestoneToShow(
      lifetimeProcessedCount,
      shownStarMilestonesRef.current
    );
    if (!milestone) return;

    shownStarMilestonesRef.current.add(milestone);
    const t = setTimeout(() => setStarModalMilestone(milestone), 900);
    return () => clearTimeout(t);
  }, [lifetimeProcessedCount]);

  // ── File ingestion ───────────────────────────────────────────────────────

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (!arr.length) return;
      const available = MAX_BATCH - jobs.length;
      if (available <= 0) return;
      enqueue(arr.slice(0, available));
    },
    [enqueue, jobs.length]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    // Reset so the same files can be re-uploaded
    e.target.value = "";
  };

  // ── Full-page drag overlay ───────────────────────────────────────────────

  useEffect(() => {
    const over = (e: globalThis.DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) {
        e.preventDefault();
        setIsDragOver(true);
      }
    };
    const leave = (e: globalThis.DragEvent) => {
      if (!e.relatedTarget) setIsDragOver(false);
    };
    const drop = (e: globalThis.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files);
    };
    document.addEventListener("dragover", over);
    document.addEventListener("dragleave", leave);
    document.addEventListener("drop", drop);
    return () => {
      document.removeEventListener("dragover", over);
      document.removeEventListener("dragleave", leave);
      document.removeEventListener("drop", drop);
    };
  }, [handleFiles]);

  // ── Clipboard paste (Ctrl/Cmd+V) ─────────────────────────────────────────

  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        try {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            const imageType = item.types.find((t) => t.startsWith("image/"));
            if (imageType) {
              const blob = await item.getType(imageType);
              handleFiles([new File([blob], "paste.png", { type: imageType })]);
              return;
            }
          }
        } catch {
          // clipboard.read() denied — silently skip
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleFiles]);

  // Note: drag/drop and clipboard paste are handled globally via the
  // document-level listeners above. Adding zone-level handlers here would
  // double-fire ingestion (both listeners live on the document node, so
  // stopPropagation can't prevent the sibling global listener).

  // ── Download all ──────────────────────────────────────────────────────────

  const handleDownloadAll = async () => {
    if (!doneJobs.length) return;
    const zip = new JSZip();
    const folder = zip.folder("withoutbg-results")!;
    for (const job of doneJobs) {
      if (!job.processedImage) continue;
      const base64 = job.processedImage.split(",")[1];
      const base = job.fileName.replace(/\.[^.]+$/, "");
      folder.file(`${base}-withoutbg.png`, base64, { base64: true });
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "withoutbg-results.zip";
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Result modal ──────────────────────────────────────────────────────────

  const selectedJob = selectedJobId
    ? jobs.find((j) => j.id === selectedJobId) ?? null
    : null;

  const openCompare = (id: string) => setSelectedJobId(id);
  const closeModal = () => setSelectedJobId(null);

  // ── Live region ───────────────────────────────────────────────────────────

  const liveMessage =
    processingCount > 0
      ? `Processing image ${doneJobs.length + 1}…`
      : completedCount > 0 && queuedCount === 0
        ? `All done. ${doneJobs.length} image${doneJobs.length !== 1 ? "s" : ""} processed.`
        : "";

  const atLimit = jobs.length >= MAX_BATCH;

  return (
    <div className="w-full space-y-5">
      <div aria-live="polite" aria-atomic className="sr-only">
        {liveMessage}
      </div>

      {/* Full-page drag overlay */}
      {isDragOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/90 dark:bg-gray-900/90 pointer-events-none border-4 border-dashed border-gray-400 dark:border-gray-500">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Drop images to remove backgrounds
          </p>
        </div>
      )}

      {/* ── Dropzone — large when empty, compact when jobs exist ── */}
      {!hasJobs ? (
        <div className="space-y-16">
        {/* Large empty-state dropzone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload images to remove their backgrounds"
          className="relative flex min-h-[280px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-wbg-page dark:bg-wbg-surface dark:border-gray-700 transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 overflow-hidden"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="rounded-full border border-gray-200 dark:border-gray-700 bg-wbg-surface p-4">
              <Upload className="h-6 w-6 text-gray-400" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Drop images, click, or paste <PasteShortcutKbd />
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                JPG, PNG, WEBP · up to {MAX_BATCH} images
              </p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleInputChange}
          />
        </div>

        <ProductLinks />
        </div>
      ) : (
        /* Compact add-more bar */
        <div className="flex items-center gap-3">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={atLimit}
            aria-label="Add more images"
            className={`inline-flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm font-medium transition-colors ${
              atLimit
                ? "border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-wbg-surface"
            }`}
          >
            <Upload className="h-4 w-4" aria-hidden />
            {atLimit ? `Limit reached (${MAX_BATCH})` : "Add more"}
          </button>

          {/* Status summary */}
          <div className="flex-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {processingCount > 0 && (
              <span className="flex items-center gap-1">
                <span
                  className="wbg-dot-pulse inline-block h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0"
                  style={{ boxShadow: "0 0 8px rgba(167,123,255,0.7)" }}
                  aria-hidden
                />
                Processing…
              </span>
            )}
            {doneJobs.length > 0 && (
              <span className="text-green-600 dark:text-green-500 font-medium">
                {doneJobs.length} done
              </span>
            )}
            {queuedCount > 0 && (
              <span>{queuedCount} queued</span>
            )}
            {errorCount > 0 && (
              <span className="text-red-500">{errorCount} failed</span>
            )}
          </div>

          {/* Batch actions */}
          <div className="flex items-center gap-1.5">
            {doneJobs.length > 1 && (
              <button
                onClick={handleDownloadAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                aria-label={`Download all ${doneJobs.length} results as ZIP`}
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                Download all
              </button>
            )}
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              aria-label="Clear all images"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Clear
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleInputChange}
          />
        </div>
      )}

      {/* ── Results grid ── */}
      {hasJobs && (
        <QueueGrid
          jobs={jobs}
          onCompare={openCompare}
          onRemove={removeJob}
          onRetry={retryJob}
          onAddMore={() => inputRef.current?.click()}
          atLimit={atLimit}
        />
      )}

      {/* ── Modals ── */}
      {selectedJob &&
        selectedJob.status === "done" &&
        selectedJob.processedImage &&
        selectedJob.alphaMatte && (
          <ResultModal
            job={selectedJob}
            doneJobs={doneJobs}
            onClose={closeModal}
            onNavigate={(id) => setSelectedJobId(id)}
          />
        )}

      {starModalMilestone && (
        <StarModal
          milestone={starModalMilestone}
          onClose={() => setStarModalMilestone(null)}
        />
      )}
    </div>
  );
}
