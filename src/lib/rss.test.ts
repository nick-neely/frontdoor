import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import { renderRssFeed } from "./rss.ts";
import { siteConfig } from "./site-config.ts";
import type { WritingFrontmatter } from "./writing-schema.ts";
import { postPath, posts } from "./writing.ts";

/*
 * Fabricated entries, used only where the assertion is about `kind`. The real
 * collection has no published Note yet, so asserting the exclusion against it
 * would pass without proving anything.
 */
function entry(
  kind: "note" | "post",
  published: string,
  slug: string
): WritingFrontmatter {
  return {
    description: `${slug} description`,
    draft: false,
    kind,
    pillar: "practical-ai",
    published,
    slug,
    title: slug,
  };
}

function parseFeed(xml: string): Document {
  const { window } = new JSDOM("", { contentType: "text/html" });
  const parsed = new window.DOMParser().parseFromString(xml, "text/xml");

  // An XML parse failure is reported as a document rather than an exception,
  // so a malformed feed only fails here if the marker element is checked.
  expect(parsed.querySelector("parsererror")).toBeNull();

  return parsed;
}

describe("the RSS feed", () => {
  const feed = renderRssFeed(posts);
  const document = parseFeed(feed);

  // A CSS type selector cannot address a prefixed name, so channel children are
  // matched on their qualified tag name instead.
  const channelChild = (tagName: string) =>
    [...document.querySelectorAll("channel > *")].find(
      (element) => element.tagName === tagName
    );

  it("declares itself once, at the URL the footer links", () => {
    expect(channelChild("link")?.textContent).toBe(
      `${siteConfig.origin}/writing`
    );
    expect(channelChild("atom:link")?.getAttribute("href")).toBe(
      `${siteConfig.origin}${siteConfig.links.rss}`
    );
  });

  it("carries exactly the published Posts", () => {
    const items = [...document.querySelectorAll("item")];

    expect(items).toHaveLength(posts.length);
    expect(
      items.map((item) => item.querySelector("title")?.textContent)
    ).toStrictEqual(posts.map((post) => post.title));
  });

  it("gives every item an absolute link, a matching permalink guid, and an RFC-822 date", () => {
    const items = [...document.querySelectorAll("item")];

    expect(items).toHaveLength(posts.length);

    for (const [index, post] of posts.entries()) {
      const item = items[index];
      const url = `${siteConfig.origin}${postPath(post)}`;

      expect(item).toBeDefined();

      expect(item?.querySelector("link")?.textContent).toBe(url);
      expect(item?.querySelector("guid")?.textContent).toBe(url);
      expect(item?.querySelector("guid")?.getAttribute("isPermaLink")).toBe(
        "true"
      );
      expect(item?.querySelector("pubDate")?.textContent).toMatch(
        /^\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/u
      );
    }
  });

  it("escapes markup rather than emitting it, so a title with an ampersand stays valid", () => {
    expect(feed).not.toMatch(/<title>[^<]*[&][^<]*(?<!amp;)/u);
    expect(parseFeed(feed).querySelector("parsererror")).toBeNull();
  });

  it("is byte-identical between renders, so a rebuild is not a feed update", () => {
    expect(renderRssFeed(posts)).toBe(feed);
  });

  // A feed item is a dated announcement. A Note is revised rather than
  // superseded, so its `pubDate` would claim a moment it does not have, and a
  // revision would either re-announce something subscribers already read or
  // land silently below what they have.
  it("carries no Note, whatever date the Note's frontmatter holds", () => {
    const mixed = parseFeed(
      renderRssFeed([
        entry("note", "2026-08-26", "a-note"),
        entry("post", "2026-08-20", "a-post"),
      ])
    );
    const items = [...mixed.querySelectorAll("item")];

    expect(
      items.map((item) => item.querySelector("title")?.textContent)
    ).toStrictEqual(["a-post"]);
  });

  // `lastBuildDate` dates the feed, so it has to follow the newest thing in
  // it rather than the newest thing it was handed.
  it("dates itself by the newest Post rather than by a newer Note", () => {
    const channelDate = (xml: string) =>
      [...parseFeed(xml).querySelectorAll("channel > *")].find(
        (element) => element.tagName === "lastBuildDate"
      )?.textContent;

    expect(
      channelDate(
        renderRssFeed([
          entry("note", "2026-08-26", "a-note"),
          entry("post", "2026-08-20", "a-post"),
        ])
      )
    ).toBe(channelDate(renderRssFeed([entry("post", "2026-08-20", "a-post")])));
  });

  it("stays a valid empty feed when there is nothing but Notes", () => {
    const onlyNotes = renderRssFeed([entry("note", "2026-08-26", "a-note")]);

    expect(parseFeed(onlyNotes).querySelectorAll("item")).toHaveLength(0);
  });
});
