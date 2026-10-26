import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { analyzeDirectory, analyzeRepository } from "./analyzer/analyze-repository";
import { isGithubUrl } from "./analyzer/clone-repository";

async function main(): Promise<void> {
  const target = process.argv[2];

  if (!target) {
    console.error("Usage: pnpm --filter @repoxray/api analyze <github-url | repo-folder>");
    process.exit(1);
  }

  let result;
  if (isGithubUrl(target)) {
    console.log(`Cloning and analyzing ${target} ...`);
    result = await analyzeRepository(target);
  } else {
    const dir = resolve(target);
    if (!existsSync(dir) || !statSync(dir).isDirectory()) {
      console.error(`Not a GitHub URL or an existing folder: ${target}`);
      process.exit(1);
    }
    console.log(`Analyzing local repo at ${dir} ...`);
    result = await analyzeDirectory(dir);
  }

  console.log(`\n${result.commitCount} commits, ${result.fileCount} files analyzed\n`);
   console.log("Top 10 hotspots (scores are relative to the hottest file, which is 1.00):\n");

  result.hotspots.slice(0, 10).forEach((h, i) => {
    const rank = String(i + 1).padStart(2);
    const score = h.score.toFixed(2);
    const changes = String(h.changes).padStart(4);
    const lines = String(h.lines).padStart(6);
    console.log(`${rank}. score ${score} | ${changes} changes | ${lines} lines | ${h.path}`);
  });
}

main().catch((error: unknown) => {
  console.error("Analysis failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});