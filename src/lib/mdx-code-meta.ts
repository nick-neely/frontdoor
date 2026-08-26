import type { ShikiTransformer } from "shiki";

/**
 * The one fence-meta vocabulary this site understands, and the whole of it:
 *
 * ```ts title="src/lib/x.ts" {2,5-7}
 * ```
 *
 * `title` names the file the block came from and becomes a mono bar above the
 * code. The brace list is Shiki's own meta-highlight notation and is handled by
 * `transformerMetaHighlight`; there is deliberately no second syntax for the
 * same thing, so a block never highlights lines two different ways.
 */
const titlePattern = /(?:^|\s)title="(?<title>[^"]*)"/u;

/** The `title="..."` a fence declared, if it declared a non-empty one. */
export function codeBlockTitle(meta: string | undefined): string | undefined {
  const title =
    meta === undefined ? undefined : titlePattern.exec(meta)?.groups?.title;

  return title === undefined || title.length === 0 ? undefined : title;
}

/**
 * Carries the fence title across the boundary where the meta string stops
 * existing. Shiki reads meta while highlighting and emits plain HAST, so the
 * title has to be written onto the `<pre>` here or it is gone by the time the
 * MDX component map sees the element.
 */
export function transformerCodeBlockTitle(): ShikiTransformer {
  return {
    name: "front-door:code-block-title",
    pre(node) {
      const title = codeBlockTitle(this.options.meta?.__raw);

      if (title !== undefined) {
        node.properties["data-title"] = title;
      }
    },
  };
}
