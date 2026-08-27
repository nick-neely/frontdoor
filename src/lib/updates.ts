import type { Project, ProjectMilestone } from "./projects.ts";
import {
  isPost,
  pillarLabel,
  postTitleTransitionName,
} from "./writing-schema.ts";
import type { WritingFrontmatter } from "./writing-schema.ts";

/**
 * The merged Update feed.
 *
 * An Update is a dated, linkable thing that happened - a published Post or a
 * Project milestone - and `CONTEXT.md` is explicit that they merge into one
 * feed rather than sitting in parallel lists. This is that merge, and it is a
 * pure function over typed sources so a new source is one more mapper rather
 * than another feed on the page.
 */

/** How many Updates the home page shows. Three is the whole feed, not a page. */
export const maxUpdates = 3;

interface UpdateBase {
  /** ISO 8601 calendar date (`YYYY-MM-DD`). */
  date: string;
  /** The Pillar for a Post, `Project` for a milestone. */
  sourceLabel: string;
  title: string;
}

/**
 * Discriminated rather than flattened to a URL, because a Post is an internal
 * route with a shared-element transition and a Project milestone is an
 * off-site link. The renderer needs to know which, and a `string` href would
 * make it guess.
 */
export type Update =
  | (UpdateBase & {
      kind: "post";
      slug: string;
      /**
       * Carried rather than recomputed at the row, so the home feed and the
       * `/writing` list name the same shared element and the transition into a
       * Post works from either surface.
       */
      transitionName: string;
    })
  | (UpdateBase & { kind: "project"; url: string });

function hasMilestone(project: Project): project is ProjectMilestone {
  return project.updatedAt !== undefined;
}

function fromPost(post: WritingFrontmatter): Update {
  return {
    date: post.published,
    kind: "post",
    slug: post.slug,
    sourceLabel: pillarLabel(post),
    title: post.title,
    transitionName: postTitleTransitionName(post),
  };
}

function fromProject(project: ProjectMilestone): Update {
  return {
    date: project.updatedAt,
    kind: "project",
    sourceLabel: "Project",
    title: project.name,
    url: project.url,
  };
}

/**
 * Newest first, capped at `maxUpdates`. The title settles same-day ties, so
 * two things that happened on one day always render in the same order rather
 * than in whichever order the sources happened to be passed.
 *
 * An Update is a dated thing that happened, so Notes are dropped here whatever
 * their frontmatter says. A Note carries a `published` date as provenance and
 * is then revised in place; announcing that date as an event would date the
 * feed by something no Note surface even prints.
 */
export function mergeUpdates(
  writing: readonly WritingFrontmatter[],
  projects: readonly Project[]
): Update[] {
  return [
    ...writing.flatMap((entry) => (isPost(entry) ? [fromPost(entry)] : [])),
    ...projects.flatMap((project) =>
      hasMilestone(project) ? [fromProject(project)] : []
    ),
  ]
    .toSorted(
      (left, right) =>
        right.date.localeCompare(left.date) ||
        left.title.localeCompare(right.title)
    )
    .slice(0, maxUpdates);
}
