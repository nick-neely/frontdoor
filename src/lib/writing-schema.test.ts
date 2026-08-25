import { describe, expect, it } from "vitest";

import {
  pillarIds,
  pillarLabels,
  writingFrontmatterSchema,
} from "./writing-schema.ts";

const valid = {
  description: "A one-line dek.",
  pillar: "practical-ai",
  published: "2026-08-25",
  slug: "a-real-post",
  title: "A real post",
};

describe("writing frontmatter", () => {
  it("defaults kind and draft so most Posts declare neither", () => {
    const parsed = writingFrontmatterSchema.parse(valid);

    expect(parsed.kind).toBe("post");
    expect(parsed.draft).toBeFalsy();
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

  it("keeps an ogImage override site-relative", () => {
    expect(
      writingFrontmatterSchema.safeParse({
        ...valid,
        ogImage: "https://example.com/card.png",
      }).success
    ).toBeFalsy();
    expect(
      writingFrontmatterSchema.safeParse({
        ...valid,
        ogImage: "/og/custom.png",
      }).success
    ).toBeTruthy();
  });
});
