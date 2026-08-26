import type { Options } from "@mdx-js/rollup";
import rehypeShiki from "@shikijs/rehype";
import { transformerMetaHighlight } from "@shikijs/transformers";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { createCssVariablesTheme } from "shiki/core";

import { transformerCodeBlockTitle } from "./mdx-code-meta.ts";
import { remarkPostImages } from "./remark-post-images.ts";

/**
 * Shiki resolves every token to a CSS custom property instead of a literal
 * colour, so one highlighted tree serves both themes and the palette lives in
 * `src/styles.css` next to the tokens it borrows from. The alternative, a
 * dual-theme build, would duplicate every token's colour inline and still need
 * a `.dark` override to choose between them.
 *
 * Highlighting happens here, at build time. Nothing from Shiki is shipped.
 *
 * The name is not decoration. Shiki writes the theme's name onto the `<pre>` as
 * a class, so a theme called `front-door` would put every code block into the
 * same class as the door mark in the header - which is `display: inline-flex`,
 * and which silently shrank every code block to the width of its longest line.
 */
const codeTheme = createCssVariablesTheme({
  fontStyle: true,
  name: "front-door-code",
  variablePrefix: "--code-",
});

/**
 * Options handed to `@mdx-js/rollup`, kept out of `vite.config.ts`.
 *
 * `remarkFrontmatter` is not optional: MDX has no concept of frontmatter, so
 * without it the YAML block is parsed as Markdown and the Post opens with its
 * own metadata rendered as a heading.
 *
 * `remarkPostImages` rewrites colocated Markdown images into imports, which is
 * what routes them through `vite-imagetools`. It reads only the file being
 * compiled, so the two readers of the collection in ADR-0001 stay two.
 *
 * `rehypeSlug` gives every heading a stable id, which is what the anchor
 * affordance on `h2` and `h3` links to and what GFM footnotes already assume.
 * The two Shiki transformers are the whole of the fence-meta vocabulary; see
 * `mdx-code-meta.ts`.
 */
export const mdxOptions: Options = {
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeShiki,
      {
        theme: codeTheme,
        transformers: [transformerCodeBlockTitle(), transformerMetaHighlight()],
      },
    ],
  ],
  remarkPlugins: [remarkFrontmatter, remarkGfm, remarkPostImages],
};
