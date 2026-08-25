# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Four audiences arrive here, in priority order. Engineering leaders and product teams evaluating Nick for modernization or workflow software. Software consultants and independent developers interested in practical AI-assisted development. Founders evaluating custom product development. Secondarily, recruiters and peers arriving from LinkedIn or X who want the fuller picture.

They arrive with one of two questions: can this person solve my problem, or is this person worth following. Both must be answerable within two clicks of the home page.

## Product Purpose

nickneely.dev is the canonical hub for Nick Neely's personal brand. It consolidates a footprint currently scattered across LinkedIn, X, GitHub, Neely Solutions, and several product domains into one place that search engines and humans converge on.

Success means an engineering leader can find the proof and book a call, a peer can find the writing and subscribe, and neither has to wonder which Nick Neely they found.

## Positioning

Nick Neely is a product-minded software consultant who turns messy business and engineering workflows into maintainable products, then shares the practical AI-assisted patterns behind how they are built.

Short form: maintainable software for messy workflows.

The differentiator is the intersection, not any single part: quantified consulting outcomes, plus firsthand AI-assisted development, plus shipped developer tools. The site's job is to make that intersection legible instead of reading as three competing identities.

## Operating Context

- One person writes, builds, and ships everything here. Anything requiring a team's cadence will not survive.
- Writing is authored as MDX in this repository, so publishing is a deploy. That is deliberate.
- Neely Solutions remains a separate, maintained brand for local and small-business work. This site links to it and never co-headlines with it.
- The legacy interactive terminal résumé moves to `terminal.nickneely.dev` and keeps one small link from the footer.

## Capabilities and Constraints

- TanStack Start, React, Nitro on Vercel, Tailwind CSS 4, shadcn/ui on Base UI, TypeScript, Vitest, Ultracite.
- Cloudflare holds DNS; Cloudflare Email Routing forwards `contact@nickneely.dev` and must not be disturbed by sending configuration.
- Resend holds newsletter subscribers. This site stores nothing about them.
- No database, no analytics beyond Vercel Web Analytics, no third-party tracking or open-rate pixels.
- Every public route is inventoried for prerendering, sitemap generation, and rendered SEO verification.

## Brand Commitments

The voice is direct, confident, and technically credible, with personality. Not corporate, not a design-engineer showcase.

Numbers are real or absent. The quantified outcomes on this site are verbatim from documented work and are never rounded, embellished, or invented for effect. Client names appear only with written sign-off.

## Evidence on Hand

- Vermeer Bill of Materials upload workflow: a 10,000-part import reduced from about two hours to about two minutes.
- CI/CD changes that cut PR verification time by roughly two-thirds at Lean TECHniques.
- ClaimDoc secure multi-file uploads, built on Vue 3, .NET, and Azure.
- Shipped products: tendnote, diffbill, and pilog, each live and linkable.
- Frontline Fuel, a headless Shopify storefront delivered through Neely Solutions, with written client sign-off and a named testimonial from Jared Gringer, its owner.
- No adoption metrics, revenue figures, or audience numbers are established. Future work must not fabricate them.

## Product Principles

- One canonical identity, repeated consistently, beats three accurate ones competing.
- Show the work rather than describing the capability.
- Own the distribution surface: the feed and the list belong here, not to a platform.
- Motion confirms an action the reader took; nothing moves because it scrolled into view.
- Every row, link, and claim resolves to something real.

## Accessibility & Inclusion

The site targets WCAG 2.2 Level AA. Semantic structure, keyboard operation, visible focus, reduced-motion support, readable contrast in both themes, and responsive layout are requirements rather than polish. Both themes are first-class; neither is an afterthought.
