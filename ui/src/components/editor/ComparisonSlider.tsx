"use client";

import { useCallback, useRef, useState } from "react";
import { GripVertical } from "lucide-react";

const INTENT_THRESHOLD = 4;

interface ComparisonSliderProps {
  before: string;
  alphaMatte: string;
  altBefore: string;
  altCutout: string;
  aspectRatio?: number;
  className?: string;
}

const cutoutMaskStyle = (alphaMatte: string): React.CSSProperties =>
  ({
    WebkitMaskImage: `url("${alphaMatte}")`,
    maskImage: `url("${alphaMatte}")`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    // Alpha mattes are grayscale RGB without an alpha channel; luminance mode
    // maps white → opaque, black → transparent.
    WebkitMaskSourceType: "luminance",
    WebkitMaskMode: "luminance",
    maskMode: "luminance",
  }) as React.CSSProperties;

export default function ComparisonSlider({
  before,
  alphaMatte,
  altBefore,
  altCutout,
  aspectRatio = 4 / 3,
  className = "",
}: ComparisonSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") {
      e.preventDefault();
      containerRef.current?.setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    } else {
      touchStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (containerRef.current?.hasPointerCapture(e.pointerId)) {
      updatePosition(e.clientX);
      return;
    }
    if (e.pointerType !== "mouse" && touchStartRef.current) {
      const dx = Math.abs(e.clientX - touchStartRef.current.x);
      const dy = Math.abs(e.clientY - touchStartRef.current.y);
      if (dx < INTENT_THRESHOLD && dy < INTENT_THRESHOLD) return;
      if (dx >= dy) {
        e.preventDefault();
        containerRef.current?.setPointerCapture(e.pointerId);
        updatePosition(e.clientX);
      } else {
        touchStartRef.current = null;
      }
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    touchStartRef.current = null;
    containerRef.current?.releasePointerCapture(e.pointerId);
  };

  const paddingBottom = `${(1 / aspectRatio) * 100}%`;

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={containerRef}
        className="relative w-full cursor-ew-resize select-none overflow-hidden border border-gray-200 dark:border-gray-800 bg-wbg-surface"
        style={{ paddingBottom, touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="slider"
        aria-label={`Compare original and cutout: ${altBefore}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-valuetext={`${Math.round(position)}% original, ${Math.round(100 - position)}% cutout`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 2));
          if (e.key === "ArrowRight") setPosition((p) => Math.min(100, p + 2));
        }}
      >
        {/* Original image (left side) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={before}
            alt={altBefore}
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>

        {/* Cutout (right side) */}
        <div
          className="absolute inset-0 bg-checker"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={before}
            alt={altCutout}
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain"
            style={cutoutMaskStyle(alphaMatte)}
          />
        </div>

        {/* Divider */}
        <div
          className="absolute inset-y-0 w-px bg-gray-900/80 dark:bg-white/80 pointer-events-none"
          style={{ left: `${position}%` }}
          aria-hidden
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-0 flex h-8 w-5 items-center justify-center rounded-sm border border-gray-300 bg-wbg-surface dark:border-gray-600">
            <GripVertical className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" aria-hidden />
          </div>
        </div>

        <span className="absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-600 bg-white/90 border border-gray-200 dark:text-gray-400 dark:bg-wbg-surface/90 dark:border-gray-700">
          Original
        </span>
        <span className="absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-600 bg-white/90 border border-gray-200 dark:text-gray-400 dark:bg-wbg-surface/90 dark:border-gray-700">
          Cutout
        </span>
      </div>
    </div>
  );
}
