# diffbill - project detail page draft

Content draft for `/projects/diffbill`. Not site code. Voice is first person as Nick, written for a technical hiring manager. Every claim in sections 2-4 has a row in the Facts register; anything without a row was cut.

**Source repo:** `/home/neely/dev/diffbill` @ `85c024e5` (pulled clean, `Already up to date`). Nothing in that repo was modified.

> **PRE-PUBLISH GATE - DO NOT SKIP.**
>
> **Page copy assumes diffbill #156-#158 are fixed; verify before this page ships.**
>
> Nick's direction (2026-08-25) is to write this page as though all three are in their ideal state, so sections 3 and 4 now describe the fixed behavior rather than the gap:
>
> - **#156** - the GitHub trust section corrected: short diff excerpts are read and stored, and diffbill _never writes_ rather than _cannot_ write.
> - **#157** - the redactor applied to patch excerpts and commit messages, not only to the PR body excerpt.
> - **#158** - the revoke-access claim made true: disconnecting GitHub actually purges the synced data.
>
> Until each is confirmed shipped, **none of the affected sentences may go live.** The affected sentences are marked in section 3 (end-of-section note) and section 4 (permissions decision).

---

## 1. Dek

> Merged pull requests in, client-ready invoice drafts out: a GitHub-to-Stripe billing pipeline for freelance developers and small dev agencies.

Alternate, closer to the existing row description:

> Turns merged GitHub pull requests into invoice-ready line items and Stripe drafts, for freelance developers and small dev agencies.

---

## 2. What it is

Freelance developers do the work in GitHub and bill it somewhere else entirely. At the end of a month you have forty merged pull requests titled things like `fix: debounce the repo picker` and a blank invoice, and the reconstruction job - remembering what each one was, deciding what a client should be charged for it, and writing it in language a non-engineer will actually pay - is the part nobody budgets for. It gets done badly, late, or not at all, and billable work quietly falls off the invoice.

diffbill closes that loop. You pick a repository and a date range, and it pulls the merged pull requests from that window along with their commit messages, linked issues, and the files each one touched. It rewrites that material into invoice line items written for the person receiving the invoice rather than the person who wrote the code, with an estimated hour figure attached to each. Then you review: edit the wording, include or exclude rows, redact anything too sensitive to show a client, and check each line against the files it was derived from. When it looks right, diffbill creates the draft invoice in your own Stripe account, and you send it from there.

It is built for the people who both ship the work and own the billing - independent freelancers, solo consultants, and small dev agencies. The design constraint that follows from that audience is that nothing is auto-sent. Every AI-generated row lands in a review step, low-confidence rows are excluded by default rather than included by default, and the invoice is a Stripe _draft_ in the user's own connected account. diffbill never holds the money and never has the last word on what a client sees.

In my own use the whole path - merged pull requests to a Stripe draft - runs about five minutes, against roughly three hours a month I used to lose reconstructing an invoice by hand. Those are my own measurements from my own billing, not a customer average and not a benchmark.

_Provenance for the two figures above: measured by Nick in his own use (Nick, direct answer, 2026-08-25). They are the same two numbers on `apps/marketing/components/social-proof.tsx` L52-55 and L75-78, and they clear the "numbers are real or absent" rule only with that attribution attached - if the page carries them, it carries "measured by Nick in his own use" alongside them._

---

## 3. How it's built

It is a pnpm + Turborepo monorepo with two Next.js App Router apps and seven shared packages. `apps/marketing` is the public site; `apps/core-app` is the product. The shared packages carry the design system (`ui`, Tailwind v4 CSS-first with shadcn-style Radix components), feature flags (`flags`, on Vercel Flags), cross-app URL resolution (`urls`), observability (`observability`), transactional email, blob storage, and a Remotion package that renders the marketing hero video programmatically. The product app is Next 16.2.1 on React 19, TypeScript throughout, Postgres through Drizzle ORM, Redis for rate limiting and caching, better-auth for identity, and Stripe for both diffbill's own subscriptions and the invoices it creates on the user's behalf. It currently runs to 73 API routes and 78 test files, with Biome for lint and format and Vitest in CI.

**The data flow.** A user connects GitHub through better-auth OAuth. Selecting a repo and a date range hits the sources endpoint, which queries merged PRs and applies label-based filters for internal and chore work before the user ever sees the list. When the user picks the PRs they want billed, each one is enriched in parallel: the PR detail endpoint for body, commit count, and churn totals; the commits endpoint for up to thirty first-line commit messages; the files endpoint, paged up to four times, for the changed files; and any issues referenced by a `Fixes #123`-style phrase in the PR body. Changed files are scored by churn and category - product code weighted up, generated files and lockfiles weighted down - and the top 200 are kept as evidence. That enriched payload is what the model sees. It is metadata, commit messages, filenames, per-file line counts, and a short trimmed excerpt of the changed lines in each file; the repository is never cloned and full file contents are never fetched, because no `/contents/` or `/git/blobs/` endpoint is called anywhere in the GitHub layer. Everything in that payload a client could eventually read - the PR body excerpt, the commit messages, and the diff excerpts - passes through the same redactor first, which strips GitHub token prefixes, long hex strings, email addresses, and screaming-snake constants. A secret is at least as likely to show up in a diff hunk as in a PR description, so the redactor runs on the whole payload rather than the one field it started on.

That evidence is not transient. The shaped source - body excerpt, labels, commit summaries, and the per-file evidence array including each file's trimmed change excerpt - is persisted as JSONB on both the invoice's sources and its line items, and it is what the client sees: the anonymous client portal renders the evidence behind each billed row so the person paying can check the work against the files it came from. Storing it is the point. An invoice whose provenance disappears the moment it is generated is not an audit trail.

Identity is single-tenant by design - every business table keys off one `userId`, with no org or workspace layer - and GitHub tokens are stored encrypted at rest through better-auth.

**The translation pipeline** is the part I would want to be asked about. It streams NDJSON back to the browser so rows appear as they are generated, and it runs per source with bounded concurrency rather than as one giant prompt.

Every model call goes through the Vercel AI Gateway via the AI SDK's `createGateway`, not a provider SDK. Model choice is a _policy_, not a constant: a routing function maps the user's plan and a requested quality mode to a primary model, an ordered list of fallback models handed to the gateway, and a reasoning-effort level. Starter runs a small fast model at minimal reasoning effort; Pro steps up; Team and any escalated request run the largest model at medium effort. Every model ID is environment-overridable, so swapping a model is a config change and not a deploy.

Generation is structured output, not text parsing - `streamObject` against Zod schemas with named schemas passed to the provider. Each source runs a segmentation pass that splits the work into distinct candidate line items, then a realization pass that writes the final client-facing wording. Before either runs, a quota function reads the source's changed-file count, changed-line count, and the number of meaningful directory clusters it touched, and derives a minimum, target, and maximum row count that gets injected into the prompt as an instruction. Row count is anchored to measured churn rather than left to the model's discretion.

The system prompt is twenty numbered grounding rules - never invent work, use only the provided fields, write delivered outcomes rather than process steps, never mention PRs or GitHub or tickets, no file names or refactor language, quarter-hour increments, keep rows distinct, and classify each row as internal, chore, documentation, sensitive, or billable. Prompts are resolved at request time from PostHog's managed-prompt store with the in-repo builder functions as fallback, cached for ten minutes. A missing managed prompt logs a warning and fires an analytics event rather than failing the request, so the repo always carries a working default.

What happens _after_ generation is where most of the engineering is. Output passes a deterministic quality gate that scores duplicate-description ratio, low-confidence ratio, and hits against a regex for known filler phrasing. On paid plans, a source that fails the gate is retried - with repair instructions naming the specific defect, a compacted context budget, and on the final attempt an escalation to the larger model - and a source that still yields nothing gets a conservative fallback row derived arithmetically from churn, marked low confidence and excluded by default. Inclusion is then decided in code, not by the model: low-confidence rows are excluded, `sensitive` rows are always excluded, and internal, chore, and documentation rows are excluded according to the user's settings and label configuration.

The evidence trail gets the same treatment. The model returns a list of filenames it claims support each row, and rather than trusting that list, a resolver re-scores it against the real changed files - tokenizing the description and the filename, weighting by churn and file category - and drops any requested file that does not actually match. A citation the model invented cannot attach itself to a line item.

Cost and quality are both instrumented. Every model call is wrapped so PostHog receives the route, operation, plan, model tier, quality mode, and prompt name, and token usage is converted to a dollar estimate against a pricing catalog fetched from the gateway and cached for a day, with a hardcoded fallback table when the catalog is unavailable. Paid usage is metered into Stripe, and an AI-credit system with grants, consumption allocations, and optional auto-replenish sits on top of it.

**Invoicing** is Stripe Connect. The draft is created in the user's own connected account, so diffbill is never in the payment path.

_Gated sentence: the redaction claim in "The data flow" above describes the post-fix state of diffbill **#157**. See the pre-publish gate at the top of this draft._

---

## 4. Decisions worth defending

**Model choice is a routing policy, not a dependency.** Every call goes through the Vercel AI Gateway with model IDs resolved per plan and quality tier, each with an ordered fallback list and an environment override. This costs a small amount of indirection and buys three things: cheap models on the free tier without a second code path, automatic failover when a provider degrades, and the ability to move to a better model by changing an environment variable. Committing to one provider's SDK would have made all three of those a refactor.

**Deterministic gates decide what ships, not the model.** An invoice is a document a client reads and pays against, so I was not willing to let a single generation be the final word. Output is scored on duplicate ratio, low-confidence ratio, and filler-phrase matches; failures on paid plans are retried with repair instructions naming the defect and escalate to a larger model on the last attempt; and if the model still produces nothing, a conservative row computed from churn is emitted, marked low confidence and excluded by default. Inclusion itself is resolved in plain TypeScript. The model proposes; the code disposes. All of that logic is pure functions with unit tests, which is the only reason it is safe to keep tightening.

**The model's citations are verified against reality.** Source-linked evidence is the product's trust claim, and that evidence is rendered to the paying client in the portal, not just to the freelancer - so a fabricated filename would be worse than no filename at all. The model returns the files it says back a line item, and a resolver independently ranks the real changed files against that row's description and discards any claimed file that does not score a genuine match. This is the cheapest hallucination defense in the system and the one I would point at first.

**Prompts live in PostHog with in-repo fallbacks.** Prompt wording is the fastest-moving part of an AI feature and the least deserving of a deploy cycle, so prompts resolve from a managed store at request time, cached ten minutes. But the builder functions stay in the repo as the fallback, and a cache miss logs plus emits an analytics event instead of erroring. The result is that prompts are editable without shipping code and the app still runs correctly with the prompt service completely unavailable.

**Row-level security in Postgres, and money that never touches diffbill.** Every authenticated query runs inside a transaction that sets `app.current_user_id`, with RLS policies keyed to it, so a future query that forgets to filter by user returns zero rows instead of someone else's invoices. The anonymous client portal gets its own context keyed to a hashed token rather than a user. On the payment side, invoices are created through Stripe Connect in the user's own account - diffbill is not a payment intermediary, holds no client funds, and inherits none of the compliance surface that would come with being one.

**GitHub permissions escalate only on request.** The default OAuth scopes are `read:user` and `user:email`, which cover public repositories. Private-repository access requires the broader `repo` scope, and rather than requesting it up front, the app reads the granted scopes back off GitHub's response headers, notices the gap, and offers a re-authorization prompt at the two points where it actually matters - the repositories page and the new-invoice flow. Someone billing public work never sees the prompt at all. Asking for the maximum permission on day one is the easy version and the one that loses signups. The precision that matters, and that the copy now carries: classic `repo` is a read _and_ write scope, so the defensible claim is that diffbill never writes - there is no write call to any repository endpoint anywhere in the codebase - rather than that it cannot. A self-imposed restriction stated accurately is worth more than a stronger-sounding one that the token does not support.

_Gated sentence: the paragraph above describes the post-fix state of diffbill **#156**. See the pre-publish gate at the top of this draft._

---

## 5. Media inventory

### Portfolio screenshots (primary source)

Captured 2026-08-25 from the locally running apps specifically for portfolio use. Directory: `/home/neely/dev/diffbill/artifacts/portfolio-screenshots/2026-08-25/` with its own `README.md` documenting the intended narrative order. Desktop captures are 1440x960; the mobile capture is 390x844.

The `final/` sequence, in the order its README recommends:

| # | Path (under `final/`) | Shows |
| --- | --- | --- |
| 01 | `01-marketing-product-thesis.png` | Product thesis: turn merged GitHub work into client-ready invoices |
| 02 | `02-marketing-github-integration.png` | GitHub integration and source-ingestion model |
| 03 | `03-marketing-ai-translation.png` | AI translation from engineering language to client-facing line items |
| 04 | `04-marketing-stripe-workflow.png` | End-to-end GitHub-to-Stripe workflow |
| 05 | `05-core-dashboard.png` | Operational overview: drafts, recurring work, repositories, recent invoices |
| 06 | `06-core-private-github-pr-selection.png` | Real private-repo PR selection with dates, metadata, batch controls |
| 07 | `07-core-ai-translation-review.png` | Human-in-the-loop review: confidence, exclusions, redactions, evidence |
| 08 | `08-core-created-invoice.png` | Resulting editable invoice draft with source traceability |
| 09 | `09-core-evidence-provenance.png` | Progressive disclosure of file-level evidence behind billed work |
| 10 | `10-core-stripe-finalization.png` | Client review state, delivery checks, totals, Stripe draft finalization |
| 11 | `11-core-recurring-planner.png` | Recurring invoice scheduling with upcoming runs and execution history |
| 12 | `12-core-connected-private-repositories.png` | Connected repos, private access, usage, import controls |
| 13 | `13-core-billing-and-usage.png` | Stripe-backed plan, entitlements, metering, AI-credit usage |
| 14 | `14-core-command-palette.png` | Keyboard-first navigation and compact command UI |
| 15 | `15-marketing-mobile.png` | Responsive version of the core marketing thesis |

**Recommended page set**, per the capture README's own suggested edit: 01, 06, 07, 09, 10, 11, 12. That covers product idea, authenticated private-GitHub integration, AI-assisted transformation, provenance, human review, Stripe integration, and the operational system without becoming a long gallery. For a detail page that needs fewer, 07 and 09 are the two that carry the "practical AI" argument by themselves.

Also present in that directory:

- `portfolio-contact-sheet.png` (2.8 MB) - fastest single review surface for picking shots.
- Contact sheets for scouting passes: `core-scout-`, `marketing-scout-`, `core-workflow-`, `integration-workflow-`, `product-surfaces-`.
- `recurring-repositories-review.png`.
- `raw/` - 37 alternate and intermediate captures intentionally left out of the final sequence. Useful if a specific surface is needed that `final/` does not cover: notably `core-create-invoice-ai-streaming.png` (translation mid-stream), `core-clients.png`, `core-settings.png`, `core-client-portal-access.png`, `core-invoice-client-review.png`, and `marketing-pricing.png`.

> **Cleared by Nick, 2026-08-25.** The capture README still carries a redaction gate; it is superseded. These are real authenticated captures, but the private repository names visible in them are Nick's own and he does not mind them being shown, and every rate, invoice amount, and usage count in the set is made-up development data rather than a real client's. No auth token or cookie value appears in the curated set. They can go on a public page as captured.
>
> One residual check, which is not a redaction gate but is still a rule: `AGENTS.md` requires written sign-off before any client is named. If a genuine client name - as opposed to a dev-data label - appears in `07`, `10`, `raw/core-clients.png`, or `raw/core-invoice-client-review.png`, that row still needs blurring or the shot needs swapping. Nick's clearance covers repo names and fabricated figures; it does not by itself cover a third party's name.

### Video

All six files are served as local static assets from `apps/marketing/public/videos/`. None are on blob storage or a CDN - `@diffbill/blob` is a core-app dependency only, and its single export handles image uploads. Specs confirmed with `ffprobe`.

| Path (under `apps/marketing/public/videos/`) | Size | Dimensions | FPS | Duration |
| --- | --- | --- | --- | --- |
| `diffbill-launch.mp4` | 16.0 MB | 1920x1080 | 30 | 113.9s |
| `changelog/client-portal.mp4` | 73.1 MB | 1920x1080 | 30 | 46.6s |
| `changelog/multi-repo.mp4` | 29.5 MB | 1920x1080 | 60 | 21.2s |
| `changelog/recurring-invoice-schedule.mp4` | 18.0 MB | 1920x1080 | 60 | 17.0s |
| `hero.mp4` | 1.26 MB | 1160x700 | 30 | 20.1s |
| `hero.webm` | 412 KB | 1160x700 | 30 | 20.0s |

**Homepage launch video.** `diffbill-launch.mp4` plays in the "See it in action" / "How It Works" section: `apps/marketing/components/how-it-works-section.tsx`, `<video>` element at L37-46, single `<source type="video/mp4">` at L47. Attributes: `autoPlay muted loop playsInline preload="metadata"`, `poster="/images/code-image.webp"`, `aria-label` "diffbill product walkthrough - from GitHub repo to Stripe invoice draft". A captions track is wired to `/videos/diffbill-launch-captions.vtt` (541 bytes, present). It is also the `contentUrl` of a `VideoObject` JSON-LD block at `apps/marketing/app/page.tsx:36-43`. One caveat for reuse: the poster `code-image.webp` is a stock screenshot of VS Code's own repository and has nothing to do with diffbill - do not carry that poster over.

**Changelog videos.** Wired through the `video` field on entries in `apps/marketing/lib/changelog.ts` (client-portal L70, recurring-invoice-schedule L87, multi-repo L96) and rendered by `apps/marketing/components/changelog-timeline.tsx` in three places: desktop sticky panel (L194-204, `autoPlay muted loop playsInline preload="auto"`), mobile inline accordion (L379-388, same minus `autoPlay`, played imperatively at L363), and an enlarge dialog (L131-140, adds `controls`). No posters are set on any of the three - the entry type has a `videoPoster` field and all three leave it empty, so a portfolio page reusing them should supply its own poster frame. Each is a single `<source>`; there are no webm variants.

What each changelog clip shows, per its entry copy: **client-portal** (2026-03-27) a secure client link with clickable per-line evidence, email verification, line-item approval or change requests, and anchored chat; **recurring-invoice-schedule** (2026-03-21) weekly, biweekly, and monthly schedules per client and repository that draft an invoice from merged PRs each period; **multi-repo** (2026-03-21) selecting several repositories in one invoice with each line item tied to its source repo.

**The hero video is generated, and currently unused.** `hero.mp4` / `hero.webm` are the exact output of `packages/hero-video/`, a Remotion 4.0.259 workspace: the `HeroVideo` composition is declared at 1160x700, 30fps, 600 frames (20s), matching the files' measured specs, and `src/render.ts` writes both codecs straight into `apps/marketing/public/videos/`. Three scenes with transitions - repo and date-range selection, line items typing in with a total springing up, then a mock Stripe draft whose badge morphs from "Draft" to "Ready to Send" - with a fade-out for a seamless loop. It is driven from the repo root by `pnpm hero:studio` and `pnpm hero:render`. Neither filename is referenced anywhere in the marketing app; the homepage hero shows a static image instead. A finished, programmatically-rendered product video that is built but not deployed is worth a sentence on the page either way.

**Gaps to capture.** Nothing here is a walkthrough of the flagship translate-and-review flow at portfolio length: the changelog clips are feature-scoped and the launch video is marketing-pitched. The highest-value new capture is a short silent screen recording of the review step - PRs selected, rows streaming in, one row edited, evidence expanded - which is the sequence `raw/core-create-invoice-ai-streaming.png` freezes a single frame of.

### Imagery in the diffbill repo - know this before reaching for it

There is **no real screenshot of the running app** anywhere in `apps/marketing/public/` or `apps/core-app/public/`. Everything visual there is brand illustration, concept art, or an AI-generated mockup. The `artifacts/portfolio-screenshots/` set above is the only source of real UI captures.

- `apps/marketing/public/images/diffbill-hero.webp` - homepage hero. Its alt text says "diffbill dashboard showing merged pull requests turned into invoice-ready billing line items", but it is stylized 3D concept art of two floating glass panels, not a UI capture. Do not describe it as a screenshot.
- `apps/marketing/public/og-image.png` - branded OG card ("Your commits. Your invoice.") with a small mock UI. Also illustrative. Byte-identical copies live at `apps/core-app/public/og-image.png` and `packages/ui/brand-assets/og-image.png`.
- `apps/marketing/public/images/blog/*-inline-*.jpg` - roughly 90 files across 35 posts. These are **AI-generated mockups with garbled interface text** (a sidebar item reads "Cvents" instead of "Clients"), despite MDX alt text calling them "UI screenshot of the diffbill dashboard". Never reuse these as product imagery.
- `apps/marketing/public/images/code-image.webp` - a stock VS Code screenshot, unrelated to diffbill, currently doing duty as the launch video's poster.
- Orphaned files referenced nowhere, reading like leftovers from an unrelated SaaS template: `new-product-ui.jpeg`, `product-ui.jpeg`, `parallel-coding-agents.webp`, `mcp-connectivity.webp`, `realtime-coding-previews.webp`, `one-click-integrations.webp`, `deployment-easy.webp`, `ai-code-reviews.webp`. Ignore them.
- Genuine brand assets, if the page needs a mark: `packages/ui/brand-assets/` (`icon.svg`, `icon.png`, favicons, manifest icons).

---

## 6. Links

- **Live:** https://diffbill.com
- **Product app:** https://app.diffbill.com (referenced as the default app origin in the core app's AI Gateway attribution headers)
- **Source:** **Private, deliberately.** `gh repo view nick-neely/diffbill --json visibility,url` returns `{"url":"https://github.com/nick-neely/diffbill","visibility":"PRIVATE"}`, and Nick is keeping it that way for now (2026-08-25). **No GitHub link goes on the page.** That is a decision rather than a gap, and the page should neither link out nor apologize for the absence - a private product repo needs no explanation on a portfolio page.

---

## 7. Facts register

Every claim in sections 2-4 maps to a row. Paths are relative to `/home/neely/dev/diffbill/`.

### Section 2 - What it is

| Claim | Evidence |
| --- | --- |
| Turns merged GitHub work into client-ready invoices | `README.md` "Product overview"; `docs/product-marketing-context.md` one-liner |
| Built for freelancers, consultants, and small teams | `README.md` line 3; `docs/product-marketing-context.md` "Target companies" |
| Pick a repository and a date range | `README.md` feature table, "GitHub ingestion: Repo and date-range selection" |
| Pulls merged PRs with commit messages, linked issues, changed files | `apps/core-app/lib/github/translation-context.ts` `enrichSourcesForTranslation` |
| Rewrites technical work into client-facing line items | `README.md` feature table; `apps/core-app/lib/ai/prompt.ts` `buildTranslationSystemPrompt` rules 5, 8 |
| Estimated hours attached to each row | `apps/core-app/lib/ai/prompt.ts` output schema `estimatedHours`; `lib/ai/estimated-hours-leniency.ts` |
| Review: edit, include/exclude, bulk accept | `README.md` feature table "Review workflow"; `apps/core-app/docs/v1-claim-matrix.md` row "Review/edit/exclude before invoicing" = Done |
| Redaction of sensitive detail | `apps/core-app/lib/ai/translation-quality.ts` `resolveLineItemPresentation`; prompt.ts rules 18-19 |
| Line items traceable to the files they came from | `apps/core-app/lib/ai/evidence-resolver.ts`; `docs/v1-claim-matrix.md` "Source-linked audit trail" = Done |
| Draft created in the user's own Stripe account | `apps/core-app/app/api/invoices/[id]/stripe/route.ts` uses `requireStripeConnectAccountId`; `docs/v1-claim-matrix.md` "Stripe draft creation in connected account" = Done |
| Low-confidence rows excluded by default | `apps/core-app/lib/ai/translation-quality.ts` `resolveLineItemInclusion` returns `included: false` for `confidence === 'low'` |
| Nothing auto-sent; it is a Stripe draft | `apps/core-app/app/api/invoices/[id]/stripe/route.ts`; `docs/v1-claim-matrix.md` acceptance "User creates and opens Stripe draft" |

### Section 3 - How it's built

| Claim | Evidence |
| --- | --- |
| pnpm + Turborepo monorepo, two Next.js apps | `README.md` "Monorepo structure"; `pnpm-workspace.yaml`; `turbo.json` |
| Seven shared packages | `packages/` = `blob`, `email`, `flags`, `hero-video`, `observability`, `ui`, `urls` |
| Tailwind v4 CSS-first, shadcn-style Radix components | `README.md` "Tech stack"; `packages/ui/styles/globals.css` |
| Feature flags on Vercel Flags | `README.md` structure; `apps/core-app/package.json` deps `flags`, `@flags-sdk/vercel`, `@vercel/flags-core` |
| Remotion package renders the hero video | `packages/hero-video/package.json` (`remotion` 4.0.259, `studio`/`render` scripts); root `package.json` `hero:studio`, `hero:render` |
| Next 16.2.1, React 19.2.4 | `apps/core-app/package.json` deps |
| Postgres via Drizzle ORM | `apps/core-app/package.json` (`drizzle-orm`, `drizzle-kit`, `pg`); `apps/core-app/drizzle/` |
| Redis for rate limiting and caching | `apps/core-app/package.json` (`@upstash/redis`, `redis`); `apps/core-app/lib/redis/` |
| better-auth for identity | `apps/core-app/package.json` (`better-auth`, `@better-auth/stripe`); `apps/core-app/lib/auth.ts` |
| 73 API routes | `find apps/core-app/app/api -name route.ts \| wc -l` = 73 |
| 78 test files | `find apps packages -name "*.test.ts*"` excluding node_modules = 78 |
| Biome lint/format, Vitest in CI | root `package.json` scripts; `apps/core-app/vitest.config.ts`; `apps/core-app/docs/testing-strategy.md` "CI" |
| Label-based filtering of internal and chore work before the user sees the list | `apps/core-app/lib/github/sources.ts` ~L146-153 (`excludeInternal`, `excludeChores`) |
| PR detail, commits, files, linked issues fetched in parallel | `apps/core-app/lib/github/translation-context.ts` `Promise.all` in `enrichSourcesForTranslation` |
| Up to 30 first-line commit messages | `translation-context.ts` `fetchPullCommitSummaries` - `payload.slice(0, 30)`, `.split('\n')[0]` |
| Files endpoint paged up to four times | `translation-context.ts` `fetchPullEvidenceFiles` - `for (let page = 1; page <= 4; ...)` |
| Linked issues parsed from `Fixes #123`-style references | `translation-context.ts` `extractLinkedIssueNumbers` regex `close[sd]? \| fix(e[sd])? \| resolve[sd]?` |
| Files scored by churn and category, top 200 kept | `translation-context.ts` `prioritizeEvidenceFiles` - log10 churn score, category weights, `.slice(0, 200)` |
| Repository never cloned, full file contents never fetched | `apps/core-app/lib/github/` calls only `/repos/{o}/{r}/pulls/*`, `/repos/{o}/{r}/issues/{n}`, `/repos/{o}/{r}`, `/user/repos`; no `/contents/` or `/git/blobs/` call exists |
| A short trimmed excerpt of changed lines is included | `translation-context.ts` `trimPatch` - `patch.slice(0, 400)`; `lib/ai/evidence-resolver.ts` `trimExcerpt` - `.slice(0, 300)` |
| Merged PRs found via the search endpoint | `lib/github/sources.ts:196` - `GET /search/issues?q=...` |
| Enrichment is wired into live routes, not dead code | `enrichSourcesForTranslation` called from `app/api/translate-work/route.ts:432`, `app/api/github/sources/route.ts:111`, `lib/services/recurring-invoice-schedules.ts:842` |
| Evidence persisted as JSONB on invoice sources and line items | `lib/db/schema/business.ts:401` (`invoiceSources.evidenceFiles`), `:400` (`bodyExcerpt`), `:273` (`lineItems.evidenceFiles`) |
| Client portal renders per-file evidence to the client | `components/portal/client-portal-page.tsx:535` and `:983` - `{file.patchExcerpt}` |
| Single-tenant: every business table keys off one `userId` | `lib/db/schema/business.ts` - `repositories.userId`, `invoices.userId` etc.; no org/workspace table |
| GitHub tokens encrypted at rest | `lib/auth.ts:206` - `account: { encryptOAuthTokens: true }`; column `lib/db/schema/auth.ts:34` |
| Streams NDJSON as rows generate | `apps/core-app/app/api/translate-work/route.ts` - `TextEncoder`, per-source `emitSourceEvent` |
| Bounded per-source concurrency | `route.ts` `SOURCE_TRANSLATION_CONCURRENCY = 3`, `SEGMENT_REALIZATION_CONCURRENCY = 2` |
| Vercel AI Gateway via `createGateway`, not a provider SDK | `apps/core-app/lib/ai/model.ts` - `import { createGateway } from 'ai'` |
| Plan + quality mode resolve to primary model, fallback list, reasoning effort | `lib/ai/model.ts` `resolveModelRoutingPolicy` |
| Starter small/minimal, Pro up, Team/escalated largest at medium effort | `lib/ai/model.ts` defaults and `reasoningEffort` per branch |
| Every model ID environment-overridable | `lib/ai/model.ts` - `process.env.AI_GATEWAY_MODEL_*` on every branch |
| Fallback list handed to the gateway | `route.ts` `getTranslationProviderOptions` - `gateway: { models: fallbackModelIds }` |
| Structured output via `streamObject` + Zod named schemas | `route.ts` `streamObject({ output: 'array', schema: translationSegmentSchema, schemaName: 'invoice_line_item_segments' })`; `lib/validators/translation.ts` |
| Two stages: segmentation then realization | `route.ts` `runSegmentationPass`; `lib/ai/prompt.ts` `buildTranslationSegmentationPrompt`, `buildTranslationRealizationPrompt` |
| Quota derived from changed files, changed lines, directory clusters | `lib/ai/line-item-quota.ts` `computeLineItemQuota`, `estimateMeaningfulClusterCount` |
| Quota injected into the prompt as an instruction | `lib/ai/line-item-quota.ts` `buildQuotaInstruction`; consumed in `route.ts` `buildGenerationUserInstructions` |
| System prompt is 20 numbered grounding rules | `lib/ai/prompt.ts` `buildTranslationSystemPrompt` - items 1-20 |
| Rules include no invented work, no GitHub/PR/ticket words, no filenames, quarter-hours, distinct rows | `lib/ai/prompt.ts` rules 1, 7, 10, 11, 14 |
| Rows classified internal / chore / documentation / sensitive / billable | `lib/ai/prompt.ts` rules 16-17; `lib/validators/translation.ts` `lineItemExcludeReasonSchema` |
| Prompts resolved from PostHog managed store, 10-minute cache | `lib/ai/managed-prompts.ts` - `resolveManagedPrompt({ cacheTtlSeconds: 600 })` |
| In-repo builder functions are the fallback | `lib/ai/managed-prompts.ts` - `fallback: buildTranslationSystemPrompt()` etc. |
| Missing managed prompt warns + emits an event, does not fail | `lib/ai/managed-prompts.ts` `reportMissingManagedPrompt` - `logWarn` + `captureServerEvent('managed_prompt_missing_using_fallback')` |
| Quality gate scores duplicate ratio, low-confidence ratio, filler regex | `lib/ai/source-quality-gate.ts` `computeSourceQualityScore`, `failsPaidQualityGate` (>0.25 dup, >0.6 low-conf, any generic hit, zero rows) |
| Paid retry with repair instructions naming the defect | `route.ts` retry loop ~L1140-1200, `repairNotes` array |
| Compacted context budget on retry | `route.ts` `COMPACT_CONTEXT_BUDGET`, `contextVariant` = `'compact'` on attempt 2 |
| Escalation to larger model on final attempt | `route.ts` ~L1143-1146 - `attempt === MAX_PAID_RETRY_ATTEMPTS` sets `activeQualityMode = 'escalated'` |
| Conservative fallback row derived from churn, low confidence, excluded | `route.ts` `buildConservativeSourceFallbackLineItem` - `Math.max(changedLines/320, changedFiles/8)`, `suggestedIncluded: false` |
| Inclusion decided in code, not by the model | `lib/ai/translation-quality.ts` `resolveLineItemInclusion` |
| `sensitive` always excluded; internal/chore/docs per user settings and labels | `lib/ai/translation-quality.ts` `resolveLineItemInclusion` branches |
| Model's claimed evidence filenames re-scored against real files | `lib/ai/evidence-resolver.ts` `rankEvidenceFilesForLineItem` |
| Non-matching requested files dropped | `evidence-resolver.ts` - requested entries filtered by `entry.directMatchScore > 0` |
| Scoring tokenizes description and filename, weights churn and category | `evidence-resolver.ts` `tokenize`, `categoryScore`, `churnScore` |
| Every model call wrapped for PostHog with route/operation/plan/tier/quality/prompt name | `lib/ai/model.ts` `getObservedModel` -> `wrapModelForPostHogLLM`; `route.ts` metadata incl. `$ai_prompt_name` |
| Token usage converted to a dollar estimate | `lib/ai/usage-costs.ts` `estimateAiUsageCostUsd` |
| Pricing catalog fetched from the gateway, cached 24h, hardcoded fallback table | `lib/ai/usage-costs.ts` - `AI_GATEWAY_MODELS_URL`, `PRICING_CACHE_TTL_MS`, `FALLBACK_MODEL_PRICING_USD_PER_TOKEN` |
| Usage metered into Stripe | `lib/services/ai-credits.ts` - `billing.meterEvents.create`, `STRIPE_METER_EVENT_AI_TRANSLATIONS` |
| AI credits with grants, consumption allocations, auto-replenish | `lib/services/ai-credits.ts`; schema `aiCreditGrants`, `aiCreditConsumptions`, `aiCreditConsumptionAllocations`, `aiCreditAutoReplenishSettings`; commit `31e28c27` "Feat/ai-credit-system (#141)" |
| Invoices created via Stripe Connect in the user's account | `app/api/invoices/[id]/stripe/route.ts` - `requireStripeConnectAccountId`, `stripeAccountId`; `lib/services/stripe.ts:183-190, 217-218, 239, 251` pass `{ stripeAccount }` on every invoice mutation |
| diffbill never stores the user's Stripe secret key | `lib/services/stripe-client.ts` uses only the platform `STRIPE_SECRET_KEY`; onboarding via `app/api/billing/connect/onboard/route.ts` |

### Section 4 - Decisions worth defending

| Claim | Evidence |
| --- | --- |
| Gateway indirection enables failover and env-swappable models | `lib/ai/model.ts` (whole file); `route.ts` `getTranslationProviderOptions` |
| Quality logic is pure functions with unit tests | `lib/ai/source-quality-gate.test.ts`, `translation-quality.test.ts`, `evidence-resolver.test.ts`, `line-item-quota.test.ts`, `translation-normalizer.test.ts`, `translation-stream-policy.test.ts`, `model.test.ts`, `managed-prompts.test.ts`, `usage-costs.test.ts`, `estimated-hours-leniency.test.ts` |
| Translation streaming is a named CI focus area | `apps/core-app/docs/testing-strategy.md` "Focus Areas" table |
| RLS: `app.current_user_id` set per authenticated transaction | `apps/core-app/lib/db/with-user-context.ts`; `apps/core-app/docs/security-rls-guide.md` |
| RLS migrations applied | `apps/core-app/drizzle/0010_rls_defense_in_depth.sql`, `0022_portal_rls_hardening.sql`, plus `0015`, `0023`, `0024`, `0027`, `0028`, `0029` |
| Forgetting the user filter returns zero rows | `docs/security-rls-guide.md` "How RLS Works" - "When not set, no rows match -> 0 results. This is intentional" |
| Portal uses a hashed-token context, not a user | `apps/core-app/lib/db/with-portal-context.ts`; `docs/security-rls-guide.md` "Portal Context" (`app.portal_token_hash`) |
| RLS shipped as a deliberate defense-in-depth pass | commit `e244e890` "RLS defense-in-depth, retry analytics, and security fixes (#65)" |
| Default OAuth scopes are `read:user` and `user:email` | `apps/core-app/lib/auth.ts:213` |
| Private repos require opt-in `repo` scope re-authorization | `apps/core-app/app/(app)/repositories/page.tsx:536` and `app/(app)/invoices/new/page.tsx:1642` - `scopes: ['read:user', 'user:email', 'repo']` |
| Missing scope detected from response headers | `apps/core-app/lib/github/sources.ts:48-51` and `:338-339` - `response.headers.get('x-oauth-scopes')` |

### Answers from Nick (2026-08-25)

Claims that entered this draft from Nick directly rather than from the repo. Everything here carries the same provenance line: **Nick, direct answer, 2026-08-25.**

| Claim | Evidence / caveat |
| --- | --- |
| Merged PRs to a Stripe draft takes about 5 minutes in Nick's own use | Nick, direct answer, 2026-08-25 - firsthand measurement. Same figure as `apps/marketing/components/social-proof.tsx:52-55` |
| About 3 hours a month saved versus reconstructing invoices by hand | Nick, direct answer, 2026-08-25 - firsthand measurement. Same figure as `social-proof.tsx:75-78` |
| Pro is $9.99 and Team is $14.99, both currently carrying the founder's 30% discount; a lifetime deal also exists | Nick, direct answer, 2026-08-25. **Conflicts with both in-repo sources** - `README.md` lists Pro at $19.99/$14.99 and `docs/product-marketing-context.md` (2026-04-01) lists Pro at $12.99/$9.99, and neither names a Team tier at $14.99 or a lifetime deal. Nick's figures are the current ones; the repo docs are stale. Not quoted in sections 2-4 |
| Patch excerpts and commit messages are run through the redactor | Nick, direct answer, 2026-08-25 - **assumed fixed as diffbill #157.** Verify before publish |
| Trust-section copy corrected: short diff excerpts read and stored; diffbill never writes rather than cannot | Nick, direct answer, 2026-08-25 - **assumed fixed as diffbill #156.** Verify before publish |
| Revoking GitHub access actually purges synced data | Nick, direct answer, 2026-08-25 - **assumed fixed as diffbill #158.** Verify before publish. Not claimed in sections 2-4 |
| The repo stays private by decision, for now | Nick, direct answer, 2026-08-25 |
| The portfolio captures are cleared: repo names are Nick's own, all rates and invoice amounts are development data | Nick, direct answer, 2026-08-25. Supersedes the redaction gate in the capture README |

---

## Open questions for Nick

**7. Two video decisions for you.** The wiring is now fully pinned in section 5, so nothing is blocked - but two judgment calls are yours. First, `client-portal.mp4` is 73 MB and `multi-repo.mp4` is 29.5 MB; if either goes on nickneely.dev they want re-encoding, and the changelog clips ship with no poster frame set, so one has to be chosen. Second - RESOLVED by Nick (2026-08-25): `hero.mp4` / `hero.webm` stay unused. The chosen video for the detail page is the marketing launch video (`diffbill-launch.mp4`, the homepage "How It Works" asset); it needs a poster frame and likely a re-encode for the page.

---

## Resolved (Nick, 2026-08-25)

**Assume-fixed set - read the pre-publish gate at the top before shipping this page.** Nick's direction is that questions 1, 2, 3 and 5b are all fixed in their ideal state, filed as diffbill issues **#156, #157 and #158**. This draft is written to the fixed state. It is not verified.

**1. The "commit diffs are never accessed" claim.** Fixed as diffbill **#156**: the trust section now describes what the code actually does - PR and issue metadata plus short excerpts of the changed lines, read and stored deliberately so every billed row has checkable provenance. The draft already used that framing; section 4's permissions decision now states the corrected version rather than flagging the gap. The frontdoor row blurb in `src/lib/projects.ts` still carries the old sentence and is owned by someone else - it needs the same correction and is outside this file's scope.

**2. Patch excerpts and commit messages are not redacted.** Fixed as diffbill **#157**: the redactor now runs over the whole enriched payload - body excerpt, commit messages, and diff excerpts - not only `bodyExcerpt`. Section 3's data-flow paragraph now says so, with a gated-sentence note at the end of the section.

**3. "Read-only permissions" is imprecise once `repo` is granted.** Fixed as diffbill **#156**: the copy now says diffbill never writes rather than that it cannot. Section 4's permissions decision carries that wording. The related suggestion in the original question - a test asserting the allowed set of GitHub paths, which would turn endpoint discipline from convention into architecture - was not part of Nick's answer and is not claimed anywhere on this page.

**4. Pricing.** Confirmed by Nick: **Pro $9.99, Team $14.99**, each currently carrying the founder's 30% discount, and a lifetime deal also exists. Recorded in the Facts register under "Answers from Nick" with its provenance. Not quoted in sections 2-4; the page still does not need prices. **Conflict worth knowing:** neither in-repo source matches - `README.md` says Pro $19.99/$14.99 and `docs/product-marketing-context.md` says Pro $12.99/$9.99, and no source names a Team tier or a lifetime deal. Nick's figures are current; the repo docs are stale and should be updated in diffbill.

**5. The two homepage numbers.** Un-excluded. "~5 min" and "3+ hrs saved per month" are real firsthand measurements Nick took in his own use, which satisfies "numbers are real or absent". They are now in section 2 with the attribution attached, and the attribution travels with them: if the figures ship, "measured by Nick in his own use" ships next to them.

**5b. The revoke-access deletion claim.** Fixed as diffbill **#158**: disconnecting GitHub now purges the synced data rather than soft-deleting the repository row. No page copy depends on this claim, so nothing in sections 2-4 changed; it is recorded because the gate covers all three issues together.

**6. Repo visibility.** Private, deliberately, for now. No GitHub link on the page, and section 6 records it as a decision rather than a gap.

**8. Screenshot redaction.** Gate lifted. The private repository names visible in the captures are Nick's own and he does not mind them shown; all rates and invoice amounts in the set are made-up development data. Section 5's blocking note is replaced with a dev-data clearance dated 2026-08-25. One rule survives it: `AGENTS.md` still requires written sign-off before naming a client, so a genuine client name in any capture needs blurring regardless of this clearance.
