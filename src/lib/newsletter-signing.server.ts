import { createHmac, timingSafeEqual } from "node:crypto";

import { confirmationLifetimeHours } from "./newsletter.ts";

/**
 * The Confirmation, per `CONTEXT.md` and ADR-0002: the signed proof that a
 * person asked for the newsletter at a specific moment. It travels in the
 * confirm link and is never stored, which is why the signature has to carry
 * everything the confirming request needs - the address it was issued for and
 * the instant it was issued.
 *
 * Nothing here reads the environment. The secret is a parameter so the whole
 * module is testable without credentials, and so the one place that knows
 * where the secret lives stays `newsletter.server.ts`. The `.server` suffix is
 * about `node:crypto`, not about the secret: this module has no business in a
 * browser bundle, and the build denies `**\/*.server.*` to the client graph
 * rather than trusting anyone to remember that.
 */

const confirmationLifetimeMs = confirmationLifetimeHours * 60 * 60 * 1000;

/**
 * `.` cannot appear in base64url or in a run of digits, so it separates the
 * three fields unambiguously even though an email address is full of dots -
 * the address is base64url-encoded before it ever meets the separator.
 */
const separator = ".";

/** Epoch milliseconds, written in decimal, and nothing else. */
const timestampPattern = /^\d+$/u;

export interface Confirmation {
  email: string;
  /** Epoch milliseconds at which the person asked. */
  issuedAt: number;
}

/**
 * Why a token was refused. The reader is told the same thing either way - a
 * link that expired or was already used - because distinguishing a forgery
 * from a stale link out loud only helps the forger.
 */
export type ConfirmationRefusal =
  | "expired"
  | "malformed"
  | "not-yet-valid"
  | "signature";

export type ConfirmationCheck =
  | { email: string; valid: true }
  | { reason: ConfirmationRefusal; valid: false };

function encode(value: string): string {
  return Buffer.from(value, "utf-8").toString("base64url");
}

function sign(payload: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(payload).digest();
}

/**
 * `email.issuedAt.signature`, where the address is base64url and the signature
 * covers the first two fields joined exactly as they appear. Signing the
 * joined string rather than the fields separately is what stops a token from
 * being re-cut into a different address and timestamp with the same signature.
 */
export function signConfirmation(
  confirmation: Confirmation,
  secret: string
): string {
  const payload = `${encode(confirmation.email)}${separator}${confirmation.issuedAt}`;

  return `${payload}${separator}${sign(payload, secret).toString("base64url")}`;
}

/**
 * Verifies a token against the secret and the clock.
 *
 * Structure is checked first because it is free, the signature next because
 * every later field is only trustworthy once it has been proven unedited, and
 * the clock last. A token dated in the future is refused rather than accepted
 * early: signing and verifying happen in the same deployment against the same
 * clock, so a future timestamp means the payload was edited, not that a clock
 * drifted.
 */
export function verifyConfirmation(
  token: string,
  secret: string,
  now: number
): ConfirmationCheck {
  const [encodedEmail, issuedAtText, signature, ...rest] =
    token.split(separator);

  if (
    rest.length > 0 ||
    encodedEmail === undefined ||
    encodedEmail.length === 0 ||
    issuedAtText === undefined ||
    !timestampPattern.test(issuedAtText) ||
    signature === undefined ||
    signature.length === 0
  ) {
    return { reason: "malformed", valid: false };
  }

  const expected = sign(`${encodedEmail}${separator}${issuedAtText}`, secret);
  const offered = Buffer.from(signature, "base64url");

  // `timingSafeEqual` throws on a length mismatch, and an HMAC-SHA256 digest
  // is always 32 bytes, so a different length is already a failed comparison.
  if (
    offered.length !== expected.length ||
    !timingSafeEqual(offered, expected)
  ) {
    return { reason: "signature", valid: false };
  }

  const issuedAt = Number(issuedAtText);

  if (!Number.isSafeInteger(issuedAt)) {
    return { reason: "malformed", valid: false };
  }

  if (issuedAt > now) {
    return { reason: "not-yet-valid", valid: false };
  }

  if (now - issuedAt > confirmationLifetimeMs) {
    return { reason: "expired", valid: false };
  }

  const email = Buffer.from(encodedEmail, "base64url").toString("utf-8");

  // Only reachable through a valid signature, so this is a guard against a
  // token this module itself signed badly rather than against an attacker.
  if (email.length === 0) {
    return { reason: "malformed", valid: false };
  }

  return { email, valid: true };
}
