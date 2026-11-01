import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";

import { comparePosts, writingFrontmatterSchema } from "./writing-schema.ts";
import type { WritingFrontmatter } from "./writing-schema.ts";

const writingDirectory = fileURLToPath(
  new URL("../../content/writing", import.meta.url)
);

const fixturesDirectory = fileURLToPath(
  new URL("../../content/fixtures", import.meta.url)
);

/**
 * Writing, read straight from the MDX frontmatter on disk. Everything under
 * `content/writing` is published: merging it is publishing it.
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

/**
 * Every published entry, newest first. Each one has a prerendered page, a
 * sitemap entry, and a card.
 *
 * Both kinds are included: a Note is a public page exactly like a Post, so it
 * prerenders, lands in the sitemap, and gets a card. The feed is the one
 * consumer that wants Posts alone, and `renderRssFeed` narrows to them itself
 * rather than making every caller remember to.
 *
 * `directory` defaults to the real content/writing/ but is overridable so
 * tests can point it at a throwaway fixture directory instead of writing
 * into the tree the dev server's content-collections watcher is scanning.
 */
export function readWriting(
  directory = writingDirectory
): WritingFrontmatter[] {
  const entries: WritingFrontmatter[] = [];

  for (const fileName of readdirSync(directory)) {
    if (!fileName.endsWith(".mdx")) {
      continue;
    }

    const source = readFileSync(path.join(directory, fileName), "utf-8");
    // Malformed YAML throws out of `matter`, so both failure modes are caught
    // here. Either way the message has to name the file: the next thing to run
    // is the prerenderer, and its error would name a route instead.
    const result = tryParse(source);

    if (!result.success) {
      throw new Error(
        `${path.join(directory, fileName)}: invalid frontmatter.\n${result.error.message}`
      );
    }

    entries.push(result.data);
  }

  return entries.toSorted(comparePosts);
}

/**
 * Whether a Vite module id is the body of a fixture under `content/fixtures`.
 *
 * Fixtures exist to be opened in the development server, so the body glob in
 * `writing_.$slug.tsx` includes them, and without this their prose, and every
 * picture they import, would be compiled into the chunk every published Post
 * shares. `vite.config.ts` empties those bodies out of the production bundle.
 * The directory decides, so nothing has to read frontmatter.
 *
 * `directory` is overridable so a test can name its own.
 */
export function isFixtureBody(
  id: string,
  directory = fixturesDirectory
): boolean {
  const [file] = id.split("?");

  return (
    file !== undefined &&
    file.endsWith(".mdx") &&
    path.resolve(path.dirname(file)) === path.resolve(directory)
  );
}
