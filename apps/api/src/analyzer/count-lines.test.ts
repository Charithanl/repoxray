import { describe, expect, test } from "vitest";
import { countLines } from "./count-lines";

describe("countLines", () => {
  test("counts lines with or without a final newline", () => {
    expect(countLines("")).toBe(0);
    expect(countLines("a")).toBe(1);
    expect(countLines("a\n")).toBe(1);
    expect(countLines("a\nb\n")).toBe(2);
  });

  test("handles Windows line endings and blank lines", () => {
    expect(countLines("a\r\nb")).toBe(2);
    expect(countLines("\n\n")).toBe(2);
  });
});
