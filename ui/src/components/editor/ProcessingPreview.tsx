"use client";

import { useEffect, useState, type CSSProperties } from "react";

export type ProcessingPhase =
  | "uploading"
  | "detecting"
  | "removing-bg"
  | "completing";

interface ProcessingPreviewProps {
  beforeImage: string;
  phase: ProcessingPhase;
  alphaMatte: string | null;
  aspectRatio?: number | null;
}

const DETECTING_MESSAGES = [
  "Detecting subject",
  "Separating foreground",
  "Refining edges",
];

const cutoutMaskStyle = (alphaMatte: string): CSSProperties =>
  ({
    WebkitMaskImage: `url("${alphaMatte}")`,
    maskImage: `url("${alphaMatte}")`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSourceType: "luminance",
    WebkitMaskMode: "luminance",
    maskMode: "luminance",
  }) as CSSProperties;

export default function ProcessingPreview({
  beforeImage,
  phase,
  alphaMatte,
  aspectRatio,
}: ProcessingPreviewProps) {
  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    if (phase !== "detecting") return;
    const id = window.setInterval(() => {
      setMessageIdx((i) => (i + 1) % DETECTING_MESSAGES.length);
    }, 1400);
    return () => window.clearInterval(id);
  }, [phase]);

  const status =
    phase === "uploading"
      ? "Preparing image\u2026"
      : phase === "detecting"
        ? DETECTING_MESSAGES[messageIdx]
        : phase === "removing-bg"
          ? "Removing background"
          : "Finalizing";

  const showScan = phase === "detecting" || phase === "removing-bg";
  const showEdgeGlow = phase === "detecting" || phase === "removing-bg";
  const showMaskReveal = phase === "removing-bg" && !!alphaMatte;
  const dimImage = phase === "detecting" || phase === "removing-bg";

  const resolvedRatio = aspectRatio ?? 4 / 3;

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-wbg-surface"
      style={{ aspectRatio: resolvedRatio }}
      aria-live="polite"
      aria-label={`Processing image: ${status}`}
    >
      {/* Checkerboard (revealed as background fades) */}
      <div
        className={`absolute inset-0 bg-checker transition-opacity duration-500 ease-out ${
          showMaskReveal ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      />

      {/* Subject-only layer (masked with alpha matte) */}
      {alphaMatte && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-out ${
            showMaskReveal ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beforeImage}
            alt=""
            className="h-full w-full object-contain"
            style={cutoutMaskStyle(alphaMatte)}
            draggable={false}
          />
        </div>
      )}

      {/* Full image (fades out once cutout is ready) */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ease-out ${
          showMaskReveal ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeImage}
          alt="Uploaded image being processed"
          className={`h-full w-full object-contain transition-[filter] duration-500 ease-out ${
            dimImage ? "brightness-[0.92] contrast-[1.02]" : ""
          }`}
          draggable={false}
        />
      </div>

      {showEdgeGlow && <div className="wbg-edge-glow" aria-hidden />}
      {showScan && <div className="wbg-scan-line" aria-hidden />}

      {/* Status footer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent px-3 pb-2 pt-6">
        <div className="flex items-center gap-2">
          <span
            className="wbg-dot-pulse inline-block h-1.5 w-1.5 rounded-full bg-purple-400"
            style={{ boxShadow: "0 0 8px rgba(167, 123, 255, 0.7)" }}
            aria-hidden
          />
          <span className="text-xs font-medium tracking-wide text-white">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}
