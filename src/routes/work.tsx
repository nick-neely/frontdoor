import { createFileRoute, Link } from "@tanstack/react-router";
import { track } from "@vercel/analytics";
import { Fragment } from "react";
import type { ComponentType, ReactNode } from "react";

import { LeanTechniquesMark } from "@/components/lean-techniques-mark.tsx";
import { buttonVariants } from "@/components/ui/button.tsx";
import {
  createGraph,
  createSeoHead,
  createWebPageSchema,
  pageTitle,
} from "@/lib/seo.ts";
import { siteConfig } from "@/lib/site-config.ts";
import { cn } from "@/lib/utils.ts";

const description =
  "Where Nick Neely has worked, what each role measurably changed, and how he works - from the hearing clinic he automated first to Lean TECHniques today.";

/**
 * The one booking destination on the site. It is a conversation, not the
 * consulting door: Engagements are contracted through Neely Solutions, and the
 * copy around this link says so in both directions. Off-site, so it opens in
 * its own tab.
 */
const conversationUrl = "https://cal.com/nickneely/chat";
const neelySolutionsUrl = "https://neelysolutions.com";
const contactAddress = siteConfig.links.contact.replace(/^mailto:/u, "");

/**
 * An employer's mark, in one of the two forms it exists in here: an inline SVG
 * that follows the surrounding text colour, or a vendored file with a second
 * cut only where dark grounds need one. Same shape as `/uses`' `UseLogo`,
 * widened by the component case because Lean TECHniques' mark was already
 * vendored as a component for the home page's Now Line.
 */
type EmployerMark =
  | { component: ComponentType<{ className?: string }> }
  | { dark?: string; src: string };

/**
 * One Role on the timeline. `framing` exists for the one Role whose shape is
 * not obvious from its title, and is context rather than a Proof Point: it
 * stays out of the amber-dotted rows so the two are never confused.
 */
interface Role {
  dates: string;
  employer: string;
  framing?: string;
  location: string;
  mark: EmployerMark;
  /** Proof Points, strongest first. */
  outcomes: readonly string[];
  title: string;
}

/*
 * Every figure below is verbatim from Nick's résumé (2026-07-26 revision).
 * Rounding, embellishing, or inventing one breaks the site's central promise,
 * so change a row only against the source it came from. The Frontline Fuel
 * waitlist and revenue figures carry the client's written sign-off, which is
 * also what lets the client be named here at all.
 *
 * Per-row years are deliberately absent: the Role carries the date range, and
 * half the rows have no documented year of their own. A column that is right
 * for three rows out of nine is worse than no column.
 */
const roles: readonly Role[] = [
  {
    dates: "Aug 2024 - Present",
    employer: "Lean TECHniques",
    location: "Johnston, IA",
    mark: { component: LeanTechniquesMark },
    outcomes: [
      "Vermeer's Bill of Materials CSV upload workflow: a 10,000-part import went from about two hours to about two minutes, replacing manual item-by-item entry.",
      "ClaimDoc's secure multi-file uploads, modernized on Vue 3, .NET, Azure Blob Storage, and Bicep.",
      "Secured 12 internal platform endpoints end to end: authentication, admin authorization, and least-privilege DTO mapping.",
      "Cut pull-request verification on that platform from about 15 minutes to about 5, with Vitest sharding, concurrency, and path filters.",
    ],
    title: "Software Engineer II, Professional Software Consultant",
  },
  {
    dates: "2025 - Present",
    employer: "Neely Solutions",
    location: "Iowa",
    mark: {
      dark: "/logos/neely-solutions-dark.svg",
      src: "/logos/neely-solutions.svg",
    },
    outcomes: [
      "Built the freelance operations platform the business runs on (Next.js, TypeScript): lead intake, portfolio CMS, and secure admin tooling, with workflows saving up to 3 hours a day across billing, outreach, and pipeline.",
      "Delivered Frontline Fuel's CMS-managed marketing and commerce app (Next.js, Payload CMS, Shopify Storefront GraphQL, Klaviyo, Resend): 50+ waitlist signups and several thousand dollars in first-month revenue.",
    ],
    title: "Founder, Software Consultant",
  },
  {
    dates: "Sep 2015 - May 2024",
    employer: "Moore Hearing Clinic",
    framing:
      "My first job, worked through high school and the years after it: insurance claims and ordinary front-office duties. I also built the clinic's website and the Python, React, and Node tools the office ran on for insurance calculations, payroll and timecard generation, and patient tracking - I automated the office I was sitting in.",
    location: "Ottumwa, IA",
    mark: { src: "/logos/moore-hearing-clinic.webp" },
    outcomes: [
      "Automating insurance calculations cut calculation time by about 50%.",
      "Generating payroll and timecards cut payroll errors by about 40%.",
      "Administrative overhead across the office fell by about 20%.",
    ],
    title: "Digital Operations Specialist",
  },
];

/*
 * The timeline's closing rows. Kept as two labelled runs rather than one line
 * because a degree, a certification, and unfinished coursework are three
 * different claims, and running them together made the years zigzag. Each run
 * reads forward in time, and each entry names what was earned before where it
 * was earned.
 */
const credentials = [
  {
    entries: [
      "Computer science coursework at Iowa State University (2019-2021)",
      "A.A.S., Computer Software Development, Indian Hills Community College (2024)",
    ],
    label: "Education",
  },
  {
    entries: ["GitHub Actions (GH-200) Associate (2026)"],
    label: "Certification",
  },
];

/*
 * Drawn from the résumé summary and from what this site already demonstrates.
 * Voice pass pending from Nick: the claims are his, the phrasing is mine.
 */
const approach: readonly { label: string; note: ReactNode }[] = [
  {
    label: "Product-minded",
    note: "I solve the business problem the ticket is pointing at. When the workflow underneath is the actual defect, I say so before I write the code around it.",
  },
  {
    label: "Fast in an unfamiliar domain",
    note: "Bills of materials, insurance claims, hearing-clinic billing. I learn the domain first and ask the clarifying questions early, while they are still cheap to answer.",
  },
  {
    label: "Agent-driven by default",
    note: (
      <>
        AI-assisted development is how I work every day, not an experiment
        running beside the real work. The editor, the agents, and the setup it
        all runs on are on{" "}
        <Link className="link-underline hover:text-foreground" to="/uses">
          /uses
        </Link>
        .
      </>
    ),
  },
  {
    label: "Maintainable over clever",
    note: "The team keeps the code after I hand it back. Boring, documented, and owned by them beats impressive and load-bearing on me.",
  },
];

/*
 * Jared's words as he wrote them, with his written sign-off on file. The
 * grammar is his and stays his: a testimonial that has been tidied into the
 * site's voice is no longer evidence that a client said it.
 */
const testimonial = {
  attribution: "Jared Gringer, Owner, Frontline Fuel",
  quote:
    "Needed a website for marketing and for an online store. Website I now have a fully functioning website that advertises my product and allow people to purchase my product. I 100% recommend Neely Solutions to anyone who needs any website work done. Especially a small business or anyone who needs a professional website. Nick will work with you to create whatever you need and keep you updated along the way.",
};

const sectionHeading =
  "font-display text-2xl font-semibold tracking-tight sm:text-3xl";

/** The size `/uses` renders its marks at, reused so the two pages agree. */
const markSize = 18;
const markClass = "size-[18px] shrink-0 object-contain";

export const Route = createFileRoute("/work")({
  component: WorkPage,
  head: () =>
    createSeoHead({
      canonicalPath: "/work",
      description,
      structuredData: createGraph([
        createWebPageSchema({
          description,
          name: "Work",
          path: "/work",
        }),
      ]),
      title: pageTitle("Work"),
    }),
});

/**
 * The employer's mark beside its name.
 *
 * Purely identifying: every Role reads completely without it, so the mark is
 * hidden from assistive technology in all three forms. The light/dark pair
 * swaps in CSS on the same `dark:` variant the theme toggle uses, so the
 * server and the first client paint agree and neither theme waits for
 * hydration to show the right file.
 */
function RoleMark({ mark }: { mark: EmployerMark }) {
  if ("component" in mark) {
    const Mark = mark.component;

    return <Mark className={markClass} />;
  }

  if (mark.dark === undefined) {
    return (
      <img
        alt=""
        className={markClass}
        decoding="async"
        height={markSize}
        src={mark.src}
        width={markSize}
      />
    );
  }

  return (
    <>
      <img
        alt=""
        className={`${markClass} dark:hidden`}
        decoding="async"
        height={markSize}
        src={mark.src}
        width={markSize}
      />
      <img
        alt=""
        className={`hidden ${markClass} dark:block`}
        decoding="async"
        height={markSize}
        src={mark.dark}
        width={markSize}
      />
    </>
  );
}

/**
 * One entry on the timeline. The dates hold their own column on wide screens,
 * which is what makes the run of Roles scannable without a card around each
 * one; below `sm` they simply lead the entry, which is the order a timeline
 * reads in anyway.
 */
function RoleEntry({ role }: { role: Role }) {
  return (
    <li className="grid gap-x-6 gap-y-3 py-8 first:pt-0 last:pb-0 sm:grid-cols-[10.5rem_1fr] sm:py-10">
      <p className="font-mono text-[13px] leading-6 text-muted-foreground sm:mt-1.5">
        {role.dates}
      </p>
      <div>
        <h3 className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight sm:text-2xl">
          <RoleMark mark={role.mark} />
          {role.employer}
        </h3>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-muted-foreground">
          <span>{role.title}</span>
          <span aria-hidden="true" className="text-border">
            ·
          </span>
          <span>{role.location}</span>
        </p>
        {role.framing === undefined ? null : (
          <p className="mt-4 leading-7 text-muted-foreground">{role.framing}</p>
        )}
        <ul className="mt-5 space-y-3.5">
          {role.outcomes.map((outcome) => (
            <li className="relative pl-6 leading-7" key={outcome}>
              {/* Decorative: the row reads the same without it, and a screen
                  reader gets the list semantics instead. */}
              <span
                aria-hidden="true"
                className="absolute top-2.5 left-0 size-1.5 rounded-full bg-signal"
              />
              {outcome}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function WorkPage() {
  return (
    <main className="flex-1" id="main-content">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
          Work
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Where I&apos;ve worked, what each role measurably changed, and how I
          work. Every figure on this page is verbatim from the work it came out
          of.
        </p>

        {/* The router, first and quiet. A reader who came here to buy
            consulting should find the right door before reading a résumé. */}
        <p className="mt-8 max-w-2xl font-mono text-[13px] leading-6 text-muted-foreground">
          Here for consulting? That work is contracted through{" "}
          <a
            className="link-underline text-foreground"
            href={neelySolutionsUrl}
            rel="noreferrer"
          >
            Neely Solutions
          </a>
          .
        </p>

        <section aria-labelledby="where-ive-worked" className="mt-16 sm:mt-20">
          <h2 className={sectionHeading} id="where-ive-worked">
            Where I&apos;ve worked
          </h2>
          <ol className="mt-10 max-w-3xl divide-y">
            {roles.map((role) => (
              <RoleEntry key={role.employer} role={role} />
            ))}
          </ol>
          {/* The same column the dates hold above, so the two runs close the
              timeline rather than trailing off the last Role. */}
          <dl className="mt-8 grid max-w-3xl gap-x-6 gap-y-4 border-t pt-6 font-mono text-[13px] leading-6 text-muted-foreground sm:grid-cols-[10.5rem_1fr]">
            {credentials.map((group) => (
              <Fragment key={group.label}>
                <dt>{group.label}</dt>
                {/* One entry per line rather than a separated run: the longest
                    of them is wider than this column on its own, so an inline
                    separator would only ever land at the end of a wrap. */}
                <dd className="flex flex-col gap-y-1 text-foreground">
                  {group.entries.map((entry) => (
                    <span key={entry}>{entry}</span>
                  ))}
                </dd>
              </Fragment>
            ))}
          </dl>
        </section>

        <section aria-labelledby="how-i-work" className="mt-16 sm:mt-20">
          <h2 className={sectionHeading} id="how-i-work">
            How I work
          </h2>
          <dl className="mt-8 max-w-2xl divide-y">
            {approach.map((row) => (
              <div className="py-6 first:pt-0 last:pb-0" key={row.label}>
                <dt className="font-mono text-[13px]">{row.label}</dt>
                <dd className="mt-2 leading-7 text-muted-foreground">
                  {row.note}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="talk-to-me" className="mt-16 sm:mt-20">
          <h2 className={sectionHeading} id="talk-to-me">
            Talk to me
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
            About a role, about AI-assisted development, or about whatever
            you&apos;re building. Not a sales call - just a conversation.
          </p>
          <div className="mt-8 flex max-w-2xl flex-col items-start gap-4">
            <a
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 px-6 text-base"
              )}
              href={conversationUrl}
              onClick={() => {
                track("chat-click", { path: "/work" });
              }}
              rel="noreferrer"
              target="_blank"
            >
              Book a conversation
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <p className="font-mono text-[13px] text-muted-foreground">
              or{" "}
              <a
                className="link-underline hover:text-foreground"
                href={siteConfig.links.contact}
              >
                {contactAddress}
              </a>
            </p>
          </div>
        </section>

        <aside
          aria-labelledby="neely-solutions"
          className="mt-16 max-w-2xl rounded-2xl border p-6 sm:mt-20 sm:p-8"
        >
          <h2
            className="font-display text-xl font-semibold tracking-tight"
            id="neely-solutions"
          >
            Neely Solutions
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Consulting and client work are contracted through my LLC rather than
            through this site. Local business, small business, a marketing and
            commerce site, an internal tool nobody wants to keep doing by hand:
            it all goes through{" "}
            <a
              className="link-underline text-foreground"
              href={neelySolutionsUrl}
              rel="noreferrer"
            >
              neelysolutions.com
            </a>
            .
          </p>
          <figure className="mt-6 border-t pt-6">
            <blockquote className="leading-7 text-muted-foreground">
              {testimonial.quote}
            </blockquote>
            <figcaption className="mt-3 font-mono text-[13px] text-muted-foreground">
              {testimonial.attribution}
            </figcaption>
          </figure>
        </aside>
      </div>
    </main>
  );
}
