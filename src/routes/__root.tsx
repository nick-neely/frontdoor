import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  createRootRoute,
  HeadContent,
  Link,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Analytics } from "@vercel/analytics/react";

import { ErrorFallback } from "@/components/error-fallback.tsx";
import { SiteFooter } from "@/components/site-footer.tsx";
import { SiteHeader } from "@/components/site-header.tsx";
import { siteConfig } from "@/lib/site-config.ts";
import { themeScript } from "@/lib/theme.ts";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  errorComponent: RootErrorComponent,
  head: () => ({
    links: [
      { href: appCss, rel: "stylesheet" },
      { href: "/manifest.json", rel: "manifest" },
      { href: "/favicon.ico", rel: "icon", sizes: "32x32" },
      { href: siteConfig.icon.path, rel: "icon", type: siteConfig.icon.type },
    ],
    meta: [
      { charSet: "utf-8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { content: siteConfig.themeColor, name: "theme-color" },
      { content: siteConfig.name, name: "application-name" },
      { content: siteConfig.name, property: "og:site_name" },
      { content: siteConfig.locale, property: "og:locale" },
    ],
  }),
  notFoundComponent: () => (
    <main
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start gap-6 px-5 py-24 sm:px-8"
      id="main-content"
    >
      <p className="font-mono text-[13px] tracking-[0.18em] text-muted-foreground uppercase">
        404
      </p>
      <h1 className="font-display text-5xl font-semibold tracking-[-0.035em] sm:text-6xl">
        Wrong door.
      </h1>
      <p className="max-w-xl text-lg leading-8 text-muted-foreground">
        That page does not exist here.
      </p>
      <Link
        className="link-underline link-underline-resting font-mono text-[13px] text-foreground"
        to="/"
      >
        Back through the front door
      </Link>
    </main>
  ),
  shellComponent: RootDocument,
});

function RootErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <ErrorFallback
      error={error}
      onRetry={() => {
        void router.invalidate();
      }}
      showDetails={import.meta.env.DEV}
    />
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // The server renders the dark default; `themeScript` swaps the class before
    // first paint for a reader who chose light, which React cannot match.
    <html className="dark" lang={siteConfig.language} suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          // A blocking inline script is the only way to set the theme before
          // first paint, and `themeScript` is a build-time constant with no
          // reader input in it.
          // oxlint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body>
        <a
          className="sr-only fixed top-3 left-3 z-50 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground focus:not-sr-only"
          href="#main-content"
        >
          Skip to content
        </a>
        <div className="flex min-h-svh flex-col">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
        {import.meta.env.DEV ? (
          <TanStackDevtools
            config={{ position: "bottom-right", triggerMode: "fixed" }}
            plugins={[
              {
                name: "TanStack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        ) : null}
        <Analytics />
        <Scripts />
      </body>
    </html>
  );
}
