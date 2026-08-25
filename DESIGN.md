# Design

The site is typography-driven, dark by default, and confident rather than decorated. Personality comes from type scale, a single accent, and restraint everywhere else. The closest reference is daverupert.com; rauno.me is an explicit non-goal, because selling visual craft is not the differentiator here.

## Tokens

Semantic colours live in `src/styles.css`. Component interfaces never encode a colour.

- **Background**: warm off-black, not pure black. Light theme is a warm off-white, not pure white.
- **Accent**: signal amber `#F5A524`, used only for link underlines, status dots, hover and focus states, and code highlighting. One accent, used sparingly, is the whole colour story.
- **Type**: Bricolage Grotesque Variable for the display moment, Inter Variable for prose, JetBrains Mono Variable for navigation, dates, status tags, and metadata. All self-hosted and subset to latin.
- **Theme**: dark by default with a light toggle. Both are first-class; neither is an afterthought.

Monospace is a deliberate signal, not decoration. It carries the developer-tool heritage and is the reason the site needs no other reference to the terminal résumé it replaced.

## Motion doctrine

**Motion only ever confirms an action the reader took. Nothing moves because it scrolled into view.**

That single rule is the line between intriguing and generic. Sites that animate on arrival read as templates; sites that animate on interaction read as craft.

### Permitted, and this is the complete list

- Hover underline draw, about 120ms, in accent amber.
- The hero cursor blink, about 1.06s, an actual terminal cadence rather than a CSS default.
- Route-change view transitions, about 150ms, with a shared-element transition on a post title. This is the one place motion explains where the page went.
- `focus-visible` rings.
- One state transition on newsletter subscribe success.

### Banned

Scroll-triggered fade-up-stagger on section entry, cursor followers and trails, gradient mesh blobs, animated gradient text, letter-by-letter typing effects, scroll hijacking, count-up number animations, card tilt on hover, and gratuitous backdrop blur.

### Parallax

Permitted only as a bounded exception: a non-textual layer, at most 8% differential, transform-only, over a bounded scroll range. Anything the reader has to read stays fixed to the page. It ships behind a flag and is judged with eyes, not in a specification. If it reads cheap, it is deleted, and nothing else depends on it.

### Always

Every animation sits behind `prefers-reduced-motion`, and no animation is load-bearing for comprehension.

## Baseline

- Shared UI primitives live in `src/components/ui` and stay compatible with the shadcn CLI.
- Clear reading widths, restrained borders, one elevation level.
- Focus states, keyboard navigation, and responsive composition are requirements, not polish.
- Not-found and error states keep the shared shell and offer an obvious way back.
