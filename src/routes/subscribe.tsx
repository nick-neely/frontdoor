import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { NewsletterCapture } from "@/components/newsletter-capture.tsx";
import { confirmNewsletterSubscription } from "@/lib/newsletter-actions.ts";
import type { ConfirmResult } from "@/lib/newsletter-actions.ts";
import {
  createGraph,
  createSeoHead,
  createWebPageSchema,
  pageTitle,
} from "@/lib/seo.ts";

/**
 * The newsletter's own page, and the landing the confirm link points at.
 *
 * It is prerendered like every other public route, which means the static
 * shell has no token in it and has to read completely as a pitch. The token is
 * read from `window.location` in an effect rather than from the router's
 * search params, and deliberately so: a prerendered document is served for
 * `/subscribe?token=...` too, so deciding what to render from the query during
 * the first client render would disagree with the HTML that is already on
 * screen. Reading it after hydration makes the swap a state change instead of
 * a mismatch.
 */

const description =
  "Confirmed-opt-in newsletter on product engineering, practical AI, and building in public. No tracking, not even opens.";

const sourcePath = "/subscribe";

/** `idle` is the prerendered state: no token in the URL, so no confirming. */
type ConfirmationState = "checking" | "idle" | ConfirmResult;

const confirmationCopy = {
  checking: "Confirming your link.",
  failed: "Something went wrong on my end. Try that link again in a moment.",
  invalid: "This link expired or was already used.",
  subscribed: "You're subscribed. First one arrives when the next Post ships.",
  unconfigured: "The newsletter is not configured yet.",
} as const satisfies Record<Exclude<ConfirmationState, "idle">, string>;

export const Route = createFileRoute("/subscribe")({
  component: SubscribePage,
  head: () =>
    createSeoHead({
      canonicalPath: sourcePath,
      description,
      structuredData: createGraph([
        createWebPageSchema({
          description,
          name: "The newsletter",
          path: sourcePath,
        }),
      ]),
      title: pageTitle("The newsletter"),
    }),
});

/**
 * Reads the Confirmation out of the URL once, after hydration, and asks the
 * server to verify it.
 *
 * Nothing is retried and nothing is cached. A Confirmation is single-use by
 * intent and short-lived by arithmetic, so a second attempt at the same token
 * is the reader's decision to make, not this hook's.
 */
function useConfirmation(): ConfirmationState {
  const [state, setState] = useState<ConfirmationState>("idle");

  useEffect(() => {
    let live = true;

    async function confirm() {
      const token = new URLSearchParams(window.location.search).get("token");

      // The prerendered state. Nothing to verify, so the pitch stands.
      if (token === null || token.length === 0) {
        return;
      }

      setState("checking");

      try {
        const result = await confirmNewsletterSubscription({ data: { token } });

        if (live) {
          setState(result);
        }
      } catch {
        // A rejected RPC rather than a refused token. Same message either way:
        // the reader can only try the link again.
        if (live) {
          setState("failed");
        }
      }
    }

    void confirm();

    return () => {
      live = false;
    };
  }, []);

  return state;
}

function Pitch() {
  return (
    <>
      <div className="mt-6 max-w-2xl space-y-5 text-lg leading-8 text-muted-foreground">
        <p>
          I write about turning the workflows everyone dreads into software a
          team can maintain, the AI-assisted patterns behind how it actually
          gets built, and what shipping my own products really costs.
        </p>
        <p>
          Every Post lands on the site first. The newsletter is how it reaches
          you if you would rather not keep checking. No open tracking, no click
          tracking, no pixel - I have no idea whether you read any of it.
        </p>
      </div>
      <NewsletterCapture className="mt-12" source={sourcePath} />
    </>
  );
}

/**
 * Everything after the token has been read. `subscribed` is the end of the
 * road, so it offers nothing to do; every other outcome puts the form back,
 * because starting over is the only thing left that helps.
 */
function Confirmation({
  state,
}: {
  state: Exclude<ConfirmationState, "idle">;
}) {
  return (
    <>
      {/* `output` is a live region by definition, so the outcome is announced
          without an ARIA attribute anyone has to remember to keep. */}
      <output className="mt-6 flex max-w-2xl items-baseline gap-2.5 font-mono text-[13px] leading-6">
        <span
          aria-hidden="true"
          className="mt-2 size-1.5 shrink-0 rounded-full bg-signal"
        />
        <span>{confirmationCopy[state]}</span>
      </output>
      {state === "checking" || state === "subscribed" ? null : (
        <NewsletterCapture className="mt-12" source={sourcePath} />
      )}
    </>
  );
}

function SubscribePage() {
  const state = useConfirmation();

  return (
    <main className="flex-1" id="main-content">
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
          The newsletter
        </h1>
        {state === "idle" ? <Pitch /> : <Confirmation state={state} />}
      </section>
    </main>
  );
}
