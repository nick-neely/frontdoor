import { Link } from "@tanstack/react-router";

import { DoorMark } from "@/components/door-mark.tsx";
import { ThemeToggle } from "@/components/theme-toggle.tsx";
import { siteConfig } from "@/lib/site-config.ts";

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          aria-label={`${siteConfig.name} home`}
          className="inline-flex items-center gap-2.5"
          to="/"
        >
          <DoorMark className="size-6 shrink-0" />
          <span className="hidden font-display text-base font-semibold tracking-tight sm:inline">
            {siteConfig.name}
          </span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <nav aria-label="Primary navigation">
            <ul className="flex items-center gap-4 sm:gap-6">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    // Home would otherwise match every route as a prefix and
                    // leave two rules drawn at once.
                    activeOptions={{ exact: item.href === "/" }}
                    className="link-underline font-mono text-[13px] text-muted-foreground hover:text-foreground data-[status=active]:text-foreground"
                    to={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
