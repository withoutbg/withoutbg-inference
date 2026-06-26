import type { ProcessorFn, ProcessorResult } from "@/lib/processor";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api";

export const apiProcessor: ProcessorFn = async (src: string): Promise<ProcessorResult> => {
  const url = `${API_BASE.replace(/\/$/, "")}/v1/remove-background`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: src }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `API error ${response.status}`);
  }

  const data = (await response.json()) as ProcessorResult;
  return {
    processed: data.processed,
    alphaMatte: data.alphaMatte,
    latencyMs: data.latencyMs,
  };
};
