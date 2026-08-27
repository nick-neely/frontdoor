import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { MDXContent } from "mdx/types";

import { mdxComponents } from "@/components/mdx-components.tsx";
import { ProjectMeta } from "@/components/project-meta.tsx";
import { findProjectDetail } from "@/lib/project-pages.ts";
import type { ProjectKind } from "@/lib/projects.ts";
import {
  projectOgImagePath,
  projectPath,
  projectTitleTransitionName,
} from "@/lib/projects.ts";
import {
  absoluteUrl,
  createGraph,
  createProjectSchema,
  createSeoHead,
  pageTitle,
} from "@/lib/seo.ts";

/**
 * The compiled MDX bodies, on the same terms as the writing surface's glob and
 * for the same reasons: eager, because the body has to be present in the first
 * render on both sides, and read only by the component, so it stays in this
 * route's split chunk instead of the entry bundle. See `writing_.$slug.tsx`.
 */
const bodies = import.meta.glob<{ default: MDXContent }>(
  "/content/projects/*.mdx",
  { eager: true }
);

/**
 * What schema.org calls each kind of Project. A Product is software someone
 * can go and use; Client Work and an Experiment are described honestly as
 * creative works rather than dressed up as applications on offer.
 */
const projectSchemaTypes = {
  "client-work": "CreativeWork",
  experiment: "CreativeWork",
  product: "SoftwareApplication",
} as const satisfies Record<
  ProjectKind,
  "CreativeWork" | "SoftwareApplication"
>;

export const Route = createFileRoute("/projects_/$slug")({
  // A Project with no detail page is a wrong door, exactly like a slug that
  // names no Project at all. Deciding here rather than in the component
  // settles the 404 before anything renders, and it keeps the body glob out of
  // the eager route module.
  loader: ({ params }) => {
    if (findProjectDetail(params.slug) === undefined) {
      // `notFound()` returns TanStack Router's control-flow signal rather
      // than an Error, which is exactly what the router expects to catch.
      // oxlint-disable-next-line typescript/only-throw-error
      throw notFound();
    }
  },
  head: ({ params }) => {
    const detail = findProjectDetail(params.slug);

    if (detail === undefined) {
      return {};
    }

    const { dek, project } = detail;
    const path = projectPath(project.slug);
    const imagePath = projectOgImagePath(project.slug);

    return createSeoHead({
      canonicalPath: path,
      description: dek,
      image: { alt: project.name, path: imagePath },
      structuredData: createGraph([
        createProjectSchema({
          description: dek,
          imageUrl: absoluteUrl(imagePath),
          name: project.name,
          // The live thing, and the source when it is public. A private
          // repository is absent rather than linked and apologised for.
          sameAs:
            project.repo === undefined
              ? [project.url]
              : [project.url, project.repo],
          type: projectSchemaTypes[project.kind],
          url: absoluteUrl(path),
        }),
      ]),
      title: pageTitle(project.name),
    });
  },
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { slug } = Route.useParams();
  const detail = findProjectDetail(slug);
  const body = detail === undefined ? undefined : bodies[detail.moduleId];

  if (detail === undefined || body === undefined) {
    // `notFound()` returns TanStack Router's control-flow signal rather than
    // an Error, which is exactly what the router expects to catch.
    // oxlint-disable-next-line typescript/only-throw-error
    throw notFound();
  }

  const Body = body.default;
  const { project } = detail;

  return (
    <main className="flex-1" id="main-content">
      <article className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <header className="max-w-2xl">
          <h1
            className="font-display text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl"
            // The one shared element in the site's route transitions: this
            // name is the same object as the row that opened the page.
            style={{
              viewTransitionName: projectTitleTransitionName(project.slug),
            }}
          >
            {project.name}
          </h1>
          <ProjectMeta className="mt-6" links project={project} />
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {detail.dek}
          </p>
        </header>
        <div className="prose mt-12">
          <Body components={mdxComponents} />
        </div>
        <footer className="mt-16 max-w-2xl border-t border-border pt-8">
          <Link
            className="link-underline font-mono text-[13px] text-foreground"
            to="/projects"
          >
            ← All projects
          </Link>
        </footer>
      </article>
    </main>
  );
}
