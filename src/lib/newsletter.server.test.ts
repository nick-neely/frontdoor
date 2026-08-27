import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { resetEnvironmentCache } from "./env.server.ts";
import { signConfirmation } from "./newsletter-signing.server.ts";
import {
  confirmSubscriber,
  confirmUrlFor,
  sendConfirmationEmail,
} from "./newsletter.server.ts";

/**
 * These tests never reach Resend, and the ones that would are the point: a
 * submission that has not been confirmed, and a Confirmation that does not
 * verify, both stop before any client is constructed. The assertions are on
 * where the code returns, which is the only place ADR-0002's "nothing is
 * stored" can be broken.
 */

const secret = "test-secret-that-is-at-least-32-characters";
const email = "reader@example.com";
const issuedAt = Date.UTC(2026, 7, 25, 12, 0, 0);

function configure(): void {
  process.env.RESEND_API_KEY = "re_test_key_that_is_never_called";
  process.env.RESEND_AUDIENCE_ID = "00000000-0000-0000-0000-000000000000";
  process.env.NEWSLETTER_SIGNING_SECRET = secret;
  resetEnvironmentCache();
}

describe("the newsletter's contact with Resend", () => {
  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_AUDIENCE_ID;
    delete process.env.NEWSLETTER_SIGNING_SECRET;
    resetEnvironmentCache();
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_AUDIENCE_ID;
    delete process.env.NEWSLETTER_SIGNING_SECRET;
    resetEnvironmentCache();
  });

  it("sends nothing when the newsletter is not configured", async () => {
    await expect(sendConfirmationEmail(email, issuedAt)).resolves.toBe(
      "unconfigured"
    );
  });

  it("creates nothing when the newsletter is not configured", async () => {
    const token = signConfirmation({ email, issuedAt }, secret);

    await expect(confirmSubscriber(token, issuedAt)).resolves.toBe(
      "unconfigured"
    );
  });

  it("refuses one credential short of the set", async () => {
    // A confirm link signed against a secret that no audience can accept would
    // dead-end. Better to say the feature is not configured.
    process.env.RESEND_API_KEY = "re_test_key_that_is_never_called";
    process.env.NEWSLETTER_SIGNING_SECRET = secret;
    resetEnvironmentCache();

    await expect(sendConfirmationEmail(email, issuedAt)).resolves.toBe(
      "unconfigured"
    );
  });

  it("reads an empty credential as absent rather than as a crash", async () => {
    // `.env.example` ships all three empty, and the environment schema rejects
    // an empty string as malformed. A fresh clone must still get a sentence.
    process.env.RESEND_API_KEY = "";
    process.env.RESEND_AUDIENCE_ID = "";
    process.env.NEWSLETTER_SIGNING_SECRET = "";
    resetEnvironmentCache();

    await expect(sendConfirmationEmail(email, issuedAt)).resolves.toBe(
      "unconfigured"
    );
  });

  it("stops on an unverified Confirmation before Resend is involved", async () => {
    // The API key here is not real, so anything that reached Resend would come
    // back `failed`. `invalid` is proof that the contact-creation call is
    // downstream of the signature check and was never made.
    configure();
    const token = signConfirmation({ email, issuedAt }, secret);
    const tampered = `${token.slice(0, -1)}${token.endsWith("A") ? "B" : "A"}`;

    await expect(confirmSubscriber(tampered, issuedAt)).resolves.toBe(
      "invalid"
    );
  });

  it("stops on an expired Confirmation before Resend is involved", async () => {
    configure();
    const token = signConfirmation({ email, issuedAt }, secret);
    const week = 7 * 24 * 60 * 60 * 1000;

    await expect(confirmSubscriber(token, issuedAt + week)).resolves.toBe(
      "invalid"
    );
  });
});

describe("the confirm link", () => {
  it("carries the token back byte for byte", () => {
    // base64url and the `.` separator all survive URL encoding, which is the
    // whole reason the address is encoded before it meets the separator.
    const token = signConfirmation({ email, issuedAt }, secret);
    const returned = new URL(confirmUrlFor(token)).searchParams.get("token");

    expect(returned).toBe(token);
  });

  it("lands on the page that doubles as the confirm landing", () => {
    const url = new URL(confirmUrlFor("anything"));

    expect(url.pathname).toBe("/subscribe");
    expect(url.origin).toBe("https://nickneely.dev");
  });
});
