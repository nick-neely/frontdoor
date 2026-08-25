import type { Root as HastRoot } from "hast";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

/**
 * Adult prose reading speed, rounded down from the usual 200-250 range so the
 * estimate reads as generous rather than optimistic.
 */
const wordsPerMinute = 220;

/**
 * The same pipeline the build uses to render a Post, minus the parts that
 * produce JavaScript. Counting the raw MDX instead would charge the reader for
 * frontmatter, import statements, JSX attributes, and comments, none of which
 * reach the page.
 *
 * Expressions, frontmatter, and ESM are dropped because they render nothing
 * textual; JSX elements pass through so prose inside a component still counts.
 */
function renderNothing(): undefined {
  return undefined;
}

const processor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(remarkGfm)
  .use(remarkMdx)
  .use(remarkRehype, {
    handlers: {
      mdxFlowExpression: renderNothing,
      mdxTextExpression: renderNothing,
      mdxjsEsm: renderNothing,
    },
    passThrough: ["mdxJsxFlowElement", "mdxJsxTextElement"],
  });

function countWords(value: string): number {
  return value.split(/\s+/u).filter((word) => word.length > 0).length;
}

/**
 * Minutes to read the rendered output of one MDX file, frontmatter included:
 * the pipeline drops it the same way the build does.
 */
export function readingMinutes(source: string): number {
  const tree: HastRoot = processor.runSync(processor.parse(source));
  let words = 0;

  visit(tree, "text", (node) => {
    words += countWords(node.value);
  });

  return Math.max(1, Math.round(words / wordsPerMinute));
}
