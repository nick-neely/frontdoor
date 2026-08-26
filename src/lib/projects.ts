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
      // Pending from Nick. Drop the file in `public/screenshots/` and
      // replace this with `{ alt, src }`; the page renders a marked
      // placeholder until then.
      screenshot: null,
    },
    kind: "product",
    name: "tendnote",
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
      // Pending from Nick. Drop the file in `public/screenshots/` and
      // replace this with `{ alt, src }`; the page renders a marked
      // placeholder until then.
      screenshot: null,
    },
    kind: "product",
    name: "diffbill",
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
    status: "shipped",
    url: "https://pilog.dev",
    year: 2026,
  },
  {
    description:
      "A headless Shopify storefront for zero-sugar electrolytes, designed by first responders for anyone who demands peak performance on duty or in the gym.",
    kind: "client-work",
    name: "Frontline Fuel",
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
    status: "active",
    url: "https://neelysolutions.com",
    year: null,
  },
];
