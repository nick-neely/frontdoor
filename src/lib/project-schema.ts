import { z } from "zod";

import { projectSlugs } from "./projects.ts";

/**
 * Slugs are hand-authored and immutable, so they are constrained to the shape
 * that survives being a URL segment, a file name, and a CSS identifier
 * fragment for the shared-element view transition.
 */
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

/**
 * Frontmatter for everything under `content/projects`.
 *
 * It is deliberately two fields. `src/lib/projects.ts` is the single source of
 * a Project's kind, status, year, live URL and repository, and every surface
 * that shows those - the list row, the metadata line on the detail page, the
 * social card - reads them from there. A detail page adds prose, pictures, and
 * the one sentence that introduces them; restating anything else here would be
 * a second copy of the inventory, free to drift from the first.
 */
export const projectFrontmatterSchema = z.object({
  /** The sentence under the title. It is also the page's meta description. */
  dek: z.string().min(1),
  slug: z
    .string()
    .regex(slugPattern)
    // A page for a Project the inventory has never heard of would prerender a
    // route nothing links to, carry a social card naming no Project, and 404
    // on a metadata line it cannot build. Refusing it here is what keeps
    // `content/projects` a view over the inventory rather than a second one.
    .refine((slug) => projectSlugs.includes(slug), {
      message: `must be one of the Projects in src/lib/projects.ts: ${projectSlugs.join(", ")}`,
    }),
});

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;

/**
 * Detail pages come in the order the list introduces their Projects, which is
 * an editorial decision recorded once in `src/lib/projects.ts`. Ordering by it
 * rather than by file name keeps the prerender inventory, the sitemap, and the
 * list page telling the same story.
 */
export function compareProjectPages(
  left: ProjectFrontmatter,
  right: ProjectFrontmatter
): number {
  return projectSlugs.indexOf(left.slug) - projectSlugs.indexOf(right.slug);
}
