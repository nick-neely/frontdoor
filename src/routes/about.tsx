import { createFileRoute, Link } from "@tanstack/react-router";

import {
  createGraph,
  createPersonSchema,
  createSeoHead,
  createWebPageSchema,
  pageTitle,
} from "@/lib/seo.ts";

const description =
  "About Nick Neely, a product-minded software consultant in Iowa who builds maintainable software for messy workflows.";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () =>
    createSeoHead({
      canonicalPath: "/about",
      description,
      structuredData: createGraph([
        createPersonSchema(),
        createWebPageSchema({
          description,
          name: "About Nick Neely",
          path: "/about",
          type: "AboutPage",
        }),
      ]),
      title: pageTitle("About"),
    }),
});

function AboutPage() {
  return (
    <main className="flex-1" id="main-content">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
          About Nick
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          I&apos;m a product-minded software consultant in Iowa. I turn messy
          business and engineering workflows into maintainable software, then
          share the practical AI-assisted patterns that hold up in real work.
        </p>

        <section aria-labelledby="what-i-do" className="mt-16 max-w-2xl">
          <h2
            className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
            id="what-i-do"
          >
            What I do
          </h2>
          <div className="mt-5 space-y-5 leading-7 text-muted-foreground">
            <p>
              My work sits where product thinking, software delivery, and
              difficult operational domains meet. I learn how the workflow
              actually behaves before I automate it. That has meant bills of
              materials, insurance claims, secure file handling, engineering
              systems, and the small internal tools that determine whether a
              team can move without fighting its own process.
            </p>
            <p>
              Consulting Engagements are contracted through Neely Solutions, a
              separate business brand. This site is the canonical home for me as
              a person: the Roles I have held, the Projects I have shipped, and
              the Posts I publish. The numbers on the{" "}
              <Link className="link-underline text-foreground" to="/work">
                work page
              </Link>{" "}
              come from documented work; if a result is not established, I do
              not turn it into a claim.
            </p>
          </div>
        </section>

        <section aria-labelledby="how-i-build" className="mt-16 max-w-2xl">
          <h2
            className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
            id="how-i-build"
          >
            How I build
          </h2>
          <div className="mt-5 space-y-5 leading-7 text-muted-foreground">
            <p>
              I prefer simple systems with clear ownership. AI agents are part
              of my daily development workflow, but judgment, verification, and
              maintainability stay with the engineer. The goal is not to produce
              more code. It is to reach a sound result faster and leave behind
              software the owning team can understand and change.
            </p>
            <p>
              You can inspect the{" "}
              <Link className="link-underline text-foreground" to="/projects">
                Projects
              </Link>{" "}
              for shipped examples, read{" "}
              <Link className="link-underline text-foreground" to="/writing">
                Writing
              </Link>{" "}
              for the reasoning behind the work, or use the contact page when
              the problem in front of you sounds like a fit.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
