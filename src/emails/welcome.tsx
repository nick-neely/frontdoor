import { Heading, Link, Text } from "react-email";

import { siteConfig } from "../lib/site-config.ts";
import type { EmailContent } from "./layout.tsx";
import {
  EmailFooter,
  EmailLayout,
  emailStyles,
  renderEmail,
} from "./layout.tsx";

/**
 * The welcome mail, sent the moment a Confirmation verifies and the contact
 * exists in Resend. It says what arrives and it stops.
 *
 * No cadence is promised anywhere in it. Publishing here is a deploy, and a
 * schedule nobody can keep is worse than no schedule at all.
 */

const writingUrl = `${siteConfig.origin}/writing`;
const subject = "You're subscribed";
const headline = "You're subscribed.";
const whatArrives =
  "Thanks for confirming. You'll get posts on product engineering, practical AI, and building in public - the same writing that lives on the site, in your inbox when it ships.";
const whatIsNotWatched =
  "No open tracking, no click tracking, no pixel. I have no idea whether you read any of it, which is how I'd want it if I were on the other end.";
const startHere = "Start with what's already there";

export function WelcomeEmail() {
  return (
    <EmailLayout
      preview="Posts on product engineering, practical AI, and building in public."
      title={subject}
    >
      <Heading style={emailStyles.heading}>{headline}</Heading>
      <Text style={emailStyles.text}>{whatArrives}</Text>
      <Text style={emailStyles.text}>{whatIsNotWatched}</Text>
      <Text style={emailStyles.text}>
        <Link href={writingUrl} style={emailStyles.link}>
          {startHere}
        </Link>
      </Text>
      <EmailFooter>Nick Neely · nickneely.dev</EmailFooter>
    </EmailLayout>
  );
}

/** The welcome mail takes no props; `pnpm email` still wants the entry. */
WelcomeEmail.PreviewProps = {};

export default WelcomeEmail;

export async function renderWelcome(): Promise<EmailContent> {
  const { html, text } = await renderEmail(<WelcomeEmail />);

  return { html, subject, text };
}
