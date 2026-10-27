import { describe, expect, test } from "vitest";
import { collectMonthlyStats } from "./collect-monthly-stats";
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
  {
    hash: "d",
    author: "Asha",
    date: "2025-12-31T23:00:00+05:30",
    subject: "year end fix",
    files: [{ path: "src/login.ts", added: 1, deleted: 0 }],
  },
];

describe("collectMonthlyStats", () => {
  test("groups changes by month and file, oldest month first", () => {
    expect(collectMonthlyStats(commits)).toEqual([
      {
        path: "src/login.ts",
        month: "2025-12",
        changes: 1,
        added: 1,
        deleted: 0,
        authors: { Asha: 1 },
      },
      {
        path: "README.md",
        month: "2026-01",
        changes: 1,
        added: 3,
        deleted: 0,
        authors: { Asha: 1 },
      },
      {
        path: "src/login.ts",
        month: "2026-01",
        changes: 2,
        added: 11,
        deleted: 3,
        authors: { Asha: 1, Ravi: 1 },
      },
      {
        path: "src/login.ts",
        month: "2026-02",
        changes: 1,
        added: 4,
        deleted: 0,
        authors: { Asha: 1 },
      },
    ]);
  });

  test("returns an empty list when there are no commits", () => {
    expect(collectMonthlyStats([])).toEqual([]);
  });
});