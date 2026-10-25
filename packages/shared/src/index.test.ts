import { expect, test } from "vitest";
import { ANALYSIS_STATUSES } from "./index";

test("has five analysis statuses", () => {
  expect(ANALYSIS_STATUSES).toHaveLength(5);
});
