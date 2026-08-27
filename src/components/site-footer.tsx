import { siteConfig } from "@/lib/site-config.ts";

const footerLinks = [
  { href: siteConfig.links.github, label: "GitHub" },
  { href: siteConfig.links.linkedin, label: "LinkedIn" },
  { href: siteConfig.links.x, label: "X" },
  { href: "/subscribe", label: "Newsletter" },
  { href: siteConfig.links.rss, label: "RSS" },
  {
    href: siteConfig.links.contact,
    label: siteConfig.links.contact.replace(/^mailto:/u, ""),
  },
];

function relFor(href: string): string | undefined {
  return href.startsWith("https://") ? "noreferrer" : undefined;
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-1.5">
          <p className="font-display text-lg font-semibold tracking-tight text-foreground">
            {siteConfig.name}
          </p>
          <p className="text-sm text-muted-foreground">{siteConfig.tagline}</p>
        </div>
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[13px] text-muted-foreground">
          {footerLinks.map((link, index) => (
            <li className="flex items-center gap-3" key={link.href}>
              <a
                className="link-underline hover:text-foreground"
                href={link.href}
                rel={relFor(link.href)}
              >
                {link.label}
              </a>
              {/* Trailing rather than leading, so a wrapped row never starts
                  with an orphaned separator. */}
              {index === footerLinks.length - 1 ? null : (
                <span aria-hidden="true" className="text-border">
                  ·
                </span>
              )}
            </li>
          ))}
        </ul>
        {/* The codename, kept deliberately small: the terminal résumé this
            site replaced still answers on its own domain. */}
        <p className="font-mono text-xs text-muted-foreground">
          <a
            className="link-underline hover:text-foreground"
            href={siteConfig.links.terminal}
            rel="noreferrer"
          >
            the old front door →
          </a>
        </p>
      </div>
    </footer>
  );
}
