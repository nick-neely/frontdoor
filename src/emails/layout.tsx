import { render } from "@react-email/render";
import type { ReactElement, ReactNode } from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";

import { emailFonts, emailPalette } from "./config.ts";

/**
 * The shell every newsletter mail is drawn in, and the styles its blocks share.
 *
 * The markup comes from React Email's primitives rather than raw elements.
 * They exist to paper over what mail clients do to ordinary HTML - Outlook's
 * word-processor engine most of all - and hand-rolling around that is a bet
 * against clients nobody here can test in.
 *
 * What stays hand-made is the restraint: no images, no remote stylesheets, and
 * no tracking pixel of any kind. ADR-0003 disables open and click tracking, so
 * there is nothing to embed and no URL to rewrite, and `PRODUCT.md` is blunt
 * about why.
 *
 * This file exports no default component on purpose: `pnpm email` treats a
 * `.tsx` file with a default export as a template to preview, and a layout is
 * not a template.
 */

/** What a template hands to Resend: nothing more, nothing less. */
export interface EmailContent {
  html: string;
  subject: string;
  /**
   * The plain-text alternative, generated from the same tree as the HTML so
   * the two cannot drift. Some clients prefer it and some readers insist on it.
   */
  text: string;
}

/**
 * The light theme, resolved to inline styles.
 *
 * Every value comes from `emailPalette`, which is the hex rendering of the
 * `:root` tokens in `src/styles.css`. Components never name a colour directly.
 */
export const emailStyles = {
  body: {
    backgroundColor: emailPalette.background,
    color: emailPalette.foreground,
    fontFamily: emailFonts.sans,
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "0",
    padding: "32px 20px",
  },
  /**
   * The one amber moment in a mail. Amber is a background here rather than a
   * text colour, so the brand hex is used exactly as the site mark uses it and
   * the label rides on it in the same near-black the body is set in.
   */
  button: {
    backgroundColor: emailPalette.signal,
    borderRadius: "10px",
    boxSizing: "border-box",
    color: emailPalette.foreground,
    display: "inline-block",
    fontSize: "15px",
    fontWeight: "600",
    padding: "12px 22px",
    textDecoration: "none",
  },
  /** The row a `Button` sits in. Padding on the table, because Outlook drops
   * a margin on an inline-block anchor and the button would then touch the
   * paragraph beneath it. */
  buttonRow: { paddingBottom: "20px" },
  container: { margin: "0 auto", maxWidth: "560px" },
  footer: {
    color: emailPalette.muted,
    fontFamily: emailFonts.mono,
    fontSize: "12px",
    lineHeight: "1.7",
    margin: "0",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "600",
    letterSpacing: "-0.02em",
    lineHeight: "1.25",
    margin: "0 0 16px",
  },
  hr: { borderColor: emailPalette.border, margin: "32px 0 20px" },
  link: { color: emailPalette.signalText, textDecoration: "underline" },
  /** Mono, muted, and small: dates, Pillars, and the like. */
  meta: {
    color: emailPalette.muted,
    fontFamily: emailFonts.mono,
    fontSize: "13px",
    margin: "0 0 20px",
  },
  text: { margin: "0 0 20px" },
} as const;

interface EmailLayoutProps {
  children: ReactNode;
  /** The inbox preview line. Short enough not to be truncated mid-word. */
  preview: string;
  /** The `<title>`, which some clients show when a mail is opened alone. */
  title: string;
}

export function EmailLayout({ children, preview, title }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <title>{title}</title>
      </Head>
      <Body style={emailStyles.body}>
        <Preview>{preview}</Preview>
        <Container style={emailStyles.container}>{children}</Container>
      </Body>
    </Html>
  );
}

/** The rule and mono block that closes every mail. */
export function EmailFooter({ children }: { children: ReactNode }) {
  return (
    <Section>
      <Hr style={emailStyles.hr} />
      <Text style={emailStyles.footer}>{children}</Text>
    </Section>
  );
}

/**
 * Renders a template to the two bodies Resend is given.
 *
 * Both come from the same element, so the text alternative is a view of the
 * HTML rather than a second copy of the copy that someone has to remember to
 * edit twice.
 */
export async function renderEmail(
  email: ReactElement
): Promise<{ html: string; text: string }> {
  const [html, text] = await Promise.all([
    render(email),
    render(email, { plainText: true }),
  ]);

  return { html, text };
}
