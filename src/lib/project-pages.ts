// The generated content-collections index, imported by relative path rather
// than through an alias so that Vite and Vitest resolve it the same way. This
// is the only module allowed to touch the generated output; every rendering
// surface reads project pages through the exports below.
//
// It is a barrel now that there are two collections, and react-doctor is right
// about barrels in general. It stays because it is the only entry point
// content-collections emits types for: the per-collection files beside it have
// no declarations, so importing one directly trades a handful of bytes for an
// untyped index.
// oxlint-disable-next-line react-doctor/no-barrel-import
import { allProjectPages } from "../../.content-collections/generated/index.js";
import { compareProjectPages } from "./project-schema.ts";
import { findProject } from "./projects.ts";
import type { Project } from "./projects.ts";

/** One entry in the project page collection: frontmatter plus the file name. */
export type ProjectPage = (typeof allProjectPages)[number];

/** Every authored detail page, in the order the list introduces its Project. */
export const projectPages: readonly ProjectPage[] =
  allProjectPages.toSorted(compareProjectPages);

/**
 * A Project and the page that describes it, resolved together.
 *
 * The two are stored apart on purpose - the inventory in `projects.ts`, the
 * prose in `content/projects` - and every reader needs both at once: the
 * heading and metadata line come from the Project, the dek and the body from
 * the page. Joining them here means a caller has one thing to find and one
 * absence to handle, and the frontmatter contract has already refused a page
 * whose slug names no Project, so the join cannot half-succeed.
 */
export interface ProjectDetail {
  dek: string;
  /** Module specifier of the compiled MDX body, and its key in the glob. */
  moduleId: string;
  project: Project;
}

export function findProjectDetail(slug: string): ProjectDetail | undefined {
  const page = projectPages.find((entry) => entry.slug === slug);
  const project = page === undefined ? undefined : findProject(page.slug);

  if (page === undefined || project === undefined) {
    return undefined;
  }

  return {
    dek: page.dek,
    moduleId: `/content/projects/${page.fileName}`,
    project,
  };
}

/**
 * Whether a Project's name on the list should link inward. Rows without a page
 * keep linking straight out to the live thing, which is the only address they
 * have.
 */
export function hasProjectPage(slug: string): boolean {
  return projectPages.some((page) => page.slug === slug);
}
