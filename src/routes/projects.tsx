import { createFileRoute } from "@tanstack/react-router";

import {
  createGraph,
  createSeoHead,
  createWebPageSchema,
  pageTitle,
} from "@/lib/seo.ts";

const description =
  "Products, client work, and experiments Nick Neely has shipped, with a status and year against each one.";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  head: () =>
    createSeoHead({
      canonicalPath: "/projects",
      description,
      structuredData: createGraph([
        createWebPageSchema({
          description,
          name: "Projects",
          path: "/projects",
          type: "CollectionPage",
        }),
      ]),
      title: pageTitle("Projects"),
    }),
});

function ProjectsPage() {
  return (
    <main className="flex-1" id="main-content">
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Projects
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Everything shipped, with an honest status against each one.
        </p>
      </section>
    </main>
  );
}
