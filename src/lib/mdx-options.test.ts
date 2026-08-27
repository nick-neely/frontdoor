import { compile } from "@mdx-js/mdx";
import { beforeAll, describe, expect, it } from "vitest";

import { mdxOptions } from "./mdx-options.ts";

const source = [
  "---",
  'title: "Frontmatter is not prose"',
  "---",
  "",
  "## A section worth linking to",
  "",
  '```ts title="src/lib/x.ts" {2}',
  'const greeting = "hello";',
  "const farewell = `goodbye`;",
  "```",
  "",
  "| Column |",
  "| ------ |",
  "| Cell   |",
  "",
  "A claim with a footnote.[^one]",
  "",
  "[^one]: The note.",
].join("\n");

async function build(): Promise<string> {
  return String(await compile(source, mdxOptions));
}

describe("the MDX build pipeline", () => {
  let compiled: string;

  // Shiki's first compile loads the highlighter. On a GitHub runner that
  // cold start ran past Vitest's 5s test timeout; the rest of this file is
  // assertions on the same module, so it is paid once here.
  beforeAll(async () => {
    compiled = await build();
  }, 20_000);

  it("highlights code at build time and ships no highlighter", () => {
    // Shiki has already run: the tokens are literal spans in the module, and
    // their colours are the site's CSS variables rather than baked hex.
    expect(compiled).toContain("var(--code-token-keyword)");
    expect(compiled).toContain('className: "shiki');
    expect(compiled).not.toMatch(/import[^;]*from\s*"(?:@shikijs|shiki)/u);
    expect(compiled).not.toContain("createHighlighter");
  });

  it("drops frontmatter instead of rendering it as a heading", () => {
    expect(compiled).not.toContain("Frontmatter is not prose");
  });

  it("renders GitHub-flavoured tables", () => {
    expect(compiled).toContain('"table"');
  });

  it("renders GitHub-flavoured footnotes", () => {
    expect(compiled).toContain("data-footnote-ref");
    expect(compiled).toContain("data-footnote-backref");
  });

  // The two halves of the one fence-meta vocabulary. `title` survives as an
  // attribute because the meta string does not exist by the time a component
  // sees the element; the brace list survives as a class on the line.
  it("carries a fence title through to the element", () => {
    expect(compiled).toContain('"data-title": "src/lib/x.ts"');
  });

  it("marks the lines a fence called out", () => {
    expect(compiled).toContain("line highlighted");
  });

  // Shiki writes the theme's name onto the `<pre>` as a class, and `.front-door`
  // is already the door mark's class: `display: inline-flex`, which shrinks a
  // code block to the width of its longest line.
  it("keeps a code block out of the door mark's class", () => {
    expect(compiled).toContain("shiki front-door-code");
    expect(compiled).not.toMatch(/shiki front-door[^-]/u);
  });

  it("gives every heading an id to link to", () => {
    expect(compiled).toContain('id: "a-section-worth-linking-to"');
  });
});
