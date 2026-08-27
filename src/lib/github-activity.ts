import { z } from "zod";

/**
 * The GitHub activity appended to the home page's Now Line.
 *
 * The single hard rule here is that a private repository name must never leave
 * the server. It is enforced at the source rather than at the rendering
 * surface: `latestPush` is the only thing that ever looks at a raw event, and
 * the shape it returns has no field a repository name could hide in unless the
 * event said it was public. Everything downstream - the server function, the
 * component, the serialized RPC response - can only ever see the sanitized
 * payload.
 */

/** What a repository is called when the push that touched it was private. */
export const privateRepoLabel = "a private repo";

/**
 * How stale a push may be and still be worth showing. Past this the line reads
 * as neglect rather than momentum, so the whole clause is dropped.
 */
export const pushMaxAgeDays = 14;

const dayInMs = 86_400_000;

/**
 * Only the fields the sanitizer reads. Everything else GitHub sends - actor,
 * payload, commit messages, branch names - is dropped by parsing rather than
 * by remembering not to use it.
 *
 * `public` is optional and treated as private when absent, so an API that
 * stops sending the flag fails closed.
 */
const gitHubEventSchema = z.object({
  created_at: z.string().min(1),
  public: z.boolean().optional(),
  repo: z.object({ name: z.string().min(1) }).optional(),
  type: z.string(),
});

export const gitHubEventsSchema = z.array(gitHubEventSchema);

export type GitHubEvent = z.infer<typeof gitHubEventSchema>;

/** The only shape that crosses the server boundary. */
export interface LatestPush {
  /** ISO 8601 instant of the push. */
  pushedAt: string;
  /** `owner/name` when the push was public, `privateRepoLabel` otherwise. */
  repoLabel: string;
}

/**
 * The most recent push worth rendering, or `null` when there is none.
 *
 * Returns `null` rather than a stale entry when the newest push is older than
 * `pushMaxAgeDays`, so the caller has nothing to hide and the Now Line has no
 * gap to reserve.
 */
export function latestPush(
  events: readonly GitHubEvent[],
  now: Date
): LatestPush | null {
  const newest = events
    .filter((event) => event.type === "PushEvent")
    .toSorted((left, right) => right.created_at.localeCompare(left.created_at))
    .at(0);

  if (newest === undefined) {
    return null;
  }

  const pushedAt = new Date(newest.created_at);
  const age = now.getTime() - pushedAt.getTime();

  if (Number.isNaN(age) || age > pushMaxAgeDays * dayInMs) {
    return null;
  }

  return {
    pushedAt: pushedAt.toISOString(),
    // The name is read only on the branch that has already proven the event
    // public. There is no other path to it.
    repoLabel:
      newest.public === true && newest.repo !== undefined
        ? newest.repo.name
        : privateRepoLabel,
  };
}

/**
 * Midnight of the reader's own day, so "yesterday" means the previous calendar
 * day rather than a rolling 24 hours.
 */
function startOfDay(moment: Date): number {
  return Date.UTC(moment.getFullYear(), moment.getMonth(), moment.getDate());
}

/**
 * How long ago the push was, in whole days, phrased the way a person would say
 * it. Deliberately coarse: a line that says "3 hours ago" is a clock, and a
 * clock has to keep ticking to stay true.
 */
export function relativePushLabel(pushedAt: string, now: Date): string {
  const days = Math.round(
    (startOfDay(now) - startOfDay(new Date(pushedAt))) / dayInMs
  );

  if (days <= 0) {
    return "today";
  }

  if (days === 1) {
    return "yesterday";
  }

  return `${days} days ago`;
}
