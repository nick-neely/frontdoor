import { env } from "./env.server.ts";
import { gitHubEventsSchema, latestPush } from "./github-activity.ts";
import type { LatestPush } from "./github-activity.ts";
import { siteConfig } from "./site-config.ts";

/**
 * The server half of the home page's GitHub activity: the token, the request,
 * and the raw events. None of it reaches the browser - the `.server.ts` name
 * is enforced by the build, which denies this module to the client bundle.
 */

/** `https://github.com/nick-neely` is the one place the account name is written. */
const eventsUrl = `https://api.github.com/users/${siteConfig.links.github.replace(/^https:\/\/github\.com\//u, "")}/events`;

/** Long enough for a cold API, short enough that nothing waits on it. */
const requestTimeoutMs = 4000;

/**
 * Reads the account's events, private ones included, and hands back only the
 * sanitized push.
 *
 * `env()` is `createServerOnlyFn`-guarded, so the token cannot be read from a
 * browser bundle even if this body somehow arrived there. Every failure - no
 * token, a malformed one, a network error, a rate limit, an unreadable body -
 * resolves to `null`, because the Now Line is written to be complete without
 * this clause and a broken fetch should read as absence rather than as an
 * error the reader can see.
 */
export async function readLatestPush(now: Date): Promise<LatestPush | null> {
  try {
    // Inside the guard rather than above it: `.env.example` ships
    // `GITHUB_ACTIVITY_TOKEN=` empty, which the schema rejects as malformed.
    // Unset, empty, and broken all mean the same thing to this feature - there
    // is no activity to show - and none of them should turn the home page's
    // one RPC into a 500 on a fresh clone.
    const token = env().GITHUB_ACTIVITY_TOKEN;

    if (token === undefined) {
      return null;
    }

    const response = await fetch(eventsUrl, {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "x-github-api-version": "2022-11-28",
      },
      signal: AbortSignal.timeout(requestTimeoutMs),
    });

    if (!response.ok) {
      return null;
    }

    const events = gitHubEventsSchema.safeParse(await response.json());

    return events.success ? latestPush(events.data, now) : null;
  } catch {
    return null;
  }
}
