# Project Agent Notes

`README.md` documents the layout and commands; `CONTEXT.md` holds the vocabulary; `DESIGN.md` holds the visual and motion law. This file records only what those cannot tell you.

## Hard constraints

- **Numbers are real or absent.** Every quantified outcome on this site comes verbatim from documented work. Use the figure as written or leave the claim out.
- **Client names need written sign-off.** Without it, describe the work and leave the client unnamed.
- **Neely Solutions is a separate maintained brand.** This site links to it and never co-headlines with it.
- **`DESIGN.md`'s motion doctrine is law.** Motion confirms an action the reader took. Anything that animates on scroll into view belongs to a different site.
- **Use `CONTEXT.md`'s words.** A shipped thing is a Project, not a product; a dated piece of writing is a Post, not an article. The glossary is opinionated on purpose.
- **One fence-meta vocabulary, one line-highlight syntax.** ` ```ts title="src/lib/x.ts" {2,5-7} `. Shiki's comment-notation transformers stay out; a block that can be highlighted two ways is a block nobody can read.

## Project-specific guidance

- Ultracite is the quality entry point; Oxlint and Oxfmt own mechanical linting and formatting. Run `pnpm fix` after edits.
- `pnpm validate` is the whole gate (lint, types, tests, Nitro build, prerender, rendered SEO) and takes about twelve seconds, most of it the Nitro build. Run it freely rather than guessing which stage a change affects.
- Persistence is absent because nothing here has needed it yet, not because it is forbidden. Adding Neon or Upstash is a normal decision that earns an ADR.

## Gotchas the configuration will not confess

- TanStack Start's import protection denies any `**/*.server.*` module to the client module graph, and it walks the whole graph rather than stopping at the server-function boundary. A `createServerFn` whose module also exports something server-only therefore fails the build: the export keeps the server import alive through tree-shaking. Keep the RPC and the server-only body in separate files, and verify with `grep` over `.output/public` rather than by reasoning about it.
- `src/lib/public-routes.ts` is exhaustive over route paths, so a dynamic route appears as the literal `/writing/$slug`. `vite.config.ts` prerenders with `failOnError: true`, so those placeholders must be expanded into real paths before they reach the prerenderer.
- Anything `vite.config.ts` imports becomes a Vite config dependency, and Vite restarts the dev server when one changes. Importing the generated content-collections index from the config is therefore an endless restart loop, because the plugin rewrites that index on every start. `server.watch.ignored` does not help; config dependencies are watched separately. Build-time consumers read `src/lib/writing-source.ts` instead.
- The `writing-draft-bodies` plugin in `vite.config.ts` empties a draft's body out of the production bundle, because the body glob is exhaustive over `content/writing` and cannot read frontmatter. Development keeps it, and `findReadablePost` opens a draft at its own URL there, which is the only way to preview one. `content/writing/writing-surface-fixture.mdx` is a permanent draft that renders every writing-surface affordance; open it in `pnpm dev` after changing anything about the reading surface.
- Shiki writes its theme's _name_ onto every `<pre>` as a class, so a theme name that collides with a component class in `src/styles.css` silently restyles every code block. The name is `front-door-code`, and `mdx-options.test.ts` asserts it.
- The generated content-collections index is a barrel, and `react-doctor/no-barrel-import` fires on every reader of it. It stays: `index.d.ts` is the only declaration file the generator emits, so importing `allWritings.js` directly saves a few bytes and loses the types.
- Oxfmt formats `.mdx` as Markdown and rewrites `*` to `_`, which turns `{/* a comment */}` into an expression MDX cannot parse. `content/**` is excluded from Oxfmt for that reason.
- Installing a dependency while `vite dev` is running can half-invalidate the dep optimizer and surface as "Invalid hook call / more than one copy of React". Delete `node_modules/.vite` and restart the dev server; production builds are unaffected.

## Learned user preferences

- Use a library's idiomatic components over hand-rolled equivalents even when the hand-rolled version works: emails are built from react-email primitives, not raw elements with inline styles.
- Saturated defaults lose to distinctive choices when flagged: Inter was swapped for Hanken Grotesk on the design detector's overused-font finding.

## Agent skills

- **Issue tracker.** Issues and specs live in this repository's GitHub Issues. See `docs/agents/issue-tracker.md`.
- **Triage labels.** Triage uses the five default labels. See `docs/agents/triage-labels.md`.
- **Domain docs.** Documentation uses the single-context layout. See `docs/agents/domain.md`.
