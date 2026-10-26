import { describe, expect, test } from "vitest";
import { calculateHotspots } from "./calculate-hotspots";
import type { FileStat } from "./collect-file-stats";

const stat = (path: string, changes: number): FileStat => ({
  path,
  changes,
  added: 0,
  deleted: 0,
  authors: {},
});

const stats = [stat("a.ts", 10), stat("b.ts", 6), stat("c.ts", 10), stat("deleted.ts", 8)];

// Current size of each file that still exists, in lines
const lines = new Map([
  ["a.ts", 200],
  ["b.ts", 400],
  ["c.ts", 400],
]);

describe("calculateHotspots", () => {
  test("scores files by changes times size, highest first", () => {
    const result = calculateHotspots(stats, lines);

    expect(result.map((h) => h.path)).toEqual(["c.ts", "b.ts", "a.ts"]);
    expect(result[0]?.score).toBeCloseTo(1);
    expect(result[1]?.score).toBeCloseTo(0.6);
    expect(result[2]?.score).toBeCloseTo(0.5);
  });

    test("scales scores so the hottest file is always 1", () => {
    const result = calculateHotspots(
      [stat("x.ts", 10), stat("y.ts", 2)],
      new Map([
        ["x.ts", 100],
        ["y.ts", 1000],
      ]),
    );

    expect(result.map((h) => h.path)).toEqual(["y.ts", "x.ts"]);
    expect(result[0]?.score).toBeCloseTo(1);
    expect(result[1]?.score).toBeCloseTo(0.5);
  });

  test("skips files that no longer exist", () => {
    const result = calculateHotspots(stats, lines);
    expect(result.find((h) => h.path === "deleted.ts")).toBeUndefined();
  });

  test("returns an empty list when there is nothing to score", () => {
    expect(calculateHotspots([], new Map())).toEqual([]);
  });
});
