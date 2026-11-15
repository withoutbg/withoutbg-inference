"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { OSS_URL, proApiUrl, proSelfHostUrl, site, SUPPORT_URL } from "@/lib/product-links";
import { markPromptSeen, markStarred, type PromptKind } from "@/lib/conversion-prompt";

const STAR_BUTTON_ID = "github-star-button";

type Copy = {
  title: string;
  body: string;
  note?: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
};

const COPY: Record<PromptKind, Copy> = {
  star: {
    title: "Saving you time?",
    body: "A GitHub star helps other people find this project.",
    cta: { label: "Star on GitHub", href: OSS_URL },
  },
  api: {
    title: "Processing a lot of images?",
    body: "withoutBG Pro gives higher-quality edges with no server to run. 1 credit per image.",
    note: "Have a key? Set WITHOUTBG_API_KEY and WITHOUTBG_PRO_PASSWORD to use Pro in this app.",
    cta: { label: "See Pro API", href: proApiUrl("prompt-20") },
    secondary: {
      label: "Compare results",
      href: site("/compare/withoutbg-open-model-vs-pro-model", "prompt-20-compare"),
    },
  },
  selfhost: {
    title: "Running this at scale?",
    body: "Pro Model Self-Host is a sharper self-hosted model. It runs on your own CPU servers, and images never leave your network.",
    cta: { label: "See Pro Self-Host", href: proSelfHostUrl("prompt-100") },
    secondary: { label: "Donate", href: SUPPORT_URL },
  },
};

interface ConversionPromptProps {
  at: number;
  kind: PromptKind;
  onClose: () => void;
}

export default function ConversionPrompt({ at, kind, onClose }: ConversionPromptProps) {
  const copy = COPY[kind];

  // Showing counts as seen: one prompt per milestone, even if ignored.
  useEffect(() => {
    markPromptSeen(at);
  }, [at]);

  // Star prompt also points at the header star button.
  useEffect(() => {
    if (kind !== "star") return;
    const btn = document.getElementById(STAR_BUTTON_ID);
    btn?.classList.add("star-prompt-highlight");
    return () => btn?.classList.remove("star-prompt-highlight");
  }, [kind]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const onCta = () => {
    if (kind === "star") markStarred();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-label={copy.title}
      className="fixed bottom-4 right-4 z-[60] w-[min(calc(100vw-2rem),22rem)] rounded-xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-2.5 right-2.5 rounded p-1 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>

      <div className="pr-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{copy.title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{copy.body}</p>
        {copy.note && (
          <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-500">{copy.note}</p>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <a
          href={copy.cta.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onCta}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white transition-colors"
        >
          {copy.cta.label}
        </a>
        {copy.secondary && (
          <a
            href={copy.secondary.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            {copy.secondary.label}
          </a>
        )}
      </div>
    </div>
  );
}
