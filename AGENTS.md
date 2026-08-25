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
- Neely Solutions is a separate maintained brand. This site links to it and never co-headlines with it.

## Decisions worth reading before proposing an alternative

Persistence is absent because nothing here has needed it yet, not because it is forbidden. Adding Neon or Upstash is a normal decision that earns an ADR.

## When Oxlint and Oxfmt cannot help

Manually verify domain and editorial correctness, source quality, user experience, accessibility, architecture, and edge cases.

## Learned workspace facts

- None yet.

## Learned user preferences

- None yet.

## Agent skills

### Issue tracker

Issues and specs are tracked in this repository's GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the five default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Domain documentation uses the single-context layout. See `docs/agents/domain.md`.
