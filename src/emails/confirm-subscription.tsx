import { Button, Heading, Section, Text } from "react-email";

import { confirmationLifetimeHours } from "../lib/newsletter.ts";
import type { EmailContent } from "./layout.tsx";
import {
  EmailFooter,
  EmailLayout,
  emailStyles,
  renderEmail,
} from "./layout.tsx";

/**
 * The confirm mail. It has exactly one job, so it carries exactly one link.
 *
 * Nothing about the reader exists anywhere yet - ADR-0002 stores nothing
 * between submission and confirmation - which is why the copy says so plainly.
 * Someone who did not ask for this needs to know that ignoring the mail is
 * already the complete answer.
 */

export interface ConfirmSubscriptionProps {
  /** Absolute `/subscribe?token=...` URL carrying the signed Confirmation. */
  confirmUrl: string;
}

const subject = "Confirm your newsletter subscription";
const headline = "One link and you're on the list.";
const ask =
  "Someone asked to subscribe this address to my newsletter. If that was you, confirm it here.";
const dismissal = `If it wasn't you, ignore this email and nothing happens. This address is not on any list until that link is followed. The link expires in ${confirmationLifetimeHours} hours.`;

export function ConfirmSubscriptionEmail({
  confirmUrl,
}: ConfirmSubscriptionProps) {
  return (
    <EmailLayout
      preview="Confirm your subscription and you're done."
      title={subject}
    >
      <Heading style={emailStyles.heading}>{headline}</Heading>
      <Text style={emailStyles.text}>{ask}</Text>
      <Section style={emailStyles.buttonRow}>
        <Button href={confirmUrl} style={emailStyles.button}>
          Confirm subscription
        </Button>
      </Section>
      <Text style={emailStyles.text}>{dismissal}</Text>
      <EmailFooter>Nick Neely · nickneely.dev</EmailFooter>
    </EmailLayout>
  );
}

/**
 * Sample data for `pnpm email`. The token carries the three fields a real one
 * has - base64url address, epoch milliseconds, signature - and says in the
 * signature field that it is not a signature, so nothing here reads as a
 * credential to a human or to a secret scanner.
 */
ConfirmSubscriptionEmail.PreviewProps = {
  confirmUrl:
    "https://nickneely.dev/subscribe?token=cHJldmlld0BleGFtcGxlLmNvbQ.1787000000000.preview-signature-not-real",
} satisfies ConfirmSubscriptionProps;

export default ConfirmSubscriptionEmail;

export async function renderConfirmSubscription(
  props: ConfirmSubscriptionProps
): Promise<EmailContent> {
  const { html, text } = await renderEmail(
    <ConfirmSubscriptionEmail {...props} />
  );

  return { html, subject, text };
}
