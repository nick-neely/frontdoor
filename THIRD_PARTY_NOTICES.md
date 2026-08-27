# Third-party source

The repository's MIT license applies to the original TanStack Start Template code. The source listed below remains under its upstream license.

- [`dmmulroy/anti-slop`](https://github.com/dmmulroy/anti-slop) supplies the vendored Oxlint plug-in source under `tools/oxlint/anti-slop`. It is distributed under the MIT license in `third_party/licenses/anti-slop-LICENSE`. The repository's installer skill is intentionally not included.

- [`pbakaus/impeccable`](https://github.com/pbakaus/impeccable) supplies the Impeccable skill under `.agents/skills/impeccable`, `.claude/skills/impeccable`, and `.cursor/skills/impeccable`, plus the companion Cursor agents under `.cursor/agents`. It is distributed under Apache License 2.0 in `third_party/licenses/impeccable-LICENSE`; its required attribution is preserved in `third_party/licenses/impeccable-NOTICE.md`. Keep the provider-native copies synchronized when upgrading it.

- [`qq15725/modern-screenshot`](https://github.com/qq15725/modern-screenshot) supplies the UMD browser capture bundle included within each Impeccable skill installation at `scripts/modern-screenshot.umd.js`. It is distributed under the MIT license in `third_party/licenses/modern-screenshot-LICENSE`.

- [`ateliertriay/bricolage`](https://github.com/ateliertriay/bricolage) supplies the static `assets/fonts/BricolageGrotesque-Bold.ttf`, used only by Satori when it renders a Post's social card at build time. It is distributed under the SIL Open Font License 1.1 in `third_party/licenses/bricolage-grotesque-OFL.txt`. The site itself serves the variable web font from `@fontsource-variable/bricolage-grotesque`; Satori cannot read variable or `woff2` faces, which is why a static `.ttf` is vendored alongside it.

- [`JetBrains/JetBrainsMono`](https://github.com/JetBrains/JetBrainsMono) supplies the static `assets/fonts/JetBrainsMono-Regular.ttf`, used for the same reason and in the same place. It is distributed under the SIL Open Font License 1.1 in `third_party/licenses/jetbrains-mono-OFL.txt`.

- [`paper-design/shaders`](https://github.com/paper-design/shaders) supplies `@paper-design/shaders-react`, the WebGL dither rendered inside the home page's opened front door. Unlike everything above it is an npm dependency rather than vendored source, but its code is redistributed minified in the site's client bundle, so its Apache License 2.0 terms apply to that artifact: the license is preserved in `third_party/licenses/paper-shaders-LICENSE` and its required attribution in `third_party/licenses/paper-shaders-NOTICE`.

- The tool logos in `public/logos/` were retrieved from [`pheralb/svgl`](https://github.com/pheralb/svgl). svgl distributes logo files it does not own; each mark remains the trademark of its owner and is not covered by this repository's MIT license. They appear only on `/uses`, where each one sits beside the name of the tool it belongs to, and they identify those tools rather than implying any affiliation with or endorsement by their owners.

  - `zed.svg`, `zed-dark.svg` — Zed Industries
  - `cursor.svg`, `cursor-dark.svg` — Anysphere
  - `neovim.svg` — the Neovim project
  - `codex.svg`, `codex-dark.svg` — OpenAI
  - `anthropic.svg`, `anthropic-dark.svg` — Anthropic
  - `ghostty.svg` — the Ghostty project

  The pairs are svgl's own light and dark cuts of the same mark, swapped by theme. The files are otherwise unmodified, with one exception: svgl's light Zed file paints with `currentColor`, which has nothing to inherit from inside an `<img>`, so the vendored copy names svgl's intended black directly.
