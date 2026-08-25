import { rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { readPublishedWriting } from "./writing-source.ts";

const fixtureSlug = "writing-source-fixture";
const fixturePath = fileURLToPath(
  new URL(`../../content/writing/${fixtureSlug}.mdx`, import.meta.url)
);

function withFixture(frontmatter: string, assertion: () => void) {
  writeFileSync(fixturePath, `---\n${frontmatter}\n---\n\nBody.\n`, "utf-8");

  try {
    assertion();
  } finally {
    rmSync(fixturePath, { force: true });
  }
}

const published = [
  'title: "Fixture"',
  `slug: "${fixtureSlug}"`,
  'description: "A fixture."',
  'published: "2026-01-01"',
  'pillar: "practical-ai"',
].join("\n");

describe("what the build reads off disk", () => {
  it("excludes drafts, so a draft never reaches the prerenderer or the feed", () => {
    withFixture(`${published}\ndraft: true`, () => {
      expect(readPublishedWriting().map((post) => post.slug)).not.toContain(
        fixtureSlug
      );
    });
  });

  it("includes the same file once it is no longer a draft", () => {
    withFixture(published, () => {
      expect(readPublishedWriting().map((post) => post.slug)).toContain(
        fixtureSlug
      );
    });
  });

  // Failing here rather than three stages later is the point: the alternative
  // is a prerender error that names a route instead of a file.
  it.each([
    [
      "a Pillar that does not exist",
      published.replace("practical-ai", "musings"),
    ],
    ["YAML that does not parse", `${published}\n  indented: oops`],
  ])("refuses %s, naming the file", (_case, frontmatter) => {
    withFixture(frontmatter, () => {
      expect(() => readPublishedWriting()).toThrow(fixtureSlug);
    });
  });
});
