import type { FileStat } from "./collect-file-stats";

export interface Hotspot {
  path: string;
  changes: number;
  lines: number;
  score: number; // 0 to 1, where 1 is the biggest and most-changed file
}

export function calculateHotspots(
  stats: FileStat[],
  lineCounts: Map<string, number>,
): Hotspot[] {
  // Only score files that still exist (deleted files have no current size)
  const existing = stats.filter((s) => lineCounts.has(s.path));
  if (existing.length === 0) return [];

  // The highest values, used to scale everything to a 0 to 1 range
  const maxChanges = existing.reduce((max, s) => Math.max(max, s.changes), 0) || 1;
  const maxLines =
    existing.reduce((max, s) => Math.max(max, lineCounts.get(s.path) ?? 0), 0) || 1;

    const raw = existing.map((s) => {
    const lines = lineCounts.get(s.path) ?? 0;
    return {
      path: s.path,
      changes: s.changes,
      lines,
      score: (s.changes / maxChanges) * (lines / maxLines),
    };
  });

  // Rescale so the hottest file in this repo is exactly 1
  const topScore = raw.reduce((max, h) => Math.max(max, h.score), 0) || 1;

  return raw
    .map((h) => ({ ...h, score: h.score / topScore }))
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
}
