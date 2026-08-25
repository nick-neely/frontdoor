import { createFileRoute } from "@tanstack/react-router";

import {
  createGraph,
  createSeoHead,
  createWebPageSchema,
  pageTitle,
} from "@/lib/seo.ts";

const description =
  "Writing on product engineering, practical AI-assisted development, and building workflow products in public.";

export const Route = createFileRoute("/writing")({
  component: WritingPage,
  head: () =>
    createSeoHead({
      canonicalPath: "/writing",
      description,
      structuredData: createGraph([
        createWebPageSchema({
          description,
          name: "Writing",
          path: "/writing",
          type: "CollectionPage",
        }),
      ]),
      title: pageTitle("Writing"),
    }),
});

function WritingPage() {
  return (
    <main className="flex-1" id="main-content">
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Writing
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Product engineering, practical AI, and building in public.
        </p>
      </section>
    </main>
  );
}
