import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";

import {
  compareProjectPages,
  projectFrontmatterSchema,
} from "./project-schema.ts";
import type { ProjectFrontmatter } from "./project-schema.ts";

const projectsDirectory = fileURLToPath(
  new URL("../../content/projects", import.meta.url)
);

/** The subset of a parse this module cares about, however it failed. */
function tryParse(source: string) {
  try {
    return projectFrontmatterSchema.safeParse(matter(source).data);
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error(String(error)),
      success: false,
    } as const;
  }
}

/**
 * Project detail pages, read straight from the MDX frontmatter on disk.
 *
 * This is the build's view of the collection, and it is separate from the
 * run-time view for the same two reasons ADR-0001 gives for writing:
 *
 * - The prerender inventory is consumed while `vite.config.ts` is still being
 *   evaluated, so reading another plugin's output would make the order of the
 *   plugin array decide whether the build is correct.
 * - Anything `vite.config.ts` imports becomes a config dependency, and Vite
 *   restarts the dev server whenever one changes. The content-collections
 *   plugin rewrites its index on every start, so importing it here would be an
 *   endless restart loop.
 *
 * `src/lib/project-pages.ts` is the run-time view over the same content. The
 * two agree because they share the schema and the ordering, and because
 * `project-pages.test.ts` asserts that they do.
 *
 * `directory` defaults to the real content/projects/ but is overridable so
 * tests can point it at a throwaway fixture directory instead of writing into
 * the tree the dev server's content-collections watcher is scanning.
 */
export function readProjectPages(
  directory = projectsDirectory
): ProjectFrontmatter[] {
  const entries: ProjectFrontmatter[] = [];

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

  return entries.toSorted(compareProjectPages);
}
