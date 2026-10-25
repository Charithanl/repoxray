import { expect, test } from "vitest";
import { ANALYSIS_STATUSES } from "@repoxray/shared";

test("api can import from shared", () => {
  expect(ANALYSIS_STATUSES[0]).toBe("queued");
});
