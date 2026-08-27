import { z } from "zod";

import type { OgCardContent } from "./og-card-layout.ts";
import { siteConfig } from "./site-config.ts";

/**
 * What the writing namespace is about. The `/writing` page and the feed say the
 * same thing because they describe the same collection.
 */
export const writingDescription =
  "Writing on product engineering, practical AI-assisted development, and building workflow products in public.";

/**
 * The three Pillars from `CONTEXT.md`, in the order the site names them. A
 * piece that fits no Pillar does not belong here, which is why `pillar` is
 * required rather than defaulted.
 */
export const pillarIds = [
  "product-engineering",
  "practical-ai",
  "building-in-public",
] as const;

export type Pillar = (typeof pillarIds)[number];

/**
 * Reader-facing Pillar names. The identifier is the storage form; this is the
 * only thing a page is allowed to print.
 */
export const pillarLabels = {
  "building-in-public": "Building in Public",
  "practical-ai": "Practical AI",
  "product-engineering": "Product Engineering",
} as const satisfies Record<Pillar, string>;

/**
 * Slugs are hand-authored and immutable, so they are constrained to the shape
 * that survives being a URL segment, a file name, and a CSS identifier
 * fragment for the shared-element view transition.
 */
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

/**
 * One leading slash and no backslashes. A second slash makes the value a
 * network-path reference, and a backslash is treated as one by every browser,
 * so either would send `absoluteUrl` to a foreign origin and publish that as
 * this Post's `og:image`. The path is also a file name under `.output/public`
 * during the build, which the same constraint keeps honest.
 */
const sitePathPattern = /^\/(?![/\\])[^\\]*$/u;

/**
 * Frontmatter for everything under `content/writing`. Posts and Notes share
 * the schema and the namespace; `kind` is what separates them, and the visible
 * split is deferred.
 */
export const writingFrontmatterSchema = z.object({
  /** Absolute URL when the piece was first published elsewhere. */
  canonical: z.url().optional(),
  description: z.string().min(1),
  draft: z.boolean().default(false),
  kind: z.enum(["post", "note"]).default("post"),
  /** Site-relative path to a hand-made card, replacing the generated one. */
  ogImage: z.string().regex(sitePathPattern).optional(),
  pillar: z.enum(pillarIds),
  published: z.iso.date(),
  slug: z.string().regex(slugPattern),
  tags: z.array(z.string().min(1)).optional(),
  title: z.string().min(1),
  updated: z.iso.date().optional(),
});

export type WritingFrontmatter = z.infer<typeof writingFrontmatterSchema>;

/**
 * Everything below is derived from frontmatter alone, so it holds whether an
 * entry came from the generated index at run time or was read off disk while
 * `vite.config.ts` was still being evaluated. Both paths exist on purpose (see
 * `docs/adr/0001-mdx-compiled-as-modules.md`); sharing these keeps them from
 * disagreeing about ordering, URLs, or how a date is written.
 */
const dateFormatter = new Intl.DateTimeFormat(siteConfig.language, {
  dateStyle: "long",
  // Frontmatter dates are calendar days with no time zone. Formatting them in
  // the reader's zone would render 2026-08-25 as the 24th west of UTC, and the
  // server and the client would disagree during hydration.
  timeZone: "UTC",
});

/** Newest first, with the slug settling same-day ties deterministically. */
export function comparePosts(
  left: WritingFrontmatter,
  right: WritingFrontmatter
): number {
  return (
    right.published.localeCompare(left.published) ||
    left.slug.localeCompare(right.slug)
  );
}

export function postPath(post: WritingFrontmatter): string {
  return `/writing/${post.slug}`;
}

/**
 * Where the canonical link should point. A Post first published elsewhere
 * declares `canonical` in frontmatter and keeps crediting the original.
 */
export function postCanonicalPath(post: WritingFrontmatter): string {
  return post.canonical ?? postPath(post);
}

/**
 * The Post's social card. Generated at build time into the client output
 * unless frontmatter names a hand-made one.
 */
export function postOgImagePath(post: WritingFrontmatter): string {
  return post.ogImage ?? `/og/writing/${post.slug}.png`;
}

/**
 * The shared-element name that carries a Post's title between the list row and
 * the post heading. Slugs are constrained to lowercase words and hyphens, so
 * the result is always a valid CSS identifier and always unique per document.
 */
export function postTitleTransitionName(post: WritingFrontmatter): string {
  return `post-title-${post.slug}`;
}

export function pillarLabel(post: WritingFrontmatter): string {
  return pillarLabels[post.pillar];
}

/** `2026-08-25` as `August 25, 2026`. */
export function formatPostDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

/** What a Post's generated social card says: the title, the Pillar, the date. */
export function postOgCard(post: WritingFrontmatter): OgCardContent {
  return {
    meta: [pillarLabel(post), formatPostDate(post.published)],
    title: post.title,
  };
}
