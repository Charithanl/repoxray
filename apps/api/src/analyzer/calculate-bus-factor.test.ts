import { describe, expect, test } from "vitest";
import { calculateBusFactor } from "./calculate-bus-factor";

describe("calculateBusFactor", () => {
  test("one author owns most of the changes", () => {
    const result = calculateBusFactor({ Asha: 2, Ravi: 1 });
    expect(result.busFactor).toBe(1);
    expect(result.topAuthor).toBe("Asha");
    expect(result.topShare).toBeCloseTo(0.667, 2);
  });

  test("needs several authors to pass half", () => {
    expect(calculateBusFactor({ A: 3, B: 3, C: 3, D: 1 }).busFactor).toBe(2);
  });

  test("exactly half is not enough", () => {
    const result = calculateBusFactor({ B: 1, A: 1 });
    expect(result.busFactor).toBe(2);
    expect(result.topAuthor).toBe("A"); // ties are sorted by name
  });

  test("a file with no authors has no bus factor", () => {
    expect(calculateBusFactor({})).toEqual({ busFactor: 0, topAuthor: "", topShare: 0 });
  });
});
