import { describe, expect, it } from "vitest";

import {
  findProjectDetail,
  hasProjectPage,
  projectPages,
} from "./project-pages.ts";
import { readProjectPages } from "./projects-source.ts";
import {
  projectOgImagePath,
  projectPath,
  projects,
  projectTitleTransitionName,
} from "./projects.ts";

/** The fields both loaders must agree on, as one comparable string. */
const identity = (entry: { dek: string; slug: string }) =>
  `${entry.slug} ${entry.dek}`;

describe("project detail pages", () => {
  it("publishes at least one page, so every other assertion means something", () => {
    expect(projectPages.length).toBeGreaterThan(0);
  });

  it("describes only Projects the inventory knows", () => {
    const slugs = new Set(projects.map((project) => project.slug));

    for (const page of projectPages) {
      expect(slugs.has(page.slug)).toBeTruthy();
    }
  });

  it("keeps slugs unique, since one addresses the page, the card, and the row", () => {
    expect(new Set(projectPages.map((page) => page.slug)).size).toBe(
      projectPages.length
    );
  });

  it("orders pages the way the list introduces their Projects", () => {
    const listed = projects
      .map((project) => project.slug)
      .filter((slug) => hasProjectPage(slug));

    expect(projectPages.map((page) => page.slug)).toStrictEqual(listed);
  });

  // The build reads frontmatter off disk and the site reads the generated
  // index; they are separate for the reasons ADR-0001 gives, so this is the
  // assertion that keeps them saying the same thing.
  it("agrees with what the build reads off disk", () => {
    expect(readProjectPages().map(identity)).toStrictEqual(
      projectPages.map(identity)
    );
  });

  it("resolves a page to its Project, its dek, and its body module", () => {
    for (const page of projectPages) {
      const detail = findProjectDetail(page.slug);

      expect(detail?.project.slug).toBe(page.slug);
      expect(detail?.dek).toBe(page.dek);
      expect(detail?.moduleId).toBe(`/content/projects/${page.fileName}`);
    }
  });

  it("resolves nothing for a Project with no page, and nothing for no Project", () => {
    // Rows without a page keep linking straight out; asking for one has to be
    // the same answer as asking for a Project that does not exist.
    const unwritten = projects.find((project) => !hasProjectPage(project.slug));

    expect(unwritten).toBeDefined();
    expect(findProjectDetail(unwritten?.slug ?? "")).toBeUndefined();
    expect(findProjectDetail("no-such-project")).toBeUndefined();
  });

  it("derives paths that join onto the origin and a CSS-safe transition name", () => {
    for (const page of projectPages) {
      expect(projectPath(page.slug)).toBe(`/projects/${page.slug}`);
      expect(projectOgImagePath(page.slug).startsWith("/")).toBeTruthy();
      expect(projectTitleTransitionName(page.slug)).toMatch(/^[a-z][\w-]*$/u);
    }
  });
});
