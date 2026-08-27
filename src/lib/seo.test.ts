import { describe, expect, it } from "vitest";

import {
  absoluteUrl,
  createGraph,
  createOrganizationSchema,
  createPersonSchema,
  createSeoHead,
  createWebPageSchema,
  createWebsiteSchema,
  pageTitle,
} from "./seo.ts";
import { siteConfig } from "./site-config.ts";

describe(pageTitle, () => {
  it("suffixes a page name with the configured site name", () => {
    expect(pageTitle("Work")).toBe(`Work | ${siteConfig.name}`);
  });

  it("returns the site name alone when no page name is given", () => {
    expect(pageTitle()).toBe(siteConfig.name);
  });
});

describe("SEO helpers", () => {
  it("builds canonical URLs from the configured public origin", () => {
    expect(absoluteUrl("/work")).toBe(`${siteConfig.origin}/work`);
  });

  it("keeps visible and social metadata aligned", () => {
    const head = createSeoHead({
      canonicalPath: "/work",
      description: "How engagements work and what they produced.",
      title: pageTitle("Work"),
    });

    expect(head.links).toContainEqual({
      href: `${siteConfig.origin}/work`,
      rel: "canonical",
    });
    expect(head.meta).toContainEqual({
      content: pageTitle("Work"),
      property: "og:title",
    });
    expect(head.meta).toContainEqual({
      content: `${siteConfig.origin}${siteConfig.socialImage.path}`,
      property: "og:image",
    });
    expect(head.meta).toContainEqual({
      content: "1200",
      property: "og:image:width",
    });
  });

  it("connects a page to its website graph", () => {
    const graph = createGraph([
      createWebsiteSchema(),
      createWebPageSchema({
        description: "How engagements work.",
        name: "Work",
        path: "/work",
      }),
    ]);

    expect(graph["@graph"]).toHaveLength(2);
  });

  it("describes the person and professional identity without conflating brands", () => {
    expect(createPersonSchema()).toMatchObject({
      "@type": "Person",
      email: "contact@nickneely.dev",
      name: siteConfig.name,
      sameAs: [
        siteConfig.links.github,
        siteConfig.links.linkedin,
        siteConfig.links.x,
      ],
      url: `${siteConfig.origin}/`,
    });
    expect(createOrganizationSchema()).toMatchObject({
      "@type": "Organization",
      address: {
        "@type": "PostalAddress",
        addressCountry: "US",
        addressRegion: "Iowa",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "contact@nickneely.dev",
      },
      name: siteConfig.name,
      url: `${siteConfig.origin}/`,
    });
    expect(createOrganizationSchema()).not.toMatchObject({
      url: siteConfig.links.neelySolutions,
    });
  });
});
