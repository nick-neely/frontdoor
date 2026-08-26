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
pnpm content    # Rebuild the typed writing and project-page indexes (also runs on install, and inside check, dev, and build)
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

## Project shape

- `content/writing` holds authored MDX. Frontmatter is the source of truth for a Post's slug, Pillar, and publication date. A Post's pictures live in the sibling directory `content/writing/<slug>/` and are written as ordinary relative Markdown images: `![alt](./shot.png "Optional caption")`.
- `content/projects` holds one MDX detail page per Project that has the material for one. Its frontmatter is two fields, `slug` and `dek`: `src/lib/projects.ts` stays the single source of a Project's kind, status, year, live URL, and repository, so a page carries prose and pictures and nothing else. Pictures are colocated in `content/projects/<slug>/` and written as the same relative Markdown images. A Project with no page keeps linking straight out from the list.
- `content-collections.ts` builds the typed frontmatter index of both collections into `.content-collections/generated`. Bodies stay out of it; see `docs/adr/0001-mdx-compiled-as-modules.md`.
- `src/lib/mdx-options.ts` is the whole compile pipeline: frontmatter, GFM, heading slugs, Shiki, and the two authoring conveniences below. `src/lib/remark-post-images.ts` rewrites colocated images into imports that `vite-imagetools` resizes and re-encodes through sharp, so every picture ships hashed, in a modern format, with intrinsic dimensions. `src/lib/mdx-code-meta.ts` owns the one fence-meta vocabulary: ` ```ts title="src/lib/x.ts" {2,5-7} `.
- `src/components/mdx-components.tsx` is what a Post's prose renders through. `figure.tsx`, `code-block.tsx`, and `copy-button.tsx` are the three components in it; everything else is typography in the `.prose` block of `src/styles.css`.
- `content/writing/writing-surface-fixture.mdx` is a permanent draft that exercises every one of those affordances on one page. It is excluded from the list, the feed, the sitemap, and the build; a draft opens at its own URL in development, which is how it is reviewed.
- `src/lib/writing-schema.ts` holds the frontmatter contract and everything derived from it. `src/lib/writing.ts` is what pages read; `src/lib/writing-source.ts` is what the build reads. They share the schema and are asserted to agree.
- Project detail pages repeat that arrangement: `src/lib/project-schema.ts` is the contract, `src/lib/project-pages.ts` is what pages read, `src/lib/projects-source.ts` is what the build reads, and a test asserts the two readers agree.
- `src/routes` owns file-based routes and route-level metadata.
- `src/lib/site-config.ts` is the single seam for public identity and canonical origin.
- `src/lib/seo.ts` builds page metadata and JSON-LD from that config.
- `src/lib/site-files.ts` generates `robots.txt` and `manifest.json`, so nothing under `public/` restates identity.
- `src/lib/public-routes.ts` classifies every route as `public` or `private` and expands `/writing/$slug` and `/projects/$slug` into real paths. It is the prerender and sitemap inventory, checked against the generated route tree at compile time.
- `src/lib/rss.ts` and `src/lib/og-image.ts` produce `/rss.xml` and one social card per Post and per Project detail page; `vite.config.ts` emits both into the build output and serves them in development.
- `src/lib/updates.ts` merges Posts and Project milestones into the one Update feed the home page renders.
- `src/lib/github-activity.ts` sanitizes GitHub events into the label the home page may show; `src/lib/github-activity.server.ts` does the authenticated read. A private repository name never leaves the second file.
- `src/lib/env.server.ts` validates server environment variables and never reaches the client bundle.
- `src/lib/newsletter.ts` holds the newsletter's copy, address check, and anti-abuse heuristics, all browser-safe. `src/lib/newsletter-signing.server.ts` signs and verifies the Confirmation that stands in for stored state; `src/lib/newsletter.server.ts` is the only module that touches Resend. See `docs/adr/0002-stateless-double-opt-in.md`.
- `src/emails` holds the three React Email templates and the palette they share. `pnpm email` previews them; `src/lib/newsletter-broadcast.ts` turns a Post into a draft payload that has no way to ask Resend to send it.
- `src/start.ts` registers global request middleware; `src/server.ts` is the server entry.
- `scripts/broadcast.mts` is `pnpm broadcast <slug>`. It creates a draft and prints its id; sending stays a deliberate act in the Resend dashboard.
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
