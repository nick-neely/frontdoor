/**
 * Browser UI colour per theme. Each value is the hex equivalent of that
 * theme's `--background` token in `src/styles.css` and has to move with it.
 */
const themeColors = { dark: "#0e0b08", light: "#f8f7f3" } as const;
const contactEmail = "contact@nickneely.dev";

export const siteConfig = {
  contactEmail,
  description:
    "Nick Neely is a product-minded software consultant who turns messy business and engineering workflows into maintainable software.",
  icon: {
    manifest: [
      { path: "/brand/frontdoor-app-icon-192.png", sizes: "192x192" },
      { path: "/brand/frontdoor-app-icon-512.png", sizes: "512x512" },
    ],
    paths: {
      dark: "/favicon-dark.png",
      light: "/favicon-light.png",
    },
    type: "image/png",
  },
  language: "en-US",
  /** Canonical off-site destinations used throughout the site. */
  links: {
    contact: `mailto:${contactEmail}`,
    github: "https://github.com/nick-neely",
    linkedin: "https://www.linkedin.com/in/nick-neely/",
    neelySolutions: "https://neelysolutions.com",
    rss: "/rss.xml",
    source: "https://github.com/nick-neely/frontdoor",
    terminal: "https://terminal.nickneely.dev",
    x: "https://x.com/nickneely00",
  },
  locale: "en_US",
  mark: {
    dark: {
      src: "/brand/frontdoor-mark-dark.png",
      src2x: "/brand/frontdoor-mark-dark@2x.png",
    },
    light: {
      src: "/brand/frontdoor-mark-light.png",
      src2x: "/brand/frontdoor-mark-light@2x.png",
    },
  },
  name: "Nick Neely",
  navigation: [
    { href: "/", label: "Home" },
    { href: "/work", label: "Work" },
    { href: "/projects", label: "Projects" },
    { href: "/writing", label: "Writing" },
  ],
  /**
   * The Now Line: what Nick is building, where he consults, and where he
   * lives. It is always rendered, so every field here is required to be true
   * right now rather than aspirational.
   */
  now: {
    building: "tendnote",
    buildingUrl: "https://tendnote.com",
    consulting: "Lean TECHniques",
    location: "Iowa",
  },
  origin: "https://nickneely.dev",
  professionalIdentity: {
    addressCountry: "US",
    addressRegion: "Iowa",
  },
  /** Installed-application name. Keep it short enough to sit under an icon. */
  shortName: "Nick Neely",
  socialImage: {
    alt: "Nick Neely. Maintainable software for messy workflows. Open the front door.",
    height: 630,
    path: "/social-card.png",
    type: "image/png",
    width: 1200,
  },
  tagline: "Maintainable software for messy workflows.",
  /** Browser UI colour before a reader picks a theme. Dark is the default. */
  themeColor: themeColors.dark,
  themeColors,
} as const;
