import { Resend } from "resend";

import { newsletterMail } from "../emails/config.ts";
import { renderConfirmSubscription } from "../emails/confirm-subscription.tsx";
import { renderWelcome } from "../emails/welcome.tsx";
import { env } from "./env.server.ts";
import {
  signConfirmation,
  verifyConfirmation,
} from "./newsletter-signing.server.ts";
import { absoluteUrl } from "./seo.ts";

/**
 * The whole of the newsletter's contact with the outside world: the Resend
 * client, the credentials, and the two operations the server functions call.
 *
 * The Resend SDK is imported here and nowhere else, and the `.server` suffix
 * is denied to the client graph by the build, so there is no arrangement of
 * imports that puts an API key or a mail-sending client in a browser bundle.
 *
 * Everything returns an outcome rather than throwing. A missing credential is
 * an operator's problem and a failed API call is Resend's, and neither is
 * something a reader who typed their address should meet as a stack trace.
 */

/** Where the confirm link lands. The page doubles as the confirm landing. */
const subscribePath = "/subscribe";

/** What the subscribe server function needs to know about a submission. */
export type NewsletterDelivery = "failed" | "sent" | "unconfigured";

/** What the confirm server function needs to know about a token. */
export type ConfirmationOutcome =
  | "failed"
  | "invalid"
  | "subscribed"
  | "unconfigured";

interface NewsletterCredentials {
  apiKey: string;
  /** Resend holds the list. This site holds nothing about who is on it. */
  audienceId: string;
  signingSecret: string;
}

/**
 * All three or none.
 *
 * Signing a confirm link that no audience can accept would produce a mail
 * whose only link dead-ends, which is worse than saying the feature is not
 * configured. `.env.example` ships all three empty, so a fresh clone lands
 * here and the reader is told the truth.
 */
function credentials(): NewsletterCredentials | null {
  try {
    const {
      NEWSLETTER_SIGNING_SECRET: signingSecret,
      RESEND_API_KEY: apiKey,
      RESEND_AUDIENCE_ID: audienceId,
    } = env();

    if (
      apiKey === undefined ||
      audienceId === undefined ||
      signingSecret === undefined
    ) {
      return null;
    }

    return { apiKey, audienceId, signingSecret };
  } catch {
    // `env()` throws on a malformed value, and `.env.example` ships all three
    // of these as empty strings - which the schema rejects rather than reads
    // as absent. `github-activity.server.ts` meets the same wall for the same
    // reason. Unset, empty, and unusable are one situation to a reader who
    // just typed their address, and "not configured yet" is the true thing to
    // say about all three.
    return null;
  }
}

/**
 * The confirm link.
 *
 * `URLSearchParams` leaves base64url's alphabet and the `.` separator alone,
 * so the token that arrives back is byte-for-byte the token that was signed.
 */
export function confirmUrlFor(token: string): string {
  const url = new URL(absoluteUrl(subscribePath));

  url.searchParams.set("token", token);

  return url.toString();
}

/**
 * Sends the confirm mail, and nothing else happens anywhere.
 *
 * Per ADR-0002 this writes no row, creates no contact, and leaves no trace
 * outside the message itself: the signature in the link is the only record
 * that the request was made, and it expires on its own.
 */
export async function sendConfirmationEmail(
  email: string,
  now: number
): Promise<NewsletterDelivery> {
  const config = credentials();

  if (config === null) {
    return "unconfigured";
  }

  const token = signConfirmation(
    { email, issuedAt: now },
    config.signingSecret
  );
  const mail = await renderConfirmSubscription({
    confirmUrl: confirmUrlFor(token),
  });

  try {
    const { error } = await new Resend(config.apiKey).emails.send({
      from: newsletterMail.from,
      html: mail.html,
      replyTo: newsletterMail.replyTo,
      subject: mail.subject,
      text: mail.text,
      to: email,
    });

    return error === null ? "sent" : "failed";
  } catch {
    // Network, timeout, or a malformed response. The reader is told to try
    // again, which is the only useful thing anyone can do about it.
    return "failed";
  }
}

/**
 * Turns a verified Confirmation into a Subscriber.
 *
 * This is the only place in the application that creates a contact, and it is
 * reachable only past a valid signature. An unverified token returns `invalid`
 * before the Resend client is even constructed.
 *
 * The welcome mail is sent after the contact exists and its outcome is
 * deliberately not consulted: once Resend holds the address the person is a
 * Subscriber, and telling them otherwise because a second API call failed
 * would be a lie that also invites them to subscribe twice.
 */
export async function confirmSubscriber(
  token: string,
  now: number
): Promise<ConfirmationOutcome> {
  const config = credentials();

  if (config === null) {
    return "unconfigured";
  }

  const check = verifyConfirmation(token, config.signingSecret, now);

  if (!check.valid) {
    return "invalid";
  }

  const resend = new Resend(config.apiKey);

  try {
    const { error } = await resend.contacts.create({
      // Resend now calls audiences segments and marks this deprecated. The
      // value in `RESEND_AUDIENCE_ID` is an audience id, so it is passed as
      // one; moving to `segments` is a change to make against a real account,
      // not a rename to guess at.
      // oxlint-disable-next-line typescript/no-deprecated
      audienceId: config.audienceId,
      email: check.email,
      unsubscribed: false,
    });

    if (error !== null) {
      return "failed";
    }
  } catch {
    return "failed";
  }

  const mail = await renderWelcome();

  // Past this point the person is a Subscriber whatever happens, so the
  // welcome mail is allowed to fail quietly rather than take the confirmation
  // down with it.
  await resend.emails
    .send({
      from: newsletterMail.from,
      html: mail.html,
      replyTo: newsletterMail.replyTo,
      subject: mail.subject,
      text: mail.text,
      to: check.email,
    })
    .catch(() => null);

  return "subscribed";
}
