import { describe, expect, it } from "vitest";

import { findProject, projectOgImagePath, projects } from "./projects.ts";

const isoDate = /^\d{4}-\d{2}-\d{2}$/u;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

describe("project inventory", () => {
  it("links every row to an absolute https destination", () => {
    // "No dead rows" starts with a URL that resolves at all. Liveness itself
    // is checked by hand before shipping a row; this only rules out the
    // relative or protocol-less values that would never leave the site.
    for (const project of projects) {
      expect(new URL(project.url).protocol).toBe("https:");
    }
  });

  it("gives every Project a unique slug that survives being a URL segment", () => {
    // The slug addresses the detail page, names the social card file, and is
    // interpolated into a CSS identifier for the shared-element transition.
    // Anything outside this shape breaks at least one of the three.
    for (const project of projects) {
      expect(project.slug).toMatch(slugPattern);
    }

    expect(new Set(projects.map((project) => project.slug)).size).toBe(
      projects.length
    );
  });

  it("points every repository at a GitHub URL, since that is what it claims", () => {
    for (const project of projects) {
      if (project.repo === undefined) {
        continue;
      }

      expect(new URL(project.repo).host).toBe("github.com");
    }
  });

  it("dates every milestone as a calendar date the Update feed can sort", () => {
    // The home feed merges Project milestones with Posts by date, so an
    // `updatedAt` that is not a plain `YYYY-MM-DD` sorts wrong rather than
    // failing loudly.
    for (const project of projects) {
      if (project.updatedAt === undefined) {
        continue;
      }

      expect(project.updatedAt).toMatch(isoDate);
      expect(Number.isNaN(Date.parse(project.updatedAt))).toBeFalsy();
    }
  });

  it("gives every featured Project a blurb", () => {
    for (const project of projects) {
      if (project.featured === undefined) {
        continue;
      }

      expect(project.featured.blurb.length).toBeGreaterThan(0);
    }
  });

  it("gives every screenshot alt text and honest intrinsic dimensions", () => {
    // A screenshot that arrives without alt text is the one accessibility
    // regression the types cannot catch. Zero or negative dimensions would
    // reserve no space, or negative space, and reintroduce the layout shift
    // the intrinsic width/height exist to prevent.
    for (const project of projects) {
      if (project.screenshot === undefined) {
        continue;
      }

      expect(project.screenshot.alt).not.toBe("");
      expect(project.screenshot.width).toBeGreaterThan(0);
      expect(project.screenshot.height).toBeGreaterThan(0);
    }
  });

  it("keeps tendnote's interim card in sync with the generated card path", () => {
    // Written as a literal in the data (see the comment on that entry) so it
    // cannot drift silently from what `projectOgImagePath` would produce.
    const tendnote = findProject("tendnote");

    expect(tendnote?.screenshot?.src).toBe(projectOgImagePath("tendnote"));
  });
});
