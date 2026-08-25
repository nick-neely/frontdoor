import { describe, expect, it } from "vitest";

import { readingMinutes } from "./reading-time.ts";

const words = (count: number) =>
  Array.from({ length: count }, () => "word").join(" ");

describe("reading time", () => {
  it("counts the rendered prose", () => {
    expect(readingMinutes(words(220))).toBe(1);
    expect(readingMinutes(words(1100))).toBe(5);
  });

  it("never reports zero minutes for something that exists", () => {
    expect(readingMinutes("One line.")).toBe(1);
  });

  it("ignores everything the reader never sees", () => {
    const source = [
      "---",
      `title: "${words(200)}"`,
      "---",
      "",
      'import Chart from "./chart.tsx";',
      "",
      `{/* ${words(200)} */}`,
      "",
      `<Chart caption="${words(200)}" />`,
      "",
      "Visible.",
    ].join("\n");

    expect(readingMinutes(source)).toBe(1);
  });

  it("counts prose written inside a component", () => {
    expect(readingMinutes(`<Callout>\n\n${words(1100)}\n\n</Callout>`)).toBe(5);
  });
});
