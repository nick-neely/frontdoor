import { afterEach, describe, expect, it, vi } from "vitest";

import { resetEnvironmentCache } from "./env.server.ts";
import { readLatestPush } from "./github-activity.server.ts";
import {
  latestPush,
  privateRepoLabel,
  pushMaxAgeDays,
  relativePushLabel,
} from "./github-activity.ts";
import type { GitHubEvent } from "./github-activity.ts";

/*
 * Every event below is fabricated. The rule under test is structural - what
 * `latestPush` is capable of returning - so the fixtures only have to be
 * shaped like GitHub's, not sourced from it.
 */
const secretRepo = "nick-neely/unannounced-thing";
const now = new Date("2026-08-25T12:00:00Z");

function pushEvent(
  createdAt: string,
  repoName: string,
  isPublic: boolean
): GitHubEvent {
  return {
    created_at: createdAt,
    public: isPublic,
    repo: { name: repoName },
    type: "PushEvent",
  };
}

describe(latestPush, () => {
  it("passes a public repository name through unchanged", () => {
    const push = latestPush(
      [pushEvent("2026-08-25T09:00:00Z", "nick-neely/frontdoor", true)],
      now
    );

    expect(push).toStrictEqual({
      pushedAt: "2026-08-25T09:00:00.000Z",
      repoLabel: "nick-neely/frontdoor",
    });
  });

  it("keeps a private repository name out of everything it returns", () => {
    const push = latestPush(
      [pushEvent("2026-08-25T09:00:00Z", secretRepo, false)],
      now
    );

    expect(push?.repoLabel).toBe(privateRepoLabel);
    // The assertion that matters: not "the label is right" but "the name is
    // nowhere in the payload", which is what actually crosses the wire.
    expect(JSON.stringify(push)).not.toContain(secretRepo);
    expect(JSON.stringify(push)).not.toContain("unannounced");
  });

  it("fails closed when the event omits its visibility flag", () => {
    const push = latestPush(
      [
        {
          created_at: "2026-08-25T09:00:00Z",
          repo: { name: secretRepo },
          type: "PushEvent",
        },
      ],
      now
    );

    expect(push?.repoLabel).toBe(privateRepoLabel);
    expect(JSON.stringify(push)).not.toContain(secretRepo);
  });

  it("reads the newest push regardless of the order events arrive in", () => {
    const push = latestPush(
      [
        pushEvent("2026-08-20T09:00:00Z", "nick-neely/older", true),
        pushEvent("2026-08-24T09:00:00Z", "nick-neely/newer", true),
      ],
      now
    );

    expect(push?.repoLabel).toBe("nick-neely/newer");
  });

  it("ignores events that are not pushes", () => {
    const push = latestPush(
      [
        {
          created_at: "2026-08-25T09:00:00Z",
          public: true,
          type: "WatchEvent",
        },
        pushEvent("2026-08-24T09:00:00Z", "nick-neely/frontdoor", true),
      ],
      now
    );

    expect(push?.repoLabel).toBe("nick-neely/frontdoor");
  });

  it("returns nothing when there is no push at all", () => {
    expect(latestPush([], now)).toBeNull();
  });

  it("drops a push that is older than the window", () => {
    const stale = new Date(
      now.getTime() - (pushMaxAgeDays + 1) * 86_400_000
    ).toISOString();

    expect(latestPush([pushEvent(stale, secretRepo, true)], now)).toBeNull();
  });

  it("keeps a push that is inside the window", () => {
    const edge = new Date(
      now.getTime() - (pushMaxAgeDays - 1) * 86_400_000
    ).toISOString();

    expect(
      latestPush([pushEvent(edge, "nick-neely/frontdoor", true)], now)
    ).not.toBeNull();
  });
});

/**
 * The label counts the reader's own calendar days, so the fixtures have to be
 * built from local components rather than from a written-out UTC instant.
 */
function daysBefore(reference: Date, days: number): string {
  const moment = new Date(reference);

  moment.setDate(moment.getDate() - days);

  return moment.toISOString();
}

describe(relativePushLabel, () => {
  it("says today, yesterday, and then counts days", () => {
    expect(relativePushLabel(daysBefore(now, 0), now)).toBe("today");
    expect(relativePushLabel(daysBefore(now, 1), now)).toBe("yesterday");
    expect(relativePushLabel(daysBefore(now, 4), now)).toBe("4 days ago");
  });

  it("does not count a push from later today as a day ago", () => {
    const later = new Date(now.getTime() + 60_000);

    expect(relativePushLabel(later.toISOString(), now)).toBe("today");
  });
});

/*
 * The `fetch` stand-ins below are `async` with a real suspension point on
 * purpose. A stub that answers synchronously would let a mistake in the await
 * chain pass, and the contextual type of `fetch` is a promise regardless.
 */
describe(readLatestPush, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resetEnvironmentCache();
    delete process.env.GITHUB_ACTIVITY_TOKEN;
  });

  it("asks for nothing at all when no token is configured", async () => {
    let calls = 0;

    vi.stubGlobal("fetch", async () => {
      calls += 1;
      await Promise.resolve();

      throw new Error("should not be reached");
    });
    resetEnvironmentCache();
    delete process.env.GITHUB_ACTIVITY_TOKEN;

    await expect(readLatestPush(now)).resolves.toBeNull();
    expect(calls).toBe(0);
  });

  it("treats a malformed token the way it treats a missing one", async () => {
    // What `.env.example` ships. The schema rejects it, and this feature has
    // to degrade to silence rather than throw out of the home page's RPC.
    process.env.GITHUB_ACTIVITY_TOKEN = "";
    resetEnvironmentCache();
    vi.stubGlobal("fetch", async () => {
      await Promise.resolve();

      throw new Error("should not be reached");
    });

    await expect(readLatestPush(now)).resolves.toBeNull();
  });

  it("never lets a private repository name off the server", async () => {
    process.env.GITHUB_ACTIVITY_TOKEN = "fabricated-token";
    resetEnvironmentCache();
    vi.stubGlobal("fetch", async () => {
      await Promise.resolve();

      return Response.json([
        pushEvent("2026-08-25T09:00:00Z", secretRepo, false),
      ]);
    });

    const push = await readLatestPush(now);

    expect(push?.repoLabel).toBe(privateRepoLabel);
    expect(JSON.stringify(push)).not.toContain(secretRepo);
  });

  it("stays quiet when the API refuses", async () => {
    process.env.GITHUB_ACTIVITY_TOKEN = "fabricated-token";
    resetEnvironmentCache();
    vi.stubGlobal("fetch", async () => {
      await Promise.resolve();

      return new Response("rate limited", { status: 403 });
    });

    await expect(readLatestPush(now)).resolves.toBeNull();
  });

  it("stays quiet when the network is gone", async () => {
    process.env.GITHUB_ACTIVITY_TOKEN = "fabricated-token";
    resetEnvironmentCache();
    vi.stubGlobal("fetch", async () => {
      await Promise.resolve();

      throw new Error("offline");
    });

    await expect(readLatestPush(now)).resolves.toBeNull();
  });
});
