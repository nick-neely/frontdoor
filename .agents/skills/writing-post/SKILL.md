---
name: writing-post
description: "Writing, end to end: take an idea through fragments and a draft to a researched MDX Post built from figures."
disable-model-invocation: true
---

# Writing a Post

Take the user's idea all the way to a finished Post in `content/writing/`. Run the stages in order. Each ends on its completion criterion, and the user decides when the two writing stages are done.

Settle a short kebab-case **stem** with the user first (`gold-rush`). Every working file lives in `docs/writing/` under it: `<stem>-fragments.md`, `<stem>-draft.md`, and one `<stem>-research-<angle>.md` per research angle.

## 1. Fragments

Read `.agents/skills/writing-fragments/SKILL.md` and run it, with the user's idea as the first fragment and `docs/writing/<stem>-fragments.md` as the file.

Done when the user says the pile is complete.

## 2. Draft

Offer the two exploit skills and recommend one:

- **`writing-beats`**: one beat at a time, choose-your-own-adventure. Fits when the path through the pile is still open.
- **`writing-shape`**: commit to an opening, then grow it paragraph by paragraph. Fits when the argument is already clear.

Read the chosen skill's `SKILL.md` under `.agents/skills/` and run it, with `docs/writing/<stem>-draft.md` as the article file.

Done when the user says the draft is finished.

## 3. Research and build

Research and building run in parallel:

1. Choose the research angles and dispatch one background subagent per angle, following [RESEARCH.md](RESEARCH.md). Research is how a Post gains what the draft lacks: data, but also history, quotes, prior thinking, and the links that back up every name the draft drops.
2. While they work, build every figure that needs no outside data, following [FIGURES.md](FIGURES.md), and write the MDX around them.
3. As each subagent returns, read its research file in full, then add the charts, sourced lines, callouts, quotes, and links it supports.

The draft is the author's voice. Condense it, reorder it, add section headings, and pull sharp lines from the fragments; every claim in the Post traces to the draft, the fragments, or a research file. Frontmatter follows `src/lib/writing-schema.ts`, with today's date.

Done when every H2 section carries at least one figure, at least three figures are custom components where the reader acts, every research angle has been worked into the Post, and every outside number or quote in the Post appears verbatim in a research file as read on its primary source.

## 4. Verify

Run `pnpm fix`, then `pnpm validate`, which compiles and prerenders the Post. The gate never clicks anything, so then open the Post in `pnpm dev` and operate every control of every figure at 1280px and at 390px wide, confirming the page never scrolls sideways. Before each screenshot, set `document.documentElement.style.scrollBehavior = "auto"`: a smooth scroll still in flight captures two overlapping frames.

Done when the gate is green and every figure has been operated at both widths.

## 5. Hand back

Report the Post's path and dev URL, a table of each section and its figures, and a fact-check list: every research item the Post leans on that was read secondhand or marked UNVERIFIED, plus the slug and date chosen. Merging the PR publishes the Post, so the merge stays the user's call.
