import { useState } from "react";

import { useHydrated } from "@/lib/use-hydrated.ts";

type Meaning = "cart" | "checkout" | "salesOrder";

const meanings = {
  cart: {
    breaks:
      "Nothing gets cancelled. The customer already submitted, so their checkout goes ahead and ships.",
    label: "The cart",
    writes: "Code that empties the customer's cart.",
  },
  checkout: {
    breaks:
      "It's the closest guess, until the warehouse has started picking. Then the checkout says cancelled while a box is being packed.",
    label: "The checkout",
    writes: "Code that marks the submitted checkout as cancelled.",
  },
  salesOrder: {
    breaks:
      "The ERP owns that record. The store's checkout still says submitted, so the customer sees an order alive in one system and dead in the other.",
    label: "The sales order",
    writes: "Code that calls the ERP to cancel the sales order.",
  },
} as const satisfies Record<Meaning, Record<string, string>>;

const order: Meaning[] = ["cart", "checkout", "salesOrder"];

/**
 * The opening ticket of "Domain-driven design in the age of AI", with the
 * reader in the agent's seat: pick a meaning of "order" and see what that
 * guess builds and what it breaks. No answer is fully right, which is the
 * point the prose makes next.
 *
 * The choices render only after hydration; before that the figure is the
 * ticket and its question. A choice swaps the answer in without motion, and
 * the answer is a polite live region.
 */
export function OrderTicket() {
  const hydrated = useHydrated();
  const [meaning, setMeaning] = useState<Meaning | null>(null);
  const chosen = meaning === null ? null : meanings[meaning];

  return (
    <figure className="playground">
      <figcaption className="playground-label">
        You are the agent. The ticket says:
      </figcaption>
      <p className="ticket-text">
        Let customers cancel an <span className="ticket-word">order</span>.
      </p>
      {hydrated ? (
        <>
          <fieldset className="playground-controls ticket-choices">
            <legend className="playground-state">Which order?</legend>
            {order.map((option) => (
              <button
                aria-pressed={option === meaning}
                className="playground-button"
                key={option}
                onClick={() => {
                  setMeaning(option);
                }}
                type="button"
              >
                {meanings[option].label}
              </button>
            ))}
          </fieldset>
          <output className="playground-outcome ticket-outcome">
            {chosen === null ? (
              "Pick one. The code gives you no hint."
            ) : (
              <>
                <span>You write: {chosen.writes}</span>
                <span data-breaks="">What breaks: {chosen.breaks}</span>
              </>
            )}
          </output>
        </>
      ) : null}
    </figure>
  );
}
