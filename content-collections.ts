import { readFileSync } from "node:fs";
import path from "node:path";

import { defineCollection, defineConfig } from "@content-collections/core";

import { projectFrontmatterSchema } from "./src/lib/project-schema.ts";
import { readingMinutes } from "./src/lib/reading-time.ts";
import { writingFrontmatterSchema } from "./src/lib/writing-schema.ts";

const writingDirectory = "content/writing";
const projectsDirectory = "content/projects";
const mdxExtension = ".mdx";

/**
 * The slug is hand-authored and immutable, and it is also how every other
 * surface finds the body module. A silent mismatch would produce a document
 * that renders at one URL and 404s at the one the site advertises.
 */
function assertSlugMatchesFileName(
  directory: string,
  fileName: string,
  slug: string
): void {
  const stem = path.basename(fileName, mdxExtension);

  if (slug !== stem) {
    throw new Error(
      `${directory}/${fileName}: frontmatter slug "${slug}" must match the file name "${stem}${mdxExtension}".`
    );
  }
}

/**
 * The typed index of everything under `content/writing`, per ADR-0001. It
 * carries frontmatter and nothing else: `@mdx-js/rollup` compiles each body
 * into its own module, and `src/lib/writing.ts` pairs the two lazily, so the
 * list page, the home feed, the sitemap, and the feed never load prose.
 *
 * `frontmatter-only` keeps the body out of the document, which is why reading
 * time is computed from a separate read of the file rather than from a
 * `content` field the schema would otherwise have to declare.
 */
const writing = defineCollection({
  directory: writingDirectory,
  include: `*${mdxExtension}`,
  name: "writing",
  parser: "frontmatter-only",
  schema: writingFrontmatterSchema,
  transform: (document) => {
    const { _meta, ...frontmatter } = document;
    const { fileName } = _meta;

    assertSlugMatchesFileName(writingDirectory, fileName, frontmatter.slug);

    const source = readFileSync(
      path.join(writingDirectory, _meta.filePath),
      "utf-8"
    );

    return {
      ...frontmatter,
      fileName,
      readingMinutes: readingMinutes(source),
    };
  },
  typeName: "Post",
});

/**
 * The typed index of every Project detail page. Same arrangement as `writing`
 * and for the same reason: `@mdx-js/rollup` compiles each body into its own
 * module, so the list page can ask whether a Project has a page without
 * loading a word of the prose on it.
 *
 * Frontmatter is two fields, because `src/lib/projects.ts` is the single
 * source of everything else a page shows about a Project.
 */
const projectPage = defineCollection({
  directory: projectsDirectory,
  include: `*${mdxExtension}`,
  name: "projectPage",
  parser: "frontmatter-only",
  schema: projectFrontmatterSchema,
  transform: (document) => {
    const { _meta, ...frontmatter } = document;
    const { fileName } = _meta;

    assertSlugMatchesFileName(projectsDirectory, fileName, frontmatter.slug);

    return { ...frontmatter, fileName };
  },
  typeName: "ProjectPage",
});

export default defineConfig({ content: [writing, projectPage] });
