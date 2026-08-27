import { describe, expect, it } from "vitest";

import { readPublishedWriting } from "./writing-source.ts";
import {
  findPost,
  postOgImagePath,
  postPath,
  postTitleTransitionName,
  posts,
} from "./writing.ts";

/** The fields both loaders must agree on, as one comparable string. */
const identity = (entry: { published: string; slug: string; title: string }) =>
  `${entry.published} ${entry.slug} ${entry.title}`;

describe("the writing index", () => {
  it("publishes at least one Post, so every other assertion means something", () => {
    expect(posts.length).toBeGreaterThan(0);
  });

  it("excludes drafts, which is what keeps them out of the build and the feed", () => {
    expect(posts.some((post) => post.draft)).toBeFalsy();
  });

  it("orders newest first", () => {
    const published = posts.map((post) => post.published);

    expect(published).toStrictEqual([...published].toSorted().toReversed());
  });

  it("keeps slugs unique, since they address the page, the card, and the feed item", () => {
    expect(new Set(posts.map((post) => post.slug)).size).toBe(posts.length);
  });

  it("finds a Post by slug and nothing by an unknown one", () => {
    const [first] = posts;

    expect(first).toBeDefined();
    expect(findPost(first?.slug ?? "")).toBe(first);
    expect(findPost("no-such-post")).toBeUndefined();
  });

  // The build reads frontmatter off disk and the site reads the generated
  // index; ADR-0001 keeps them separate so plugin order can never matter. This
  // is the assertion that keeps them saying the same thing.
  it("agrees with what the build reads off disk", () => {
    expect(readPublishedWriting().map(identity)).toStrictEqual(
      posts.map(identity)
    );
  });

  it("derives paths that join onto the origin and a CSS-safe transition name", () => {
    for (const post of posts) {
      expect(postPath(post)).toBe(`/writing/${post.slug}`);
      expect(postOgImagePath(post).startsWith("/")).toBeTruthy();
      expect(postTitleTransitionName(post)).toMatch(/^[a-z][\w-]*$/u);
    }
  });
});
