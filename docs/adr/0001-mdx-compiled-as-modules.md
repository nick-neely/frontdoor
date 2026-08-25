# MDX posts compile to modules, and content-collections indexes them

Writing is authored as MDX in the repository. `@mdx-js/rollup` compiles each file into a real module that Vite code-splits, and `@content-collections/core` builds the typed index of frontmatter that the writing list, the home feed, RSS, the sitemap, and the prerender inventory all read. Post bodies and the post index are deliberately separate: a list page never pays for the prose it links to.

## Considered options

**Runtime compilation** (`compileMDX` plus `useMDXComponent`) keeps one pipeline and injects components per render, but it serializes every post's compiled JavaScript into the data layer, so the index carries the weight of the bodies. Rejected because the index is read by four surfaces that need none of that.

**Plain markdown** was the first choice, and MDX won because graphs, comparisons, and embedded demos are expected in the practical-AI and building-in-public pillars, and retrofitting MDX later would mean rewriting the render path rather than extending it.

**A hosted CMS** would allow publishing without a deploy. Rejected: it contradicts owning the distribution surface, adds a runtime dependency and an outage mode, and buys nothing at four posts a quarter when `pnpm validate` takes about five seconds.

## Consequences

Publishing is a deploy. That is accepted, not tolerated.

The prerender inventory in `src/lib/public-routes.ts` is exhaustive over route paths, so a dynamic route appears as the literal `/writing/$slug` and must be expanded into real paths before `vite.config.ts` hands `pages` to the prerenderer with `failOnError: true`. That expansion reads frontmatter directly rather than importing the generated content-collections index, so build ordering between the two plugins can never affect it.
