import { useState } from "react";

import { useHydrated } from "@/lib/use-hydrated.ts";

type Edition = "2026" | "2025";

interface Metric {
  label: string;
  /** Percent change, verbatim from the report. */
  value: number;
}

interface Group {
  metrics: Metric[];
  title: string;
}

/**
 * Faros AI's figures for teams with high AI adoption, verbatim from each
 * report and sourced in `docs/writing/gold-rush-research.md`. The two editions
 * are different samples, so the chart shows one at a time rather than drawing
 * a trend between them.
 */
const editions = {
  "2025": {
    groups: [
      {
        metrics: [
          { label: "Tasks completed", value: 21 },
          { label: "Pull requests merged", value: 98 },
        ],
        title: "Output",
      },
      {
        metrics: [{ label: "PR review time", value: 91 }],
        title: "Review",
      },
    ],
    href: "https://www.faros.ai/blog/ai-software-engineering",
    label: "2025 report",
    source:
      "The AI Productivity Paradox (2025): over 10,000 developers on 1,255 teams.",
  },
  "2026": {
    groups: [
      {
        metrics: [
          { label: "Task throughput per developer", value: 33.7 },
          { label: "PR merge rate per developer", value: 16.2 },
        ],
        title: "Output",
      },
      {
        metrics: [
          { label: "Median wait for a first review", value: 156.6 },
          { label: "Median time in PR review", value: 441.5 },
        ],
        title: "Review",
      },
    ],
    href: "https://pages.faros.ai/hubfs/AI_Engineering_Report_2026_The_Acceleration_Whiplash_Faros.pdf",
    label: "2026 report",
    source:
      "The Acceleration Whiplash (2026): 22,000 developers on 4,000 teams, analysis as of March 2026.",
  },
} as const satisfies Record<
  Edition,
  { groups: Group[]; href: string; label: string; source: string }
>;

const order: Edition[] = ["2026", "2025"];

/**
 * One scale for both editions, so switching never makes a smaller change
 * look as long as a larger one.
 */
const scaleMax = 450;

const percent = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  signDisplay: "always",
});

/**
 * The opening chart of "The agentic software gold rush": how much output and
 * review time changed on teams with high AI adoption, in Faros AI's telemetry.
 *
 * A single series of horizontal bars, every value printed beside its bar, so
 * the bars are decoration over a list a screen reader reads in full. Output
 * and review are told apart by their group headings first and their ink
 * second. The figure starts on the newest report, the switch renders only
 * after hydration, and switching swaps the bars without motion.
 */
export function ReviewBottleneckChart() {
  const hydrated = useHydrated();
  const [edition, setEdition] = useState<Edition>("2026");
  const current = editions[edition];

  return (
    <figure className="playground bar-chart">
      <p className="playground-label">
        Change on teams with high AI adoption, from Faros AI&apos;s telemetry
      </p>
      {hydrated ? (
        <fieldset className="playground-controls">
          <legend className="sr-only">Which report</legend>
          {order.map((option) => (
            <button
              aria-pressed={option === edition}
              className="playground-button"
              key={option}
              onClick={() => {
                setEdition(option);
              }}
              type="button"
            >
              {editions[option].label}
            </button>
          ))}
        </fieldset>
      ) : null}
      {current.groups.map((group) => (
        <section
          aria-label={group.title}
          className="bar-chart-group"
          data-group={group.title.toLowerCase()}
          key={group.title}
        >
          <p className="bar-chart-group-title">{group.title}</p>
          <dl>
            {group.metrics.map((metric) => (
              <div className="bar-chart-row" key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>
                  <span
                    aria-hidden="true"
                    className="bar-chart-bar"
                    style={{
                      width: `calc((100% - 5rem) * ${metric.value / scaleMax})`,
                    }}
                  />
                  <span className="bar-chart-value">
                    {percent.format(metric.value)}%
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <figcaption aria-live="polite" className="playground-outcome">
        <a
          className="link-underline-resting"
          href={current.href}
          rel="noreferrer"
        >
          {current.source}
        </a>{" "}
        Each team&apos;s quarters of lowest and highest AI adoption, compared.
        Correlation, not cause.
      </figcaption>
    </figure>
  );
}
