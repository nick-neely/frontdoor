import { useRef, useState } from "react";

import { Checkout } from "@/components/posts/checkout.ts";
import type { CheckoutStatus } from "@/components/posts/checkout.ts";
import { useHydrated } from "@/lib/use-hydrated.ts";

type Command = "cancel" | "startPicking";

/** What the last call did, in the words a console would use. */
type Outcome =
  | { command: Command; kind: "ok"; status: CheckoutStatus }
  | { command: Command; kind: "threw"; message: string };

function describe(outcome: Outcome): string {
  return outcome.kind === "ok"
    ? `${outcome.command}() → status is now "${outcome.status}"`
    : `${outcome.command}() threw: ${outcome.message}`;
}

/**
 * A live `Checkout` the reader can poke at. It holds one real aggregate and
 * calls its methods, so trying to cancel after picking starts throws the
 * invariant instead of quietly succeeding.
 *
 * The controls render only after hydration; before that the figure shows the
 * aggregate's resting state and nothing that looks pressable. Results swap in
 * without motion, and the outcome line is a polite live region so the answer
 * is announced as well as shown.
 */
export function CheckoutPlayground() {
  const hydrated = useHydrated();
  // The aggregate is not what renders; `status` is. A ref holds it, created on
  // first use so a render never builds a Checkout only to discard it.
  const aggregate = useRef<Checkout | null>(null);
  const checkout = () => {
    const current = aggregate.current ?? new Checkout();
    aggregate.current = current;
    return current;
  };
  const [status, setStatus] = useState<CheckoutStatus>("submitted");
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const run = (command: Command) => {
    try {
      checkout()[command]();
      setOutcome({ command, kind: "ok", status: checkout().status });
    } catch (error) {
      setOutcome({
        command,
        kind: "threw",
        message: error instanceof Error ? error.message : String(error),
      });
    }
    setStatus(checkout().status);
  };

  const reset = () => {
    aggregate.current = new Checkout();
    setStatus(aggregate.current.status);
    setOutcome(null);
  };

  return (
    <figure className="playground">
      <figcaption className="playground-label">
        Try it: a live <code>Checkout</code>
      </figcaption>
      <p className="playground-state">
        status: <span>&quot;{status}&quot;</span>
      </p>
      {hydrated ? (
        <>
          <div className="playground-controls">
            <button
              className="playground-button"
              onClick={() => {
                run("startPicking");
              }}
              type="button"
            >
              startPicking()
            </button>
            <button
              className="playground-button"
              onClick={() => {
                run("cancel");
              }}
              type="button"
            >
              cancel()
            </button>
            <button className="playground-button" onClick={reset} type="button">
              reset
            </button>
          </div>
          <output
            className="playground-outcome"
            data-threw={outcome?.kind === "threw" ? "" : undefined}
          >
            {outcome === null
              ? "Start picking, then try to cancel."
              : describe(outcome)}
          </output>
        </>
      ) : null}
    </figure>
  );
}
