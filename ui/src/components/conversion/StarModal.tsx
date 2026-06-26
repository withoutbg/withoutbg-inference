"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  markStarPromptDismissed,
  markStarPromptStarred,
  type StarMilestone,
} from "@/lib/star-prompt";

const STAR_BUTTON_ID = "github-star-button";

interface StarModalProps {
  milestone: StarMilestone;
  onClose: () => void;
}

export default function StarModal({ milestone, onClose }: StarModalProps) {
  const calloutRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  const handleDismiss = useCallback(() => {
    markStarPromptDismissed(milestone);
    onClose();
  }, [milestone, onClose]);

  const handleStarClick = useCallback(() => {
    markStarPromptStarred();
    onClose();
  }, [onClose]);

  useEffect(() => {
    const updateAnchor = () => {
      const btn = document.getElementById(STAR_BUTTON_ID);
      if (btn) setAnchor(btn.getBoundingClientRect());
    };

    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, true);

    const btn = document.getElementById(STAR_BUTTON_ID);
    const header = btn?.closest("header");
    btn?.classList.add("star-prompt-highlight");
    header?.classList.add("star-prompt-active");
    btn?.addEventListener("click", handleStarClick);

    return () => {
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor, true);
      btn?.classList.remove("star-prompt-highlight");
      header?.classList.remove("star-prompt-active");
      btn?.removeEventListener("click", handleStarClick);
    };
  }, [handleStarClick]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleDismiss]);

  useEffect(() => {
    calloutRef.current?.focus();
  }, [anchor]);

  const calloutStyle: React.CSSProperties | undefined = anchor
    ? {
        top: anchor.bottom + 14,
        right: Math.max(16, window.innerWidth - anchor.right),
      }
    : undefined;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/90"
      onClick={handleDismiss}
      aria-modal="true"
      role="dialog"
      aria-label="Support this project"
    >
      {anchor && (
        <div
          ref={calloutRef}
          tabIndex={-1}
          style={calloutStyle}
          className="fixed w-[min(calc(100vw-2rem),18rem)] outline-none rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDismiss}
            aria-label="Close"
            className="absolute top-2.5 right-2.5 rounded p-1 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>

          <div
            className="absolute -top-2 right-6 h-4 w-4 rotate-45 border-l border-t border-gray-700 bg-gray-900"
            aria-hidden
          />

          <div className="pr-6">
            <h2 className="text-sm font-semibold text-white">
              Love the results?
            </h2>
            <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">
              Please support the project by leaving a star.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
