import { readFileSync } from "node:fs";
import path from "node:path";

import { defineCollection, defineConfig } from "@content-collections/core";

import { readingMinutes } from "./src/lib/reading-time.ts";
import { writingFrontmatterSchema } from "./src/lib/writing-schema.ts";

const writingDirectory = "content/writing";
const mdxExtension = ".mdx";

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
    const stem = path.basename(fileName, mdxExtension);

    // The slug is hand-authored and immutable, and it is also how every other
    // surface finds the body module. A silent mismatch would produce a Post
    // that renders at one URL and 404s at the one the feed advertises.
    if (frontmatter.slug !== stem) {
      throw new Error(
        `content/writing/${fileName}: frontmatter slug "${frontmatter.slug}" must match the file name "${stem}${mdxExtension}".`
      );
    }

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

export default defineConfig({ content: [writing] });
