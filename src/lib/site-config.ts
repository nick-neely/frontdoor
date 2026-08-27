/**
 * Browser UI colour per theme. Each value is the hex equivalent of that
 * theme's `--background` token in `src/styles.css` and has to move with it.
 */
const themeColors = { dark: "#0e0b08", light: "#f8f7f3" } as const;

export const siteConfig = {
  description:
    "Nick Neely is a product-minded software consultant who turns messy business and engineering workflows into maintainable software.",
  /** SVG favicon. Replace the file, keep the shape. */
  icon: { path: "/mark.svg", type: "image/svg+xml" },
  language: "en-US",
  /** Off-site destinations the footer offers, in the order it lists them. */
  links: {
    contact: "mailto:contact@nickneely.dev",
    github: "https://github.com/nick-neely",
    linkedin: "https://www.linkedin.com/in/nick-neely/",
    rss: "/rss.xml",
    terminal: "https://terminal.nickneely.dev",
    x: "https://x.com/nickneely00",
  },
  locale: "en_US",
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
  /** Installed-application name. Keep it short enough to sit under an icon. */
  shortName: "Nick Neely",
  socialImage: {
    alt: "Nick Neely. Maintainable software for messy workflows.",
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
