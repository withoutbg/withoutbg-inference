"use client";

import { useEffect, useState } from "react";
import { ENGINE_RESET_EVENT, type Engine, fetchProAvailable, setEngine } from "@/lib/api-processor";
import { proApiUrl } from "@/lib/product-links";
import { cn } from "@/lib/utils";

const ENGINE_KEY = "wbg-engine";
const PASSWORD_KEY = "wbg-pro-password";

function read(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function write(key: string, value: string) {
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    // storage blocked: choice lasts for this tab only
  }
}

/**
 * Open weights / withoutBG Pro switch. Live only when the server has
 * WITHOUTBG_API_KEY and WITHOUTBG_PRO_PASSWORD set; picking Pro asks for the
 * server's Pro password once. Without them, a "Pro" link explains how to turn
 * it on and where to get a key.
 */
export function EngineToggle() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [engine, setLocal] = useState<Engine>("open");
  const [asking, setAsking] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchProAvailable().then((ok) => {
      if (cancelled) return;
      setAvailable(ok);
      if (!ok) return;
      const password = read(PASSWORD_KEY);
      if (read(ENGINE_KEY) === "pro" && password) {
        setLocal("pro");
        setEngine("pro", password);
      }
    });
    const onReset = () => {
      setLocal("open");
      write(ENGINE_KEY, "open");
    };
    window.addEventListener(ENGINE_RESET_EVENT, onReset);
    return () => {
      cancelled = true;
      window.removeEventListener(ENGINE_RESET_EVENT, onReset);
    };
  }, []);

  if (available === null) return null;

  if (!available) {
    return (
      <a
        href={proApiUrl("engine-toggle")}
        target="_blank"
        rel="noopener noreferrer"
        title="withoutBG Pro: higher-quality edges, 1 credit per image. To use it here, start the container with WITHOUTBG_API_KEY and WITHOUTBG_PRO_PASSWORD."
        className="hidden sm:flex items-center gap-0.5 rounded-md bg-gray-100 p-0.5 text-xs font-medium dark:bg-gray-800"
      >
        <span className="rounded bg-white px-2 py-0.5 text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100">
          Open weights
        </span>
        <span className="px-2 py-0.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
          Pro ↗
        </span>
      </a>
    );
  }

  const choose = (next: Engine) => {
    if (next === "pro" && !read(PASSWORD_KEY)) {
      setAsking(true);
      return;
    }
    setLocal(next);
    setEngine(next, read(PASSWORD_KEY));
    write(ENGINE_KEY, next);
  };

  const submitPassword = () => {
    if (!draft) return;
    write(PASSWORD_KEY, draft);
    setAsking(false);
    setDraft("");
    setLocal("pro");
    setEngine("pro", draft);
    write(ENGINE_KEY, "pro");
  };

  if (asking) {
    return (
      <form
        className="flex items-center gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          submitPassword();
        }}
      >
        <input
          type="password"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Pro password"
          aria-label="withoutBG Pro password for this server"
          className="h-7 w-32 rounded-md border border-gray-300 bg-white px-2 text-xs dark:border-gray-600 dark:bg-gray-800"
        />
        <button type="submit" className="rounded px-2 py-0.5 text-xs font-medium text-gray-900 dark:text-gray-100">
          Use Pro
        </button>
        <button
          type="button"
          onClick={() => setAsking(false)}
          className="rounded px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400"
        >
          Cancel
        </button>
      </form>
    );
  }

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
