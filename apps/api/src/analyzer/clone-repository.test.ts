import { describe, expect, test } from "vitest";
import { isGithubUrl } from "./clone-repository";

describe("isGithubUrl", () => {
  test("accepts normal GitHub repo URLs", () => {
    expect(isGithubUrl("https://github.com/expressjs/express")).toBe(true);
    expect(isGithubUrl("https://github.com/expressjs/express.git")).toBe(true);
    expect(isGithubUrl("https://github.com/facebook/react/")).toBe(true);
  });

  test("rejects anything else", () => {
    expect(isGithubUrl("http://github.com/expressjs/express")).toBe(false);
    expect(isGithubUrl("https://gitlab.com/expressjs/express")).toBe(false);
    expect(isGithubUrl("https://github.com/expressjs")).toBe(false);
    expect(isGithubUrl("https://github.com/expressjs/express/issues")).toBe(false);
    expect(isGithubUrl("--upload-pack=evil")).toBe(false);
    expect(isGithubUrl("C:\\Users\\someone\\repo")).toBe(false);
    expect(isGithubUrl("")).toBe(false);
  });
});