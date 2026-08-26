import { describe, expect, it } from "vitest";

import { projectPages } from "./project-pages.ts";
import { projectPath } from "./projects.ts";
import { publicPaths } from "./public-routes.ts";
import { postPath, posts } from "./writing.ts";

describe("public route inventory", () => {
  it("uses paths that join onto the canonical origin without rewriting", () => {
    // The sitemap and `scripts/verify-seo-output.mjs` build canonical URLs by
    // concatenating `siteConfig.origin` with these paths, so a missing leading
    // slash or a trailing slash yields URLs that never match rendered output.
    for (const routePath of publicPaths) {
      expect(routePath.startsWith("/")).toBeTruthy();
      expect(routePath !== "/" && routePath.endsWith("/")).toBeFalsy();
    }
  });

  it("expands every dynamic route into real paths", () => {
    // `vite.config.ts` prerenders with `failOnError: true`, so a surviving
    // parameter would be requested literally and fail the build.
    for (const routePath of publicPaths) {
      expect(routePath).not.toContain("$");
    }
  });

  it("lists exactly the authored detail pages under /projects", () => {
    // Only a Project with a page gets a URL. The rest are rows that link
    // straight out, and a path for one of them would prerender a 404.
    const listed = publicPaths.filter((routePath) =>
      routePath.startsWith("/projects/")
    );

    expect(listed.toSorted()).toStrictEqual(
      projectPages.map((page) => projectPath(page.slug)).toSorted()
    );
  });

  it("lists exactly the published Posts under /writing", () => {
    // The expansion reads frontmatter from disk while the accessor reads the
    // generated index. They are separate on purpose, so this is the assertion
    // that keeps them agreeing.
    const listed = publicPaths.filter((routePath) =>
      routePath.startsWith("/writing/")
    );

    expect(listed.toSorted()).toStrictEqual(posts.map(postPath).toSorted());
  });
});
