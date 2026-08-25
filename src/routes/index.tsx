import { createFileRoute } from "@tanstack/react-router";

import {
  createGraph,
  createSeoHead,
  createWebPageSchema,
  createWebsiteSchema,
  pageTitle,
} from "@/lib/seo.ts";
import { siteConfig } from "@/lib/site-config.ts";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () =>
    createSeoHead({
      canonicalPath: "/",
      description: siteConfig.description,
      structuredData: createGraph([
        createWebsiteSchema(),
        createWebPageSchema({
          description: siteConfig.description,
          name: siteConfig.name,
          path: "/",
        }),
      ]),
      title: pageTitle(),
    }),
});

function HomePage() {
  return (
    <main className="flex-1" id="main-content">
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <h1 className="max-w-3xl font-display text-5xl font-semibold tracking-[-0.035em] text-balance sm:text-6xl">
          Nick Neely
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Maintainable software for messy workflows.
        </p>
      </section>
    </main>
  );
}
