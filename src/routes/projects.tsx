import { createFileRoute } from "@tanstack/react-router";

import type { Project, ProjectFeature } from "@/lib/projects.ts";
import {
  projectKindLabels,
  projects,
  projectStatusLabels,
} from "@/lib/projects.ts";
import {
  createGraph,
  createSeoHead,
  createWebPageSchema,
  pageTitle,
} from "@/lib/seo.ts";

const description =
  "Products and client work Nick Neely has shipped: what each one does, where it stands, and a link to the live thing.";

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
        <ul className="mt-14 border-t">
          {projects.map((project) => (
            <ProjectRow key={project.url} project={project} />
          ))}
        </ul>
      </section>
    </main>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <li className="border-b py-8 sm:py-10">
      <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        <a
          className="link-underline hover:text-foreground"
          href={project.url}
          rel="noreferrer"
          target="_blank"
        >
          {project.name}
        </a>
      </h2>
      <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
        {project.description}
      </p>
      <ProjectMeta project={project} />
      {project.featured === undefined ? null : (
        <FeaturedDetail feature={project.featured} name={project.name} />
      )}
    </li>
  );
}

/**
 * The metadata cluster. A description list rather than a row of spans, so a
 * screen reader hears "Status, Active, Kind, Product, Year, 2026" instead of
 * three unlabelled fragments. The dot is decorative: the status it signals is
 * spelled out beside it.
 */
function ProjectMeta({ project }: { project: Project }) {
  // Amber marks the one status that means work is happening right now. Every
  // other status takes the muted dot, which is what keeps the accent readable
  // as a signal rather than as decoration.
  const dotClass =
    project.status === "active" ? "bg-signal" : "bg-muted-foreground/60";

  return (
    <dl className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground">
      <div className="flex items-center">
        <dt className="sr-only">Status</dt>
        <dd className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`size-1.5 shrink-0 rounded-full ${dotClass}`}
          />
          {projectStatusLabels[project.status]}
        </dd>
      </div>
      <div>
        <dt className="sr-only">Kind</dt>
        <dd>{projectKindLabels[project.kind]}</dd>
      </div>
      {project.year === null ? null : (
        <div>
          <dt className="sr-only">Year</dt>
          <dd>{project.year}</dd>
        </div>
      )}
    </dl>
  );
}

/**
 * The extra depth a featured Project gets. Same row, same rules, more room:
 * the list stays one system rather than growing a second card language.
 */
function FeaturedDetail({
  feature,
  name,
}: {
  feature: ProjectFeature;
  name: string;
}) {
  return (
    <div className="mt-7 grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] sm:items-start">
      <p className="max-w-2xl leading-7">{feature.blurb}</p>
      {feature.screenshot === null ? (
        // Deliberately empty. Inventing browser chrome or a mock interface
        // would put something on the page that does not exist yet.
        <div className="flex aspect-[16/10] items-center justify-center rounded-lg border border-dashed bg-card">
          {/* The visible label reads as a caption once the surrounding frame
              is visible; a screen reader gets no frame, so it gets the
              sentence instead and the caption is hidden from it. */}
          <span className="sr-only">{`${name} interface screenshot pending`}</span>
          <span
            aria-hidden="true"
            className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
          >
            screenshot pending
          </span>
        </div>
      ) : (
        <img
          alt={feature.screenshot.alt}
          className="aspect-[16/10] w-full rounded-lg border object-cover"
          src={feature.screenshot.src}
        />
      )}
    </div>
  );
}
