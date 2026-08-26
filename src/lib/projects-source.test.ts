import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { readProjectPages } from "./projects-source.ts";

const fixtureSlug = "pilog";

// A fresh directory per test keeps fixtures out of content/projects/, which
// the dev server's content-collections watcher scans. Writing fixtures there
// triggers rebuilds mid-test-run, and the loud-failure cases below would leave
// the generated index empty for whatever runs next against the real content.
let fixtureDirectory: string;

function withFixture(frontmatter: string, assertion: () => void) {
  fixtureDirectory = mkdtempSync(path.join(tmpdir(), "projects-source-"));
  writeFileSync(
    path.join(fixtureDirectory, `${fixtureSlug}.mdx`),
    `---\n${frontmatter}\n---\n\nBody.\n`,
    "utf-8"
  );

  assertion();
}

const page = [`slug: "${fixtureSlug}"`, 'dek: "A fixture."'].join("\n");

describe("what the build reads off disk", () => {
  afterEach(() => {
    if (fixtureDirectory) {
      rmSync(fixtureDirectory, { force: true, recursive: true });
    }
  });

  it("reads a detail page, which is what the prerenderer is handed", () => {
    withFixture(page, () => {
      expect(
        readProjectPages(fixtureDirectory).map((entry) => entry.slug)
      ).toStrictEqual([fixtureSlug]);
    });
  });

  // Failing here rather than three stages later is the point: the alternative
  // is a prerender error that names a route instead of a file.
  it.each([
    [
      "a slug that names no Project",
      page.replace(fixtureSlug, "a-project-that-was-never-shipped"),
    ],
    ["a page with no dek to describe it", `slug: "${fixtureSlug}"`],
    ["YAML that does not parse", `${page}\n  indented: oops`],
  ])("refuses %s, naming the file", (_case, frontmatter) => {
    withFixture(frontmatter, () => {
      expect(() => readProjectPages(fixtureDirectory)).toThrow(fixtureSlug);
    });
  });
});
