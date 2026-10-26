import { describe, expect, test } from "vitest";
import { parseGitHistory } from "./parse-git-history";

const sample = [
  "--aaa111|Asha|2026-01-05T10:00:00+05:30|add login",
  "",
  "10\t2\tsrc/login.ts",
  "3\t0\tREADME.md",
  "--bbb222|Ravi|2026-01-06T09:30:00+05:30|fix bug | in login",
  "",
  "1\t1\tsrc/login.ts",
  "-\t-\tlogo.png",
].join("\n");

describe("parseGitHistory", () => {
  test("reads commit details", () => {
    const commits = parseGitHistory(sample);
    expect(commits).toHaveLength(2);
    expect(commits[0]).toMatchObject({
      hash: "aaa111",
      author: "Asha",
      date: "2026-01-05T10:00:00+05:30",
      subject: "add login",
    });
  });

  test("reads lines added and deleted per file", () => {
    const commits = parseGitHistory(sample);
    expect(commits[0]?.files).toEqual([
      { path: "src/login.ts", added: 10, deleted: 2 },
      { path: "README.md", added: 3, deleted: 0 },
    ]);
  });

  test("keeps pipes in the subject and skips binary files", () => {
    const commits = parseGitHistory(sample);
    expect(commits[1]?.subject).toBe("fix bug | in login");
    expect(commits[1]?.files).toEqual([{ path: "src/login.ts", added: 1, deleted: 1 }]);
  });
});