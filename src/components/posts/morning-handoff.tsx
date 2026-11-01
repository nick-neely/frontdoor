import { useState } from "react";

import { useHydrated } from "@/lib/use-hydrated.ts";

type View = "log" | "evidence";

const views = {
  evidence: "Evidence and decisions",
  log: "A log of everything",
} as const satisfies Record<View, string>;

const order: View[] = ["log", "evidence"];

/** A night of agent work, as a transcript would hand it back. */
const log = [
  "read src/settings/labels.ts",
  "edit src/settings/labels.ts",
  "run pnpm test settings (pass)",
  "read package.json",
  "bump logging library",
  "run pnpm test (failed)",
  "read src/lib/logger.ts",
  "edit src/lib/logger.ts",
  "run pnpm test (pass)",
  "open browser /checkout",
  "write migrations/drop_legacy_column.sql",
  "run migration against a copy",
  "draft email to beta users",
  "read CONTEXT.md",
  "grep supervisor src/admin",
];

const evidence = [
  {
    items: [
      {
        detail: "Before-and-after screenshots of the settings screen.",
        title: "Renamed a settings label",
      },
      {
        detail:
          "A recording of checkout and sign-in running on the new version, with the test failures it fixed along the way.",
        title: "Upgraded the logging library",
      },
    ],
    title: "Finished inside the agreed boundaries",
  },
  {
    items: [
      {
        detail:
          "Written and run against a copy of the data. The real migration is a one-way door, so it stopped here.",
        title: "Drop a database column",
      },
      {
        detail: "Drafted, not sent. A sent email can't be unsent.",
        title: "Email beta users",
      },
    ],
    title: "Waiting for your judgment",
  },
  {
    items: [
      {
        detail:
          "The glossary says a manager approves refunds. The admin code calls that person a supervisor. Which one is right?",
        title: "A contradiction",
      },
    ],
    title: "Brought back to the team",
  },
];

/**
 * What a team returns to after agents worked overnight, from "The agentic
 * software gold rush". The reader switches between the transcript of what the
 * agents did and the same night sorted into what finished, what waits for a
 * person, and what the agents found. The changes are the ones from the
 * merge-danger grid earlier in the Post.
 *
 * Both views are ordinary lists. The figure starts on the log, the switch
 * renders only after hydration, and the swap has no motion.
 */
export function MorningHandoff() {
  const hydrated = useHydrated();
  const [view, setView] = useState<View>("log");

  return (
    <figure className="playground morning-handoff">
      <figcaption className="playground-label">
        The team is back. What&apos;s waiting?
      </figcaption>
      {hydrated ? (
        <fieldset className="playground-controls">
          <legend className="sr-only">How the night is handed back</legend>
          {order.map((option) => (
            <button
              aria-pressed={option === view}
              className="playground-button"
              key={option}
              onClick={() => {
                setView(option);
              }}
              type="button"
            >
              {views[option]}
            </button>
          ))}
        </fieldset>
      ) : null}
      {view === "log" ? (
        <>
          <ol className="morning-handoff-log">
            {log.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ol>
          <p className="playground-outcome">
            …and the rest of the night. Every step is here, and nothing says
            which ones matter.
          </p>
        </>
      ) : (
        <div className="morning-handoff-evidence">
          {evidence.map((group) => (
            <section aria-label={group.title} key={group.title}>
              <p className="compare-title">{group.title}</p>
              <ul>
                {group.items.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}.</strong> {item.detail}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </figure>
  );
}
