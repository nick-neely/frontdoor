import { describe, expect, it } from "vitest";

import { projects } from "./projects.ts";

const isoDate = /^\d{4}-\d{2}-\d{2}$/u;

describe("project inventory", () => {
  it("links every row to an absolute https destination", () => {
    // "No dead rows" starts with a URL that resolves at all. Liveness itself
    // is checked by hand before shipping a row; this only rules out the
    // relative or protocol-less values that would never leave the site.
    for (const project of projects) {
      expect(new URL(project.url).protocol).toBe("https:");
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

  it("gives every featured Project a blurb and every screenshot alt text", () => {
    // A screenshot that arrives without alt text is the one accessibility
    // regression the types cannot catch.
    for (const project of projects) {
      if (project.featured === undefined) {
        continue;
      }

      expect(project.featured.blurb.length).toBeGreaterThan(0);
      expect(project.featured.screenshot?.alt ?? "pending").not.toBe("");
    }
  });
});
