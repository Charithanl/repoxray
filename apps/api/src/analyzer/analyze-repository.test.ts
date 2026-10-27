import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { createFixtureRepo } from "../test-utils/create-fixture-repo";
import { analyzeDirectory, type AnalysisResult } from "./analyze-repository";
import { cleanupRepository } from "./clone-repository";

let dir = "";
let result: AnalysisResult;

beforeAll(async () => {
  dir = await createFixtureRepo();
  result = await analyzeDirectory(dir);
}, 30_000);

afterAll(async () => {
  if (dir) await cleanupRepository(dir);
});

describe("analyzeDirectory on a fixture repo", () => {
  test("counts commits and live source files", () => {
    expect(result.commitCount).toBe(4);
    expect(result.fileCount).toBe(2);
  });
  test("groups changes by month for files that still exist", () => {
    expect(result.monthly).toEqual([
      {
        path: "src/db.ts",
        month: "2026-01",
        changes: 1,
        added: 20,
        deleted: 0,
        authors: { Asha: 1 },
      },
      {
        path: "src/login.ts",
        month: "2026-01",
        changes: 2,
        added: 12,
        deleted: 0,
        authors: { Asha: 1, Ravi: 1 },
      },
      {
        path: "src/login.ts",
        month: "2026-02",
        changes: 1,
        added: 2,
        deleted: 0,
        authors: { Asha: 1 },
      },
    ]);
  });

    test("flags files owned mostly by one author", () => {
    const [login, db] = result.hotspots;
    expect(login).toMatchObject({ busFactor: 1, topAuthor: "Asha", atRisk: true });
    expect(login?.topShare).toBeCloseTo(0.667, 2);
    expect(db).toMatchObject({ busFactor: 1, topAuthor: "Asha", atRisk: false });
  });

  test("ranks files by hotspot score", () => {
    expect(result.hotspots.map((h) => h.path)).toEqual(["src/login.ts", "src/db.ts"]);

    const [login, db] = result.hotspots;
    expect(login).toMatchObject({ changes: 3, lines: 14 });
    expect(login?.score).toBeCloseTo(1);
    expect(db).toMatchObject({ changes: 1, lines: 20 });
    expect(db?.score).toBeCloseTo(0.476, 2);
  });

  test("ignores docs, lockfiles and deleted files", () => {
    const paths = result.hotspots.map((h) => h.path);
    expect(paths).not.toContain("README.md");
    expect(paths).not.toContain("pnpm-lock.yaml");
    expect(paths).not.toContain("src/util.ts");
  });
});