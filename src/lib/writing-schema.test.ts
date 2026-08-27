import { describe, expect, it } from "vitest";
import type { z } from "zod";

import {
  compareNotes,
  isNote,
  isPost,
  pillarIds,
  pillarLabels,
  postOgCard,
  writingFrontmatterSchema,
} from "./writing-schema.ts";

const valid = {
  description: "A one-line dek.",
  pillar: "practical-ai",
  published: "2026-08-25",
  slug: "a-real-post",
  title: "A real post",
};

/** Frontmatter as the collection sees it, so `kind` and `draft` are resolved. */
const entry = (overrides: Partial<z.input<typeof writingFrontmatterSchema>>) =>
  writingFrontmatterSchema.parse({ ...valid, ...overrides });

describe("writing frontmatter", () => {
  it("defaults kind and draft so most Posts declare neither", () => {
    const parsed = writingFrontmatterSchema.parse(valid);

    expect(parsed.kind).toBe("post");
    expect(parsed.draft).toBeFalsy();
  });

  it("tells the two kinds apart, which is the only thing kind is for", () => {
    const note = entry({ kind: "note" });
    const post = entry({});

    expect(isNote(note)).toBeTruthy();
    expect(isPost(note)).toBeFalsy();
    expect(isPost(post)).toBeTruthy();
    expect(isNote(post)).toBeFalsy();
  });

  // A Note is revised rather than superseded, so it is shelved alphabetically
  // and its date never orders anything.
  it("sorts Notes by title, with the slug settling a tie", () => {
    const notes = [
      entry({ published: "2020-01-01", slug: "zebra", title: "Zebra" }),
      entry({ published: "2026-08-25", slug: "second-ant", title: "Ant" }),
      entry({ published: "2026-08-25", slug: "first-ant", title: "Ant" }),
    ];

    expect(notes.toSorted(compareNotes).map((note) => note.slug)).toStrictEqual(
      ["first-ant", "second-ant", "zebra"]
    );
  });

  // The card is the page's claim in a smaller frame, so it makes exactly the
  // claims the page does: a date for a Post, none for a Note.
  it("puts the date on a Post's card and leaves it off a Note's", () => {
    expect(postOgCard(entry({})).meta).toStrictEqual([
      "Practical AI",
      "August 25, 2026",
    ]);
    expect(postOgCard(entry({ kind: "note" })).meta).toStrictEqual([
      "Practical AI",
    ]);
  });

  it("requires a Pillar, because a piece that fits none does not belong here", () => {
    const withoutPillar = { ...valid, pillar: undefined };

    expect(
      writingFrontmatterSchema.safeParse(withoutPillar).success
    ).toBeFalsy();
    expect(
      writingFrontmatterSchema.safeParse({ ...valid, pillar: "musings" })
        .success
    ).toBeFalsy();
  });

  it("names every Pillar it accepts", () => {
    for (const pillar of pillarIds) {
      expect(pillarLabels[pillar]).toMatch(/\S/u);
    }
  });

  // The slug is a URL segment, a file name, and part of a CSS identifier, so
  // anything that is not lowercase words joined by single hyphens breaks one of
  // the three.
  it.each(["Not-Lower", "trailing-", "double--hyphen", "has space", ""])(
    "rejects the slug %j",
    (slug) => {
      expect(
        writingFrontmatterSchema.safeParse({ ...valid, slug }).success
      ).toBeFalsy();
    }
  );

  it("rejects a published date that is not a calendar day", () => {
    expect(
      writingFrontmatterSchema.safeParse({ ...valid, published: "August 2026" })
        .success
    ).toBeFalsy();
  });

  // The override is resolved against the origin for `og:image` and used as a
  // file name during the build, so anything that can name another host is
  // refused here rather than published as this Post's card.
  it.each([
    "https://example.com/card.png",
    "//example.com/card.png",
    String.raw`/\example.com/card.png`,
    "og/custom.png",
  ])("rejects the ogImage %j", (ogImage) => {
    expect(
      writingFrontmatterSchema.safeParse({ ...valid, ogImage }).success
    ).toBeFalsy();
  });

  it("keeps an ogImage override site-relative", () => {
    expect(
      writingFrontmatterSchema.safeParse({
        ...valid,
        ogImage: "/og/writing/a-real-post.png",
      }).success
    ).toBeTruthy();
  });
});
