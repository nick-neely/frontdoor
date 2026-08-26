import { describe, expect, it } from "vitest";

import { projects } from "./projects.ts";
import type { Project } from "./projects.ts";
import { maxUpdates, mergeUpdates } from "./updates.ts";
import type { WritingFrontmatter } from "./writing-schema.ts";
import { posts } from "./writing.ts";

/*
 * Fabricated inputs, and only here. The merge is a pure function over typed
 * sources, so exercising it with real content would test the content instead
 * of the ordering, the cap, and the shape each source narrows to.
 */
function post(
  published: string,
  slug: string,
  title: string
): WritingFrontmatter {
  return {
    description: `${title} description`,
    draft: false,
    kind: "post",
    pillar: "practical-ai",
    published,
    slug,
    title,
  };
}

function project(name: string, updatedAt?: string): Project {
  return {
    description: `${name} description`,
    kind: "product",
    name,
    slug: name,
    status: "active",
    updatedAt,
    url: `https://${name}.example`,
    year: 2026,
  };
}

describe(mergeUpdates, () => {
  it("interleaves both sources by date, newest first", () => {
    const merged = mergeUpdates(
      [post("2026-08-20", "middle", "Middle")],
      [project("newest", "2026-08-24"), project("oldest", "2026-08-01")]
    );

    expect(merged.map((update) => update.title)).toStrictEqual([
      "newest",
      "Middle",
      "oldest",
    ]);
  });

  it("narrows each source to what a row needs", () => {
    const merged = mergeUpdates(
      [post("2026-08-20", "a-post", "A Post")],
      [project("a-project", "2026-08-19")]
    );

    expect(merged).toStrictEqual([
      {
        date: "2026-08-20",
        kind: "post",
        slug: "a-post",
        sourceLabel: "Practical AI",
        title: "A Post",
        transitionName: "post-title-a-post",
      },
      {
        date: "2026-08-19",
        kind: "project",
        sourceLabel: "Project",
        title: "a-project",
        url: "https://a-project.example",
      },
    ]);
  });

  it("skips a Project that has reached no milestone", () => {
    const merged = mergeUpdates(
      [],
      [project("quiet"), project("busy", "2026-08-19")]
    );

    expect(merged.map((update) => update.title)).toStrictEqual(["busy"]);
  });

  it("caps the feed and keeps the newest of what it drops", () => {
    const merged = mergeUpdates(
      [
        post("2026-08-01", "one", "One"),
        post("2026-08-02", "two", "Two"),
        post("2026-08-03", "three", "Three"),
        post("2026-08-04", "four", "Four"),
      ],
      []
    );

    expect(merged).toHaveLength(maxUpdates);
    expect(merged.map((update) => update.title)).toStrictEqual([
      "Four",
      "Three",
      "Two",
    ]);
  });

  it("orders a same-day tie deterministically", () => {
    const sources: [WritingFrontmatter[], Project[]] = [
      [post("2026-08-20", "beta", "Beta")],
      [project("Alpha", "2026-08-20")],
    ];
    const forwards = mergeUpdates(...sources);
    const backwards = mergeUpdates(sources[0].toReversed(), sources[1]);

    expect(forwards.map((update) => update.title)).toStrictEqual([
      "Alpha",
      "Beta",
    ]);
    expect(backwards).toStrictEqual(forwards);
  });

  it("survives having nothing to merge", () => {
    expect(mergeUpdates([], [])).toStrictEqual([]);
  });

  it("produces a usable feed from the real sources", () => {
    // Not an assertion about how much has shipped, only that the two real
    // sources still satisfy the shape the home page renders.
    const merged = mergeUpdates(posts, projects);

    expect(merged.length).toBeLessThanOrEqual(maxUpdates);
    for (const update of merged) {
      expect(update.title.length).toBeGreaterThan(0);
      expect(update.sourceLabel.length).toBeGreaterThan(0);
    }
  });
});
