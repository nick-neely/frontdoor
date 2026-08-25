import { describe, expect, it } from "vitest";

import { fitTitle } from "./og-card-layout.ts";

describe("the social card title", () => {
  it("uses the largest size for a title that fits one line", () => {
    const { fontSize, lines } = fitTitle("Building the front door");

    expect(lines).toStrictEqual(["Building the front door"]);
    expect(fontSize).toBe(76);
  });

  it("steps the size down rather than spilling past three lines", () => {
    const long = fitTitle(
      "Why the prerender inventory reads frontmatter from disk instead of the generated index"
    );

    expect(long.lines.length).toBeLessThanOrEqual(3);
    expect(long.fontSize).toBeLessThan(76);
  });

  it("truncates once even the smallest size runs out of room", () => {
    const { lines } = fitTitle(
      Array.from({ length: 60 }, () => "word").join(" ")
    );

    expect(lines).toHaveLength(3);
    expect(lines.at(-1)?.endsWith("…")).toBeTruthy();
  });
});
