import { newsletterMail } from "../emails/config.ts";
import { renderNewPost } from "../emails/new-post.tsx";
import { absoluteUrl } from "./seo.ts";
import { formatPostDate, pillarLabel, postPath } from "./writing-schema.ts";
import type { WritingFrontmatter } from "./writing-schema.ts";

/**
 * Everything `pnpm broadcast` does apart from the one call to Resend.
 *
 * The split exists so the interesting parts are testable: which Post a slug
 * names, what the payload says, and - most of all - what the payload does not
 * say. `send` and `scheduledAt` are absent from the type and absent from the
 * object, so the shape the script hands to Resend cannot ask it to deliver
 * anything. A typo reaching every Subscriber is not a mistake anyone gets to
 * make twice, so it is made unrepresentable rather than merely avoided.
 */

/**
 * The draft payload, exactly as `resend.broadcasts.create` receives it.
 *
 * Structurally compatible with the SDK's `CreateBroadcastOptions` by design,
 * without importing it: this module is shared code and has no business knowing
 * that a mail vendor exists. The audience is not part of it - that comes from
 * the environment, which only the script reads.
 */
export interface BroadcastDraft {
  from: string;
  html: string;
  /** Internal label in the Resend dashboard. Never seen by a Subscriber. */
  name: string;
  replyTo: string;
  subject: string;
  text: string;
}

/**
 * The Post a slug names, or an error that says which of the two things went
 * wrong.
 *
 * A draft and a typo are the same to a reader and very different to whoever
 * just typed the command, so they get different messages. Nothing here reads
 * the environment or the network, so a wrong slug costs nothing.
 */
export function selectBroadcastPost(
  slug: string,
  entries: readonly WritingFrontmatter[]
): WritingFrontmatter {
  const post = entries.find((entry) => entry.slug === slug);

  if (post === undefined) {
    const known = entries
      .flatMap((entry) => (entry.draft ? [] : [entry.slug]))
      .join(", ");

    throw new Error(
      `No Post with the slug "${slug}". Published slugs: ${known || "none"}.`
    );
  }

  if (post.draft) {
    throw new Error(
      `"${slug}" is still a draft. Publish it before broadcasting it.`
    );
  }

  return post;
}

/** The mono line under the title: when it was published, and its Pillar. */
export function broadcastMeta(post: WritingFrontmatter): string {
  return `${formatPostDate(post.published)} · ${pillarLabel(post)}`;
}

export async function buildBroadcastDraft(
  post: WritingFrontmatter
): Promise<BroadcastDraft> {
  const mail = await renderNewPost({
    description: post.description,
    meta: broadcastMeta(post),
    title: post.title,
    // Always the site's own URL, never the `canonical` a syndicated Post
    // declares: a Subscriber followed a link from here and should land here.
    url: absoluteUrl(postPath(post)),
  });

  return {
    from: newsletterMail.from,
    html: mail.html,
    name: `Post: ${post.title}`,
    replyTo: newsletterMail.replyTo,
    subject: mail.subject,
    text: mail.text,
  };
}
