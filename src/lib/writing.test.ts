import { describe, expect, it } from "vitest";

import { readPublishedWriting } from "./writing-source.ts";
import {
  findWriting,
  notes,
  postOgImagePath,
  postPath,
  postTitleTransitionName,
  posts,
  publishedWriting,
} from "./writing.ts";

/** The fields both loaders must agree on, as one comparable string. */
const identity = (entry: { published: string; slug: string; title: string }) =>
  `${entry.published} ${entry.slug} ${entry.title}`;

describe("the writing index", () => {
  it("publishes at least one Post, so every other assertion means something", () => {
    expect(posts.length).toBeGreaterThan(0);
  });

  it("excludes drafts, which is what keeps them out of the build and the feed", () => {
    expect(publishedWriting.some((entry) => entry.draft)).toBeFalsy();
  });

  // The two lists are the whole split: `posts` is the dated feed and `notes`
  // is the evergreen shelf, and nothing published is allowed to fall between
  // them or land in both.
  it("splits everything published into exactly one of the two lists", () => {
    expect(posts.every((post) => post.kind === "post")).toBeTruthy();
    expect(notes.every((note) => note.kind === "note")).toBeTruthy();
    expect(posts.length + notes.length).toBe(publishedWriting.length);
  });

  it("orders Notes by title rather than by date", () => {
    const titles = notes.map((note) => note.title);

    expect(titles).toStrictEqual([...titles].toSorted());
  });

  it("orders Posts newest first", () => {
    const published = posts.map((post) => post.published);

    expect(published).toStrictEqual([...published].toSorted().toReversed());
  });

  it("keeps slugs unique, since they address the page, the card, and the feed item", () => {
    expect(new Set(publishedWriting.map((entry) => entry.slug)).size).toBe(
      publishedWriting.length
    );
  });

  it("finds a published piece by slug and nothing by an unknown one", () => {
    const [first] = publishedWriting;

    expect(first).toBeDefined();
    expect(findWriting(first?.slug ?? "")).toBe(first);
    expect(findWriting("no-such-post")).toBeUndefined();
  });

  // The build reads frontmatter off disk and the site reads the generated
  // index; ADR-0001 keeps them separate so plugin order can never matter. This
  // is the assertion that keeps them saying the same thing.
  it("agrees with what the build reads off disk", () => {
    expect(readPublishedWriting().map(identity)).toStrictEqual(
      publishedWriting.map(identity)
    );
  });

  it("derives paths that join onto the origin and a CSS-safe transition name", () => {
    for (const entry of publishedWriting) {
      expect(postPath(entry)).toBe(`/writing/${entry.slug}`);
      expect(postOgImagePath(entry).startsWith("/")).toBeTruthy();
      expect(postTitleTransitionName(entry)).toMatch(/^[a-z][\w-]*$/u);
    }
  });
});
