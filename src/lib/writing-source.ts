import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";

import { comparePosts, writingFrontmatterSchema } from "./writing-schema.ts";
import type { WritingFrontmatter } from "./writing-schema.ts";

const writingDirectory = fileURLToPath(
  new URL("../../content/writing", import.meta.url)
);

/**
 * Published writing, read straight from the MDX frontmatter on disk.
 *
 * This is the build's view of the collection, and per ADR-0001 it deliberately
 * does not import the generated content-collections index. Two reasons, both
 * load-bearing:
 *
 * - The prerender inventory is consumed while `vite.config.ts` is still being
 *   evaluated, so reading another plugin's output would make the order of the
 *   plugin array decide whether the build is correct.
 * - Anything `vite.config.ts` imports becomes a config dependency, and Vite
 *   restarts the dev server whenever one changes. The content-collections
 *   plugin rewrites its index on every start, so importing it here would be an
 *   endless restart loop.
 *
 * `src/lib/writing.ts` is the run-time view over the same content. The two
 * agree because they share the schema and the ordering, and because
 * `writing.test.ts` asserts that they do.
 */
function tryParse(source: string) {
  try {
    return writingFrontmatterSchema.safeParse(matter(source).data);
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error(String(error)),
      success: false,
    } as const;
  }
}

export function readPublishedWriting(): WritingFrontmatter[] {
  const entries: WritingFrontmatter[] = [];

  for (const fileName of readdirSync(writingDirectory)) {
    if (!fileName.endsWith(".mdx")) {
      continue;
    }

    const source = readFileSync(path.join(writingDirectory, fileName), "utf-8");
    // Malformed YAML throws out of `matter`, so both failure modes are caught
    // here. Either way the message has to name the file: the next thing to run
    // is the prerenderer, and its error would name a route instead.
    const result = tryParse(source);

    if (!result.success) {
      throw new Error(
        `content/writing/${fileName}: invalid frontmatter.\n${result.error.message}`
      );
    }

    // A draft has no prerendered page, no sitemap entry, no card, and no feed
    // item. Excluding it here is what makes all four true at once.
    if (!result.data.draft) {
      entries.push(result.data);
    }
  }

  return entries.toSorted(comparePosts);
}
