import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { isFixtureBody, readWriting } from "./writing-source.ts";

const fixtureSlug = "writing-source-fixture";

// A fresh directory per test keeps fixtures out of content/writing/, which
// the dev server's content-collections watcher scans. Writing fixtures there
// triggers rebuilds mid-test-run, and the loud-failure case below would leave
// the generated index empty for whatever runs next against the real content.
let fixtureDirectory: string;

function withFixture(frontmatter: string, assertion: () => void) {
  fixtureDirectory = mkdtempSync(path.join(tmpdir(), "writing-source-"));
  writeFileSync(
    path.join(fixtureDirectory, `${fixtureSlug}.mdx`),
    `---\n${frontmatter}\n---\n\nBody.\n`,
    "utf-8"
  );

  assertion();
}

const published = [
  'title: "Fixture"',
  `slug: "${fixtureSlug}"`,
  'description: "A fixture."',
  'published: "2026-01-01"',
  'pillar: "practical-ai"',
].join("\n");

describe("what the build reads off disk", () => {
  afterEach(() => {
    if (fixtureDirectory) {
      rmSync(fixtureDirectory, { force: true, recursive: true });
    }
  });

  it("includes every Post on disk, because merging one is publishing it", () => {
    withFixture(published, () => {
      expect(readWriting(fixtureDirectory).map((post) => post.slug)).toContain(
        fixtureSlug
      );
    });
  });

  // This reader is what `public-routes.ts` expands `/writing/$slug` with and
  // what the build draws cards from, so a Note reaching it is what makes a
  // Note a real page rather than a row on a list. Only the feed narrows to
  // Posts, and it does that itself.
  it("includes a published Note, which is a page exactly like a Post", () => {
    withFixture(`${published}\nkind: note`, () => {
      const entries = readWriting(fixtureDirectory);

      expect(entries.map((entry) => entry.slug)).toContain(fixtureSlug);
      expect(entries.every((entry) => entry.kind === "note")).toBeTruthy();
    });
  });

  // A fixture has no production page, so its prose has no reason to be in the
  // bundle every published Post shares. This is what `vite.config.ts` asks
  // before it decides whether to compile a body at all. Only the directory
  // decides, so these need no files on disk.
  describe("which bodies the build empties", () => {
    const fixtures = path.resolve("content", "fixtures");

    it("recognises a fixture body by the directory it lives in", () => {
      expect(
        isFixtureBody(path.join(fixtures, "a-fixture.mdx?import"), fixtures)
      ).toBeTruthy();
    });

    it.each([
      ["a published Post", path.resolve("content", "writing", "a-post.mdx")],
      ["a fixture's picture", path.join(fixtures, "a-fixture", "glyph.png")],
      ["a file that is not writing at all", path.join(fixtures, "notes.txt")],
    ])("does not call %s a fixture body", (_case, id) => {
      expect(isFixtureBody(id, fixtures)).toBeFalsy();
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
      expect(() => readWriting(fixtureDirectory)).toThrow(fixtureSlug);
    });
  });
});
