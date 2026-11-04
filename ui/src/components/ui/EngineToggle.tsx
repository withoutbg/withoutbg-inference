"use client";

import { useEffect, useState } from "react";
import { type Engine, fetchProAvailable, setEngine } from "@/lib/api-processor";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "wbg-engine";

function readStored(): Engine {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "pro" ? "pro" : "open";
  } catch {
    return "open";
  }
}

/**
 * Open weights / withoutBG Pro switch. Renders nothing unless the server has
 * WITHOUTBG_API_KEY set, so default installs never see it.
 */
export function EngineToggle() {
  const [available, setAvailable] = useState(false);
  const [engine, setLocal] = useState<Engine>("open");

  useEffect(() => {
    let cancelled = false;
    fetchProAvailable().then((ok) => {
      if (cancelled || !ok) return;
      const stored = readStored();
      setAvailable(true);
      setLocal(stored);
      setEngine(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!available) return null;

  const choose = (next: Engine) => {
    setLocal(next);
    setEngine(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage blocked: choice lasts for this tab only
    }
  };

  const option = (value: Engine, label: string, title: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={engine === value}
      title={title}
      onClick={() => choose(value)}
      className={cn(
        "rounded px-2 py-0.5 text-xs font-medium transition-colors",
        engine === value
          ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      )}
    >
      {label}
    </button>
  );

  return (
    <div
      role="radiogroup"
      aria-label="Engine"
      className="flex items-center gap-0.5 rounded-md bg-gray-100 p-0.5 dark:bg-gray-800"
    >
      {option("open", "Open weights", "Runs on this server. Images stay here.")}
      {option("pro", "Pro", "withoutBG Pro: images are sent to api.withoutbg.com, 1 credit each.")}
    </div>
  );
}
