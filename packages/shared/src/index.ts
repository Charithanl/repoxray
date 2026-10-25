export const ANALYSIS_STATUSES = ["queued", "cloning", "analyzing", "done", "failed"] as const;
export type AnalysisStatus = (typeof ANALYSIS_STATUSES)[number];
