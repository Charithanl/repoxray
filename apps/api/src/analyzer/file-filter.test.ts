import { describe, expect, test } from "vitest";
import { shouldAnalyzeFile } from "./file-filter";

describe("shouldAnalyzeFile", () => {
  test("keeps normal source and docs files", () => {
    expect(shouldAnalyzeFile("src/login.ts")).toBe(true);
    expect(shouldAnalyzeFile("README.md")).toBe(true);
    expect(shouldAnalyzeFile("src/distance.ts")).toBe(true);
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
});
