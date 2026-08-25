import { afterEach, describe, expect, it } from "vitest";

import { env, requireEnv, resetEnvironmentCache } from "./env.server.ts";

describe("server environment", () => {
  afterEach(() => {
    resetEnvironmentCache();
    delete process.env.RESEND_API_KEY;
    delete process.env.NEWSLETTER_SIGNING_SECRET;
  });

  it("treats absent variables as absent rather than failing to boot", () => {
    expect(env().RESEND_API_KEY).toBeUndefined();
  });

  it("rejects a malformed value instead of passing it downstream", () => {
    process.env.NEWSLETTER_SIGNING_SECRET = "too-short";

    expect(() => env()).toThrow(/NEWSLETTER_SIGNING_SECRET/u);
  });

  it("names the missing variable when a feature requires one", () => {
    expect(() => requireEnv("RESEND_API_KEY")).toThrow(/RESEND_API_KEY/u);
  });

  it("returns a required variable once it is set", () => {
    process.env.RESEND_API_KEY = "re_test";

    expect(requireEnv("RESEND_API_KEY")).toBe("re_test");
  });
});
