/**
 * Pro Smart brush keeps no state on the server, so the client keeps every stroke
 * made on a job and resends all of them on each Apply. Strokes live in memory
 * for the page session (they are not stored or sent anywhere else).
 */
export interface ProStrokes {
  keep: ImageData;
  remove: ImageData;
}

const store = new Map<string, ProStrokes>();

export function getProStrokes(jobId: string): ProStrokes | undefined {
  return store.get(jobId);
}

export function setProStrokes(jobId: string, strokes: ProStrokes): void {
  store.set(jobId, strokes);
}

/** A new cutout (Remove background again) starts with no strokes. */
export function clearProStrokes(jobId: string): void {
  store.delete(jobId);
}
