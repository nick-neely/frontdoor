// The generated content-collections index, imported by relative path rather
// than through an alias so that Vite and Vitest resolve it the same way. This
// is the only module allowed to touch the generated output; every rendering
// surface reads writing through the exports below.
//
// It is a barrel now that there are two collections, and react-doctor is right
// about barrels in general. It stays because it is the only entry point
// content-collections emits types for: the per-collection files beside it have
// no declarations, so importing one directly trades a handful of bytes for an
// untyped index.
// oxlint-disable-next-line react-doctor/no-barrel-import
import {
  allFixtures,
  allWritings,
} from "../../.content-collections/generated/index.js";
import {
  compareNotes,
  comparePosts,
  isNote,
  isPost,
} from "./writing-schema.ts";

// Re-exported so a route needs one import, and so that whether a helper is
// derived from frontmatter or from the index stays an implementation detail.
export {
  formatPostDate,
  isNote,
  pillarLabel,
  postCanonicalPath,
  postOgImagePath,
  postPath,
  postTitleTransitionName,
  writingDescription,
} from "./writing-schema.ts";

/**
 * One entry in the writing collection: frontmatter plus what the build adds.
 * Both kinds are this type, because a Post and a Note differ in how they are
 * listed and dated rather than in what they carry.
 */
export type WritingEntry = (typeof allWritings)[number];

/**
 * Everything the site publishes, newest first, of either kind. Everything
 * under `content/writing` is published: merging it is publishing it.
 *
 * This is the list that answers whether a URL exists: a Note is a public page
 * exactly like a Post, so it prerenders, appears in the sitemap, and gets a
 * card. The kinds part company below, where the difference is visible.
 */
export const publishedWriting: readonly WritingEntry[] =
  allWritings.toSorted(comparePosts);

/**
 * Every published Post, newest first. This is the dated half of the site: the
 * `/writing` feed, the RSS items, and the home page Updates all come from
 * here and from nowhere else.
 */
export const posts: readonly WritingEntry[] = publishedWriting.filter(isPost);

/**
 * Every published Note, by title. A Note is evergreen and revised in place, so
 * it is listed alphabetically and undated; see `compareNotes`.
 */
export const notes: readonly WritingEntry[] = publishedWriting
  .filter(isNote)
  .toSorted(compareNotes);

export function findWriting(slug: string): WritingEntry | undefined {
  return publishedWriting.find((entry) => entry.slug === slug);
}

/**
 * The entry a reading URL resolves to, which is not quite the same question.
 *
 * In production it is published writing and nothing else. In development the
 * fixtures under `content/fixtures` open at their own URLs too, because their
 * whole purpose is to be opened and looked at. They never appear on
 * `/writing`, in the feed, or in the sitemap; the URL has to be typed.
 */
export function findReadableWriting(slug: string): WritingEntry | undefined {
  const readable = import.meta.env.DEV
    ? [...publishedWriting, ...allFixtures]
    : publishedWriting;

  return readable.find((entry) => entry.slug === slug);
}

/** Module specifier of the compiled MDX body, and the key its glob is under. */
export function postModuleId(entry: WritingEntry): string {
  return entry.modulePath;
}
