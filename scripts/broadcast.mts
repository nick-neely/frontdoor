import { Resend } from "resend";

import { requireEnv } from "../src/lib/env.server.ts";
import {
  buildBroadcastDraft,
  selectBroadcastPost,
} from "../src/lib/newsletter-broadcast.ts";
import { readWriting } from "../src/lib/writing-source.ts";

/**
 * `pnpm broadcast <slug>` - renders a Post into a draft broadcast in Resend.
 *
 * It never sends. There is no flag for it, no `--send`, no confirmation
 * prompt: the payload `buildBroadcastDraft` produces has no `send` field and
 * no `scheduledAt` field, and this file calls nothing else. Pressing send is a
 * deliberate act in the Resend dashboard, by a person who has read the draft.
 * Automating that is how a typo reaches every Subscriber permanently.
 *
 * `requireEnv` is the right failure here rather than the graceful degradation
 * the server functions use: the operator is standing at a terminal, and being
 * told which variable is missing is exactly what they need. Every failure is
 * printed as one line, because a stack trace from a command someone just typed
 * is news about this file rather than about their problem.
 */

function fail(message: string): never {
  process.stderr.write(`${message}\n`);

  return process.exit(1);
}

async function main(): Promise<void> {
  /** The first argument after the runtime and this file. */
  const [slug] = process.argv.slice(2);

  if (slug === undefined || slug.length === 0) {
    fail("Usage: pnpm broadcast <slug>");
  }

  const draft = await buildBroadcastDraft(
    selectBroadcastPost(slug, readWriting())
  );
  const resend = new Resend(requireEnv("RESEND_API_KEY"));

  const { data, error } = await resend.broadcasts.create({
    ...draft,
    // Resend now calls audiences segments and marks `audienceId` deprecated.
    // The value in `RESEND_AUDIENCE_ID` is an audience id, so it is passed as
    // one; moving to `segmentId` is a change to make against a real account.
    // oxlint-disable-next-line typescript/no-deprecated
    audienceId: requireEnv("RESEND_AUDIENCE_ID"),
  });

  if (error !== null) {
    fail(`Resend refused the draft: ${error.message}`);
  }

  process.stdout.write(
    [
      `Draft created: ${data?.id ?? "(no id returned)"}`,
      `Subject: ${draft.subject}`,
      "",
      "Nothing has been sent. Open the broadcast in the Resend dashboard,",
      "read it, and send it from there.",
      "",
    ].join("\n")
  );
}

try {
  await main();
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
