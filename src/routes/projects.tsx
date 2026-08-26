import { createFileRoute, Link } from "@tanstack/react-router";

import { ProjectMeta } from "@/components/project-meta.tsx";
import { hasProjectPage } from "@/lib/project-pages.ts";
import type { Project, ProjectScreenshot } from "@/lib/projects.ts";
import { projects, projectTitleTransitionName } from "@/lib/projects.ts";
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
            <ProjectRow key={project.slug} project={project} />
          ))}
        </ul>
      </section>
    </main>
  );
}

/**
 * The name, and where it goes.
 *
 * A Project with a detail page sends the reader inward, and the name carries
 * the shared-element transition into the heading it becomes. A Project without
 * one has exactly one address worth having, so its name goes straight there.
 * Either way the live site is reachable: rows that link inward carry it in the
 * metadata cluster below instead.
 */
function ProjectName({ project }: { project: Project }) {
  if (!hasProjectPage(project.slug)) {
    return (
      <a
        className="link-underline hover:text-foreground"
        href={project.url}
        rel="noreferrer"
        target="_blank"
      >
        {project.name}
      </a>
    );
  }

  return (
    <Link
      className="link-underline hover:text-foreground"
      params={{ slug: project.slug }}
      style={{ viewTransitionName: projectTitleTransitionName(project.slug) }}
      to="/projects/$slug"
    >
      {project.name}
    </Link>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <li className="border-b py-8 sm:py-10">
      <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        <ProjectName project={project} />
      </h2>
      <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
        {project.description}
      </p>
      <ProjectMeta
        className="mt-5"
        links={hasProjectPage(project.slug)}
        project={project}
      />
      <ProjectMedia project={project} />
    </li>
  );
}

/**
 * The image slot every row can carry, and the blurb only a featured row does.
 * The two facts are independent, so all four combinations are real: a
 * featured row can be mid-caption without an image yet, and a plain row can
 * carry a card image with no blurb beside it. Neither fact renders the empty
 * frame the other would have needed.
 */
function ProjectMedia({ project }: { project: Project }) {
  const { featured, name, screenshot } = project;

  if (featured === undefined) {
    if (screenshot === undefined) {
      return null;
    }

    return (
      // Same right-hand column the featured rows use, so the five images
      // read as one aligned rail down the page.
      <div className="mt-7 grid sm:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div className="hidden sm:block" />
        <div className="max-w-[20rem]">
          <ProjectScreenshotFigure name={name} screenshot={screenshot} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-7 grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] sm:items-start">
      <p className="max-w-2xl leading-7">{featured.blurb}</p>
      <ProjectScreenshotFigure name={name} screenshot={screenshot ?? null} />
    </div>
  );
}

/**
 * The image itself, sized to its own intrinsic aspect so a 1200x630 social
 * card and a 960x540 app screenshot both render whole - never cropped - or
 * the honest placeholder for a featured row that does not have one yet.
 */
function ProjectScreenshotFigure({
  name,
  screenshot,
}: {
  name: string;
  screenshot: ProjectScreenshot | null;
}) {
  if (screenshot === null) {
    // Deliberately empty. Inventing browser chrome or a mock interface would
    // put something on the page that does not exist yet.
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-lg border border-dashed bg-card">
        {/* The visible label reads as a caption once the surrounding frame is
            visible; a screen reader gets no frame, so it gets the sentence
            instead and the caption is hidden from it. */}
        <span className="sr-only">{`${name} interface screenshot pending`}</span>
        <span
          aria-hidden="true"
          className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
        >
          screenshot pending
        </span>
      </div>
    );
  }

  return (
    <img
      alt={screenshot.alt}
      className="w-full rounded-lg border object-contain"
      decoding="async"
      height={screenshot.height}
      loading="lazy"
      src={screenshot.src}
      width={screenshot.width}
    />
  );
}
