import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { publicPaths } from "../src/lib/public-routes.ts";
import { siteConfig } from "../src/lib/site-config.ts";
import { generatedSiteFiles } from "../src/lib/site-files.ts";
import { postOgImagePath, postPath, posts } from "../src/lib/writing.ts";

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

// Every Post carries an Article, a card of its own, and a feed item. These are
// generated during the build rather than authored, so they are verified in the
// output rather than trusted from configuration.
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

for (const post of posts) {
  const routePath = postPath(post);
  const html = readFileSync(htmlOutputPath(routePath), "utf-8");
  const imagePath = postOgImagePath(post);
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
    html.includes(`"datePublished":"${post.published}"`),
    `${routePath}: publication date in schema`
  );
  assert.ok(
    feed.includes(`${siteConfig.origin}${routePath}`),
    `${routePath}: feed item`
  );

  assertPng(
    imagePath.slice(1),
    siteConfig.socialImage.width,
    siteConfig.socialImage.height
  );
}

// Shiki runs during the build. Any of it reaching a client chunk would mean a
// megabyte of grammars shipped to highlight code that is already highlighted.
const clientScripts = readdirSync(path.resolve(".output/public/assets")).filter(
  (fileName) => fileName.endsWith(".js")
);

assert.ok(clientScripts.length > 0, "Client assets must exist");
for (const fileName of clientScripts) {
  const source = readFileSync(
    path.resolve(".output/public/assets", fileName),
    "utf-8"
  );

  assert.ok(
    !source.includes("createHighlighter"),
    `${fileName} must not contain a syntax highlighter`
  );
}

console.log(
  `Verified SEO output for ${publicPaths.length} public pages, ${posts.length} generated cards, and the feed.`
);
