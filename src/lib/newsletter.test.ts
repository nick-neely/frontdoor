import { describe, expect, it } from "vitest";

import {
  isPlausibleEmail,
  judgeSubmission,
  minimumTimeToSubmitMs,
} from "./newsletter.ts";

describe("submission heuristics", () => {
  it("accepts a submission that waited and left the honeypot alone", () => {
    expect(
      judgeSubmission({
        elapsedMs: minimumTimeToSubmitMs,
        filledHoneypot: false,
      })
    ).toBe("accepted");
  });

  it("traps a filled honeypot however long it took", () => {
    expect(judgeSubmission({ elapsedMs: 60_000, filledHoneypot: true })).toBe(
      "trapped"
    );
  });

  it("prefers the honeypot when both signals fire", () => {
    // The trap answers with success and the clock answers with a retry, so a
    // script that trips both must never be handed the retry to learn from.
    expect(judgeSubmission({ elapsedMs: 0, filledHoneypot: true })).toBe(
      "trapped"
    );
  });

  it("refuses a submission faster than a person types", () => {
    expect(
      judgeSubmission({
        elapsedMs: minimumTimeToSubmitMs - 1,
        filledHoneypot: false,
      })
    ).toBe("too-fast");
  });

  it("refuses a submission whose clock ran backwards", () => {
    expect(judgeSubmission({ elapsedMs: -5000, filledHoneypot: false })).toBe(
      "too-fast"
    );
  });
});

describe("address check", () => {
  it.each(["nick@nickneely.dev", " spaced@example.com "])(
    "accepts %j",
    (value) => {
      expect(isPlausibleEmail(value)).toBeTruthy();
    }
  );

  it.each(["", "nick", "nick@", "@nickneely.dev", "nick @example.com"])(
    "rejects %j",
    (value) => {
      expect(isPlausibleEmail(value)).toBeFalsy();
    }
  );
});
