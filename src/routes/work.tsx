import { createFileRoute } from "@tanstack/react-router";
import { track } from "@vercel/analytics";

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
  "Consulting for engineering leaders, product teams, and founders who need a messy workflow turned into maintainable software.";

/** The one booking destination on the site. Off-site, so it opens in its own tab. */
const introCallUrl = "https://cal.com/nickneely/chat";
const neelySolutionsUrl = "https://neelysolutions.com";
const contactAddress = siteConfig.links.contact.replace(/^mailto:/u, "");

const audiences = [
  {
    detail:
      "modernizing internal workflows and legacy systems without stopping the business to do it.",
    lead: "Engineering leaders and product teams",
  },
  {
    detail:
      "who need a first product built by someone who has shipped their own.",
    lead: "Founders",
  },
  {
    detail:
      "adopting practical AI-assisted development that survives contact with real codebases.",
    lead: "Consultants and independent developers",
  },
];

/*
 * Every figure here is verbatim from documented work. Rounding, embellishing,
 * or inventing one breaks the site's central promise, so change a row only
 * against the source it came from.
 */
const proofPoints = [
  {
    client: "Vermeer",
    outcome:
      "Bill of Materials upload workflow: a 10,000-part import went from about two hours to about two minutes.",
  },
  {
    client: "Lean TECHniques",
    outcome:
      "CI/CD changes that cut pull-request verification time by roughly two-thirds.",
  },
  {
    client: "ClaimDoc",
    outcome: "Secure multi-file uploads, built on Vue 3, .NET, and Azure.",
  },
];

const engagementSteps = [
  {
    detail:
      "A short conversation about the workflow that hurts, what it costs you, and whether I can actually help.",
    step: "Discovery",
  },
  {
    detail:
      "A written plan with a clear boundary: what ships, what it changes, and how we will know it worked.",
    step: "Scope",
  },
  {
    detail:
      "Working software in your hands early and often, with the documentation and handoff your team needs to own it.",
    step: "Delivery",
  },
];

const sectionHeading =
  "font-display text-2xl font-semibold tracking-tight sm:text-3xl";

export const Route = createFileRoute("/work")({
  component: WorkPage,
  head: () =>
    createSeoHead({
      canonicalPath: "/work",
      description,
      structuredData: createGraph([
        createWebPageSchema({
          description,
          name: "Work with me",
          path: "/work",
        }),
      ]),
      title: pageTitle("Work"),
    }),
});

function WorkPage() {
  return (
    <main className="flex-1" id="main-content">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
          Work with me
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          I turn messy business and engineering workflows into software your
          team can actually maintain - and I stick around long enough to prove
          it works.
        </p>

        <section aria-labelledby="who-i-help" className="mt-16 sm:mt-20">
          <h2 className={sectionHeading} id="who-i-help">
            Who I help
          </h2>
          <ul className="mt-8 max-w-2xl space-y-7">
            {audiences.map((audience) => (
              <li key={audience.lead}>
                <p className="text-lg font-medium">{audience.lead}</p>
                <p className="mt-1.5 leading-7 text-muted-foreground">
                  {audience.detail}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="proof" className="mt-16 sm:mt-20">
          <h2 className={sectionHeading} id="proof">
            Proof
          </h2>
          {/* oxlint-disable-next-line eslint/no-warning-comments */}
          {/* TODO(nick): add years to Proof Points - not documented, must not be guessed */}
          <ul className="mt-8 max-w-2xl space-y-8">
            {proofPoints.map((point) => (
              <li className="relative pl-6" key={point.client}>
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 left-0 size-1.5 rounded-full bg-signal"
                />
                <p className="font-mono text-[13px] text-muted-foreground">
                  {point.client}
                </p>
                <p className="mt-2 text-lg leading-8">{point.outcome}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* oxlint-disable-next-line eslint/no-warning-comments */}
        {/* TODO(nick): confirm this matches how engagements really run */}
        <section
          aria-labelledby="how-engagements-work"
          className="mt-16 sm:mt-20"
        >
          <h2 className={sectionHeading} id="how-engagements-work">
            How engagements work
          </h2>
          <ol className="mt-8 max-w-2xl divide-y">
            {engagementSteps.map((item) => (
              <li className="py-6 first:pt-0 last:pb-0" key={item.step}>
                <p className="font-mono text-[13px]">{item.step}</p>
                <p className="mt-2 leading-7 text-muted-foreground">
                  {item.detail}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-16 flex max-w-2xl flex-col items-start gap-4 sm:mt-20">
          <a
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 px-6 text-base"
            )}
            href={introCallUrl}
            onClick={() => {
              track("intro-call-click", { path: "/work" });
            }}
            rel="noreferrer"
            target="_blank"
          >
            Book an intro call
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

        <aside
          aria-label="Neely Solutions"
          className="mt-16 max-w-2xl rounded-2xl border p-6 sm:mt-20 sm:p-8"
        >
          <p className="leading-7 text-muted-foreground">
            Local or small-business project? That work lives at{" "}
            <a
              className="link-underline text-foreground"
              href={neelySolutionsUrl}
              rel="noreferrer"
            >
              Neely Solutions
            </a>
            .
          </p>
          {/* oxlint-disable-next-line eslint/no-warning-comments */}
          {/* TODO(nick): paste Jared Gringer's testimonial verbatim */}
          <figure className="mt-6 border-t pt-6">
            <blockquote className="leading-7 text-muted-foreground">
              [Testimonial pending - Jared&apos;s words go here verbatim, with
              his written sign-off already on file.]
            </blockquote>
            <figcaption className="mt-3 font-mono text-[13px] text-muted-foreground">
              Jared Gringer, Owner, Frontline Fuel
            </figcaption>
          </figure>
        </aside>
      </div>
    </main>
  );
}
