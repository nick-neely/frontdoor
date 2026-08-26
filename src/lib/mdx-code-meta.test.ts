import { describe, expect, it } from "vitest";

import { codeBlockTitle } from "./mdx-code-meta.ts";

describe("fence meta", () => {
  it.each([
    ['title="src/lib/x.ts"', "src/lib/x.ts"],
    ['{2,5-7} title="src/lib/x.ts"', "src/lib/x.ts"],
    ['title="src/lib/x.ts" {2}', "src/lib/x.ts"],
  ])("reads the title out of %s", (meta, expected) => {
    expect(codeBlockTitle(meta)).toBe(expected);
  });

  it.each([
    ["nothing at all", undefined],
    ["only a highlight list", "{2,5-7}"],
    ["an empty title", 'title=""'],
    // `title` has to be the whole word. Anything else is a different directive
    // that happens to end in the same five letters.
    ["a directive that merely ends in it", 'subtitle="not this"'],
  ])("finds no title in %s", (_case, meta) => {
    expect(codeBlockTitle(meta)).toBeUndefined();
  });
});
