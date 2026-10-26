import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { shouldAnalyzeFile } from "./file-filter";
import { runGit } from "./run-git";

const MAX_FILE_BYTES = 1_000_000; // skip files over 1 MB, they're almost never real source code

export function countLines(text: string): number {
  if (text === "") return 0;
  const newlines = text.split("\n").length - 1;
  return text.endsWith("\n") ? newlines : newlines + 1;
}

// Returns { file path -> number of lines } for every real file in the repo right now
export async function collectLineCounts(dir: string): Promise<Map<string, number>> {
  const listing = await runGit(["-c", "core.quotepath=false", "ls-files"], dir);
  const counts = new Map<string, number>();

  for (const path of listing.split(/\r?\n/)) {
    if (path === "" || !shouldAnalyzeFile(path)) continue;

    try {
      const fullPath = join(dir, path);
      const info = await stat(fullPath);
      if (!info.isFile() || info.size > MAX_FILE_BYTES) continue;

      const text = await readFile(fullPath, "utf8");
      if (text.includes("\0")) continue; // contains binary data, not text

      counts.set(path, countLines(text));
    } catch {
      continue; // unreadable file or broken link, skip it
    }
  }

  return counts;
}