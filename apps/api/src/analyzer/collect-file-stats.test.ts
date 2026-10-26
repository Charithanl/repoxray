import { describe, expect, test } from "vitest";
import { collectFileStats } from "./collect-file-stats";
import type { Commit } from "./parse-git-history";

const commits: Commit[] = [
  {
    hash: "a",
    author: "Asha",
    date: "2026-01-05T10:00:00+05:30",
    subject: "add login",
    files: [
      { path: "src/login.ts", added: 10, deleted: 2 },
      { path: "README.md", added: 3, deleted: 0 },
    ],
  },
  {
    hash: "b",
    author: "Ravi",
    date: "2026-01-06T09:30:00+05:30",
    subject: "fix bug",
    files: [{ path: "src/login.ts", added: 1, deleted: 1 }],
  },
  {
    hash: "c",
    author: "Asha",
    date: "2026-02-01T12:00:00+05:30",
    subject: "tweak login",
    files: [{ path: "src/login.ts", added: 4, deleted: 0 }],
  },
];

describe("collectFileStats", () => {
  test("counts changes, lines and authors per file", () => {
    const stats = collectFileStats(commits);
    const login = stats.find((s) => s.path === "src/login.ts");

    expect(login).toEqual({
      path: "src/login.ts",
      changes: 3,
      added: 15,
      deleted: 3,
      authors: { Asha: 2, Ravi: 1 },
    });
  });

  test("sorts the most-changed files first", () => {
    const stats = collectFileStats(commits);
    expect(stats.map((s) => s.path)).toEqual(["src/login.ts", "README.md"]);
  });
});