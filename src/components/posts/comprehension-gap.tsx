import { useState } from "react";

import { useHydrated } from "@/lib/use-hydrated.ts";

type Author = "me" | "agent";

const authors = {
  agent: {
    caption:
      "An agent writes it: the hours come back, and the understanding never gets built. That's the comprehension gap.",
    code: "Written by the agent",
    label: "An agent writes it",
  },
  me: {
    caption:
      "I write it: the same four hours build the change and my picture of the system.",
    code: "Writing the change",
    label: "I write it",
  },
} as const satisfies Record<Author, Record<string, string>>;

const order: Author[] = ["me", "agent"];

/** What implementing used to teach, in the order it usually arrives. */
const understanding = [
  "Following dependencies",
  "Discovering constraints",
  "Reconsidering the design",
];

/**
 * The two jobs one stretch of implementation does, from "The agentic software
 * gold rush": one lane for the code and one for the understanding built while
 * writing it. Switching the author to an agent keeps the code lane and leaves
 * the understanding lane as outlines of what was skipped.
 *
 * The figure starts on "I write it" either way, and the switch renders only
 * after hydration. The change is a swap rather than an animation, and the
 * caption is a polite live region.
 */
export function ComprehensionGap() {
  const hydrated = useHydrated();
  const [author, setAuthor] = useState<Author>("me");
  const current = authors[author];
  const skipped = author === "agent";

  return (
    <figure className="playground comprehension-gap">
      <p className="playground-label">Four hours of implementation</p>
      {hydrated ? (
        <fieldset className="playground-controls">
          <legend className="sr-only">Who writes the change</legend>
          {order.map((option) => (
            <button
              aria-pressed={option === author}
              className="playground-button"
              key={option}
              onClick={() => {
                setAuthor(option);
              }}
              type="button"
            >
              {authors[option].label}
            </button>
          ))}
        </fieldset>
      ) : null}
      <dl className="comprehension-gap-lanes">
        <div className="comprehension-gap-lane">
          <dt>The code</dt>
          <dd>
            <span className="comprehension-gap-segment">{current.code}</span>
          </dd>
        </div>
        <div className="comprehension-gap-lane">
          <dt>The understanding</dt>
          <dd>
            {understanding.map((step) => (
              <span
                className="comprehension-gap-segment"
                data-skipped={skipped ? "" : undefined}
                key={step}
              >
                {step}
                {skipped ? <span className="sr-only"> (skipped)</span> : null}
              </span>
            ))}
          </dd>
        </div>
      </dl>
      <figcaption aria-live="polite" className="playground-outcome">
        {current.caption}
      </figcaption>
    </figure>
  );
}
