import { siteConfig } from "./site-config.ts";

const defaultRobots =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

export type JsonLdValue =
  | boolean
  | number
  | string
  | readonly JsonLdValue[]
  | { readonly [key: string]: JsonLdValue };

export type StructuredData = Record<string, JsonLdValue>;

interface SeoHeadOptions {
  canonicalPath: string;
  description: string;
  /**
   * Replaces the shared social card. Every card the site produces is a
   * 1200x630 PNG, so only the path and the alternative text vary.
   */
  image?: { alt: string; path: string };
  noIndex?: boolean;
  structuredData?: StructuredData;
  title: string;
  type?: "article" | "website";
}

interface ArticleSchemaOptions {
  dateModified?: string;
  datePublished: string;
  description: string;
  headline: string;
  imageUrl: string;
  url: string;
}

interface ProjectSchemaOptions {
  description: string;
  imageUrl: string;
  name: string;
  /** The live site, and the source repository when one is public. */
  sameAs: readonly string[];
  /**
   * A shipped piece of software is a `SoftwareApplication`; anything else this
   * site calls a Project is a `CreativeWork`. Neither carries offers or
   * ratings, because this site has none to state.
   */
  type: "CreativeWork" | "SoftwareApplication";
  url: string;
}

interface WebPageSchemaOptions {
  description: string;
  name: string;
  path: string;
  type?: "AboutPage" | "CollectionPage" | "WebPage";
}

/**
 * Resolves a site-relative path against the canonical origin. An input that is
 * already absolute is returned unchanged, which is how a Post that declares a
 * `canonical` elsewhere keeps crediting the original.
 */
export function absoluteUrl(path: string): string {
  return new URL(path, `${siteConfig.origin}/`).toString();
}

/**
 * Composes a document title from the configured site name, so renaming the
 * project in `site-config.ts` renames every page with it. Called without a page
 * name it returns the site name alone, which is what the home route wants.
 */
export function pageTitle(page?: string): string {
  return page === undefined ? siteConfig.name : `${page} | ${siteConfig.name}`;
}

export function createSeoHead({
  canonicalPath,
  description,
  image,
  noIndex = false,
  structuredData,
  title,
  type = "website",
}: SeoHeadOptions) {
  const canonicalUrl = absoluteUrl(canonicalPath);
  const imageUrl = absoluteUrl(image?.path ?? siteConfig.socialImage.path);
  const imageAlt = image?.alt ?? siteConfig.socialImage.alt;
  const robots = noIndex ? "noindex, nofollow" : defaultRobots;

  return {
    links: [{ href: canonicalUrl, rel: "canonical" }],
    meta: [
      { title },
      { content: description, name: "description" },
      { content: robots, name: "robots" },
      { content: title, property: "og:title" },
      { content: description, property: "og:description" },
      { content: type, property: "og:type" },
      { content: canonicalUrl, property: "og:url" },
      { content: imageUrl, property: "og:image" },
      { content: siteConfig.socialImage.type, property: "og:image:type" },
      {
        content: String(siteConfig.socialImage.width),
        property: "og:image:width",
      },
      {
        content: String(siteConfig.socialImage.height),
        property: "og:image:height",
      },
      { content: imageAlt, property: "og:image:alt" },
      { content: "summary_large_image", name: "twitter:card" },
      { content: title, name: "twitter:title" },
      { content: description, name: "twitter:description" },
      { content: imageUrl, name: "twitter:image" },
      { content: imageAlt, name: "twitter:image:alt" },
      ...(structuredData === undefined
        ? []
        : [{ "script:ld+json": structuredData }]),
    ],
  };
}

export function createWebsiteSchema() {
  return {
    "@id": `${siteConfig.origin}/#website`,
    "@type": "WebSite",
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    name: siteConfig.name,
    url: `${siteConfig.origin}/`,
  } satisfies StructuredData;
}

export function createWebPageSchema({
  description,
  name,
  path,
  type = "WebPage",
}: WebPageSchemaOptions) {
  const url = absoluteUrl(path);

  return {
    "@id": `${url}#webpage`,
    "@type": type,
    description,
    inLanguage: siteConfig.language,
    isPartOf: { "@id": `${siteConfig.origin}/#website` },
    name,
    url,
  } satisfies StructuredData;
}

/**
 * Article metadata for a Post. `dateModified` is omitted rather than defaulted
 * to `datePublished`, so a Post that has never been revised does not claim an
 * edit it never had.
 */
export function createArticleSchema({
  dateModified,
  datePublished,
  description,
  headline,
  imageUrl,
  url,
}: ArticleSchemaOptions) {
  const author = {
    "@type": "Person",
    name: siteConfig.name,
    url: `${siteConfig.origin}/`,
  } satisfies StructuredData;

  const article = {
    "@id": `${url}#article`,
    "@type": "Article",
    author,
    datePublished,
    description,
    headline,
    image: imageUrl,
    inLanguage: siteConfig.language,
    isPartOf: { "@id": `${siteConfig.origin}/#website` },
    mainEntityOfPage: url,
    publisher: author,
    url,
  } satisfies StructuredData;

  return dateModified === undefined
    ? article
    : ({ ...article, dateModified } satisfies StructuredData);
}

/**
 * The thing a Project detail page is about. Deliberately thin: name, what it
 * does, who made it, where else it lives, and the page itself. A
 * `SoftwareApplication` can also carry price and rating, and Google wants both
 * before it will draw a rich result - but this site has neither a price it
 * charges nor a rating anyone gave, and inventing either to win a search
 * feature is the exact trade `AGENTS.md` forbids.
 */
export function createProjectSchema({
  description,
  imageUrl,
  name,
  sameAs,
  type,
  url,
}: ProjectSchemaOptions) {
  const author = {
    "@type": "Person",
    name: siteConfig.name,
    url: `${siteConfig.origin}/`,
  } satisfies StructuredData;

  return {
    "@id": `${url}#project`,
    "@type": type,
    author,
    description,
    image: imageUrl,
    inLanguage: siteConfig.language,
    isPartOf: { "@id": `${siteConfig.origin}/#website` },
    mainEntityOfPage: url,
    name,
    sameAs,
    url,
  } satisfies StructuredData;
}

export function createGraph(items: readonly StructuredData[]) {
  return {
    "@context": "https://schema.org",
    "@graph": items,
  } satisfies StructuredData;
}
