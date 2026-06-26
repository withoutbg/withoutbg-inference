"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { INFERENCE_REPO_URL } from "@/lib/reference-links";
import { markStarPromptStarred } from "@/lib/star-prompt";

const REPO_URL = INFERENCE_REPO_URL;
const REPO_API = "https://api.github.com/repos/withoutbg/withoutbg-inference";

function formatStars(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export function GitHubStarButton() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(REPO_API, { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.stargazers_count) {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <a
      id="github-star-button"
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => markStarPromptStarred()}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800/30"
      aria-label="Star withoutBG on GitHub"
    >
      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-400 flex-shrink-0" aria-hidden />
      <span>Star</span>
      {stars !== null && (
        <span className="text-gray-500 dark:text-gray-400">
          {formatStars(stars)}
        </span>
      )}
    </a>
  );
}
