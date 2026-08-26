# Project Agent Notes

`README.md` documents the layout and commands; `CONTEXT.md` holds the vocabulary; `DESIGN.md` holds the visual and motion law. This file records only what those cannot tell you.

## Project-specific guidance

- Ultracite is the quality entry point; Oxlint and Oxfmt own mechanical linting and formatting. Run `pnpm fix` after edits.
- `pnpm validate` is the whole gate (lint, types, tests, Nitro build, prerender, rendered SEO) and takes about five seconds. Run it freely rather than guessing which stage a change affects; there is no faster subset worth substituting.

## Hard constraints

- **Numbers are real or absent.** Every quantified outcome on this site comes verbatim from documented work. Use the figure as written or leave the claim out.
- **Client names need written sign-off.** Without it, describe the work and leave the client unnamed.
- **`DESIGN.md`'s motion doctrine is law.** Motion confirms an action the reader took. Anything that animates on scroll into view belongs to a different site.
- **Use `CONTEXT.md`'s words.** A shipped thing is a Project, not a product; a dated piece of writing is a Post, not an article. The glossary is opinionated on purpose.

## Gotchas the configuration will not confess

- `src/lib/public-routes.ts` is exhaustive over route paths, so a dynamic route appears as the literal `/writing/$slug`. `vite.config.ts` prerenders with `failOnError: true`, which means those placeholders must be expanded into real paths before they reach the prerenderer
- TanStack Start's import protection denies any `**/*.server.*` module to the client module graph, and it walks the whole graph rather than stopping at the server-function boundary. A `createServerFn` whose module also exports something server-only therefore fails the build: the export keeps the server import alive through tree-shaking. Keep the RPC and the server-only body in separate files, and verify with `grep` over `.output/public` rather than by reasoning about it.
- Installing a dependency while `vite dev` is running can half-invalidate the dep optimizer and surface as "Invalid hook call / more than one copy of React". Delete `node_modules/.vite` and restart the dev server; production builds are unaffected.
- Neely Solutions is a separate maintained brand. This site links to it and never co-headlines with it.

## Decisions worth reading before proposing an alternative

Persistence is absent because nothing here has needed it yet, not because it is forbidden. Adding Neon or Upstash is a normal decision that earns an ADR.

## When Oxlint and Oxfmt cannot help

Manually verify domain and editorial correctness, source quality, user experience, accessibility, architecture, and edge cases.

## Learned workspace facts

- Anything `vite.config.ts` imports becomes a Vite config dependency, and Vite restarts the dev server when one changes. Importing the generated content-collections index from the config is therefore an endless restart loop, because the plugin rewrites that index on every start. `server.watch.ignored` does not help; config dependencies are watched separately. Build-time consumers read `src/lib/writing-source.ts` instead.
- Oxfmt formats `.mdx` as Markdown and rewrites `*` to `_`, which turns `{/* a comment */}` into an expression MDX cannot parse. `content/**` is excluded from Oxfmt for that reason.

## Learned user preferences

- Use a library's idiomatic components over hand-rolled equivalents even when the hand-rolled version works: emails are built from react-email primitives, not raw elements with inline styles.
- Saturated defaults lose to distinctive choices when flagged: Inter was swapped for Hanken Grotesk on the design detector's overused-font finding.

## Agent skills

### Issue tracker

Issues and specs are tracked in this repository's GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the five default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Domain documentation uses the single-context layout. See `docs/agents/domain.md`.
