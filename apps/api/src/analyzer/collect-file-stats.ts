import type { Commit } from "./parse-git-history";

export interface FileStat {
  path: string;
  changes: number;
  added: number;
  deleted: number;
  authors: Record<string, number>;
}

export function collectFileStats(commits: Commit[]): FileStat[] {
  // One entry per file path, filled in as we walk through the commits
  const byPath = new Map<string, FileStat>();

  for (const commit of commits) {
    for (const file of commit.files) {
      let stat = byPath.get(file.path);

      // First time we see this file, start it at zero
      if (!stat) {
        stat = { path: file.path, changes: 0, added: 0, deleted: 0, authors: {} };
        byPath.set(file.path, stat);
      }

      stat.changes += 1;
      stat.added += file.added;
      stat.deleted += file.deleted;
      stat.authors[commit.author] = (stat.authors[commit.author] ?? 0) + 1;
    }
  }

  // Most-changed files first, with ties sorted by name so results are always the same
  return [...byPath.values()].sort(
    (a, b) => b.changes - a.changes || a.path.localeCompare(b.path),
  );
}