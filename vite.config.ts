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
import { imagetools } from "vite-imagetools";

import { createDocumentRoutingRules } from "./src/lib/agent-http.ts";
import { mdxOptions } from "./src/lib/mdx-options.ts";
import type { OgCardContent } from "./src/lib/og-card-layout.ts";
import { renderOgImage } from "./src/lib/og-image.ts";
import { readProjectPages } from "./src/lib/projects-source.ts";
import {
  findProject,
  projectOgCard,
  projectOgImagePath,
} from "./src/lib/projects.ts";
import { publicPaths } from "./src/lib/public-routes.ts";
import { renderRssFeed } from "./src/lib/rss.ts";
import { siteConfig } from "./src/lib/site-config.ts";
import { generatedSiteFiles } from "./src/lib/site-files.ts";
import { postOgCard, postOgImagePath } from "./src/lib/writing-schema.ts";
import { isDraftBody, readPublishedWriting } from "./src/lib/writing-source.ts";

const feedFileName = siteConfig.links.rss.replace(/^\//u, "");

/** One card the build has to draw, and where it lands in the output. */
interface GeneratedCard {
  content: OgCardContent;
  fileName: string;
}

/** Renders one card on demand in development, where no bundle is emitted. */
async function serveOgImage(
  card: GeneratedCard,
  publicDirectory: string,
  response: ServerResponse,
  next: Connect.NextFunction
): Promise<void> {
  let png: Uint8Array;

  try {
    png = await renderOgImage(card.content, publicDirectory);
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

function cardFileName(cardPath: string): string {
  return cardPath.replace(/^\//u, "");
}

/**
 * Every social card the build draws: one per published Post, one per Project
 * detail page. A Post that names its own `ogImage` is skipped, because a
 * hand-made card is already in `public/`.
 *
 * Both halves read the same sources as the prerender inventory, so a draft, a
 * renamed slug, or a detail page that has not been written yet moves the card,
 * the page, and the sitemap entry together.
 */
function generatedCards(): GeneratedCard[] {
  const writingCards = readPublishedWriting()
    .filter((post) => post.ogImage === undefined)
    .map((post) => ({
      content: postOgCard(post),
      fileName: cardFileName(postOgImagePath(post)),
    }));

  const projectCards = readProjectPages().flatMap((page) => {
    // The frontmatter contract already refuses a page whose slug names no
    // Project, so this is exhaustiveness rather than a real branch.
    const project = findProject(page.slug);

    return project === undefined
      ? []
      : [
          {
            content: projectOgCard(project),
            fileName: cardFileName(projectOgImagePath(project.slug)),
          },
        ];
  });

  return [...writingCards, ...projectCards];
}

/**
 * Emits the artefacts the content owns but no route renders: the feed the
 * footer links, and every generated social card.
 *
 * `enforce: "pre"` for the same reason as `siteFiles`: the development
 * middleware has to beat the application's catch-all handler.
 */
function contentArtifacts(): Plugin {
  let publicDirectory = "";

  return {
    configResolved(config) {
      publicDirectory = config.publicDir;
    },
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
          (generated) => generated.fileName === name
        );

        if (card === undefined) {
          next();
          return;
        }

        void serveOgImage(card, publicDirectory, response, next);
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
        generatedCards().map(async (card) => ({
          fileName: card.fileName,
          source: await renderOgImage(card.content, publicDirectory),
        }))
      );

      for (const card of rendered) {
        this.emitFile({ ...card, type: "asset" });
      }
    },
    name: "content-artifacts",
  };
}

/**
 * Empties a draft's prose out of the production bundle.
 *
 * The compiled bodies reach the route through an exhaustive glob over
 * `content/writing`, which cannot tell a draft from a Post; a draft therefore
 * has no page while its prose, and every picture it imports, still ships inside
 * the chunk every published Post shares. Returning an empty source is enough:
 * `@mdx-js/rollup` still compiles a real module, so the glob's shape is
 * unchanged, and the module has no content and no imports left in it.
 *
 * `apply: "build"` is the whole point of the plugin being conditional. In
 * development a draft still renders, which is how one is previewed.
 */
function draftBodies(): Plugin {
  return {
    apply: "build",
    enforce: "pre",
    load(id) {
      return isDraftBody(id) ? "" : null;
    },
    name: "writing-draft-bodies",
  };
}

const config = defineConfig({
  plugins: [
    devtools(),
    contentCollections(),
    // Ahead of `viteReact`, so MDX is already JavaScript by the time React's
    // transform and Fast Refresh see it.
    { enforce: "pre", ...mdx(mdxOptions) },
    // Resizes and re-encodes the pictures `remarkPostImages` turned into
    // imports, through sharp, at build time. It sees only the import
    // specifiers that plugin wrote, so it never reads the collection and this
    // config stays clear of the generated index per ADR-0001. Output is cached
    // under `node_modules/.cache`, which is what keeps `pnpm validate` fast on
    // the second run.
    imagetools(),
    draftBodies(),
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
    nitro({
      vercel: {
        config: {
          routes: createDocumentRoutingRules(publicPaths),
          version: 3,
        },
      },
    }),
    viteReact(),
    siteFiles(),
    contentArtifacts(),
  ],
  resolve: { tsconfigPaths: true },
});

export default config;
