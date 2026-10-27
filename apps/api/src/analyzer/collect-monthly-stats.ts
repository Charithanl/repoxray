import type { Commit } from "./parse-git-history";

export interface MonthlyFileStat {
  path: string;
  month: string; // like "2026-01"
  changes: number;
  added: number;
  deleted: number;
  authors: Record<string, number>;
}

export function collectMonthlyStats(commits: Commit[]): MonthlyFileStat[] {
  // One bucket per (month, file) pair, filled in as we walk through the commits
  const buckets = new Map<string, MonthlyFileStat>();

  for (const commit of commits) {
    // Dates look like 2026-01-05T10:00:00+05:30, so the first 7 characters are the month
    const month = commit.date.slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(month)) continue; // skip anything with a broken date

    for (const file of commit.files) {
      const key = JSON.stringify([month, file.path]);
      let bucket = buckets.get(key);

      if (!bucket) {
        bucket = { path: file.path, month, changes: 0, added: 0, deleted: 0, authors: {} };
        buckets.set(key, bucket);
      }

      bucket.changes += 1;
      bucket.added += file.added;
      bucket.deleted += file.deleted;
      bucket.authors[commit.author] = (bucket.authors[commit.author] ?? 0) + 1;
    }
  }

  // Oldest month first, then by file name, so the order never shuffles between runs
  return [...buckets.values()].sort(
    (a, b) => a.month.localeCompare(b.month) || a.path.localeCompare(b.path),
  );
}