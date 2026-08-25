# tendnote — project detail page draft

Draft content for `/projects/tendnote`. Not site code. Audience: a technical hiring manager deciding whether Nick can be trusted with a real system.

Source repo: `/home/neely/dev/tendnote` @ `eac6af13` (main, 2026-08-23). Row this page must agree with: `src/lib/projects.ts` → `tendnote`, kind `product`, status `active`, year `2026`, url `https://tendnote.com`.

---

## 1. Dek

> A private, consent-first memory for the people you care about — where nothing an assistant infers becomes a durable fact until you approve it.

Alternates, if the page wants the row's narrower framing verbatim:

- _A private relationship memory and follow-up assistant, built so the model can only ever propose._
- _Relationship memory with a review step in the database, not just the prompt._

---

## 2. What it is

I kept losing the part of a relationship that isn't in any calendar: that Priya is shipping a launch on Monday, that Casey's birthday is in July, that I told Jordan I'd check in after his final interview. A CRM answers a different question — it tracks a pipeline, and people are not rows in a funnel. A notes app holds the detail but can't tell me which of the four hundred notes matters this morning. tendnote is the thing in between: a private notebook for people, plus a small, bounded shortlist of what's worth a thought today.

You capture from one composer — a note, a link, an open question, a reminder, a recurring chore — and tendnote files it into the right kind of record. A person page holds what you know about someone and where each fact came from. A daily shortlist pulls together due follow-ups, birthdays, overdue chores and review work. Eve, the built-in assistant, can read that context and talk about it, draft a message grounded in the memories that justify it, and propose things it noticed. What Eve cannot do is decide anything. There is no send path in the product at all: no email, no chat message, no post.

The privacy stance is the part I'd want inspected, because it's a database constraint rather than a promise in a system prompt. Every memory row is born `suggested` — that is the column default in the schema, not a convention. Approval is a status transition to `approved` that stamps `approvedAt` and writes an audit entry, and the code that performs it first reloads the row and refuses anything that isn't still a suggestion. A memory also cannot exist without provenance: the `source_record_id` foreign key is `NOT NULL` with `ON DELETE RESTRICT`, so the note a fact was drawn from cannot be deleted out from under it, and the review card can always show you the sentence you actually wrote. Sensitivity is inherited from that source record rather than supplied by the model, so a delicate note can't be laundered into an ordinary fact by the wording of a proposal. That is what "reviewed before it becomes memory" means here — and it is the same seam whether the suggestion came from background extraction, from Eve in conversation, or from a message captured in Discord.

---

## 3. How it's built

**Shape.** A pnpm/Turborepo monorepo: two apps over five shared packages. `apps/web` is the Next.js 16.3 App Router UI on React 19.2, Tailwind 4 and shadcn/Radix. `apps/agent` is Eve — its instruction set, tools, subagents, skills, channels and scheduled-workflow dispatcher. `packages/db` owns the Drizzle schema, migrations and every owner-scoped query; `packages/domain` holds shared Zod schemas; `packages/auth` is one Better Auth baseline so the web app and Eve verify identical sessions; `packages/rate-limit` and `packages/config` round it out. `@tendnote/db` deliberately has no root barrel — consumers import explicit subpaths so Eve's bundle stays lean.

**Storage.** Postgres with pgvector, via Drizzle. Redis backs sessions and rate-limit state. The durable spine is two tables: `source_records` (the evidence layer — a note, an interaction summary, a Discord capture) and `memories` (durable facts, each pointing back at the source record that grounds it). Follow-ups reconnect you with a _person_; General Actions are to-dos for _you_, with Routines as a General Action on a cadence; Saved Items are the honest fallback for things that don't fit a richer family yet; Assets are the things you own. Every record carries an owner, a visibility scope, and a sensitivity — and scope and sensitivity are kept as separate columns on purpose, because "how delicate is this" and "who may see it" are different questions.

**How memory actually works.** Capture writes a source record and enqueues a job. Extraction runs as a Postgres-owned job — a real table with attempts, `run_after`, `claimed_at` and a unique idempotency key, so it is inspectable and re-runnable rather than hidden in a queue. Extraction produces `suggested` memories, which land in a review queue that interleaves five families (suggested memories, suggested actions, asset review groups, source records and self-context facts) so no one family starves the others. On approval, an embedding job is scheduled and the fact becomes retrievable.

Retrieval runs in layers: precomputed context snapshots (explicitly a cache, never truth), Postgres full-text search over a generated `tsvector` column, pgvector semantic search over _approved_ memories and eligible records, and a unified asset search. The rule that makes this safe is ordering: owner, scope, sensitivity and lifecycle filters are applied **in the query, before any ranking** — never as a post-filter over a ranked list.

**Where the AI actually is.** Four places, each bounded. (1) Extraction runs through a replaceable LLM adapter in production, with a deterministic adapter for tests and offline development — the lifecycle was built and proven before a model was allowed near it. (2) Embeddings, through the AI Gateway. (3) Eve, the conversational agent, built on the `eve` framework and mounted same-origin into Next via `withEve()`, so the browser streams turns from `/eve/v1/*` with no separate agent URL and no CORS. Eve's subagents are narrow and proposal-only — `memory_curator` proposes cleanup, `relationship_strategist` proposes follow-ups, and `privacy_guard` reviews with no tools at all. (4) A presentation-only summary line on generated briefs; the brief's _contents_ are selected deterministically from the relationship agenda, and the model never chooses what goes in.

On Vercel, `/eve/v1/*` is routed to the Eve service _before_ Next filesystem routing, which means Next middleware never sees those requests. So Eve's own channel is the trust boundary: it verifies the Better Auth cookie itself, requires persisted beta access, charges the ingress rate-limit budget before any model work starts, and stamps only the verified user id onto the session principal.

**Scale, for calibration.** 459 commits over two months, 1,992 tracked TypeScript files of which 650 are tests, 77 committed migrations, 62 Eve eval files, and 238 architecture decision records.

---

## 4. Decisions worth defending

**A memory cannot exist without the note it came from.** `memories.source_record_id` is `NOT NULL` with `ON DELETE RESTRICT`. The shared mutation layer refuses provenance-free memories in normal product flows; only seeds and repair scripts may create controlled fallback source records. This started as a policy (ADR 0022) and was then pushed into the schema, because a policy that lives only in application code is one refactor from being optional. The payoff shows up in the UI: every review card can show the fact against the sentence that produced it, and no "remembered" fact is ever unattributable.

**Suggested is the default state, and approval is a transition — not a copy.** Observations and memories share one table with a lifecycle status (`suggested → approved | dismissed | archived`) rather than a separate ingestion table. That avoided building an ingestion subsystem before there was anything to ingest, while keeping the option to split noisy provider-derived candidates out later. The approval path reloads the row, refuses anything not still `suggested`, stamps `approvedAt`, and writes an audit entry — so "who promoted this to a fact, and when" is answerable after the fact.

**Deterministic enforcement beats a well-behaved model.** Scope is enforced in the query layer, so retrieval, search, Eve's tools and the UI all inherit it instead of each re-implementing it. The `privacy_guard` subagent exists — and holds no tools whatsoever. It can review phrasing for leakage; it cannot grant, widen or approve access. I'd defend this as the single most important structural choice in the project: the security boundary is a place in the code, not a paragraph in a prompt, and it was a precondition for adding household sharing at all (ADR 0137).

**The tool gate fails closed, including when the gate itself fails.** Eve's modes narrow which tools a turn may use, resolved from the principal the channel's auth stamped — never from message text. The implementation has a sharp edge worth naming: the framework lets a dynamic resolver _override_ an authored tool but not delete one, so withheld tools are rebound to a definition that runs nothing and explains why. Worse, the framework _skips_ a resolver that throws and runs the turn on the full authored tool set — so a crashing gate is a gate that fails open, on exactly the session whose principal it couldn't parse. The resolver therefore reads the principal defensively, catches its own resolution, and falls back to `restricted` (nothing available). That is a bug class you only find by reading the framework's behavior rather than trusting its API shape, and the reasoning is written down in the file.

**Publishing the prompt instead of treating it as a moat.** tendnote ships AGPL-3.0 with the full application source, the Eve instruction set, every tool and subagent definition, the ADR corpus and the eval suite. The instruction set is the most carefully authored artifact in the project and the most tempting to withhold — but it is extractable from any deployed instance by a determined user, so withholding it would forfeit a complete case study to protect something that was never actually keepable. Hosted differentiation is operational: a customer pays to avoid running Postgres, Redis, a queue, a scheduler and several OAuth apps. AGPL rather than BUSL because readers correctly decline to call source-available "open source", and the credibility was the entire reason to publish. A CLA is collected from the first external contribution, because reconstructing consent from forty contributors later is a project-halting event.

---

## 5. Media inventory

### Captured for this page

Captured 2026-08-25 from a local build at commit `eac6af13`, running against the local Docker Postgres with fixture data. 1440×900, PNG, light theme unless noted. All in `docs/drafts/projects/media/tendnote/`.

| File | Caption |
| --- | --- |
| `01-today-followups.png` | The daily surface: due reminders per person alongside one suggested follow-up awaiting accept-or-dismiss. |
| `02-review-queue.png` | The review gate. Every extracted fact sits as **Suggested** with Save and Dismiss; nothing here is a stored memory yet. **Lead image.** |
| `03-review-queue-dark.png` | The same review queue in dark theme — both themes are first-class. |
| `04-actions.png` | Actions and Routines: personal and household to-dos, filed into Areas, separate from person follow-ups. |
| `05-saved-items.png` | Saved Items, the deliberate fallback for a note that doesn't belong to a richer record family yet, with source grounding and promote-to-action. |
| `06-assets-empty-state.png` | The Assets empty state. Secondary at best — mostly whitespace; use only if the page wants an empty-state beat. |

Note for whoever places these: the assistant panel header in `01`–`03` reads "Saved privately, reviewed before it becomes memory" — the site blurb is the product's own words, verbatim. Worth cropping tight enough to keep legible.

### Already in the repo

Brand assets only — `apps/web/public/icons/`: `tendnote-mark-light.png`, `tendnote-mark-dark.png`, `tendnote-192.png`, `tendnote-512.png`, `tendnote-maskable-512.png`, `tendnote-badge-96.png`, `tendnote-favicon-{light,dark}.png`, `tendnote-source.png`. The repo's own publication audit confirms these nine PNGs are the only tracked binaries: "No screenshots, evidence uploads, or PDFs."

### Gaps — and one blocker

- **People directory and person detail page — cleared to capture, not yet captured.** These are the richest surfaces and the most obvious missing shots. I originally skipped them because the local database mixes fixtures with a real person: the People directory contains **"Juli" — Partner, Birthday February 10**, and the repo's own publication audit (`docs/phase-9a/publication-inventory.md`) identifies Juli as a real person whose name was replaced with the fixture "Mara" throughout the tree. **That blocker is now lifted.** Juli is Nick's girlfriend and gave explicit sign-off for her data appearing in these captures; Nick relayed it on **2026-08-25**, and the personal-data sign-off is on file per Nick as of that date. The captures themselves are still outstanding: relaunching the local dev server was refused by the sandbox permission layer on the follow-up attempt, so the shots could not be taken in this pass. Nothing about the data blocks them now — they need only a session permitted to start the dev server, and are a five-minute recapture.
- Eve chat mid-conversation — the assistant proposing a memory and the review card appearing inline. This is the product's best single demo and needs a live model turn plus a clean database.
- Global Recall / search (Ctrl-K) showing exact-before-related results.
- Household surface, and a scope selector showing private / shared / household.
- Mobile PWA shell — the product is mobile-first and no shot shows that.
- A short screen recording of capture → suggestion → approve would carry this page better than any still.

---

## 6. Links

- **Live:** https://tendnote.com — behind a private beta gate. Unadmitted visitors land on `/pending`; there is no free tier and hosted access is US-only at launch. A hiring manager clicking through will _not_ see the product. Flagged below.
- **Source:** https://github.com/nick-neely/tendnote — **PUBLIC**, so the GitHub link may ship on the page. Verified via `gh repo view`: `"visibility":"PUBLIC"`, `"isPrivate":false`, licence AGPL-3.0, created 2026-06-24.
- Optional deep link for technical readers: the Canonical Case Study, `docs/case-studies/tendnote-agent-built-privacy.md`.

---

## 7. Facts register

Every factual claim in sections 2–4, mapped to what I read. Paths are relative to `/home/neely/dev/tendnote`.

| # | Claim | Evidence |
| --- | --- | --- |
| 1 | Private, consent-first memory for people, things owned, and work | `README.md` opening |
| 2 | Not a CRM; no pipelines, lead scores, or autonomous outreach | `README.md` para 2; `apps/web/PRODUCT.md` "Anti-references" |
| 3 | One mobile-first composer classifies into supported record families | `README.md` "Capture, Today, and recall"; `docs/architecture.md` "Global Capture" |
| 4 | Today is a bounded, capped cross-domain shortlist | `docs/architecture.md` "Capture, Today, and Global Recall"; ADR 0196 |
| 5 | No email/chat/social send path exists anywhere in the product | `docs/security.md` "Message drafting and external actions" |
| 6 | Memory rows default to `suggested` | `packages/db/src/schema/app/memories.ts` — `status: memoryStatus("status").notNull().default("suggested")` |
| 7 | `memory_status` enum is suggested/approved/dismissed/archived | `packages/db/src/schema/app/enums.ts` — `memoryStatus` |
| 8 | Approval stamps `approvedAt` and writes an audit entry | `packages/db/src/queries/memories/review.ts` — `saveSuggestedMemory`, action `memory.review_save` |
| 9 | Approval refuses a row that is not still `suggested` | same file — `requireSuggestedMemory`, throws "Only suggested memories can be reviewed." |
| 10 | `source_record_id` is NOT NULL with ON DELETE RESTRICT | `packages/db/src/schema/app/memories.ts` |
| 11 | Provenance rule is an explicit decision, seeds excepted | ADR 0022 `docs/adr/0022-memory-writes-require-source-records.md` |
| 12 | Sensitivity is inherited from the source record, not model-supplied | `apps/agent/agent/tools/propose_suggested_memory.ts` doc comment |
| 13 | Eve proposes via the same seam; `capture_memory` is the explicit-request path | `apps/agent/agent/tools/propose_suggested_memory.ts`, `capture_memory.ts` |
| 14 | Discord capture writes a source record for review, never a memory | `docs/security.md` "Data capture and retrieval"; `docs/architecture.md` Discord |
| 15 | Turborepo, two apps over five shared packages | `docs/architecture.md` "Workspace"; `pnpm-workspace.yaml` |
| 16 | Next.js 16.3, React 19.2, Tailwind 4, Radix/shadcn | `apps/web/package.json` |
| 17 | Eve framework `eve@^0.32.0`; Better Auth; Vercel Queue; Drizzle; Zod | `apps/web/package.json`, `apps/agent/package.json` |
| 18 | Postgres + pgvector and Redis | `docker-compose.yml` (`pgvector/pgvector:pg17`, `redis:7-alpine`); `docs/architecture.md` |
| 19 | `@tendnote/db` has no root barrel, on purpose | `docs/architecture.md` "Import direction" |
| 20 | Source records are the evidence layer; memories point back to them | ADR 0005; `packages/db/src/schema/app/source-records.ts` |
| 21 | Follow-ups (person) vs General Actions (owner); Routines are cadenced Actions | `docs/architecture.md` "Data model at a glance"; ADR 0143, 0148 |
| 22 | Saved Items are the narrow grounded fallback | ADR 0204; `docs/architecture.md` |
| 23 | Scope and sensitivity are separate columns by decision | ADR 0054; `memories.ts` / `source-records.ts` carry both |
| 24 | Extraction jobs are Postgres-owned with attempts/run_after/idempotency key | `packages/db/src/schema/app/source-records.ts` — `extractionJobs`, `actionExtractionJobs`; ADR 0018 |
| 25 | Review queue interleaves five families | `apps/web/src/lib/review-queue.ts` — `ReviewQueueFamily`; `review-queue.server.ts` |
| 26 | Approval schedules an embedding job | `packages/db/src/queries/memories/review.ts` — `scheduleApprovedMemoryEmbedding` |
| 27 | Context snapshots are a rebuildable cache, never truth | ADR 0009, 0180; `docs/architecture.md` |
| 28 | Full-text search uses a generated tsvector column | `packages/db/src/schema/app/memories.ts` — `searchVector ... generatedAlwaysAs(to_tsvector(...))` + GIN index |
| 29 | Filters apply in the query before ranking | `docs/security.md` "Filter before rank"; `docs/architecture.md` "Retrieval and background jobs" |
| 30 | LLM extraction is the production path; deterministic adapter for tests/offline | ADR 0063, ADR 0020; `docs/architecture.md` |
| 31 | Eve mounted same-origin via `withEve()`; no CORS, no separate agent URL | ADR 0061; `docs/architecture.md` "Web chat to Eve"; `apps/web/next.config.ts` |
| 32 | Subagents are proposal-only; `privacy_guard` has no tools | `docs/architecture.md` "Eve"; ADR 0123, 0125, 0137 |
| 33 | Brief contents are deterministic; LLM summary line is presentation-only | ADR 0062; `docs/architecture.md` "Scheduled workflows" |
| 34 | `/eve/v1/*` routes before Next filesystem routing, so the Eve channel is the trust boundary | `docs/security.md` "The hosted Eve boundary"; ADR 0194 |
| 35 | Eve channel verifies cookie, requires beta access, charges ingress budget before model work | `docs/security.md` (numbered list) |
| 36 | Scope enforced in the query layer, inherited by retrieval/search/Eve/UI | `docs/security.md` "Scope and visibility"; `docs/architecture.md` "Household scope" |
| 37 | Mode gate: withheld tools rebound, not deleted; framework can't delete an authored tool | `apps/agent/agent/tools/eve_mode_gate.ts` doc comment |
| 38 | A throwing resolver is skipped and fails open; gate catches itself and falls back to `restricted` | same file — "Why nothing in here is allowed to throw"; `RESTRICTED_PLAN` |
| 39 | Mode resolved from the channel-stamped principal, not message text | `docs/architecture.md` "Eve"; ADR 0128 |
| 40 | AGPL-3.0; full source, instruction set, ADRs and eval suite published | ADR 0224; `LICENSE`; `package.json` `"license": "AGPL-3.0-only"` |
| 41 | Instruction set published because it is extractable anyway | ADR 0224 |
| 42 | Hosted differentiation is operational, not the prompt | ADR 0224 "Consequences" |
| 43 | CLA from the first external pull request | ADR 0224; `CONTRIBUTING.md` |
| 44 | 459 commits, 2026-06-24 → 2026-08-23 | `git rev-list --count HEAD`; `git log` first/last |
| 45 | 1,992 tracked .ts/.tsx files; 650 tracked test files | `git ls-files '*.ts' '*.tsx'` / `'*.test.ts' '*.test.tsx'` |
| 46 | 77 committed migrations | `git ls-files 'packages/db/migrations/*.sql'` |
| 47 | 62 Eve eval files | `git ls-files '*.eval.ts'` |
| 48 | 238 ADRs | `git ls-files 'docs/adr/*.md'` minus README |
| 49 | Private beta gate; `/pending`; no free tier; US-only at launch | ADR 0067, ADR 0226; `docs/security.md` "Identity and access" |
| 50 | Repo is public, AGPL-3.0, created 2026-06-24 | `gh repo view nick-neely/tendnote --json visibility,url,licenseInfo,createdAt` |
| 51 | Nine tracked brand PNGs; no screenshots in repo | `docs/phase-9a/publication-inventory.md` "Tracked binaries"; `git ls-files` image sweep |
| 52 | "Juli" is a real person; current tree uses fixture "Mara" | `docs/phase-9a/publication-inventory.md` finding 1 |

**Claims deliberately not made:** no user counts, no adoption or revenue figures, no performance benchmarks, no uptime. None are documented anywhere in the repo, and `PRODUCT.md` forbids inventing them.

---

## Open questions for Nick

1. **The live link doesn't demo the product.** `tendnote.com` is behind the private beta gate, so a hiring manager who clicks lands on `/pending`. Options: label the link "private beta" on the row, point the primary CTA at the public GitHub repo instead, or add a screenshot-led walkthrough on this page so the page _is_ the demo. My recommendation is the third plus an honest "private beta" label.

2. **The row description is now narrower than the product.** `projects.ts` says "relationship memory and follow-up assistant". The product also ships Assets (things you own), General Actions and Routines, Household workspaces, and Google/Gmail/Contacts/Discord integrations. Do you want the row widened, or is relationship memory the deliberate headline with the rest as depth on this page?

3. **Do you want the eval result on the page?** The Canonical Case Study preserves an exact deterministic run — `google/gemini-3.7-flash`, **52 passed, 8 failed, 0 skipped, 0 errored across 60 cases**, exit code 1 — explicitly classified as exploratory evidence rather than a clean qualification pass. Publishing a failing gate verbatim is unusual and, in the right frame, extremely credible. It is also easy to misread out of context. Your call; I left it out of the body.

4. **Same question for the "~15% of the code" disclosure.** The case study states you have personally read roughly 15% of the code, and that this is the suite's first Phase 9a evaluation. It's the most striking honest thing in the repo. On a hiring page it could read as either unusual integrity or a liability, depending entirely on framing. Left out of the body pending your call.

5. **Person-level screenshots are unblocked but still outstanding.** Juli's explicit sign-off (relayed by Nick, 2026-08-25) removes the consent problem that made me skip the People directory and person detail page, and that sign-off is recorded in the Media inventory above. The remaining obstacle is purely mechanical: the sandbox refused to relaunch the local dev server on the follow-up attempt, so the shots were not taken. Re-run in a session permitted to start `next dev` and the People directory, person detail, Eve chat, and Global Recall captures all follow quickly. Worth deciding then whether the person detail shot features Juli (richest real context) or a fixture person such as Priya Shah (cleaner for a public page); my inclination is a fixture person for the detail shot, with Juli's consent covering the People directory where her row is simply present.

6. **Confirm the Neon pointer is intentional.** `apps/web/.env.local` sets `DATABASE_URL` to a Neon `neondb` instance, so a plain `pnpm dev` runs the local app against a _remote_ database. I overrode it to the local Docker Postgres for this work. If that Neon database holds real relationship data, running local dev unmodified points a development build at it — worth a second look independent of this page.

7. **Status wording.** The row says `active` / 2026. Given publication landed and commercial surfaces are explicitly deferred (ADR 0228), is there a milestone date worth setting `updatedAt` to so tendnote appears in the home Update feed?
