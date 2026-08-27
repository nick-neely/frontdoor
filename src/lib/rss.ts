import { absoluteUrl } from "./seo.ts";
import { siteConfig } from "./site-config.ts";
import { isPost, postPath, writingDescription } from "./writing-schema.ts";
import type { WritingFrontmatter } from "./writing-schema.ts";

const xmlEscapes = new Map([
  ['"', "&quot;"],
  ["&", "&amp;"],
  ["'", "&apos;"],
  ["<", "&lt;"],
  [">", "&gt;"],
]);

function escapeXml(value: string): string {
  return value.replaceAll(
    /["&'<>]/gu,
    (character) => xmlEscapes.get(character) ?? character
  );
}

/**
 * `2026-08-25` as `Tue, 25 Aug 2026 00:00:00 GMT`. Frontmatter dates are
 * calendar days, so they are anchored to UTC midnight rather than to whatever
 * zone the build machine happens to be in.
 */
function toFeedDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

function renderItem(post: WritingFrontmatter): string {
  const url = absoluteUrl(postPath(post));

  return [
    "    <item>",
    `      <title>${escapeXml(post.title)}</title>`,
    `      <link>${escapeXml(url)}</link>`,
    `      <description>${escapeXml(post.description)}</description>`,
    `      <pubDate>${toFeedDate(post.published)}</pubDate>`,
    `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
    "    </item>",
  ].join("\n");
}

/**
 * The feed the footer has always linked to. It takes the published entries
 * rather than reaching for them, so the build can hand it what it read from
 * disk and a test can hand it the run-time index.
 *
 * Posts only, and the filter lives here rather than at the two call sites so
 * that no caller can get it wrong. A feed item is a dated announcement, and a
 * Note is revised rather than superseded: its `pubDate` would claim a moment
 * the piece does not have, and a revision would either re-announce something
 * subscribers already read or land silently at the bottom of the feed.
 *
 * `lastBuildDate` follows the newest Post rather than the clock, which keeps
 * two builds of the same content byte-identical.
 */
export function renderRssFeed(writing: readonly WritingFrontmatter[]): string {
  const feedUrl = absoluteUrl(siteConfig.links.rss);
  const posts = writing.filter(isPost);
  const [newest] = posts;

  return `${[
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(`${siteConfig.name}: Writing`)}</title>`,
    `    <link>${escapeXml(absoluteUrl("/writing"))}</link>`,
    `    <description>${escapeXml(writingDescription)}</description>`,
    `    <language>${siteConfig.language}</language>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>`,
    ...(newest === undefined
      ? []
      : [`    <lastBuildDate>${toFeedDate(newest.published)}</lastBuildDate>`]),
    ...posts.map(renderItem),
    "  </channel>",
    "</rss>",
  ].join("\n")}\n`;
}
