/**
 * Processor interface — both mock and real implementations satisfy this.
 *
 * To connect a real API, create a new file that exports a function with this
 * signature and pass it into `BackgroundRemovalEditor` via the `processor`
 * prop (or replace the default import in `useMockProcessor`).
 */
export interface ProcessorResult {
  /** Fully-composed cutout as a data URL (transparent PNG). */
  processed: string;
  /** Grayscale alpha matte as a data URL (RGB, no alpha channel). White = subject, black = background. */
  alphaMatte: string;
  /** Server-side latency in milliseconds (use null for client-only processing). */
  latencyMs: number | null;
}

export type ProcessorFn = (src: string) => Promise<ProcessorResult>;
