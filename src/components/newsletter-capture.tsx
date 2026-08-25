import { track } from "@vercel/analytics";
import { useEffect, useId, useRef, useState } from "react";
import type { SyntheticEvent } from "react";

import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { subscribeToNewsletter } from "@/lib/newsletter-actions.ts";
import type { SubscribeResult } from "@/lib/newsletter-actions.ts";
import {
  honeypotFieldName,
  isPlausibleEmail,
  newsletterFootnote,
  newsletterPitch,
} from "@/lib/newsletter.ts";
import { cn } from "@/lib/utils.ts";

/**
 * The capture block: a quiet bordered box with one honest sentence, one field,
 * and one button. It appears at the end of every Post, at the foot of
 * `/writing`, and on `/subscribe`.
 *
 * Success is the one state transition `DESIGN.md` permits, and it is permitted
 * because the reader caused it. The form is replaced by a single line, settled
 * over 150ms, instantly under reduced motion. Nothing else here moves.
 *
 * The two anti-abuse heuristics are wired invisibly and stay out of the copy.
 * A reader should never learn that a trap exists, and a script should never
 * learn that it was caught: `judgeSubmission` decides, the server answers a
 * trapped submission with the same success a real one gets, and - per ADR-0002
 * - a real success writes nothing anywhere either.
 */

interface NewsletterCaptureProps {
  className?: string;
  /**
   * The route path this block sits on, carried by the analytics event. ADR-0002
   * makes this the answer to "which page drives signups", in place of a table.
   */
  source: string;
}

type CaptureStatus = "error" | "idle" | "sent" | "submitting";

const confirmationLine = "Check your email to confirm.";

/** Said before anything is sent, so it names the field rather than the send. */
const invalidEmailMessage = "That doesn't look like an email address.";

/**
 * Every outcome the server can report that is not a success, each naming what
 * happened and what to do about it. None is a stack trace, and none of them
 * mentions the heuristics: `too-fast` reads as a hiccup on purpose.
 */
const failureMessages = {
  failed: "That didn't send. Try again in a moment.",
  "too-fast": "That was quick - give it a moment and try again.",
  unconfigured: "The newsletter is not configured yet.",
} as const satisfies Record<Exclude<SubscribeResult, "sent">, string>;

export function NewsletterCapture({
  className,
  source,
}: NewsletterCaptureProps) {
  const headingId = useId();
  const inputId = useId();
  const statusId = useId();
  const honeypotId = useId();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [failure, setFailure] = useState("");

  /**
   * When the form became available to the reader. Stamped in an effect rather
   * than during render so the prerendered shell and the first client render
   * are identical, and so the clock starts when the browser has the form
   * rather than when the build wrote the page.
   */
  const shownAt = useRef<number | null>(null);

  /** Read at submit time so the honeypot never becomes React state. */
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const address = email.trim();

    // Checked here so an obvious typo costs nothing. The server validates the
    // same shape again, because this check is a courtesy and not a boundary.
    if (!isPlausibleEmail(address)) {
      setStatus("error");
      setFailure(invalidEmailMessage);
      return;
    }

    setStatus("submitting");

    const elapsedMs =
      shownAt.current === null ? 0 : Date.now() - shownAt.current;

    try {
      const result = await subscribeToNewsletter({
        data: {
          elapsedMs,
          email: address,
          [honeypotFieldName]: honeypotRef.current?.value ?? "",
        },
      });

      if (result === "sent") {
        // Fired only on a submission the server accepted, so the count means
        // "someone asked", not "someone clicked".
        track("newsletter-subscribe", { source });
        setStatus("sent");
        return;
      }

      setStatus("error");
      setFailure(failureMessages[result]);
    } catch {
      // A rejected RPC: offline, a cold start that timed out, a 500. The
      // address stays in the field so trying again costs one click.
      setStatus("error");
      setFailure(failureMessages.failed);
    }
  }

  const submitting = status === "submitting";
  const sent = status === "sent";

  return (
    <section
      aria-labelledby={headingId}
      className={cn("max-w-2xl rounded-2xl border p-6 sm:p-8", className)}
    >
      <p
        className="font-mono text-[13px] tracking-[0.18em] text-muted-foreground uppercase"
        id={headingId}
      >
        Newsletter
      </p>
      <p className="mt-3 leading-7 text-muted-foreground">{newsletterPitch}</p>

      <div className="mt-6 min-h-10">
        {sent ? null : (
          <form
            className="flex flex-col gap-3 sm:flex-row"
            /* The address is checked in `handleSubmit`, which can say something
               more useful than a browser bubble and keeps both themes honest. */
            noValidate
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
          >
            <label className="sr-only" htmlFor={inputId}>
              Email address
            </label>
            <Input
              aria-describedby={statusId}
              aria-invalid={status === "error"}
              autoComplete="email"
              className="h-10 flex-1"
              disabled={submitting}
              id={inputId}
              name="email"
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
            {/*
              The honeypot. Off-screen rather than `display: none`, out of the
              tab order, and hidden from the accessibility tree, so no reader
              on any device meets it - and a script filling every named field
              still finds it.
            */}
            <div
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px overflow-hidden"
            >
              <label htmlFor={honeypotId}>Company</label>
              <input
                autoComplete="off"
                defaultValue=""
                id={honeypotId}
                name={honeypotFieldName}
                ref={honeypotRef}
                tabIndex={-1}
                type="text"
              />
            </div>
            <Button className="h-10 px-5" disabled={submitting} type="submit">
              {submitting ? "Sending" : "Subscribe"}
            </Button>
          </form>
        )}
        {/*
          `output` is a live region by definition - implicit `role="status"`
          and an implicit polite announcement - so the error and the
          confirmation both reach a screen reader without an ARIA attribute
          anyone has to remember to keep.
        */}
        <output
          className={cn(
            "block font-mono text-[13px]",
            sent &&
              "newsletter-settle flex min-h-10 items-center text-foreground",
            status === "error" && "mt-3 text-destructive"
          )}
          id={statusId}
        >
          {sent ? (
            <>
              <span
                aria-hidden="true"
                className="mr-2.5 size-1.5 shrink-0 rounded-full bg-signal"
              />
              {confirmationLine}
            </>
          ) : (
            failure
          )}
        </output>
      </div>

      <p className="mt-4 font-mono text-xs text-muted-foreground">
        {newsletterFootnote}
      </p>
    </section>
  );
}
