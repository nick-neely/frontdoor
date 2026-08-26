import type { OgCardContent } from "./og-card-layout.ts";

/**
 * The Project inventory. A Project is anything shipped that has a name and a
 * link; every Project is exactly one kind and carries exactly one status. See
 * `CONTEXT.md` for the definitions these terms are bound to.
 *
 * Every description here is written from what the Project's own live site says
 * it does. Nothing is inferred, embellished, or carried over from an internal
 * document the reader cannot check.
 */

/** A Project is a Product, Client Work, or an Experiment. Never two of them. */
export type ProjectKind = "client-work" | "experiment" | "product";

/** Where a Project sits in its lifecycle. Every Project carries exactly one. */
export type ProjectStatus = "active" | "archived" | "hiatus" | "shipped";

export interface ProjectScreenshot {
  /** Describes the interface shown, not the fact that it is a screenshot. */
  alt: string;
  /** Site-absolute path under `public/`. */
  src: string;
}

/**
 * The extra weight a featured Project carries on the list: a short blurb and
 * one screenshot slot. `screenshot: null` is an honest "no asset yet" and the
 * page renders a marked placeholder for it rather than inventing an image.
 */
export interface ProjectFeature {
  blurb: string;
  screenshot: ProjectScreenshot | null;
}

export interface Project {
  /** One line, in the words the Project's own site uses. */
  description: string;
  /** Present only on Projects the list gives extra room to. */
  featured?: ProjectFeature;
  kind: ProjectKind;
  name: string;
  /**
   * Public GitHub repository, when the source is readable. A private
   * repository is simply absent: the row says nothing rather than linking to
   * a page the reader would be refused.
   */
  repo?: string;
  /**
   * Immutable identifier, and the only thing that ties a Project to the rest
   * of the site: the detail page's URL segment, its social card's file name,
   * the CSS identifier the list row's shared-element transition travels on,
   * and the file name of the MDX under `content/projects` when one exists.
   */
  slug: string;
  status: ProjectStatus;
  /**
   * ISO 8601 calendar date (`YYYY-MM-DD`) of the most recent documented
   * milestone. A Project milestone is one of the two sources of an Update, so
   * the home feed reads this field directly and needs no per-Project shape of
   * its own. Set it only for a milestone that actually happened on that date;
   * absent is the correct value until one does.
   */
  updatedAt?: string;
  /** Absolute URL of the live thing. Every row resolves or it does not ship. */
  url: string;
  /** Year shipped, or `null` for an ongoing brand with no single ship date. */
  year: number | null;
}

/** What the home Update feed narrows a Project to once it has a milestone. */
export type ProjectMilestone = Project & { updatedAt: string };

export const projectKindLabels = {
  "client-work": "Client Work",
  experiment: "Experiment",
  product: "Product",
} satisfies Record<ProjectKind, string>;

export const projectStatusLabels = {
  active: "Active",
  archived: "Archived",
  hiatus: "Hiatus",
  shipped: "Shipped",
} satisfies Record<ProjectStatus, string>;

/**
 * Listed in the order the reader should meet them: the two featured Products
 * first, then the rest. Not sorted at render time, because the order is an
 * editorial decision rather than a property of the data.
 */
export const projects: readonly Project[] = [
  {
    description:
      "A private relationship memory and follow-up assistant for who you talked to and what to follow up on.",
    featured: {
      blurb:
        "A notebook for the things you would otherwise forget about people: who you talked to, what is going on with them, or something to follow up on. Notes are saved privately and reviewed before they become memory.",
      screenshot: {
        alt: "tendnote's review queue: four extracted facts about two people, each labelled Suggested with Dismiss and Save beside it.",
        src: "/screenshots/tendnote-review-queue.webp",
      },
    },
    kind: "product",
    name: "tendnote",
    repo: "https://github.com/nick-neely/tendnote",
    slug: "tendnote",
    status: "active",
    url: "https://tendnote.com",
    year: 2026,
  },
  {
    description:
      "Turns merged GitHub pull requests into invoice-ready line items and Stripe drafts, built for freelance developers and small dev agencies.",
    featured: {
      blurb:
        "Pick a repository and a date range, review the line items diffbill rewrites from developer shorthand into descriptions a client can read, then create the draft in your own Stripe account. It reads pull request metadata and short excerpts of the changed lines, and never your full source files or repository contents.",
      screenshot: {
        alt: 'diffbill\'s home page, headed "Your commits. Your invoice." over a dark green field.',
        src: "/screenshots/diffbill-product-thesis.webp",
      },
    },
    kind: "product",
    name: "diffbill",
    // No `repo`: the repository is private by decision, and a portfolio row
    // owes no explanation for a product whose source is not published.
    slug: "diffbill",
    status: "active",
    url: "https://diffbill.com",
    // Year per the Project table in issue #6, which Nick wrote. That
    // table is the documented source for this one.
    year: 2026,
  },
  {
    description:
      "A local-first developer journal: capture rough notes in a global-hotkey scratchpad, then triage them into repo-aware GitHub issue drafts.",
    kind: "product",
    name: "pilog",
    repo: "https://github.com/nick-neely/pilog",
    slug: "pilog",
    status: "shipped",
    url: "https://pilog.dev",
    year: 2026,
  },
  {
    description:
      "A headless Shopify storefront for zero-sugar electrolytes, designed by first responders for anyone who demands peak performance on duty or in the gym.",
    kind: "client-work",
    name: "Frontline Fuel",
    slug: "frontline-fuel",
    status: "shipped",
    url: "https://drinkfrontlinefuel.com",
    // Year per the Project table in issue #6, which Nick wrote. That
    // table is the documented source for this one.
    year: 2026,
  },
  {
    description:
      "The separate brand for local and small-business work: professional web development for businesses in Dubuque, Iowa and beyond.",
    kind: "client-work",
    name: "Neely Solutions",
    slug: "neely-solutions",
    status: "active",
    url: "https://neelysolutions.com",
    year: null,
  },
];

/**
 * Everything below derives a URL, a file name, or a CSS identifier from a
 * slug. A Project without a detail page still has all three; nothing here
 * asserts that the page exists, which is `src/lib/project-pages.ts`'s job.
 */
export function projectPath(slug: string): string {
  return `/projects/${slug}`;
}

/**
 * The Project's social card, drawn at build time into the client output. It
 * shares the writing cards' shape and directory so one pipeline emits both.
 */
export function projectOgImagePath(slug: string): string {
  return `/og/projects/${slug}.png`;
}

/**
 * The shared-element name that carries a Project's name from the list row to
 * the detail page's heading. Slugs are lowercase words and hyphens, so the
 * result is always a valid CSS identifier and always unique per document.
 */
export function projectTitleTransitionName(slug: string): string {
  return `project-title-${slug}`;
}

/**
 * What a Project's generated social card says. Same visual system as a Post's,
 * with the mono line carrying what identifies a Project instead: what kind of
 * thing it is, and the year it shipped. A brand with no single ship date
 * prints the kind alone rather than a placeholder year.
 */
export function projectOgCard(project: Project): OgCardContent {
  const kind = projectKindLabels[project.kind];

  return {
    meta: project.year === null ? [kind] : [kind, String(project.year)],
    title: project.name,
  };
}

export function findProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/**
 * Every slug the inventory knows, which is what the MDX frontmatter contract
 * validates against: a page for a Project that does not exist would prerender
 * a route the list can never link to.
 */
export const projectSlugs: readonly string[] = projects.map(
  (project) => project.slug
);
