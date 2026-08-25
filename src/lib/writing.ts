// The generated content-collections index, imported by relative path rather
// than through an alias so that Vite and Vitest resolve it the same way. This
// is the only module allowed to touch the generated output; every rendering
// surface reads writing through the exports below.
import { allWritings } from "../../.content-collections/generated/index.js";
import { comparePosts } from "./writing-schema.ts";

// Re-exported so a route needs one import, and so that whether a helper is
// derived from frontmatter or from the index stays an implementation detail.
export {
  formatPostDate,
  pillarLabel,
  postCanonicalPath,
  postOgImagePath,
  postPath,
  postTitleTransitionName,
  writingDescription,
} from "./writing-schema.ts";

/** One entry in the writing collection: frontmatter plus what the build adds. */
export type Post = (typeof allWritings)[number];

/**
 * Every Post the site publishes, newest first. Drafts never appear here, which
 * is what keeps them off the list, off the reading surface, and out of the
 * metadata each page emits. Notes share the collection until the visible split
 * lands.
 */
export const posts: readonly Post[] = allWritings
  .filter((entry) => !entry.draft)
  .toSorted(comparePosts);

export function findPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

/** Module specifier of the compiled MDX body, and the key its glob is under. */
export function postModuleId(post: Post): string {
  return `/content/writing/${post.fileName}`;
}
