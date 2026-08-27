import { describe, expect, it } from "vitest";

import {
  signConfirmation,
  verifyConfirmation,
} from "./newsletter-signing.server.ts";
import { confirmationLifetimeHours } from "./newsletter.ts";

const secret = "test-secret-that-is-at-least-32-characters";
const otherSecret = "another-secret-that-is-also-32-characters!!";
const email = "reader.with.dots+tag@example.com";
const issuedAt = Date.UTC(2026, 7, 25, 12, 0, 0);
const hour = 60 * 60 * 1000;

describe("Confirmation signing", () => {
  it("round-trips an address, dots and plus tag included", () => {
    const token = signConfirmation({ email, issuedAt }, secret);

    expect(verifyConfirmation(token, secret, issuedAt + hour)).toStrictEqual({
      email,
      valid: true,
    });
  });

  it("keeps the address out of plain sight in the link", () => {
    // Not a security property - the signature is - but a confirm link that
    // reads as an address invites forwarding it as if it were one.
    expect(signConfirmation({ email, issuedAt }, secret)).not.toContain(email);
  });

  it("refuses a payload edited to name a different address", () => {
    const token = signConfirmation({ email, issuedAt }, secret);
    const [, timestamp, signature] = token.split(".");
    const forged = [
      Buffer.from("someone.else@example.com", "utf-8").toString("base64url"),
      timestamp,
      signature,
    ].join(".");

    expect(verifyConfirmation(forged, secret, issuedAt)).toStrictEqual({
      reason: "signature",
      valid: false,
    });
  });

  it("refuses a payload edited to reset the clock", () => {
    const token = signConfirmation({ email, issuedAt }, secret);
    const [address, , signature] = token.split(".");
    const forged = [address, String(issuedAt + hour), signature].join(".");

    expect(verifyConfirmation(forged, secret, issuedAt)).toStrictEqual({
      reason: "signature",
      valid: false,
    });
  });

  it("refuses an edited signature", () => {
    const token = signConfirmation({ email, issuedAt }, secret);
    const tampered = `${token.slice(0, -1)}${token.endsWith("A") ? "B" : "A"}`;

    expect(verifyConfirmation(tampered, secret, issuedAt)).toStrictEqual({
      reason: "signature",
      valid: false,
    });
  });

  it("refuses a token signed with a rotated secret", () => {
    // ADR-0002 accepts this: rotation invalidates every link in flight, which
    // is what makes rotation a deliberate act rather than routine hygiene.
    const token = signConfirmation({ email, issuedAt }, otherSecret);

    expect(verifyConfirmation(token, secret, issuedAt)).toStrictEqual({
      reason: "signature",
      valid: false,
    });
  });

  it("accepts a token at the last moment of its lifetime", () => {
    const token = signConfirmation({ email, issuedAt }, secret);
    const deadline = issuedAt + confirmationLifetimeHours * hour;

    expect(verifyConfirmation(token, secret, deadline)).toStrictEqual({
      email,
      valid: true,
    });
  });

  it("refuses a token one millisecond past its lifetime", () => {
    const token = signConfirmation({ email, issuedAt }, secret);
    const past = issuedAt + confirmationLifetimeHours * hour + 1;

    expect(verifyConfirmation(token, secret, past)).toStrictEqual({
      reason: "expired",
      valid: false,
    });
  });

  it("refuses a token dated in the future", () => {
    const token = signConfirmation({ email, issuedAt }, secret);

    expect(verifyConfirmation(token, secret, issuedAt - 1)).toStrictEqual({
      reason: "not-yet-valid",
      valid: false,
    });
  });

  it.each([
    ["empty", ""],
    ["one field", "abc"],
    ["two fields", "abc.123"],
    ["four fields", "abc.123.def.ghi"],
    ["a non-numeric timestamp", "abc.later.def"],
    ["an empty address", ".123.def"],
    ["an empty signature", "abc.123."],
  ])("refuses a token with %s", (_description, token) => {
    expect(verifyConfirmation(token, secret, issuedAt)).toStrictEqual({
      reason: "malformed",
      valid: false,
    });
  });
});
