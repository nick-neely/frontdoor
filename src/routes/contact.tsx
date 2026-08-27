import { createFileRoute, Link } from "@tanstack/react-router";

import { buttonVariants } from "@/components/ui/button.tsx";
import {
  createGraph,
  createSeoHead,
  createWebPageSchema,
  pageTitle,
} from "@/lib/seo.ts";
import { siteConfig } from "@/lib/site-config.ts";
import { cn } from "@/lib/utils.ts";

const contactAddress = siteConfig.contactEmail;
const description =
  "Contact Nick Neely about product engineering, workflow software, practical AI-assisted development, or a software consulting Engagement.";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () =>
    createSeoHead({
      canonicalPath: "/contact",
      description,
      structuredData: createGraph([
        createWebPageSchema({
          description,
          name: "Contact Nick Neely",
          path: "/contact",
          type: "ContactPage",
        }),
      ]),
      title: pageTitle("Contact"),
    }),
});

function ContactPage() {
  return (
    <main className="flex-1" id="main-content">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
          Contact
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Tell me what you&apos;re trying to change, what makes the current
          workflow difficult, and what a useful outcome would look like.
        </p>

        <section aria-labelledby="email" className="mt-16 max-w-2xl">
          <h2
            className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
            id="email"
          >
            Email Nick
          </h2>
          <div className="mt-5 space-y-5 leading-7 text-muted-foreground">
            <p>
              Email is the direct route for questions about product engineering,
              modernizing workflow software, AI-assisted development, a Role, or
              something you are building. Useful first messages include the
              people affected, the system or process in place today, the
              constraint that matters most, and any deadline that is real. You
              do not need a polished brief before reaching out.
            </p>
            <p>
              This address reaches Nick directly. It is not a support queue,
              mailing list signup, or automated intake form. Please do not send
              passwords, access keys, private customer data, medical
              information, or other sensitive material in an introductory
              message. We can agree on an appropriate way to exchange project
              material if a conversation needs it.
            </p>
          </div>
          <a
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-8 h-11 px-6 text-base"
            )}
            href={siteConfig.links.contact}
          >
            {contactAddress}
          </a>
        </section>

        <section aria-labelledby="consulting" className="mt-16 max-w-2xl">
          <h2
            className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
            id="consulting"
          >
            Consulting
          </h2>
          <p className="mt-5 leading-7 text-muted-foreground">
            Consulting Engagements are contracted through{" "}
            <a
              className="link-underline text-foreground"
              href={siteConfig.links.neelySolutions}
              rel="noreferrer"
            >
              Neely Solutions
            </a>
            . Nickneely.dev remains the canonical record of my Roles, Projects,
            technical perspective, and documented Proof Points. Start with the{" "}
            <Link className="link-underline text-foreground" to="/work">
              work page
            </Link>{" "}
            if you need evidence before beginning a conversation.
          </p>
        </section>
      </div>
    </main>
  );
}
