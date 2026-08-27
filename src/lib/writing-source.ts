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

/**
 * Every entry on disk, drafts included.
 *
 * Only tooling that has to tell a draft from a missing file reads this -
 * `pnpm broadcast` refuses a draft slug by name rather than calling it
 * unknown. Nothing that renders a page should use it.
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
 * A draft has no prerendered page, no sitemap entry, no card, and no feed
 * item. Excluding it here is what makes all four true at once.
 *
 * Both kinds are included: a Note is a public page exactly like a Post, so it
 * prerenders, lands in the sitemap, and gets a card. The feed is the one
 * consumer that wants Posts alone, and `renderRssFeed` narrows to them itself
 * rather than making every caller remember to.
 */
export function readPublishedWriting(
  directory = writingDirectory
): WritingFrontmatter[] {
  return readWriting(directory).filter((entry) => !entry.draft);
}

/**
 * Whether a Vite module id is the body of a Post marked `draft: true`.
 *
 * A draft has no page, so nothing renders its prose - but the body glob in
 * `writing_.$slug.tsx` is exhaustive over the directory and has no way to read
 * frontmatter, so without this a draft's prose, and every picture it imports,
 * would still be compiled into the chunk that every published Post shares.
 * `vite.config.ts` empties those bodies out of the production bundle; the
 * development server keeps them, which is how a draft is previewed at all.
 *
 * Malformed frontmatter answers `false` rather than throwing. The same build
 * calls `readPublishedWriting`, which names the file and stops; failing twice
 * about one file, once without a name, would only make that message harder to
 * find.
 *
 * `directory` is overridable for the same reason it is above: a test must not
 * write fixtures into the tree the development server is watching.
 */
export function isDraftBody(id: string, directory = writingDirectory): boolean {
  const [file] = id.split("?");

  if (
    file === undefined ||
    !file.endsWith(".mdx") ||
    path.resolve(path.dirname(file)) !== path.resolve(directory)
  ) {
    return false;
  }

  const result = tryParse(readFileSync(file, "utf-8"));

  return result.success && result.data.draft;
}
