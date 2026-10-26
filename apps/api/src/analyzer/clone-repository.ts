import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runGit } from "./run-git";

const GITHUB_URL = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+?(\.git)?\/?$/;

export function isGithubUrl(url: string): boolean {
  return GITHUB_URL.test(url);
}

// Downloads only the last N months of history into a fresh temporary folder
export async function cloneRepository(url: string, months = 12): Promise<string> {
  if (!isGithubUrl(url)) {
    throw new Error("Only https://github.com/owner/repo URLs are allowed");
  }

  const dir = await mkdtemp(join(tmpdir(), "repoxray-"));
  await runGit([
    "clone",
    "--shallow-since",
    `${months} months ago`,
    "--no-tags",
    "--single-branch",
    "--",
    url,
    dir,
  ]);
  return dir;
}

// Deletes the temporary clone when we're done with it
export async function cleanupRepository(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true, maxRetries: 3 });
}