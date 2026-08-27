import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  confirmSubscriber,
  sendConfirmationEmail,
} from "./newsletter.server.ts";
import {
  honeypotFieldName,
  judgeSubmission,
  subscriberEmailSchema,
} from "./newsletter.ts";

/**
 * The two RPC endpoints the newsletter needs, and the whole boundary between
 * the capture block and Resend.
 *
 * `newsletter.server.ts` is imported at the top of this module, which is safe
 * for the same reason `src/routes/index.tsx` can import
 * `github-activity.server.ts`: TanStack Start compiles the handler bodies out
 * of the client build and the imports they alone used go with them. The
 * `.server` suffix is the backstop - the build refuses to put such a module in
 * the client graph at all - so the Resend SDK, the API key, and the signing
 * secret cannot reach a browser however this file is edited.
 *
 * Both functions answer with an outcome rather than an exception. The capture
 * block turns each one into a sentence a reader can act on, which is the only
 * thing a failed subscribe should ever produce.
 */

const subscribeSchema = z.object({
  /**
   * Milliseconds between the form appearing and the reader submitting it. The
   * client is the only thing that can measure this and the client is not
   * trusted, which is fine: the check is noise reduction, not security.
   */
  elapsedMs: z.number(),
  email: subscriberEmailSchema,
  /** The honeypot. Empty from a human, filled by something reading names. */
  [honeypotFieldName]: z.string(),
});

const confirmSchema = z.object({ token: z.string().min(1) });

/**
 * What the reader is told happened.
 *
 * `sent` covers the honeypot too. A script that learns which submissions were
 * refused learns how to stop being refused, so the trap answers exactly as a
 * success does - and, per ADR-0002, a real success also writes nothing
 * anywhere, so the two are genuinely indistinguishable from outside.
 */
export type SubscribeResult = "failed" | "sent" | "too-fast" | "unconfigured";

export type ConfirmResult =
  | "failed"
  | "invalid"
  | "subscribed"
  | "unconfigured";

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .validator(subscribeSchema)
  .handler(async ({ data }): Promise<SubscribeResult> => {
    const verdict = judgeSubmission({
      elapsedMs: data.elapsedMs,
      filledHoneypot: data[honeypotFieldName].length > 0,
    });

    // Both heuristics are answered before any credential is read, so a script
    // cannot use a misconfigured deployment to tell the two apart either.
    if (verdict === "trapped") {
      return "sent";
    }

    if (verdict === "too-fast") {
      return "too-fast";
    }

    return await sendConfirmationEmail(data.email, Date.now());
  });

export const confirmNewsletterSubscription = createServerFn({ method: "POST" })
  .validator(confirmSchema)
  .handler(
    async ({ data }): Promise<ConfirmResult> =>
      await confirmSubscriber(data.token, Date.now())
  );
