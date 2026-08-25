import type { Options } from "@mdx-js/rollup";
import rehypeShiki from "@shikijs/rehype";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { createCssVariablesTheme } from "shiki/core";

/**
 * Shiki resolves every token to a CSS custom property instead of a literal
 * colour, so one highlighted tree serves both themes and the palette lives in
 * `src/styles.css` next to the tokens it borrows from. The alternative, a
 * dual-theme build, would duplicate every token's colour inline and still need
 * a `.dark` override to choose between them.
 *
 * Highlighting happens here, at build time. Nothing from Shiki is shipped.
 */
const codeTheme = createCssVariablesTheme({
  fontStyle: true,
  name: "front-door",
  variablePrefix: "--code-",
});

/**
 * Options handed to `@mdx-js/rollup`, kept out of `vite.config.ts`.
 *
 * `remarkFrontmatter` is not optional: MDX has no concept of frontmatter, so
 * without it the YAML block is parsed as Markdown and the Post opens with its
 * own metadata rendered as a heading.
 */
export const mdxOptions: Options = {
  rehypePlugins: [[rehypeShiki, { theme: codeTheme }]],
  remarkPlugins: [remarkFrontmatter, remarkGfm],
};
