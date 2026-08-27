import { describe, expect, it } from "vitest";

import { fitTitle, ogCardSize } from "./og-card-layout.ts";

/**
 * The drawable width, and the glyph advance the layout fits lines to. Kept
 * here rather than exported so the test states the limit it is asserting
 * instead of borrowing the arithmetic it is checking.
 */
const contentWidth = ogCardSize.width - ogCardSize.padding * 2;
const averageGlyphWidth = 0.54;

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

  it("breaks a token no line could hold, rather than letting it run off the card", () => {
    const { fontSize, lines } = fitTitle(
      "https://nickneely.dev/writing/an-unbreakable-identifier-no-line-can-hold"
    );
    const maxCharacters = Math.floor(
      contentWidth / (fontSize * averageGlyphWidth)
    );

    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(maxCharacters);
    }
  });

  it("truncates once even the smallest size runs out of room", () => {
    const { lines } = fitTitle(
      Array.from({ length: 60 }, () => "word").join(" ")
    );

    expect(lines).toHaveLength(3);
    expect(lines.at(-1)?.endsWith("…")).toBeTruthy();
  });
});
