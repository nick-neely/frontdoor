import { createFileRoute, Link } from "@tanstack/react-router";

import {
  createGraph,
  createSeoHead,
  createWebPageSchema,
  pageTitle,
} from "@/lib/seo.ts";
import { siteConfig } from "@/lib/site-config.ts";

const description =
  "How nickneely.dev handles analytics, newsletter subscriptions, local preferences, email, and links to other services.";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () =>
    createSeoHead({
      canonicalPath: "/privacy",
      description,
      structuredData: createGraph([
        createWebPageSchema({
          description,
          name: "Privacy",
          path: "/privacy",
        }),
      ]),
      title: pageTitle("Privacy"),
    }),
});

function PrivacyPage() {
  return (
    <main className="flex-1" id="main-content">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
          Privacy
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          This site is deliberately small in what it collects. It has no user
          accounts, advertising trackers, or database of visitors.
        </p>

        <div className="mt-16 max-w-2xl space-y-14">
          <section aria-labelledby="analytics">
            <h2
              className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
              id="analytics"
            >
              Analytics
            </h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              The site uses Vercel Web Analytics to understand aggregate page
              traffic. It does not use advertising pixels or build profiles for
              targeted advertising. The colour theme you choose is stored in
              your browser so the site can use the same preference on your next
              visit. That preference is not sent to a separate account because
              there are no site accounts.
            </p>
          </section>

          <section aria-labelledby="newsletter">
            <h2
              className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
              id="newsletter"
            >
              Newsletter
            </h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              If you ask to join the newsletter, Resend receives the email
              address needed to send a confirmation. This site does not store a
              subscriber database. A signed Confirmation travels in the
              confirmation link, and a Subscriber is created with Resend only
              after that link is used. Messages do not include open-rate
              tracking pixels. You can unsubscribe using the link included in a
              newsletter message.
            </p>
          </section>

          <section aria-labelledby="messages-and-links">
            <h2
              className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
              id="messages-and-links"
            >
              Messages and other sites
            </h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              If you email Nick, your message is handled by the mail providers
              involved in delivering and replying to it. Links to GitHub,
              LinkedIn, X, Neely Solutions, Projects, and other external sites
              take you to services with their own privacy practices. Review
              those services before sharing information with them. For a privacy
              question about this site, use the{" "}
              <Link className="link-underline text-foreground" to="/contact">
                contact page
              </Link>{" "}
              or email{" "}
              <a
                className="link-underline text-foreground"
                href={siteConfig.links.contact}
              >
                {siteConfig.links.contact.replace(/^mailto:/u, "")}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
