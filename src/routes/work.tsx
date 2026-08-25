import { createFileRoute } from "@tanstack/react-router";

import {
  createGraph,
  createSeoHead,
  createWebPageSchema,
  pageTitle,
} from "@/lib/seo.ts";

const description =
  "Consulting for engineering leaders, product teams, and founders who need a messy workflow turned into maintainable software.";

export const Route = createFileRoute("/work")({
  component: WorkPage,
  head: () =>
    createSeoHead({
      canonicalPath: "/work",
      description,
      structuredData: createGraph([
        createWebPageSchema({
          description,
          name: "Work with me",
          path: "/work",
        }),
      ]),
      title: pageTitle("Work with me"),
    }),
});

function WorkPage() {
  return (
    <main className="flex-1" id="main-content">
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Work with me
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          What I do, who I do it for, and the outcomes it produced.
        </p>
      </section>
    </main>
  );
}
