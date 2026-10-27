import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { calculateHotspots, type Hotspot } from "./calculate-hotspots";
import { cleanupRepository, cloneRepository } from "./clone-repository";
import { collectFileStats } from "./collect-file-stats";
import { collectMonthlyStats, type MonthlyFileStat } from "./collect-monthly-stats";
import { collectLineCounts } from "./count-lines";
import { shouldAnalyzeFile } from "./file-filter";
import { parseGitHistory } from "./parse-git-history";
import { runGit } from "./run-git";

export interface AnalysisResult {
  hotspots: Hotspot[];
  monthly: MonthlyFileStat[];
  commitCount: number;
  fileCount: number;
}

// A shallow clone cuts history at a date. The oldest commits it keeps look like
// "every file was just added", which would add a fake change to every file.
// git lists those commits in .git/shallow, so we read the list and skip them.
async function readShallowBoundary(dir: string): Promise<Set<string>> {
  try {
    const text = await readFile(join(dir, ".git", "shallow"), "utf8");
    return new Set(text.split(/\r?\n/).filter(Boolean));
  } catch {
    return new Set<string>(); // not a shallow clone, nothing to skip
  }
}

// Analyzes a repo that is already on disk
export async function analyzeDirectory(dir: string): Promise<AnalysisResult> {
  const rawLog = await runGit(
    [
      "-c",
      "core.quotepath=false",
      "log",
      "--no-renames",
      "--numstat",
      "--format=--%H|%an|%aI|%s",
    ],
    dir,
  );

  const boundary = await readShallowBoundary(dir);
  const commits = parseGitHistory(rawLog)
    .filter((commit) => !boundary.has(commit.hash))
    .map((commit) => ({
      ...commit,
      files: commit.files.filter((file) => shouldAnalyzeFile(file.path)),
    }));

  const stats = collectFileStats(commits);
  const lineCounts = await collectLineCounts(dir);

  // Only keep monthly numbers for files that still exist, since the treemap only draws those
  const monthly = collectMonthlyStats(commits).filter((m) => lineCounts.has(m.path));

  return {
    hotspots: calculateHotspots(stats, lineCounts),
    monthly,
    commitCount: commits.length,
    fileCount: lineCounts.size,
  };
}

// Clones a GitHub repo into a temporary folder, analyzes it, then deletes the clone
export async function analyzeRepository(url: string, months = 12): Promise<AnalysisResult> {
  const dir = await cloneRepository(url, months);
  try {
    return await analyzeDirectory(dir);
  } finally {
    await cleanupRepository(dir); // runs even if the analysis crashes
  }
}