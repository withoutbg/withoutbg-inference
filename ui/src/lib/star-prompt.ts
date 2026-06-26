const LS_STATUS_KEY = "wbg_star_prompt";
const LS_TOTAL_KEY = "wbg_processed_total";

export const STAR_MILESTONES = [5, 20, 100] as const;
export type StarMilestone = (typeof STAR_MILESTONES)[number];

export type StarPromptStatus = "starred" | "done" | "5" | "20";

export function getLifetimeProcessedCount(): number {
  if (typeof window === "undefined") return 0;
  const n = parseInt(localStorage.getItem(LS_TOTAL_KEY) ?? "0", 10);
  return Number.isFinite(n) ? n : 0;
}

export function incrementLifetimeProcessedCount(): number {
  const next = getLifetimeProcessedCount() + 1;
  localStorage.setItem(LS_TOTAL_KEY, String(next));
  return next;
}

export function getStarPromptStatus(): StarPromptStatus | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LS_STATUS_KEY);
  if (raw === "starred" || raw === "done" || raw === "5" || raw === "20") {
    return raw;
  }
  return null;
}

export function starPromptComplete(): boolean {
  const status = getStarPromptStatus();
  return status === "starred" || status === "done";
}

export function markStarPromptStarred(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_STATUS_KEY, "starred");
}

export function markStarPromptDismissed(milestone: StarMilestone): void {
  if (typeof window === "undefined") return;
  if (milestone === 100) {
    localStorage.setItem(LS_STATUS_KEY, "done");
  } else {
    localStorage.setItem(LS_STATUS_KEY, String(milestone));
  }
}

export function getNextStarMilestone(): StarMilestone | null {
  const status = getStarPromptStatus();
  if (status === "starred" || status === "done") return null;

  const dismissedAt = status === null ? 0 : Number(status);
  return STAR_MILESTONES.find((m) => m > dismissedAt) ?? null;
}

/** Returns the milestone to show, or null if none applies yet. */
export function milestoneToShow(
  lifetimeCount: number,
  alreadyShown: ReadonlySet<StarMilestone>
): StarMilestone | null {
  const next = getNextStarMilestone();
  if (!next || alreadyShown.has(next)) return null;
  if (lifetimeCount >= next) return next;
  return null;
}
