import { calculateBusFactor } from "./calculate-bus-factor";
import type { FileStat } from "./collect-file-stats";

// A file is only flagged as risky if one person owns it AND it has real history
const MIN_CHANGES_FOR_RISK = 3;

export interface Hotspot {
  path: string;
  changes: number;
  lines: number;
  score: number; // 0 to 1, where 1 is the hottest file in this repo
  busFactor: number;
  topAuthor: string;
  topShare: number;
  atRisk: boolean;
}

export function calculateHotspots(
  stats: FileStat[],
  lineCounts: Map<string, number>,
): Hotspot[] {
  // Only score files that still exist (deleted files have no current size)
  const existing = stats.filter((s) => lineCounts.has(s.path));
  if (existing.length === 0) return [];

  const maxChanges = existing.reduce((max, s) => Math.max(max, s.changes), 0) || 1;
  const maxLines =
    existing.reduce((max, s) => Math.max(max, lineCounts.get(s.path) ?? 0), 0) || 1;

  const raw = existing.map((s) => {
    const lines = lineCounts.get(s.path) ?? 0;
    const bus = calculateBusFactor(s.authors);
    return {
      path: s.path,
      changes: s.changes,
      lines,
      score: (s.changes / maxChanges) * (lines / maxLines),
      busFactor: bus.busFactor,
      topAuthor: bus.topAuthor,
      topShare: bus.topShare,
      atRisk: bus.busFactor === 1 && s.changes >= MIN_CHANGES_FOR_RISK,
    };
  });

  // Rescale so the hottest file in this repo is exactly 1
  const topScore = raw.reduce((max, h) => Math.max(max, h.score), 0) || 1;

  return raw
    .map((h) => ({ ...h, score: h.score / topScore }))
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
}
