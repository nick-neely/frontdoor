/**
 * Everything the newsletter's mail shares: who it comes from, who a reply
 * reaches, and the palette it is drawn in.
 *
 * The From and Reply-To pair is ADR-0003's whole point and is written once
 * here, so the confirm mail, the welcome mail, and `pnpm broadcast` cannot
 * drift apart or accidentally send as an address Resend has not verified.
 */
export const newsletterMail = {
  /** `send.nickneely.dev` is the domain verified in Resend. See ADR-0003. */
  from: "Nick Neely <hello@send.nickneely.dev>",
  /**
   * Cloudflare Email Routing forwards this one. A reply to the newsletter
   * should reach a person, not a sending domain nobody reads.
   */
  replyTo: "contact@nickneely.dev",
} as const;

/**
 * The light theme's tokens, resolved to hex.
 *
 * Mail clients cannot read `src/styles.css`, and half of them would ignore a
 * `prefers-color-scheme` block anyway, so the newsletter commits to the warm
 * light theme rather than shipping two palettes and hoping. Every value here
 * is the hex rendering of the matching `:root` token, so moving a token means
 * moving its twin.
 */
export const emailPalette = {
  /** `--background`: warm off-white, never pure white. */
  background: "#f8f7f3",
  /** `--border`. */
  border: "#dfdcd6",
  /** `--foreground`: warm near-black. */
  foreground: "#18130e",
  /** `--muted-foreground`, for metadata and the footer. */
  muted: "#645c53",
  /**
   * The brand amber exactly, as it appears in the site mark. Used as a
   * background under `foreground` text, where it is a graphic rather than a
   * text colour and needs no contrast correction.
   */
  signal: "#f5a524",
  /**
   * `--signal` as the light theme renders it: the brand amber darkened to
   * 4.6:1 on `background`, which is what a link drawn in amber has to clear.
   */
  signalText: "#a85e06",
} as const;

export const emailFonts = {
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
} as const;
