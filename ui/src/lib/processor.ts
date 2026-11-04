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
  /**
   * Smart brush edits only: opaque token from the server. Send it back with the
   * next edit of the same image so the server runs only the Smart brush graph.
   */
  editContext?: string | null;
}

export type ProcessorFn = (src: string) => Promise<ProcessorResult>;

/** Smart brush masks (data URLs, white = painted) plus the matte being edited. */
export interface EditRequest {
  image: string;
  keepMask: string | null;
  removeMask: string | null;
  matte: string;
  /** `editContext` from the previous edit of this image, if any. */
  editContext?: string | null;
}

export type EditFn = (req: EditRequest) => Promise<ProcessorResult>;
