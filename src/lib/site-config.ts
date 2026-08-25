export const siteConfig = {
  description:
    "Nick Neely is a product-minded software consultant who turns messy business and engineering workflows into maintainable software.",
  /** Header logo and SVG favicon. Replace the file, keep the shape. */
  icon: { path: "/mark.svg", type: "image/svg+xml" },
  language: "en-US",
  locale: "en_US",
  name: "Nick Neely",
  navigation: [
    { href: "/", label: "Home" },
    { href: "/work", label: "Work" },
    { href: "/projects", label: "Projects" },
    { href: "/writing", label: "Writing" },
  ],
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
  /** Browser UI colour. Match the `--background` token in `src/styles.css`. */
  themeColor: "#f7f9f9",
} as const;
