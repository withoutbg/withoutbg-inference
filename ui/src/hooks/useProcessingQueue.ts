"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { generateMockAlphaMatte, compositeCutout } from "@/lib/mock-alpha";
import { apiProcessor } from "@/lib/api-processor";
import type { ProcessorFn } from "@/lib/processor";
import { incrementLifetimeProcessedCount, getLifetimeProcessedCount } from "@/lib/star-prompt";
import type { ProcessingPhase } from "@/components/editor/ProcessingPreview";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type JobStatus = "queued" | "processing" | "done" | "error";

export interface Job {
  id: string;
  fileName: string;
  status: JobStatus;
  /** Original (full-res) data URL, set immediately on enqueue. */
  beforeImage: string;
  /** Prepared (resized) data URL, set once resizing completes. */
  preparedImage: string | null;
  processedImage: string | null;
  alphaMatte: string | null;
  latencyMs: number | null;
  aspectRatio: number | null;
  error: string | null;
  phase: ProcessingPhase | null;
}

// ---------------------------------------------------------------------------
// Helpers (same logic as useMockProcessor, kept local to this module)
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function prepareImage(
  src: string,
  maxPx = 1024
): Promise<{ dataUrl: string; aspectRatio: number }> {
  const img = await loadImage(src);
  const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
  return { dataUrl: canvas.toDataURL("image/png"), aspectRatio: w / h };
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ---------------------------------------------------------------------------
// Built-in mock processor — matches ProcessorFn signature.
// Swap this for a real API call and nothing else changes.
// ---------------------------------------------------------------------------

const mockProcessor: ProcessorFn = async (src: string) => {
  await delay(800);
  const alphaMatte = await generateMockAlphaMatte(src);
  await delay(1000);
  const processed = await compositeCutout(src, alphaMatte);
  const latencyMs = 800 + Math.floor(Math.random() * 400);
  return { processed, alphaMatte, latencyMs };
};

const defaultProcessor: ProcessorFn =
  process.env.NEXT_PUBLIC_USE_MOCK === "true" ? mockProcessor : apiProcessor;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const MAX_BATCH = 20;

export function useProcessingQueue(processor: ProcessorFn = defaultProcessor) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [lifetimeProcessedCount, setLifetimeProcessedCount] = useState(0);

  useEffect(() => {
    setLifetimeProcessedCount(getLifetimeProcessedCount());
  }, []);

  // Ref tracking whether the worker is currently running; avoids double-runs
  // when React re-renders without state changing.
  const workerRunning = useRef(false);

  // ── Helpers to mutate a single job by id ────────────────────────────────

  const patchJob = useCallback(
    (id: string, patch: Partial<Omit<Job, "id">>) => {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, ...patch } : j))
      );
    },
    []
  );

  // ── Enqueue ──────────────────────────────────────────────────────────────

  const enqueue = useCallback(
    async (files: File[]) => {
      const accepted = files
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, MAX_BATCH);

      if (!accepted.length) return;

      const newJobs: Job[] = await Promise.all(
        accepted.map(async (file) => {
          const beforeImage = await readFileAsDataURL(file);
          return {
            id: makeId(),
            fileName: file.name,
            status: "queued" as JobStatus,
            beforeImage,
            preparedImage: null,
            processedImage: null,
            alphaMatte: null,
            latencyMs: null,
            aspectRatio: null,
            error: null,
            phase: null,
          };
        })
      );

      setJobs((prev) => {
        const remaining =
          prev.length + newJobs.length > MAX_BATCH
            ? newJobs.slice(0, MAX_BATCH - prev.length)
            : newJobs;
        return [...prev, ...remaining];
      });
    },
    []
  );

  // ── Remove / reset ───────────────────────────────────────────────────────

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  const reset = useCallback(() => {
    setJobs([]);
    setCompletedCount(0);
    workerRunning.current = false;
  }, []);

  // ── Retry a failed job ───────────────────────────────────────────────────

  const retryJob = useCallback((id: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, status: "queued", error: null, phase: null }
          : j
      )
    );
  }, []);

  // ── Sequential worker ────────────────────────────────────────────────────

  useEffect(() => {
    const next = jobs.find((j) => j.status === "queued");
    if (!next || workerRunning.current) return;

    workerRunning.current = true;
    const id = next.id;

    (async () => {
      try {
        // Phase 1: resize / prepare
        patchJob(id, { status: "processing", phase: "uploading" });
        await delay(300);
        const { dataUrl: prepared, aspectRatio } = await prepareImage(
          next.beforeImage
        );
        patchJob(id, {
          preparedImage: prepared,
          aspectRatio,
          phase: "detecting",
        });

        // Phase 2+3: run the processor (mock or real API)
        patchJob(id, { phase: "removing-bg" });
        const result = await processor(prepared);

        patchJob(id, { phase: "completing" });
        await delay(200);

        patchJob(id, {
          status: "done",
          processedImage: result.processed,
          alphaMatte: result.alphaMatte,
          latencyMs: result.latencyMs,
          phase: null,
        });

        setCompletedCount((c) => c + 1);
        setLifetimeProcessedCount(incrementLifetimeProcessedCount());
      } catch (err) {
        patchJob(id, {
          status: "error",
          error: err instanceof Error ? err.message : "Processing failed.",
          phase: null,
        });
      } finally {
        workerRunning.current = false;
      }
    })();
  }, [jobs, patchJob, processor]);

  return {
    jobs,
    completedCount,
    lifetimeProcessedCount,
    enqueue,
    removeJob,
    retryJob,
    reset,
  };
}
