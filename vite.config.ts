import type { ServerResponse } from "node:http";

import contentCollections from "@content-collections/vite";
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import type { Connect, Plugin } from "vite";

import { mdxOptions } from "./src/lib/mdx-options.ts";
import { renderOgImage } from "./src/lib/og-image.ts";
import { publicPaths } from "./src/lib/public-routes.ts";
import { renderRssFeed } from "./src/lib/rss.ts";
import { siteConfig } from "./src/lib/site-config.ts";
import { generatedSiteFiles } from "./src/lib/site-files.ts";
import { postOgImagePath } from "./src/lib/writing-schema.ts";
import type { WritingFrontmatter } from "./src/lib/writing-schema.ts";
import { readPublishedWriting } from "./src/lib/writing-source.ts";

const feedFileName = siteConfig.links.rss.replace(/^\//u, "");

/** Renders one card on demand in development, where no bundle is emitted. */
async function serveOgImage(
  post: WritingFrontmatter,
  response: ServerResponse,
  next: Connect.NextFunction
): Promise<void> {
  let png: Uint8Array;

  try {
    png = await renderOgImage(post);
  } catch (error) {
    next(error);
    return;
  }

  response.setHeader("content-type", "image/png");
  response.end(png);
}

/**
 * Emits the identity files derived from `site-config.ts` into the client
 * output and serves the same content in development.
 *
 * `enforce: "pre"` is load-bearing: the development middleware has to be
 * registered before the application's catch-all handler, which would otherwise
 * answer `/robots.txt` with the document shell. It keeps the plugin's position
 * in the array from mattering, since a build alone would not reveal the
 * difference.
 */
function siteFiles(): Plugin {
  return {
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const name = request.url?.split("?")[0]?.replace(/^\//u, "") ?? "";
        const match = Object.entries(generatedSiteFiles).find(
          ([fileName]) => fileName === name
        );

        if (match === undefined) {
          next();
          return;
        }

        const [, file] = match;
        response.setHeader("content-type", file.contentType);
        response.end(file.source);
      });
    },
    enforce: "pre",
    generateBundle() {
      if (this.environment.name !== "client") {
        return;
      }

      for (const [fileName, file] of Object.entries(generatedSiteFiles)) {
        this.emitFile({ fileName, source: file.source, type: "asset" });
      }
    },
    name: "site-files",
  };
}

function cardFileName(post: WritingFrontmatter): string {
  return postOgImagePath(post).replace(/^\//u, "");
}

/** Posts whose card the build has to draw, rather than one already in `public/`. */
function generatedCards(): WritingFrontmatter[] {
  return readPublishedWriting().filter((post) => post.ogImage === undefined);
}

/**
 * Emits the artefacts a Post owns but no route renders: the feed the footer
 * links, and one generated social card per Post.
 *
 * Both read the same published set as the prerender inventory, so a draft or a
 * renamed slug moves everywhere at once. Cards are only generated for Posts
 * that do not override `ogImage`, since a hand-made card is already in
 * `public/`.
 *
 * `enforce: "pre"` for the same reason as `siteFiles`: the development
 * middleware has to beat the application's catch-all handler.
 */
function writingArtifacts(): Plugin {
  return {
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const name = request.url?.split("?")[0]?.replace(/^\//u, "") ?? "";

        // Read on every request rather than once: in development a Post can
        // appear while the server is running, and its card and feed entry
        // should not wait for a restart. It is a handful of small files.
        if (name === feedFileName) {
          response.setHeader("content-type", "application/rss+xml");
          response.end(renderRssFeed(readPublishedWriting()));
          return;
        }

        const card = generatedCards().find(
          (post) => cardFileName(post) === name
        );

        if (card === undefined) {
          next();
          return;
        }

        void serveOgImage(card, response, next);
      });
    },
    enforce: "pre",
    async generateBundle() {
      if (this.environment.name !== "client") {
        return;
      }

      this.emitFile({
        fileName: feedFileName,
        source: renderRssFeed(readPublishedWriting()),
        type: "asset",
      });

      const rendered = await Promise.all(
        generatedCards().map(async (post) => ({
          fileName: cardFileName(post),
          source: await renderOgImage(post),
        }))
      );

      for (const card of rendered) {
        this.emitFile({ ...card, type: "asset" });
      }
    },
    name: "writing-artifacts",
  };
}

const config = defineConfig({
  plugins: [
    devtools(),
    contentCollections(),
    // Ahead of `viteReact`, so MDX is already JavaScript by the time React's
    // transform and Fast Refresh see it.
    { enforce: "pre", ...mdx(mdxOptions) },
    tailwindcss(),
    tanstackStart({
      pages: publicPaths.map((path) => ({ path })),
      prerender: {
        crawlLinks: false,
        enabled: true,
        failOnError: true,
      },
      sitemap: {
        enabled: true,
        host: siteConfig.origin,
      },
    }),
    nitro(),
    viteReact(),
    siteFiles(),
    writingArtifacts(),
  ],
  resolve: { tsconfigPaths: true },
});

export default config;
