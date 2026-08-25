# nickneely.dev

The personal site of Nick Neely: consulting, shipped projects, and writing on product engineering, practical AI-assisted development, and building in public.

Live at [nickneely.dev](https://nickneely.dev).

## Stack

- TanStack Start and React 19
- Nitro production output, deployed on Vercel with DNS at Cloudflare
- Tailwind CSS 4, shadcn/ui on Base UI
- MDX writing indexed by content-collections
- Resend for the newsletter, with no subscriber state stored here
- TypeScript, Vitest, and Ultracite with type-aware Oxlint and Oxfmt

## Develop

Requirements: Node.js 24 and pnpm 12.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Copy `.env.example` to `.env` when working on the newsletter or the home page's activity line; every variable is optional until the feature that needs it runs.

## Commands

```bash
pnpm content    # Rebuild the typed writing index (also runs on install, and inside check, dev, and build)
pnpm dev        # Start the development server
pnpm fix        # Apply safe Oxlint and Oxfmt fixes
pnpm check      # Check lint, formatting, and type-aware rules
pnpm typecheck  # Run TypeScript without emitting files
pnpm test       # Run the Vitest suite once
pnpm build      # Build the Nitro production output and prerender public routes
pnpm seo:verify # Inspect built metadata, schema, sitemap, robots, and SSR headings
pnpm start      # Run an existing production build locally
pnpm validate   # Run every CI and pre-push gate
```

## Project shape

- `content/writing` holds authored MDX. Frontmatter is the source of truth for a Post's slug, Pillar, and publication date.
- `content-collections.ts` builds the typed frontmatter index into `.content-collections/generated`. Post bodies stay out of it; see `docs/adr/0001-mdx-compiled-as-modules.md`.
- `src/lib/writing-schema.ts` holds the frontmatter contract and everything derived from it. `src/lib/writing.ts` is what pages read; `src/lib/writing-source.ts` is what the build reads. They share the schema and are asserted to agree.
- `src/routes` owns file-based routes and route-level metadata.
- `src/lib/site-config.ts` is the single seam for public identity and canonical origin.
- `src/lib/seo.ts` builds page metadata and JSON-LD from that config.
- `src/lib/site-files.ts` generates `robots.txt` and `manifest.json`, so nothing under `public/` restates identity.
- `src/lib/public-routes.ts` classifies every route as `public` or `private` and expands `/writing/$slug` into real paths. It is the prerender and sitemap inventory, checked against the generated route tree at compile time.
- `src/lib/rss.ts` and `src/lib/og-image.ts` produce `/rss.xml` and one social card per Post; `vite.config.ts` emits both into the build output and serves them in development.
- `src/lib/updates.ts` merges Posts and Project milestones into the one Update feed the home page renders.
- `src/lib/github-activity.ts` sanitizes GitHub events into the label the home page may show; `src/lib/github-activity.server.ts` does the authenticated read. A private repository name never leaves the second file.
- `src/lib/env.server.ts` validates server environment variables and never reaches the client bundle.
- `src/start.ts` registers global request middleware; `src/server.ts` is the server entry.
- `scripts/verify-seo-output.mjs` verifies rendered production artifacts rather than trusting configuration.
- `tools/oxlint/anti-slop` is vendored lint plug-in source from [`dmmulroy/anti-slop`](https://github.com/dmmulroy/anti-slop).

TanStack Router generates `src/routeTree.gen.ts`. Do not edit it by hand.

## Working here

- `CONTEXT.md` is the glossary. It is opinionated about which word to use.
- `DESIGN.md` holds the visual direction and the motion doctrine.
- `PRODUCT.md` holds product truth, including which claims are established and which must never be invented.
- `docs/adr/` records decisions that would otherwise look arbitrary later.
- `AGENTS.md` is the entry point for coding agents.

## Deployment

Nitro builds a Vercel-ready output with no build command or `vercel.json` needed. `pnpm validate` runs before the first deployment and after any change to public route metadata.

## License

Original code is available under the [MIT License](LICENSE). Site content, writing, and brand assets are not. Vendored source remains under the upstream licenses recorded in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
