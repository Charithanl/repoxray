import { describe, expect, test } from "vitest";
import { shouldAnalyzeFile } from "./file-filter";

describe("shouldAnalyzeFile", () => {
  test("keeps normal source files", () => {
    expect(shouldAnalyzeFile("src/login.ts")).toBe(true);
    expect(shouldAnalyzeFile("src/distance.ts")).toBe(true);
    expect(shouldAnalyzeFile("lib/response.js")).toBe(true);
  });

  test("skips lockfiles, images, build output and dependencies", () => {
    expect(shouldAnalyzeFile("pnpm-lock.yaml")).toBe(false);
    expect(shouldAnalyzeFile("apps/web/package-lock.json")).toBe(false);
    expect(shouldAnalyzeFile("yarn.lock")).toBe(false);
    expect(shouldAnalyzeFile("node_modules/x/index.js")).toBe(false);
    expect(shouldAnalyzeFile("dist/app.js")).toBe(false);
    expect(shouldAnalyzeFile("public/logo.png")).toBe(false);
    expect(shouldAnalyzeFile("static/app.min.js")).toBe(false);
    expect(shouldAnalyzeFile("static/app.js.map")).toBe(false);
  });

  test("skips docs, changelogs, licenses and CI config", () => {
    expect(shouldAnalyzeFile("README.md")).toBe(false);
    expect(shouldAnalyzeFile("History.md")).toBe(false);
    expect(shouldAnalyzeFile("CHANGELOG.md")).toBe(false);
    expect(shouldAnalyzeFile("LICENSE")).toBe(false);
    expect(shouldAnalyzeFile("docs/guide.html")).toBe(false);
    expect(shouldAnalyzeFile(".github/workflows/ci.yml")).toBe(false);
    expect(shouldAnalyzeFile("apps/api/package.json")).toBe(false);
  });
});