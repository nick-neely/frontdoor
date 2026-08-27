import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { isDraftBody, readPublishedWriting } from "./writing-source.ts";

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

  it("excludes drafts, so a draft never reaches the prerenderer or the feed", () => {
    withFixture(`${published}\ndraft: true`, () => {
      expect(
        readPublishedWriting(fixtureDirectory).map((post) => post.slug)
      ).not.toContain(fixtureSlug);
    });
  });

  it("includes the same file once it is no longer a draft", () => {
    withFixture(published, () => {
      expect(
        readPublishedWriting(fixtureDirectory).map((post) => post.slug)
      ).toContain(fixtureSlug);
    });
  });

  // A draft has no page, so its prose has no reason to be in the bundle every
  // published Post shares. This is what `vite.config.ts` asks before it decides
  // whether to compile a body at all.
  it("recognises a draft body by the file the build is about to compile", () => {
    withFixture(`${published}\ndraft: true`, () => {
      expect(
        isDraftBody(
          path.join(fixtureDirectory, `${fixtureSlug}.mdx`),
          fixtureDirectory
        )
      ).toBeTruthy();
    });
  });

  it.each([
    ["a published Post", published, `${fixtureSlug}.mdx`],
    ["a file that is not writing at all", published, "notes.txt"],
  ])("does not call %s a draft body", (_case, frontmatter, fileName) => {
    withFixture(frontmatter, () => {
      expect(
        isDraftBody(path.join(fixtureDirectory, fileName), fixtureDirectory)
      ).toBeFalsy();
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
      expect(() => readPublishedWriting(fixtureDirectory)).toThrow(fixtureSlug);
    });
  });
});
