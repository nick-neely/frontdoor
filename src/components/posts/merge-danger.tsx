import { useState } from "react";

import { useHydrated } from "@/lib/use-hydrated.ts";

type Reach = "contained" | "wide";
type Door = "two-way" | "one-way";
type Change = "label" | "logging" | "email" | "migration";

const quadrants = {
  "contained:one-way": "Waits for a person",
  "contained:two-way": "Proceeds on its own",
  "wide:one-way": "Waits for human judgment",
  "wide:two-way": "Proceeds with evidence",
} as const satisfies Record<`${Reach}:${Door}`, string>;

const changes = {
  email: {
    door: "one-way",
    label: "Email beta users",
    reach: "contained",
    why: "Few people see it, but a sent email can't be unsent. The agent drafts it and stops.",
  },
  label: {
    door: "two-way",
    label: "Rename a settings label",
    reach: "contained",
    why: "One screen changes, and a revert puts it back. Nobody needs to wait for me.",
  },
  logging: {
    door: "two-way",
    label: "Upgrade a logging library",
    reach: "wide",
    why: "Every service touches it, but a revert undoes it. It can proceed once the evidence shows the affected workflows ran.",
  },
  migration: {
    door: "one-way",
    label: "Drop a database column",
    reach: "wide",
    why: "A destructive migration reaches everything that reads that data, and there's no walking it back. This one waits for me.",
  },
} as const satisfies Record<
  Change,
  { door: Door; label: string; reach: Reach; why: string }
>;

const order: Change[] = ["label", "logging", "email", "migration"];
const doors: Door[] = ["two-way", "one-way"];
const reaches: Reach[] = ["contained", "wide"];

/**
 * The merge-danger grid from "The agentic software gold rush": blast radius
 * across, reversibility down, and what each quadrant lets an agent do. The
 * reader picks a change and the grid marks where it lands.
 *
 * The grid and its verdicts are the resting state, so the figure reads
 * completely before hydration. The changes render only after it. A pick marks
 * its quadrant in ink without motion, and the reason is a polite live region.
 */
export function MergeDanger() {
  const hydrated = useHydrated();
  const [change, setChange] = useState<Change | null>(null);
  const chosen = change === null ? null : changes[change];

  return (
    <figure className="playground merge-danger">
      <figcaption className="playground-label">
        Where a change lands decides who signs off
      </figcaption>
      {hydrated ? (
        <fieldset className="playground-controls ticket-choices">
          <legend className="playground-state">Pick a change:</legend>
          {order.map((option) => (
            <button
              aria-pressed={option === change}
              className="playground-button"
              key={option}
              onClick={() => {
                setChange(option);
              }}
              type="button"
            >
              {changes[option].label}
            </button>
          ))}
        </fieldset>
      ) : null}
      <table className="merge-danger-grid">
        <thead>
          <tr>
            <th scope="col">
              <span className="sr-only">Reversibility</span>
            </th>
            {reaches.map((reach) => (
              <th key={reach} scope="col">
                {reach === "contained" ? "Contained blast" : "Wide blast"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {doors.map((door) => (
            <tr key={door}>
              <th scope="row">
                {door === "two-way" ? "Two-way door" : "One-way door"}
              </th>
              {reaches.map((reach) => (
                <td
                  data-active={
                    chosen?.reach === reach && chosen.door === door
                      ? ""
                      : undefined
                  }
                  data-door={door}
                  key={reach}
                >
                  {quadrants[`${reach}:${door}`]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {hydrated ? (
        <output className="playground-outcome">
          {chosen === null
            ? "Each change lands in one quadrant."
            : `${quadrants[`${chosen.reach}:${chosen.door}`]}. ${chosen.why}`}
        </output>
      ) : null}
    </figure>
  );
}
