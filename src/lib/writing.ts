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

/** Everything in the collection, newest first, drafts included. */
const allPosts: readonly Post[] = allWritings.toSorted(comparePosts);

/**
 * Every Post the site publishes, newest first. Drafts never appear here, which
 * is what keeps them off the list, off the reading surface, and out of the
 * metadata each page emits. Notes share the collection until the visible split
 * lands.
 */
export const posts: readonly Post[] = allPosts.filter((entry) => !entry.draft);

export function findPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

/**
 * The Post a reading URL resolves to, which is not quite the same question.
 *
 * In production it is a published Post and nothing else: a draft is a wrong
 * door, exactly like a slug that was never written. In development a draft
 * opens at its own URL, because a draft nobody can read is a draft nobody can
 * review - and `content/writing/writing-surface-fixture.mdx` is a permanent one
 * whose whole purpose is to be opened and looked at.
 *
 * It still does not appear on `/writing`, in the feed, or in the sitemap. The
 * URL has to be typed, which is the entire mechanism and the entire safeguard.
 */
export function findReadablePost(slug: string): Post | undefined {
  const readable = import.meta.env.DEV ? allPosts : posts;

  return readable.find((post) => post.slug === slug);
}

/** Module specifier of the compiled MDX body, and the key its glob is under. */
export function postModuleId(post: Post): string {
  return `/content/writing/${post.fileName}`;
}
