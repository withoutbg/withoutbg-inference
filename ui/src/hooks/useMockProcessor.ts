"use client";

import { useState, useCallback } from "react";
import { generateMockAlphaMatte, compositeCutout } from "@/lib/mock-alpha";

export type ProcessingStep =
  | "idle"
  | "resizing"
  | "removing"
  | "compositing"
  | "done"
  | "error";

export interface ProcessorState {
  step: ProcessingStep;
  beforeImage: string | null;
  processedImage: string | null;
  alphaMatte: string | null;
  latencyMs: number | null;
  error: string | null;
  imageAspectRatio: number | null;
}

const INITIAL_STATE: ProcessorState = {
  step: "idle",
  beforeImage: null,
  processedImage: null,
  alphaMatte: null,
  latencyMs: null,
  error: null,
  imageAspectRatio: null,
};

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

/** Resize image to max 1024px on longest side, return data URL. */
async function prepareImage(src: string, maxPx = 1024): Promise<{ dataUrl: string; aspectRatio: number }> {
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

export function useMockProcessor() {
  const [state, setState] = useState<ProcessorState>(INITIAL_STATE);

  const process = useCallback(async (src: string) => {
    setState({ ...INITIAL_STATE, step: "resizing", beforeImage: src });

    try {
      // Step 1: resize
      await delay(300);
      const { dataUrl: prepared, aspectRatio } = await prepareImage(src);
      setState((s) => ({ ...s, step: "removing", beforeImage: prepared, imageAspectRatio: aspectRatio }));

      // Step 2: generate alpha matte (the expensive mock step)
      await delay(800);
      const alphaMatte = await generateMockAlphaMatte(prepared);
      setState((s) => ({ ...s, alphaMatte }));

      await delay(1000);
      setState((s) => ({ ...s, step: "compositing" }));

      // Step 3: composite
      await delay(400);
      const processedImage = await compositeCutout(prepared, alphaMatte);
      const latencyMs = 800 + Math.floor(Math.random() * 400);

      setState((s) => ({
        ...s,
        step: "done",
        processedImage,
        latencyMs,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        step: "error",
        error: err instanceof Error ? err.message : "Processing failed.",
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { ...state, process, reset };
}
