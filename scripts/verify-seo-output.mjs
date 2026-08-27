import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { projectPages } from "../src/lib/project-pages.ts";
import { projectOgImagePath, projectPath } from "../src/lib/projects.ts";
import { publicPaths } from "../src/lib/public-routes.ts";
import { siteConfig } from "../src/lib/site-config.ts";
import { generatedSiteFiles } from "../src/lib/site-files.ts";
import {
  postOgImagePath,
  postPath,
  posts,
  publishedWriting,
} from "../src/lib/writing.ts";

const pageTitles = new Set();
const pageDescriptions = new Set();
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

/** @param {string} routePath Public route path. */
function htmlOutputPath(routePath) {
  return path.resolve(
    ".output/public",
    routePath === "/" ? "index.html" : `${routePath.slice(1)}/index.html`
  );
}

/**
 * @param {string} value Text to search.
 * @param {RegExp} pattern Global regular expression to count.
 */
function countMatches(value, pattern) {
  return value.match(pattern)?.length ?? 0;
}

/** @param {string} html Rendered document. */
function visibleText(html) {
  return html
    .replaceAll(
      /<(?<element>script|style|svg)\b[^>]*>[\s\S]*?<\/\k<element>>/gu,
      " "
    )
    .replaceAll(/<[^>]+>/gu, " ")
    .replaceAll(/&(?:#\d+|#x[\da-f]+|\w+);/giu, " ")
    .replaceAll(/\s+/gu, " ")
    .trim();
}

for (const routePath of publicPaths) {
  const html = readFileSync(htmlOutputPath(routePath), "utf-8");
  const canonical = `${siteConfig.origin}${routePath}`;

  assert.equal(countMatches(html, /<title>/gu), 1, `${routePath}: title count`);
  assert.equal(
    countMatches(html, /<meta\b(?=[^>]*\bname="description")[^>]*>/gu),
    1,
    `${routePath}: description count`
  );
  assert.equal(
    countMatches(html, /<link\b(?=[^>]*\brel="canonical")[^>]*>/gu),
    1,
    `${routePath}: canonical count`
  );
  assert.ok(
    html.includes(`href="${canonical}"`),
    `${routePath}: canonical URL`
  );
  assert.ok(html.includes('property="og:title"'), `${routePath}: Open Graph`);
  assert.ok(
    html.includes(`content="${siteConfig.socialImage.type}"`),
    `${routePath}: social image type`
  );
  assert.ok(
    html.includes(`content="${siteConfig.socialImage.width}"`),
    `${routePath}: social image width`
  );
  assert.ok(
    html.includes(`content="${siteConfig.socialImage.height}"`),
    `${routePath}: social image height`
  );
  assert.ok(html.includes('name="twitter:card"'), `${routePath}: Twitter card`);
  assert.ok(
    html.includes('type="application/ld+json"'),
    `${routePath}: structured data`
  );
  assert.ok(html.includes("<h1"), `${routePath}: server-rendered heading`);

  const title = /<title>(?<title>[^<]+)<\/title>/u.exec(html)?.groups?.title;
  const descriptionTag = /<meta\b(?=[^>]*\bname="description")[^>]*>/u.exec(
    html
  )?.[0];
  const description = descriptionTag?.match(
    /\bcontent="(?<description>[^"]+)"/u
  )?.groups?.description;

  assert.ok(
    typeof title === "string" && title.length > 0,
    `${routePath}: title text`
  );
  assert.ok(
    typeof description === "string" && description.length > 0,
    `${routePath}: description text`
  );
  pageTitles.add(title);
  pageDescriptions.add(description);

  const structuredData =
    /<script type="application\/ld\+json">(?<json>[\s\S]*?)<\/script>/u.exec(
      html
    )?.groups?.json;
  assert.ok(
    typeof structuredData === "string" && structuredData.length > 0,
    `${routePath}: structured data text`
  );
  JSON.parse(structuredData);
}

assert.equal(pageTitles.size, publicPaths.length, "Page titles must be unique");
assert.equal(
  pageDescriptions.size,
  publicPaths.length,
  "Page descriptions must be unique"
);

const homeHtml = readFileSync(htmlOutputPath("/"), "utf-8");
assert.ok(
  countMatches(homeHtml, /<h2\b/gu) >= 2,
  "/: server-rendered outline must have at least two second-level headings"
);
assert.ok(
  countMatches(homeHtml, /<h3\b/gu) >= 3,
  "/: server-rendered outline must expose the primary destinations"
);

for (const routePath of ["/about", "/contact", "/privacy"]) {
  const html = readFileSync(htmlOutputPath(routePath), "utf-8");

  assert.ok(
    visibleText(html).length >= 500,
    `${routePath}: trust anchor must contain at least 500 visible characters`
  );
  assert.ok(
    countMatches(html, /<h2\b/gu) >= 1,
    `${routePath}: trust anchor must have a navigable heading outline`
  );
}

const sitemap = readFileSync(".output/public/sitemap.xml", "utf-8");
assert.equal(countMatches(sitemap, /<loc>/gu), publicPaths.length);
for (const routePath of publicPaths) {
  assert.ok(sitemap.includes(`<loc>${siteConfig.origin}${routePath}</loc>`));
}

const robots = readFileSync(".output/public/robots.txt", "utf-8");
assert.ok(robots.includes(`Sitemap: ${siteConfig.origin}/sitemap.xml`));

// The manifest and robots.txt are generated from `site-config.ts` at build
// time. Compare the emitted bytes with what the config produces now, so a
// stale or missing emission fails here rather than reaching production.
for (const [fileName, file] of Object.entries(generatedSiteFiles)) {
  assert.equal(
    readFileSync(path.resolve(".output/public", fileName), "utf-8"),
    file.source,
    `${fileName} must match site-config.ts`
  );
}

const socialImagePath = path.resolve(
  ".output/public",
  siteConfig.socialImage.path.slice(1)
);
const socialImage = readFileSync(socialImagePath);
assert.ok(
  socialImage.subarray(0, pngSignature.length).equals(pngSignature),
  "Social image must be a PNG"
);
assert.equal(
  socialImage.readUInt32BE(16),
  siteConfig.socialImage.width,
  "Social image width"
);
assert.equal(
  socialImage.readUInt32BE(20),
  siteConfig.socialImage.height,
  "Social image height"
);

/**
 * @param {string} assetPath Path under `.output/public`.
 * @param {number} width Expected pixel width.
 * @param {number} height Expected pixel height.
 */
function assertPng(assetPath, width, height) {
  const file = readFileSync(path.resolve(".output/public", assetPath));

  assert.ok(
    file.subarray(0, pngSignature.length).equals(pngSignature),
    `${assetPath} must be a PNG`
  );
  assert.equal(file.readUInt32BE(16), width, `${assetPath} width`);
  assert.equal(file.readUInt32BE(20), height, `${assetPath} height`);
}

// Every published piece carries an Article and a card of its own; only a Post
// carries a feed item. These are generated during the build rather than
// authored, so they are verified in the output rather than trusted from
// configuration.
const feed = readFileSync(
  path.resolve(".output/public", siteConfig.links.rss.slice(1)),
  "utf-8"
);

assert.ok(feed.startsWith("<?xml"), "Feed must be XML");
assert.equal(
  countMatches(feed, /<item>/gu),
  posts.length,
  "Feed item count must match the published Posts"
);
assert.ok(
  !sitemap.includes(siteConfig.links.rss),
  "The feed is not a page and does not belong in the sitemap"
);

for (const entry of publishedWriting) {
  const routePath = postPath(entry);
  const html = readFileSync(htmlOutputPath(routePath), "utf-8");
  const imagePath = postOgImagePath(entry);
  const imageUrl = `${siteConfig.origin}${imagePath}`;

  assert.ok(
    html.includes('content="article" property="og:type"'),
    `${routePath}: Open Graph type`
  );
  assert.ok(
    html.includes(`content="${imageUrl}" property="og:image"`),
    `${routePath}: generated card referenced absolutely`
  );
  assert.ok(html.includes('"@type":"Article"'), `${routePath}: Article schema`);
  assert.ok(
    html.includes(`"datePublished":"${entry.published}"`),
    `${routePath}: publication date in schema`
  );
  // A Note is revised rather than superseded, so it is a page and a card but
  // never a feed item. Asserting both directions here is what proves the rule
  // in the shipped output rather than in the function that renders the feed.
  // The URL is matched inside its <link> element rather than as a bare
  // substring, so a slug that prefixes another slug cannot count as evidence
  // for it.
  assert.equal(
    feed.includes(`<link>${siteConfig.origin}${routePath}</link>`),
    entry.kind === "post",
    `${routePath}: feed item present for a Post and absent for a Note`
  );

  assertPng(
    imagePath.slice(1),
    siteConfig.socialImage.width,
    siteConfig.socialImage.height
  );
}

// A Project detail page carries a card of its own and a schema naming the
// thing it is about. Same treatment as a Post: verified in the output rather
// than trusted from configuration.
for (const page of projectPages) {
  const routePath = projectPath(page.slug);
  const html = readFileSync(htmlOutputPath(routePath), "utf-8");
  const imagePath = projectOgImagePath(page.slug);
  const imageUrl = `${siteConfig.origin}${imagePath}`;

  assert.ok(
    html.includes(`content="${imageUrl}" property="og:image"`),
    `${routePath}: generated card referenced absolutely`
  );
  assert.ok(
    html.includes('"@type":"SoftwareApplication"') ||
      html.includes('"@type":"CreativeWork"'),
    `${routePath}: Project schema`
  );
  assert.ok(
    html.includes(`"mainEntityOfPage":"${siteConfig.origin}${routePath}"`),
    `${routePath}: schema points at the page it is on`
  );

  assertPng(
    imagePath.slice(1),
    siteConfig.socialImage.width,
    siteConfig.socialImage.height
  );
}

// The GitHub activity read is server-only: the module carries the `.server`
// suffix, the token it reads lives in the environment, and the home route
// reaches it through a server function. Any of these strings in a client chunk
// would mean that arrangement quietly stopped holding.
const serverOnlyStrings = [
  "github-activity.server",
  "GITHUB_ACTIVITY_TOKEN",
  "api.github.com/users",
];

// Everything that turns authored content into shipped content runs during the
// build and belongs nowhere near a browser: Shiki's grammars, and the sharp
// binary `vite-imagetools` drives. A transform directive surviving into a chunk
// would mean an image import stopped being resolved while the bundle was
// written, which is the failure that ships an unoptimized original.
const buildOnlyStrings = [
  "createHighlighter",
  "imagetools",
  "libvips",
  "as=picture",
];

const clientScripts = readdirSync(path.resolve(".output/public/assets")).filter(
  (fileName) => fileName.endsWith(".js")
);

assert.ok(clientScripts.length > 0, "Client assets must exist");
for (const fileName of clientScripts) {
  const source = readFileSync(
    path.resolve(".output/public/assets", fileName),
    "utf-8"
  );

  for (const buildOnly of buildOnlyStrings) {
    assert.ok(
      !source.includes(buildOnly),
      `${fileName} must not contain the build-time-only ${buildOnly}`
    );
  }

  for (const serverOnly of serverOnlyStrings) {
    assert.ok(
      !source.includes(serverOnly),
      `${fileName} must not contain the server-only ${serverOnly}`
    );
  }
}

console.log(
  `Verified SEO output for ${publicPaths.length} public pages, ${publishedWriting.length + projectPages.length} generated cards, and the feed.`
);
