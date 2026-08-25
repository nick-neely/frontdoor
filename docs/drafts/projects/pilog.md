# pilog - project detail page draft

Content draft for `/projects/pilog`. Not site code. Kind: Product. Status: Shipped. Row description this page must agree with (`src/lib/projects.ts`): "A local-first developer journal: capture rough notes in a global-hotkey scratchpad, then triage them into repo-aware GitHub issue drafts."

Every claim below traces to a row in the Facts register. Anything I could not source is either absent or listed under Open questions.

---

## 1. Dek

A local-first developer journal: catch the thought on a global hotkey, then turn the pile of rough notes into repo-aware GitHub issue drafts you review before anything gets published.

_Alternate, closer to the existing row:_ A local-first developer journal. Capture rough notes in a global-hotkey scratchpad, then triage them into repo-aware GitHub issue drafts.

---

## 2. What it is

You are three files deep in a change and you notice something unrelated. The save button has no loading state. The auth redirect looks wrong. Settings spacing broke on mobile. Filing it properly means leaving the editor, opening GitHub, picking a repo, writing a title that means something in six weeks, choosing labels. So you do not file it. You tell yourself you will remember, and you do not.

Pilog splits that into two moments that have nothing to do with each other. Capture is a markdown scratchpad on a global hotkey, `Cmd/Ctrl+Shift+Space` by default and rebindable. It is a frameless, always-on-top window with no chrome, no required fields, no repo picker, no label selector. You type the thought and it is gone from your attention. The window is kept alive and hidden rather than destroyed, so reopening it is a show, not a cold start. Triage happens later, on your schedule, in an inbox that has accumulated the pile. You select notes that belong to the same linked repository, hit Generate Drafts, and a local agent reads those notes alongside the actual repo before writing GitHub issue drafts: title, body, suggested labels drawn from that repo's real label vocabulary, acceptance criteria, affected files, a confidence level, and a short reason for why it grouped what it grouped. Five rough notes can become one issue or three. Each draft stays visibly anchored to the notes it came from. When a note is too vague to act on, the agent is allowed to say so and produce a clarification draft with questions instead of guessing; you answer and regenerate.

Nothing publishes itself by accident. Review-and-publish is the default path. Auto-publish exists, but it is per repository, off by default, and every gate on it is conservative out of the box: confirmation required, high confidence required, known affected files required, at most five issues per run, and every publish written to a local publish log. Pilog is MIT licensed and free, and its own site leads with "free and open-source, local-first developer journal." Local-first is the posture, not a limitation I am apologizing for: notes, drafts, repository metadata, and full agent run history live in a SQLite file on your machine, and credentials live in the OS keychain. The one boundary the product refuses to blur is the model call itself. If you point Pi at a local model, generation never leaves the machine. If you point it at a cloud provider, that provider sees what you send when you press Generate. The site says exactly that rather than selling "private" and hoping nobody asks.

---

## 3. How it's built

Pilog is an Electron desktop app: TypeScript throughout, React 19 in the renderer, electron-vite for the build, Tailwind CSS 4 with shadcn-style components over Base UI and Radix primitives, and CodeMirror 6 for the markdown editor. The window model is deliberate rather than incidental. The inbox and the scratchpad are two separate `BrowserWindow` instances, not one window with routing, because the scratchpad needs its own frame policy and its own always-on-top z-order independent of whatever the main window is doing. Both windows load their own React entry point through electron-vite's multi-page input and share a single preload script. The app boots into the system tray; the tray, the global hotkey, and the tray menu all call the same `openScratchpad()`.

Persistence is better-sqlite3 with Drizzle ORM, one file at `userData/pilog.sqlite`, WAL enabled and foreign keys enforced. Seven tables carry the whole product: notes, repos, repo indices, issue drafts, agent runs, publish log, and a settings key-value table. All of it lives in the Electron main process; the renderer never touches the database. The renderer never touches Electron either. Every request/response crossing that boundary goes through a single `IpcContract` type that maps channel names to request and response shapes, with the main-process handler registry and the preload bridge both typed against it, so adding a channel is a type error until you implement it. No raw `ipcRenderer` is exposed. The renderer sees one object, `window.pilog`.

GitHub integration is Octokit behind OAuth Device Flow. Packaged builds carry a public client ID and no client secret, which is the point: a distributable Electron app cannot keep a secret, so the flow was chosen to not need one. The access token is encrypted with Electron's `safeStorage` (Keychain, DPAPI, or libsecret depending on platform) and written to a file in `userData`. It never enters `pilog.sqlite`, and there is a test in the repo whose entire job is to assert that.

Draft generation runs on Pi, the open-source TypeScript agent framework, embedded as a library inside the Electron main process rather than shelled out to as a CLI. Structured output uses an exit tool: I register a tool called `submit_issue_drafts` whose parameter schema is the issue-draft shape itself, so the model's own tool-call validation and my persistence-side validation are the same schema applied once, and the first call to that tool is the run's result. Streaming to the renderer uses a `MessagePortMain` created per run, because port close is a free run-is-over signal; a separate one-bit `webContents.send` broadcast tells other windows to refresh their lists. The full native Pi event stream is persisted into `agent_runs` so the Agent Runs view can render the whole transcript when a run goes wrong, while the renderer only consumes a coarse four-case projection of it.

"Repo-aware" is a specific set of mechanics, not a vibe. Linking a repository builds a repo index snapshot: detected package manager, framework signals, important directories and their roles, and a summary of what was excluded. That snapshot goes into the prompt, along with the repo's real GitHub label vocabulary fetched through Octokit, so suggested labels are labels that exist. During the run the agent has eight read-only tools over the working tree: `read_file`, `list_dir`, `glob`, `grep` via ripgrep, and `git_status`, `git_diff`, `git_log`, `git_blame` via simple-git. Repository access goes through a descriptor rather than a raw path, which is how a Windows install can link and read a repo that lives inside WSL: the descriptor carries the distro and the Linux path, and tools execute through `wsl.exe` instead of hand-rolled UNC parsing at each call site.

---

## 4. Decisions worth defending

**The agent is read-only by construction, not by prompt discipline.** I embedded Pi's low-level agent core rather than its coding-agent SDK, specifically because the coding-agent SDK ships `edit`, `write`, and `bash` and a system prompt that assumes they exist. Filtering those out afterward gives you "read-only by tool-filter," which is a policy. Never registering them gives you a property. On top of that, every path argument is resolved against the linked repo root, `realpath`-resolved to defeat symlink escapes, checked for containment, and denied against `.git/objects`, `node_modules`, and anything matching `.env*` - and that check runs inside each tool's execute body, not in the prompt. The input to this agent is arbitrary text a user typed while distracted; prompt injection is the expected case, not the exotic one. The honest cost, written into the ADR: models bench better with `bash` available, so I am trading some output quality for a security property I can actually state. (`docs/adr/0005`, `src/main/pi/tools/sandbox.ts`)

**In-process, not a child process.** The reflexive answer for embedding an agent runtime is process isolation. I argued against it here because the usual reason does not apply: Pi is pure JavaScript over HTTP with no native dependencies, so there is no runtime boundary to bridge. Going through stdio JSON-RPC would add a serialize/parse layer for no behavioral gain, turn a synchronous `agent.abort()` into a round trip, and make BYOK credentials worse, since out-of-process means the API key has to travel through an environment variable, a config file, or a credential RPC instead of staying in main's heap. The accepted cost is no crash isolation, and I wrote down the specific conditions that would make me reverse this. There is also a runtime guard that snapshots `process.cwd`, `process.env`, `process.exit`, and signal-handler counts before a run and asserts they are unchanged after, because "it runs in my process" is a claim worth testing rather than assuming. (`docs/adr/0005`, `src/main/pi/runtime.ts`)

**Device Flow over loopback OAuth, and `safeStorage` over everything else.** A packaged desktop app cannot hold a client secret, so the packaged path uses Device Flow with a public bundled client ID and no secret in the artifact at all. The loopback flow still exists but is fenced behind a dev-only environment flag plus `is.dev` plus the presence of a secret. Tokens go to `safeStorage`, which means the encrypted blob is useless on any other machine or user account. Pilog also declines to share Pi's default `~/.pi/agent/auth.json`: that file is plaintext, and sharing it with a user's standalone `pi` install would put two writers on one file. Instead I implemented Pi's own `AuthStorage` interface against `safeStorage` - roughly sixty lines of storage-method bodies - and kept Pi's provider catalog, model catalog, and OAuth refresh as-is. Small adapter, no reimplementation. (`docs/adr/0004`, `docs/adr/0005` §3, `src/main/pi/auth-storage.ts`)

**Pi's version is pinned exactly, and travels with the app.** `@earendil-works/pi-agent-core`, `pi-ai`, and `pi-coding-agent` are pinned to an exact version with no caret range, bundled into the release, and shipped through the same electron-updater channel as everything else. There is no separate "update Pi" affordance and no version skew between a Pilog release and the agent runtime inside it. A ranged dependency could change tool-call semantics between two users running what they both believe is the same version of Pilog. Pinning makes the agent runtime part of Pilog's changelog. A boot-time assertion checks the runtime actually imported and disables Generate Drafts behind a visible banner if it did not, so a corrupted install surfaces at launch rather than at the moment someone finally tries to use the feature. (`docs/adr/0005` §7, `package.json`)

**Prompt quality gets a deterministic regression test.** The obvious failure mode for a feature like this is that a prompt edit silently degrades output and nobody notices for a month. So prompt changes are gated by a fixture-based loop: three fixture repos covering a focused bug, related notes that should stay grouped, and broad work that should split into a parent draft plus a clarification draft. Each fixture is copied into a temporary git repo, run through the real prompt builder, the real read-only tools, the real `submit_issue_drafts` validation, the real label matcher, and the real persistence path, then checked for draft count, source-note grouping, affected files, labels, acceptance criteria, template application, and clarification behavior. It makes no live model or GitHub calls, and it runs as part of `pnpm test`. The doc is explicit that this is a structural baseline and not a substitute for reading the generated issues yourself, which is the correct claim to make about it. (`docs/prompt-quality-loop.md`, `src/main/pi/prompt-quality-loop.ts`)

**The download page reads a static manifest, not the GitHub API.** GitHub Releases is the canonical artifact source; pilog.dev is a download path over it. The release workflow emits a repo-versioned JSON release manifest that the Next.js site imports at build time, so the download page never depends on GitHub API availability or on scraping asset filenames at request time. Releases are produced only by an explicit tag or manual dispatch, never by a push to main, because installers, checksums, and updater metadata need an intentional version gate. Preview and stable are separate update channels so prerelease artifacts cannot leak into stable installs. (`docs/adr/0006`, `site/src/data/release-manifest.json`, `.github/workflows/release-*.yml`)

---

## 5. Media inventory

**Confirmed, in the pilog repo:**

| Asset | Path | Notes |
| --- | --- | --- |
| App screenshot, tilted-paper treatment | `site/public/landing/pilog-app-screenshot-option-01-tilted-paper.png` | 1.7 MB PNG |
| App screenshot, editorial-flat treatment | `site/public/landing/pilog-app-screenshot-option-02-editorial-flat.png` | 1.9 MB PNG. This is the one the pilog README embeds, so it is the closest thing to a canonical hero |
| App screenshot, evening-desk treatment | `site/public/landing/pilog-app-screenshot-option-03-evening-desk.png` | 1.6 MB PNG |
| Same three screenshots, source variants | `design/screenshot-variants/` | Duplicates of the above |
| OG image options | `design/og-image/` | Three PNG options plus one optimized JPG |
| Pi mark and app icon | `site/public/pi-mark.png`, `site/public/pi-icon.png`, `resources/icon.png` | The Pi mark is the pilog hero imagery |
| Tray icon variants | `design/tray-variants/` | Light and dark previews, several variants |
| App icon variants | `design/icon-variants/` | Five explorations plus the chosen icon |

**Gaps:**

- All three landing screenshots show the same surface (the inbox with triage and draft generation). There is no image of the scratchpad, which is the product's defining gesture and the thing the first paragraph of this page describes.
- No image of the Draft Review surface, the Agent Runs transcript view, or Settings, all of which are the concrete evidence for the "show the source, always" and "you can see what leaves your machine" claims.
- No motion asset. The capture gesture is a two-second interaction and reads far better as a short loop than as a still. Note that `DESIGN.md` motion doctrine applies to how it is presented on the page: it cannot autoplay on scroll into view.
- Every screenshot is a full-window shot at large dimensions. They will need cropping and compression before they go into `public/screenshots/` on this site.
- `projects.ts` currently gives pilog no `featured` block, so there is no screenshot slot for it on the Projects list at all. If pilog gets one, option-02 is the pick.

---

## 6. Links

- **Live site:** https://pilog.dev
- **Source:** https://github.com/nick-neely/pilog - **repository is PUBLIC**, MIT licensed, so the GitHub link goes on the page. Verified with `gh repo view nick-neely/pilog --json visibility,url` on 2026-08-25.
- **Downloads:** https://pilog.dev/download, which currently routes to https://pilog.dev/preview
- **Latest release:** `v0.1.0-preview.5`, published 2026-05-22, macOS / Windows / Linux artifacts with published SHA-256 checksums

Caveat that affects how this page can be worded: there is **no stable release yet**. The release manifest has `stable: null`, the download page says "No stable release yet" in Pilog's own words, and all five published releases are prereleases. Builds are signing-ready but unsigned, so installers show an OS security warning. See Open questions.

---

## 7. Facts register

Every factual claim in sections 2 through 4, with its source. Paths are relative to `/home/neely/dev/pilog` unless noted. A claim with no row here gets cut.

| # | Claim | Source |
| --- | --- | --- |
| 1 | Capture and triage are deliberately separated | `PRODUCT.md`, "Product Purpose": "Pilog separates capture from triage" |
| 2 | The example frustrations (save button loading state, auth redirect, settings spacing) | `PRODUCT.md`, "Users" - quoted near-verbatim from the doc's own examples |
| 3 | Default global hotkey is `CommandOrControl+Shift+Space` | `src/shared/shortcuts.test.ts:12` asserts it; `src/shared/shortcuts.ts:82` exports it |
| 4 | The hotkey is rebindable | `src/main/hotkeys/register-global-hotkeys.ts` reads the `hotkey.scratchpad` setting and re-registers |
| 5 | Scratchpad is frameless, always-on-top, ~480x360, hidden rather than destroyed on close | `docs/adr/0002-window-architecture.md`, Decision |
| 6 | The scratchpad is a markdown editor with no required fields or pickers | `PRODUCT.md` Design Principle 1; CodeMirror markdown packages in `package.json` (`@codemirror/lang-markdown`, `codemirror`) |
| 7 | Selected notes must all belong to one linked repo to generate | `README.md`, "Pi Draft Generation", requirement 3 |
| 8 | Drafts carry title, body, labels, acceptance criteria, affected files, confidence, grouping reason | `src/main/db/schema.ts`, `issueDrafts` table columns |
| 9 | Suggested labels come from the repo's real GitHub label vocabulary | `src/main/db/schema.ts` `repos.githubLabels` / `githubLabelsSyncedAt`; `src/main/pi/issue-generation.ts:262` `formatRepoLabelVocabulary` |
| 10 | Drafts stay linked to their source notes | `schema.ts` `issueDrafts.sourceNoteIds`; `PRODUCT.md` Design Principle 2, "Show the source, always" |
| 11 | Vague notes produce a clarification draft with questions instead of a guess | `schema.ts` `issueDrafts.workflowState: 'needs_clarification'`, `clarificationQuestions`, `clarificationHistory`; `issue-generation.ts:149` prompt line "Mark vague notes as needing clarification."; regeneration path at `issue-generation.ts:396` and `:519` |
| 12 | Auto-publish is per repo, off by default, with conservative gates | `schema.ts` `repos` defaults: `autoPublishEnabled` false, `autoPublishRequireConfirmation` true, `autoPublishMinimumConfidence` 'high', `autoPublishRequireKnownAffectedFiles` true, `autoPublishMaxIssuesPerRun` 5, `autoPublishDryRun` false, `autoPublishDefaultLabel` 'triaged-by-pilog' |
| 13 | Every publish is written to a local publish log | `schema.ts` `publishLog` table; `README.md` feature list |
| 14 | MIT licensed | `LICENSE.md`; `gh repo view --json licenseInfo` returns `mit` |
| 15 | Site positioning line "free and open-source · local-first developer journal" | `site/src/components/landing/hero.tsx:28` |
| 16 | Notes, drafts, repo metadata, and agent run history live in local SQLite | `docs/adr/0001`; `src/main/db/schema.ts` |
| 17 | Cloud model providers see what you send on Generate; only a local model keeps generation on-machine | `site/src/components/landing/principles.tsx`, principle 03, verbatim |
| 18 | Electron + TypeScript + React 19 + electron-vite + Tailwind 4 + Base UI/Radix + CodeMirror 6 | `package.json` dependencies and devDependencies |
| 19 | Two separate `BrowserWindow` instances, chosen over single-window routing | `docs/adr/0002`, Options considered and Decision |
| 20 | Multi-page renderer build, shared preload script | `docs/adr/0002`, Decision |
| 21 | App boots into the tray; tray, hotkey, and menu share one `openScratchpad()` | `docs/adr/0002`, "Amendment: Tray-Driven Lifecycle" and Consequences |
| 22 | better-sqlite3 + Drizzle, `userData/pilog.sqlite`, WAL on, foreign keys enforced | `docs/adr/0001`, Decision |
| 23 | Seven tables: notes, repos, repo_indices, issue_drafts, agent_runs, publish_log, settings | `src/main/db/schema.ts` |
| 24 | Renderer never touches the database | `docs/adr/0001`, Consequences |
| 25 | Single typed `IpcContract`; adding a channel requires both type and handler; no raw `ipcRenderer`; renderer sees only `window.pilog` | `docs/adr/0003`, Decision and Consequences |
| 26 | GitHub auth is Device Flow with a public bundled client ID and no client secret in packaged builds | `docs/adr/0004`, Decision; `README.md`, "Setup" |
| 27 | Loopback OAuth is dev/test only, gated on env flag + `is.dev` + secret present | `docs/adr/0004`, Decision |
| 28 | Token encrypted with `safeStorage` (Keychain / DPAPI / libsecret) and stored in `userData`, never in SQLite | `docs/adr/0004`, Decision; `src/main/security/secrets.ts` |
| 29 | A test exists asserting no tokens land in the database | `src/main/security/no-tokens-in-db.test.ts` |
| 30 | Octokit is the GitHub client | `package.json` `@octokit/rest`; `src/main/github/client.ts` |
| 31 | Pi is embedded in-process in the Electron main process, not as a child process or CLI | `docs/adr/0005` §1; `src/main/pi/runtime.ts` imports `@earendil-works/pi-agent-core` directly |
| 32 | Pi is the open-source TypeScript agent framework `earendil-works/pi` | `docs/adr/0005`, Context |
| 33 | Structured output via the `submit_issue_drafts` exit tool; one schema serves both tool validation and persistence; first call ends the run | `docs/adr/0005` §2; `src/main/pi/issue-generation.ts:348` `createSubmitIssueDraftsTool` |
| 34 | `MessagePortMain` per run for streaming, `webContents.send` for cross-window invalidation | `docs/adr/0005` §4 |
| 35 | Full native Pi event stream persisted for the Agent Runs transcript; renderer gets a coarser four-case projection | `docs/adr/0005` §4 and Persistence; `schema.ts` `agentRuns.eventStream` |
| 36 | Repo index snapshot captures package manager, framework signals, important directories, exclusion summary | `src/main/repos/repo-indexer.ts`; `schema.ts` `repoIndices` |
| 37 | The repo index is fed into the generation prompt | `src/main/pi/issue-generation.ts:273` `formatRepoIndexForPrompt` |
| 38 | Eight read-only tools: `read_file`, `list_dir`, `glob`, `grep`, `git_status`, `git_diff`, `git_log`, `git_blame` | `docs/adr/0005` §5 tool table; `src/main/pi/tools/repo-tools.ts` |
| 39 | `grep` uses ripgrep; git tools use simple-git | `docs/adr/0005` §5; `package.json` `@vscode/ripgrep`, `simple-git` |
| 40 | Repository access descriptor supports host and WSL; Windows Pilog can read a WSL-hosted repo through `wsl.exe` | `docs/adr/0005` §5 "Repository access descriptor"; `README.md` "Windows App With WSL Repositories"; `schema.ts` `repos.accessKind` / `wslDistro` / `wslPath` |
| 41 | `bash`, `exec`, `write_file`, `edit_file`, `web_fetch`, and all git mutations are excluded by never being registered | `docs/adr/0005` §5, "Explicitly excluded" |
| 42 | Chose `pi-agent-core` + `pi-ai` over the coding-agent SDK because that SDK ships edit/write/bash and a matching system prompt | `docs/adr/0005` §2 and Rejected alternatives |
| 43 | Sandbox: paths resolved against repo root, `realpath`-resolved, containment-checked, denylisted against `.git/objects`, `node_modules`, `.env*`, enforced inside each tool body | `src/main/pi/tools/sandbox.ts` (`createRepoSandbox`, `assertRelativeAllowed`, `assertContained`); `docs/adr/0005` §5 "Sandbox property" |
| 44 | Accepted cost: models bench better with `bash`, traded for the read-only property | `docs/adr/0005` §5 Rationale and "Negative / accepted costs" |
| 45 | In-process rationale: pure JS over HTTP, no serialize/parse gain, synchronous abort, better BYOK hygiene | `docs/adr/0005` §1 |
| 46 | Accepted cost of in-process: no crash isolation, with documented conditions for revisiting | `docs/adr/0005`, "Negative / accepted costs" and "Conditions for revisiting" |
| 47 | Runtime guard snapshots cwd, env, `process.exit`, and signal-handler counts and asserts they are unchanged after a run | `src/main/pi/runtime.ts` `snapshotProcessState` / `assertProcessStateUnchanged` |
| 48 | Pilog implements Pi's `AuthStorage` against `safeStorage` rather than sharing `~/.pi/agent/auth.json`; roughly sixty lines of storage-method bodies; Pi's provider catalog, model catalog, and OAuth refresh reused as-is | `docs/adr/0005` §3 |
| 49 | Pi packages pinned to an exact version, no caret | `package.json`: `"@earendil-works/pi-agent-core": "0.74.0"`, `"@earendil-works/pi-ai": "0.74.0"`, `"@earendil-works/pi-coding-agent": "0.74.0"` |
| 50 | Pi ships through the same electron-updater channel; no separate Pi update path | `docs/adr/0005` §7 |
| 51 | Boot-time assertion disables Generate Drafts behind a banner if the runtime failed to import | `docs/adr/0005` §7 |
| 52 | Prompt quality loop: three fixtures, real prompt builder / real tools / real validation / real persistence, no live model or GitHub calls, runs in `pnpm test` | `docs/prompt-quality-loop.md`; `src/main/pi/prompt-quality-loop.ts`; `package.json` script `quality:prompt`; `src/main/pi/prompt-quality-loop.test.ts` |
| 53 | The loop's doc states it is a structural baseline, not a replacement for human review | `docs/prompt-quality-loop.md`, Interpretation rules |
| 54 | GitHub Releases is canonical; pilog.dev is the download path over it | `docs/adr/0006`, Decision |
| 55 | Site reads a static repo-versioned release manifest at build time, not the GitHub API at request time | `docs/adr/0006`, Decision and Rejected alternatives; `site/src/data/release-manifest.json`; `site/src/app/download/page.tsx` imports the JSON |
| 56 | Releases are tag- or dispatch-driven, never push-to-main | `docs/adr/0006`, Decision and Rejected alternatives; `.github/workflows/release-stable.yml` and `release-preview.yml` trigger on tags plus `workflow_dispatch` |
| 57 | Separate preview and stable update channels so prereleases cannot leak into stable installs | `docs/adr/0006`, "App Update Channels" and Rejected alternatives |
| 58 | The site is Next.js on Vercel, sharing a `@pilog/ui` workspace package with the app | `site/package.json`; `pnpm-workspace.yaml` |
| 59 | No stable release; five prereleases; latest `v0.1.0-preview.5` published 2026-05-22 | `gh release list -R nick-neely/pilog`; `site/src/data/release-manifest.json` has `"stable": null` |
| 60 | Builds are signing-ready but unsigned | `README.md`, "Build"; `site/src/app/download/page.tsx` copy; manifest artifact descriptions say "Unsigned" |
| 61 | Repo is public, MIT, created 2026-05-07 | `gh repo view nick-neely/pilog --json visibility,licenseInfo,createdAt` |

### Deliberately excluded

Things I found that read well but do not survive the "numbers are real or absent" rule:

- "A note captured in under three seconds" and "five rough notes become one to three drafts" (`PRODUCT.md`, Product Purpose) are stated success criteria, not measurements. They are targets Nick wrote for himself.
- "Re-open latency stays under 200 ms" (`docs/adr/0002`) is a design target in an ADR, not a benchmark result.
- `scripts/packaged-performance.cjs` defines millisecond budgets (6000 / 1000 / 750 / 1000 / 15000) and `scripts/packaged-size-budget.ts` defines size budgets. These are thresholds the harness compares against. No measured report is committed to the repo, so there is no measured number to quote.
- Star count is 0 and there are no download, install, or user numbers anywhere. No adoption claim of any kind belongs on this page. `PRODUCT.md` on this site says the same thing under Evidence on Hand.
- Repo size figures (450 commits, ~38k lines of TypeScript across `src/`, 65 test files, 7 e2e specs) are checkable but are effort proxies, not outcomes. I would leave them off a hiring-manager page; they invite the wrong comparison. Listed here in case Nick disagrees.

---

## Open questions for Nick

1. **Status and the stable-release gap.** `projects.ts` lists pilog as `status: "shipped"`, but pilog.dev's own download page says "No stable release yet" and every published artifact is an unsigned prerelease. A hiring manager who clicks through will hit that page. Three options: leave the status as Shipped and have this page say plainly that preview builds are the current distribution while signing is pending; change the status to `active`; or hold the detail page until v1.0 with signed builds. I lean toward the first, because naming the gap yourself reads as confidence and matches the site's "every claim resolves to something real" principle. Your call.

2. **`year: 2026` and the milestone date.** First commit is 2026-05-07 and the newest release is 2026-05-22, so 2026 is right. But pilog has no `updatedAt` in `projects.ts` while tendnote and diffbill do not either. If the detail page ships, is `2026-05-22` (the preview.5 release) the documented milestone worth putting in the home Update feed?

3. **The stray `v1.0.0` tag.** There is a git tag `v1.0.0` in the repo pointing at the commit "chore: bump version to 0.1.0-preview.1" from 2026-05-12, with no corresponding GitHub release. It looks like a mistake. Anyone browsing tags will see a 1.0.0 that is not a 1.0.0. Worth deleting before this page drives traffic to the repo.

4. **How much of Pi to name.** Naming Pi (`earendil-works/pi`, version 0.74.0) is honest and the ADR discussion is the most interesting engineering in the project. It also ties your product's story to a third-party framework's maturity. Name it, or describe it as "an embedded open-source agent runtime" and let the ADR link carry the detail?

5. **Scratchpad media.** Section 5 flags this: all three screenshots show the inbox, and none show the scratchpad, which is the gesture the whole page is about. Is there an existing capture, or should this page wait on one?

6. **Which decisions to keep.** Section 4 has six. Three or four is probably the right number for the page. My ranking: read-only by construction, in-process embedding, prompt quality loop, then Device Flow / `safeStorage`. The release manifest and the version pin are the two I would cut first.

7. **The privacy sentence.** Section 2 ends on the local-model-versus-cloud-provider boundary, lifted from pilog's own principle 03. It is the most credible paragraph on the page precisely because it declines to overclaim, but it is also the one that says "this thing sends your notes to a provider." Keep it at that prominence, or move it down?
