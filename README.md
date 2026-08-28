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

Requirements: Node.js 24 and pnpm 11.24.0.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Copy `.env.example` to `.env` when working on the newsletter or the home page's activity line; every variable is optional until the feature that needs it runs.

## Commands

```bash
pnpm content    # Rebuild the typed content indexes (runs on install, check, dev, and build)
pnpm dev        # Start the development server
pnpm email      # Preview the newsletter templates at http://localhost:3001
pnpm broadcast  # Draft a broadcast in Resend from a Post slug; it never sends
pnpm fix        # Apply safe Oxlint and Oxfmt fixes
pnpm check      # Check lint, formatting, and type-aware rules
pnpm typecheck  # Run TypeScript without emitting files
pnpm test       # Run the Vitest suite once
pnpm build      # Build the Nitro production output and prerender public routes
pnpm seo:verify # Inspect built metadata, schema, sitemap, robots, and SSR headings
pnpm start      # Run an existing production build locally
pnpm validate   # Run every CI and pre-push gate
```

## Layout

| Path | What lives there |
| --- | --- |
| `content/writing` | Posts as MDX. Frontmatter owns the slug, Pillar, and date. |
| `content/projects` | Optional detail page per Project, prose and pictures only. |
| `src/routes` | File-based routes and route-level metadata. |
| `src/lib` | Content pipeline, SEO, feeds, newsletter, and the schemas behind them. |
| `src/components` | Shared UI, including what a Post's prose renders through. |
| `src/emails` | React Email templates, previewed with `pnpm email`. |
| `scripts` | Operational scripts run through pnpm. |
| `docs/adr` | Decisions that would otherwise look arbitrary later. |

A few things the layout does not show:

- `src/lib/projects.ts` is the single source of a Project's kind, status, year, and links, so a detail page carries nothing but prose and pictures. A Post's and a Project's pictures sit beside the MDX file in `content/<collection>/<slug>/` and are written as ordinary relative Markdown images.
- `src/lib/site-config.ts` is the single seam for public identity and canonical origin. `robots.txt` and `manifest.json` are generated from it, so nothing under `public/` restates it.
- A module ending in `.server.ts` never reaches the client bundle. That split is what keeps private repository names, Resend credentials, and signing keys off the browser.
- TanStack Router generates `src/routeTree.gen.ts`. Do not edit it by hand.

## Working here

- `CONTEXT.md` is the glossary. It is opinionated about which word to use.
- `DESIGN.md` holds the visual direction and the motion doctrine.
- `PRODUCT.md` holds product truth, including which claims are established and which must never be invented.
- `AGENTS.md` is the entry point for coding agents.

## Deployment

Nitro builds a Vercel-ready output with no build command or `vercel.json` needed. `pnpm validate` runs before the first deployment and after any change to public route metadata.

## License

Original code is available under the [MIT License](LICENSE). Site content, writing, and brand assets are not. Vendored source remains under the upstream licenses recorded in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
