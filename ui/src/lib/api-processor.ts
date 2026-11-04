import type { EditFn, ProcessorFn, ProcessorResult } from "@/lib/processor";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "/api").replace(/\/$/, "");

/**
 * Engine for new removals. "pro" (withoutBG Pro, hosted) is offered only when
 * the server has WITHOUTBG_API_KEY set; see `fetchProAvailable`. Smart brush
 * edits always run on the open weights.
 */
export type Engine = "open" | "pro";
let currentEngine: Engine = "open";

export function setEngine(engine: Engine) {
  currentEngine = engine;
}

export async function fetchProAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) return false;
    const data = (await response.json()) as { pro_available?: boolean };
    return data.pro_available === true;
  } catch {
    return false;
  }
}

async function post(body: Record<string, string>, engine: Engine = "open"): Promise<ProcessorResult> {
  const url = `${API_BASE}/v1/remove-background?engine=${engine}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    let message = detail;
    try {
      const parsed = JSON.parse(detail) as { detail?: string; error?: string };
      message = parsed.detail ?? parsed.error ?? detail;
    } catch {
      // plain-text error
    }
    throw new Error(message || `API error ${response.status}`);
  }

  const data = (await response.json()) as ProcessorResult;
  return {
    processed: data.processed,
    alphaMatte: data.alphaMatte,
    latencyMs: data.latencyMs,
  };
}

export const apiProcessor: ProcessorFn = (src) => post({ image: src }, currentEngine);

/** Smart brush edit: the same endpoint with masks and the previous matte. */
export const apiEditor: EditFn = ({ image, keepMask, removeMask, matte }) => {
  const body: Record<string, string> = { image, matte };
  if (keepMask) body.keep_mask = keepMask;
  if (removeMask) body.remove_mask = removeMask;
  return post(body);
};
