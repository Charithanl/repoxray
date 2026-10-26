import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { runGit } from "../analyzer/run-git";

// Makes a file with the given number of lines: "line 1", "line 2", ...
const makeLines = (count: number): string =>
  Array.from({ length: count }, (_, i) => `line ${i + 1}`).join("\n") + "\n";

async function write(dir: string, path: string, content: string): Promise<void> {
  const fullPath = join(dir, path);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content);
}

// Stages everything and makes one commit with a fixed author and date
async function commit(dir: string, author: string, date: string, message: string): Promise<void> {
  await runGit(["add", "-A"], dir);
  await runGit(
    [
      "-c",
      `user.name=${author}`,
      "-c",
      `user.email=${author.toLowerCase()}@example.com`,
      "-c",
      "commit.gpgsign=false",
      "commit",
      "-m",
      message,
      `--date=${date}`,
    ],
    dir,
  );
}

// Builds a tiny repo in a temporary folder and returns its path.
// Because every author, date and line count is fixed, the analysis result is predictable.
export async function createFixtureRepo(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "repoxray-fixture-"));

  await runGit(["init", "--initial-branch=main"], dir);
  await runGit(["config", "core.autocrlf", "false"], dir);

  await write(dir, "src/login.ts", makeLines(10));
  await write(dir, "src/db.ts", makeLines(20));
  await write(dir, "README.md", makeLines(2));
  await write(dir, "pnpm-lock.yaml", makeLines(50));
  await commit(dir, "Asha", "2026-01-05T10:00:00+05:30", "add login and db");

  await write(dir, "src/login.ts", makeLines(12));
  await write(dir, "src/util.ts", makeLines(5));
  await commit(dir, "Ravi", "2026-01-06T09:30:00+05:30", "extend login");

  await write(dir, "src/login.ts", makeLines(14));
  await commit(dir, "Asha", "2026-02-01T12:00:00+05:30", "tweak login");

  await rm(join(dir, "src/util.ts"));
  await commit(dir, "Ravi", "2026-02-02T15:00:00+05:30", "remove util");

  return dir;
}