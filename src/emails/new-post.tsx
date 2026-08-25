import { Heading, Link, Text } from "react-email";

import type { EmailContent } from "./layout.tsx";
import {
  EmailFooter,
  EmailLayout,
  emailStyles,
  renderEmail,
} from "./layout.tsx";

/**
 * The broadcast layout: one Post, one link, nothing else.
 *
 * `{{{RESEND_UNSUBSCRIBE_URL}}}` is Resend's merge tag, substituted per
 * recipient when the broadcast goes out. It is the entire unsubscribe story -
 * ADR-0002 keeps the list at Resend, so this site has no preference centre and
 * no unsubscribe route to point at. The triple braces are Resend's own
 * escaping rule and have to survive rendering verbatim.
 */

/** Substituted by Resend per recipient. Only ever valid inside a broadcast. */
export const unsubscribeMergeTag = "{{{RESEND_UNSUBSCRIBE_URL}}}";

export interface NewPostProps {
  /** The Post's dek, as it reads on the site. */
  description: string;
  /** Mono metadata line: the publication date and the Pillar. */
  meta: string;
  title: string;
  /** Absolute URL of the Post. */
  url: string;
}

export function NewPostEmail({ description, meta, title, url }: NewPostProps) {
  return (
    <EmailLayout preview={description} title={title}>
      <Heading style={emailStyles.heading}>{title}</Heading>
      <Text style={emailStyles.meta}>{meta}</Text>
      <Text style={emailStyles.text}>{description}</Text>
      <Text style={emailStyles.text}>
        <Link href={url} style={emailStyles.link}>
          Read it on nickneely.dev
        </Link>
      </Text>
      <EmailFooter>
        You confirmed a subscription at nickneely.dev.{" "}
        <Link href={unsubscribeMergeTag} style={emailStyles.link}>
          Unsubscribe
        </Link>
        .
      </EmailFooter>
    </EmailLayout>
  );
}

/**
 * Sample data for `pnpm email`, taken verbatim from the one published Post so
 * the preview shows the real measure of a real title and dek.
 */
NewPostEmail.PreviewProps = {
  description:
    "Why I demoted my interactive terminal résumé to a subdomain and rebuilt nickneely.dev as one canonical front door.",
  meta: "August 25, 2026 · Building in Public",
  title: "Building the new front door",
  url: "https://nickneely.dev/writing/building-the-new-front-door",
} satisfies NewPostProps;

export default NewPostEmail;

export async function renderNewPost(
  props: NewPostProps
): Promise<EmailContent> {
  const { html, text } = await renderEmail(<NewPostEmail {...props} />);

  return { html, subject: props.title, text };
}
