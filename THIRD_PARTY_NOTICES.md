# Third-party source

The repository's MIT license applies to the original TanStack Start Template code. The source listed below remains under its upstream license.

- [`dmmulroy/anti-slop`](https://github.com/dmmulroy/anti-slop) supplies the vendored Oxlint plug-in source under `tools/oxlint/anti-slop`. It is distributed under the MIT license in `third_party/licenses/anti-slop-LICENSE`. The repository's installer skill is intentionally not included.

- [`pbakaus/impeccable`](https://github.com/pbakaus/impeccable) supplies the Impeccable skill under `.agents/skills/impeccable`, `.claude/skills/impeccable`, and `.cursor/skills/impeccable`, plus the companion Cursor agents under `.cursor/agents`. It is distributed under Apache License 2.0 in `third_party/licenses/impeccable-LICENSE`; its required attribution is preserved in `third_party/licenses/impeccable-NOTICE.md`. Keep the provider-native copies synchronized when upgrading it.

- [`qq15725/modern-screenshot`](https://github.com/qq15725/modern-screenshot) supplies the UMD browser capture bundle included within each Impeccable skill installation at `scripts/modern-screenshot.umd.js`. It is distributed under the MIT license in `third_party/licenses/modern-screenshot-LICENSE`.

- [`ateliertriay/bricolage`](https://github.com/ateliertriay/bricolage) supplies the static `assets/fonts/BricolageGrotesque-Bold.ttf`, used only by Satori when it renders a Post's social card at build time. It is distributed under the SIL Open Font License 1.1 in `third_party/licenses/bricolage-grotesque-OFL.txt`. The site itself serves the variable web font from `@fontsource-variable/bricolage-grotesque`; Satori cannot read variable or `woff2` faces, which is why a static `.ttf` is vendored alongside it.

- [`JetBrains/JetBrainsMono`](https://github.com/JetBrains/JetBrainsMono) supplies the static `assets/fonts/JetBrainsMono-Regular.ttf`, used for the same reason and in the same place. It is distributed under the SIL Open Font License 1.1 in `third_party/licenses/jetbrains-mono-OFL.txt`.

- [`paper-design/shaders`](https://github.com/paper-design/shaders) supplies `@paper-design/shaders-react`, the WebGL dither rendered inside the home page's opened front door. Unlike everything above it is an npm dependency rather than vendored source, but its code is redistributed minified in the site's client bundle, so its Apache License 2.0 terms apply to that artifact: the license is preserved in `third_party/licenses/paper-shaders-LICENSE` and its required attribution in `third_party/licenses/paper-shaders-NOTICE`.

- Most of the tool logos in `public/logos/` were retrieved from [`pheralb/svgl`](https://github.com/pheralb/svgl). svgl distributes logo files it does not own; each mark remains the trademark of its owner and is not covered by this repository's MIT license. They appear only on `/uses`, where each one sits beside the name of the tool it belongs to, and they identify those tools rather than implying any affiliation with or endorsement by their owners.

  - `zed.svg`, `zed-dark.svg` — Zed Industries
  - `cursor.svg`, `cursor-dark.svg` — Anysphere
  - `neovim.svg` — the Neovim project
  - `codex.svg`, `codex-dark.svg` — OpenAI
  - `anthropic.svg`, `anthropic-dark.svg` — Anthropic
  - `ghostty.svg` — the Ghostty project
  - `t3.svg`, `t3-dark.svg` — T3 Tools
  - `nextjs.svg`, `vercel.svg`, `vercel-dark.svg` — Vercel
  - `tanstack.svg` — the TanStack project
  - `electron.svg` — the Electron project (OpenJS Foundation)
  - `typescript.svg` — Microsoft
  - `neon.svg` — Neon
  - `drizzle.svg`, `drizzle-dark.svg` — Drizzle Team
  - `better-auth.svg`, `better-auth-dark.svg` — the Better Auth project
  - `tailwindcss.svg` — Tailwind Labs
  - `shadcn.svg`, `shadcn-dark.svg` — shadcn
  - `base-ui.svg`, `base-ui-dark.svg` — the Base UI project
  - `zod.svg` — the Zod project
  - `stripe.svg` — Stripe
  - `resend.svg`, `resend-dark.svg` — Resend
  - `upstash.svg` — Upstash
  - `vitest.svg` — the Vitest project
  - `playwright.svg` — the Playwright project (Microsoft)
  - `docker.svg` — Docker
  - `oxc.svg` — the Oxc project (fronts the shared Oxlint + Oxfmt entry; both are Oxc tools)
  - `posthog.svg`, `posthog-dark.svg` — PostHog
  - `turborepo.svg`, `turborepo-dark.svg` — Vercel

  The pairs are svgl's own light and dark cuts of the same mark, swapped by theme. Where svgl's own filenames disagree with that convention the routing in its `src/data/svgs.ts` decides: the T3 pair is stored there as `t3-dark.svg` for light grounds and `t3-light.svg` for dark ones, and Resend's pair is named for its ink rather than its ground, as `resend-icon-black.svg` and `resend-icon-white.svg`. In both cases the vendored copies carry this repository's naming instead. The files are otherwise unmodified, with three exceptions. Two are the same problem: svgl's light Zed file and its light shadcn/ui file paint with `currentColor`, which has nothing to inherit from inside an `<img>`, so each vendored copy names svgl's intended black directly. The third is PostHog, where svgl carries a single logomark rather than a pair, and that mark paints the hedgehog's face in flat `#000`, which vanishes against this site's dark ground. svgl does route a light and a dark cut of PostHog's wordmark, and those two files are byte-identical apart from that same `#000` becoming `#fff`, so `posthog-dark.svg` applies svgl's own swap to the logomark and alters nothing else.

- `ultracite.svg` and `ultracite-dark.svg` also come from the project rather than svgl, which does not carry Ultracite. The source is [`haydenbleasel/ultracite`](https://github.com/haydenbleasel/ultracite) at `apps/docs/public/logo.svg`. Its six paths all paint with `currentColor`, which inside an `<img>` has nothing to inherit, so each vendored copy names a colour directly: the black is the one the project's own `apps/docs/public/favicon.svg` names for the identical artwork, and the white is what `currentColor` already resolves to where the project renders this file on its dark docs pages. Nothing else is changed.

- `react-email.svg` is likewise the project's own, from [`resend/react-email`](https://github.com/resend/react-email). The mark it publishes at `apps/docs/logo/light.svg` is a wordmark in a `0 0 119 32` viewBox, near enough to four times as wide as it is tall that at the 18px this page renders it there is nothing left to read, so the vendored file is instead the square logomark the same repository ships as its favicon, at `apps/web/public/meta/favicon.svg`, unmodified. It plates its own black behind white artwork and is served to both themes.

- `herdr.svg` and `herdr-dark.svg` are the exception to the paragraph above: svgl does not carry Herdr, so the mark comes from the project itself, [`herdrdev/herdr`](https://github.com/herdrdev/herdr), at `website/assets/ram.svg`. It remains the trademark of its owner and is used on the same identifying terms as the marks above. Two modifications: the source file paints with `currentColor`, so each vendored copy names a colour directly, taking the pair Herdr's own plated `logo.svg` uses — `#303438` on light grounds, its `#d9dad8` plate colour on dark ones — and the `viewBox` is the `125 125 250 250` crop Herdr's own `favicon.svg` takes of the identical artwork, because the uncropped mark is illegible at the 18px this page renders it.
