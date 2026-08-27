import { projectKindLabels, projectStatusLabels } from "@/lib/projects.ts";
import type { Project } from "@/lib/projects.ts";
import { cn } from "@/lib/utils.ts";

/** `https://tendnote.com/` reads as `tendnote.com` in a metadata cluster. */
function hostLabel(url: string): string {
  return new URL(url).host.replace(/^www\./u, "");
}

interface ProjectMetaProps {
  className?: string;
  /**
   * Adds the live site and, where there is one, the source repository.
   *
   * A row whose name already links out to the live thing would be saying the
   * same thing twice; a row whose name links inward to a detail page, and the
   * detail page itself, are the two places the outward links have to live.
   */
  links?: boolean;
  project: Project;
}

/**
 * The metadata cluster a Project carries wherever it appears. A description
 * list rather than a row of spans, so a screen reader hears "Status, Active,
 * Kind, Product, Year, 2026" instead of three unlabelled fragments. The dot is
 * decorative: the status it signals is spelled out beside it.
 */
export function ProjectMeta({
  className,
  links = false,
  project,
}: ProjectMetaProps) {
  // Amber marks the one status that means work is happening right now. Every
  // other status takes the muted dot, which is what keeps the accent readable
  // as a signal rather than as decoration.
  const dotClass =
    project.status === "active" ? "bg-signal" : "bg-muted-foreground/60";

  return (
    <dl
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground",
        className
      )}
    >
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
      {links ? (
        <div>
          <dt className="sr-only">Live site</dt>
          <dd>
            <a
              className="link-underline hover:text-foreground"
              href={project.url}
              rel="noreferrer"
              target="_blank"
            >
              {hostLabel(project.url)}
            </a>
          </dd>
        </div>
      ) : null}
      {links && project.repo !== undefined ? (
        <div>
          <dt className="sr-only">Source</dt>
          <dd>
            <a
              className="link-underline hover:text-foreground"
              href={project.repo}
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </dd>
        </div>
      ) : null}
    </dl>
  );
}
