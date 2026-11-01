# Figures

A **figure** is any block other than prose that carries part of the argument. The reference Posts are `content/writing/domain-driven-design-in-the-age-of-ai.mdx` and `content/writing/agentic-software-gold-rush.mdx`; read one, and one of its components in `src/components/posts/`, before planning.

## Planning

Name each section's central claim, then pick its form, strongest first:

- **The reader's seat.** When a claim says a decision is harder or riskier than it looks, the reader makes that decision: pick the meaning of "order" (`order-ticket.tsx`), pick a change and see who signs off (`merge-danger.tsx`), run the agent's tests (`self-graded-tests.tsx`).
- **Live code.** When a claim is about how code behaves, the Post prints the code and the playground runs that same code from a sibling `.ts` file (`checkout.ts`, `refund-approval.ts`), so every result the reader triggers is real.
- **Toggle.** When a claim is a contrast within one picture, the reader switches between its two states (`context-map.tsx`, `comprehension-gap.tsx`, `morning-handoff.tsx`).
- **Chart.** When the research supplies comparable numbers. See [Charts](#charts).
- **Shared components** in `src/components/mdx-components.tsx`: `Process` for a four-step sequence, `Compare` for two sides, `Glossary` for terms, `Callout` for an aside. A GFM table suits three or more rows of the same shape, and a fenced block with a title and highlighted lines suits code.

Thread one illustrative scenario through several figures, so later figures call back to earlier ones: the refund rule from the tests figure reappears as the contradiction in the overnight handoff. Illustrative scenarios carry no counts of their own: a number in the Post is either the author's or sourced verbatim.

## Building a component

Every post component shares one anatomy:

- `src/components/posts/<name>.tsx`, a test beside it, and styles in `src/styles.css` next to the `.playground` rules, reusing `.playground`, `.playground-label`, `.playground-button`, and `.playground-outcome`.
- The resting state renders on the server and reads completely. Controls render once `useHydrated()` is true.
- A choice swaps state in place. Selected controls carry `aria-pressed`, and a short outcome line is a polite live region (`<output>` or `aria-live="polite"`).
- Marks use the ink and border tokens: a foreground border for the selected state, the muted fill for waiting or skipped. The accent stays on hover and focus.
- Semantic structure sits underneath: a real `<table>` for a grid, a `<dl>` for label and value, lists for lists, so the figure still reads without CSS.
- A doc comment names the Post the component belongs to and states its hydration and live-region behaviour.

A component reusable across Posts belongs in `mdx-components.tsx` instead, and gets a showing in `content/fixtures/writing-surface-fixture.mdx`.

## Charts

Load the `dataviz` skill before drawing. Draw in HTML and CSS or inline SVG so the server renders it; Recharts animates on mount and renders empty when prerendered.

- Print every value beside its mark. Group headings name the series, so colour never carries identity alone.
- When a toggle switches between datasets that are not comparable (different samples, different editions), keep one fixed scale across both and draw no trend between them.
- The caption links the primary source and names the sample. Where the data is observational, it says "correlation, not cause".

## Tests

One jsdom test file per component, asserting what the reader sees: the resting text, the outcome after a click, `aria-pressed`, and the live region. jsdom drops `calc()` inline widths, so assert printed values rather than bar geometry.
