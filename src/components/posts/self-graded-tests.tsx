import { useState } from "react";

import {
  agentExamples,
  requirementExamples,
  runExamples,
} from "@/components/posts/refund-approval.ts";
import type { ExampleResult } from "@/components/posts/refund-approval.ts";
import { useHydrated } from "@/lib/use-hydrated.ts";

type Suite = "agent" | "requirement";

const suites = {
  agent: { examples: agentExamples, label: "Run the agent's tests" },
  requirement: {
    examples: requirementExamples,
    label: "Check the agreed example",
  },
} as const;

const order: Suite[] = ["agent", "requirement"];

function line(result: ExampleResult): string {
  const mark = result.passed ? "✓" : "✗";
  return `${mark} needsApproval(${result.amount}) → ${String(result.actual)}, expected ${String(result.expected)}`;
}

function summary(results: ExampleResult[]): string {
  const failed = results.filter((result) => !result.passed).length;
  return failed === 0
    ? `${results.length} passed.`
    : `${failed} failed. The code and its tests agree; the requirement doesn't.`;
}

/**
 * The self-graded test from "The agentic software gold rush": an agent wrote
 * `needsApproval` and its tests from the same misreading, so its suite passes
 * and the example agreed with the product owner fails. Both buttons run the
 * real function in `refund-approval.ts`.
 *
 * The controls render only after hydration; before that the figure shows the
 * requirement alone. Results swap in without motion, and the outcome is a
 * polite live region, like the other playgrounds.
 */
export function SelfGradedTests() {
  const hydrated = useHydrated();
  const [suite, setSuite] = useState<Suite | null>(null);
  const results = suite === null ? null : runExamples(suites[suite].examples);
  const failed = results?.some((result) => !result.passed) ?? false;

  return (
    <figure className="playground">
      <figcaption className="playground-label">
        The requirement, as agreed with the product owner:
      </figcaption>
      <p className="ticket-text">
        Refunds of $500 <span className="ticket-word">or more</span> need a
        manager&apos;s approval.
      </p>
      {hydrated ? (
        <>
          <div className="playground-controls">
            {order.map((option) => (
              <button
                aria-pressed={option === suite}
                className="playground-button"
                key={option}
                onClick={() => {
                  setSuite(option);
                }}
                type="button"
              >
                {suites[option].label}
              </button>
            ))}
          </div>
          <output
            className="playground-outcome ticket-outcome"
            data-threw={failed ? "" : undefined}
          >
            {results === null ? (
              "Run the agent's tests first."
            ) : (
              <>
                {results.map((result) => (
                  <span key={result.amount}>{line(result)}</span>
                ))}
                <span>{summary(results)}</span>
              </>
            )}
          </output>
        </>
      ) : null}
    </figure>
  );
}
