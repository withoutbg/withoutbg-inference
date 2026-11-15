/**
 * One small prompt per usage milestone, cheapest ask first:
 *   5 images   → star the repo
 *   20 images  → withoutBG Pro API
 *   100 images → Pro Model Self-Host (donate as the second option)
 * Each prompt shows at most once per browser. State lives in localStorage only.
 */

const LS_SEEN_KEY = "wbg_prompt_seen"; // highest milestone already shown
const LS_STARRED_KEY = "wbg_starred";
const LS_TOTAL_KEY = "wbg_processed_total";
const LS_LEGACY_STAR_KEY = "wbg_star_prompt"; // "starred" | "done" | "5" | "20"

export const PROMPT_MILESTONES = [
  { at: 5, kind: "star" },
  { at: 20, kind: "api" },
  { at: 100, kind: "selfhost" },
] as const;

export type Milestone = (typeof PROMPT_MILESTONES)[number];
export type PromptKind = Milestone["kind"];

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage blocked: prompt may show again next visit
  }
}

export function getLifetimeProcessedCount(): number {
  if (typeof window === "undefined") return 0;
  const n = parseInt(read(LS_TOTAL_KEY) ?? "0", 10);
  return Number.isFinite(n) ? n : 0;
}

export function incrementLifetimeProcessedCount(): number {
  const next = getLifetimeProcessedCount() + 1;
  write(LS_TOTAL_KEY, String(next));
  return next;
}

function seenUpTo(): number {
  const seen = parseInt(read(LS_SEEN_KEY) ?? "", 10);
  if (Number.isFinite(seen)) return seen;
  // Older builds only had the star prompt at 5 / 20 / 100.
  const legacy = read(LS_LEGACY_STAR_KEY);
  if (legacy === "done") return 100;
  if (legacy === "5" || legacy === "20") return 5;
  return 0;
}

export function hasStarred(): boolean {
  return read(LS_STARRED_KEY) === "1" || read(LS_LEGACY_STAR_KEY) === "starred";
}

export function markStarred(): void {
  if (typeof window === "undefined") return;
  write(LS_STARRED_KEY, "1");
}

export function markPromptSeen(at: number): void {
  if (typeof window === "undefined") return;
  if (at > seenUpTo()) write(LS_SEEN_KEY, String(at));
}

/**
 * The prompt to show for this lifetime count, or null. If several milestones
 * were passed at once (a big batch), only the highest shows; the rest are skipped.
 */
export function promptToShow(lifetimeCount: number): Milestone | null {
  const seen = seenUpTo();
  const due = PROMPT_MILESTONES.filter(
    (m) => m.at > seen && lifetimeCount >= m.at && !(m.kind === "star" && hasStarred())
  );
  return due.at(-1) ?? null;
}
