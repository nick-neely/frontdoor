import { compile } from "@mdx-js/mdx";
import { describe, expect, it } from "vitest";

import { mdxOptions } from "./mdx-options.ts";

const source = [
  "---",
  'title: "Frontmatter is not prose"',
  "---",
  "",
  "```ts",
  'const greeting = "hello";',
  "```",
  "",
  "| Column |",
  "| ------ |",
  "| Cell   |",
].join("\n");

describe("the MDX build pipeline", () => {
  it("highlights code at build time and ships no highlighter", async () => {
    const compiled = String(await compile(source, mdxOptions));

    // Shiki has already run: the tokens are literal spans in the module, and
    // their colours are the site's CSS variables rather than baked hex.
    expect(compiled).toContain("var(--code-token-keyword)");
    expect(compiled).toContain('className: "shiki');
    expect(compiled).not.toMatch(/import[^;]*from\s*"(?:@shikijs|shiki)/u);
    expect(compiled).not.toContain("createHighlighter");
  });

  it("drops frontmatter instead of rendering it as a heading", async () => {
    const compiled = String(await compile(source, mdxOptions));

    expect(compiled).not.toContain("Frontmatter is not prose");
  });

  it("renders GitHub-flavoured tables", async () => {
    const compiled = String(await compile(source, mdxOptions));

    expect(compiled).toContain('"table"');
  });
});
