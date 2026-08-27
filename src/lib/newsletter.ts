import { z } from "zod";

/**
 * The newsletter as the reader meets it: the words, the address check, and the
 * two quiet heuristics that stand in for a rate-limit store.
 *
 * Everything here is safe in a browser bundle. The signature, the Resend
 * client, and the secret live in `.server` modules that this one never
 * imports, so the capture block can share the copy and the checks with the
 * server functions without dragging any of that across the boundary.
 */

/**
 * How long a confirm link stays good. Long enough to survive a night's sleep
 * or a workday, short enough that a link forwarded or logged somewhere stops
 * being useful quickly. This is the entire expiry mechanism: ADR-0002 stores
 * no pending row, so there is nothing to sweep - only arithmetic on the
 * timestamp inside the signature.
 *
 * It lives here rather than beside the signing code because the confirm mail
 * has to state it out loud, and an email template has no business importing
 * `node:crypto` to read a number.
 */
export const confirmationLifetimeHours = 24;

/** The honest pitch, repeated verbatim wherever the capture block appears. */
export const newsletterPitch =
  "Posts on product engineering, practical AI, and building in public. No tracking - not even opens.";

/** The promise under the form. Both halves of it are literally true. */
export const newsletterFootnote = "Double opt-in. Unsubscribe any time.";

/**
 * The honeypot's field name. It has to read like a field a form would really
 * have, because a bot that fills everything is caught by anything and a bot
 * worth catching is the one reading names. Humans never see it: it is
 * off-screen, out of the tab order, and hidden from the accessibility tree.
 */
export const honeypotFieldName = "company";

/**
 * How long a person plausibly takes to read a one-line pitch, decide, and type
 * an address. A script posting the form takes milliseconds.
 */
export const minimumTimeToSubmitMs = 3000;

/**
 * What the two heuristics concluded.
 *
 * `trapped` is answered with the same success the reader sees, on purpose: a
 * script that learns which of its submissions were rejected learns how to stop
 * being rejected. Neither verdict is security - both are noise reduction in
 * front of an endpoint whose worst case is one unwanted confirm email that
 * nobody clicks, and nothing is written anywhere either way.
 */
export type SubmissionVerdict = "accepted" | "too-fast" | "trapped";

export interface SubmissionSignals {
  /** Milliseconds between the form appearing and the reader submitting it. */
  elapsedMs: number;
  /** Whether the honeypot field came back with anything in it. */
  filledHoneypot: boolean;
}

/** The address the confirm link will be signed for, if there is one. */
export const subscriberEmailSchema = z.email();

/** The client-side check, so an obvious typo never becomes a round trip. */
export function isPlausibleEmail(value: string): boolean {
  return subscriberEmailSchema.safeParse(value.trim()).success;
}

/**
 * Decides what to do with a submission before anything is sent.
 *
 * A pure function on two numbers and a boolean, so the rule is stated once and
 * tested directly rather than inferred from a handler.
 */
export function judgeSubmission(signals: SubmissionSignals): SubmissionVerdict {
  if (signals.filledHoneypot) {
    return "trapped";
  }

  // A negative elapsed time means the client clock moved, which says nothing
  // about the reader. Treat it the way an implausibly fast submission is
  // treated: ask them to try again rather than guess.
  if (signals.elapsedMs < minimumTimeToSubmitMs) {
    return "too-fast";
  }

  return "accepted";
}
