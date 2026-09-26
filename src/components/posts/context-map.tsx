import { useId, useState } from "react";

import { useHydrated } from "@/lib/use-hydrated.ts";

/** The two honest choices a downstream context has. */
type Relationship = "conform" | "translate";

const relationships = {
  conform: {
    caption:
      "Conform: Checkout uses the ERP's model as-is, and its shapes spread through our code.",
    checkoutModel: "ERP's model",
    description:
      "The ERP sits upstream, and Checkout conforms to it, using the ERP's model directly. Warehouse sits downstream of both, acting on what Checkout decides and what the ERP releases.",
    edge: "its model, as-is",
    label: "Conform",
  },
  translate: {
    caption:
      "Translate: an anticorruption layer turns the ERP's model into ours at the border.",
    checkoutModel: "our model",
    description:
      "The ERP sits upstream. Its model reaches Checkout only through an anticorruption layer. Warehouse sits downstream of both, acting on what Checkout decides and what the ERP releases.",
    edge: "its model",
    label: "Translate",
  },
} as const satisfies Record<Relationship, Record<string, string>>;

const order: Relationship[] = ["translate", "conform"];

/**
 * The store's context map from "Domain-driven design in the age of AI": the
 * ERP upstream, Checkout below it, and Warehouse downstream of both. The
 * reader switches Checkout between conforming to the ERP and translating
 * through an anticorruption layer, and the picture and caption change with it.
 *
 * It is drawn as a narrow vertical column so the labels stay legible at phone
 * width. Every colour comes from `.context-map` in `src/styles.css`. The
 * switch renders only after hydration, the picture starts on "translate"
 * either way, and the change is a swap rather than an animation. The caption
 * is a live region, so the new relationship is announced too.
 */
export function ContextMap() {
  const hydrated = useHydrated();
  const [relationship, setRelationship] = useState<Relationship>("translate");
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const arrowId = `${id}-arrow`;
  const arrow = `url(#${arrowId})`;
  const current = relationships[relationship];
  const translating = relationship === "translate";

  return (
    <figure className="context-map">
      {hydrated ? (
        <fieldset className="context-map-switch">
          <legend className="sr-only">How Checkout relates to the ERP</legend>
          {order.map((option) => (
            <button
              aria-pressed={option === relationship}
              className="playground-button"
              key={option}
              onClick={() => {
                setRelationship(option);
              }}
              type="button"
            >
              {relationships[option].label}
            </button>
          ))}
        </fieldset>
      ) : null}
      <svg
        aria-labelledby={`${titleId} ${descriptionId}`}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an inline SVG has no semantic tag; this role exposes its title and desc as one image
        role="img"
        viewBox="0 0 360 380"
      >
        <title id={titleId}>Context map for the online store</title>
        <desc id={descriptionId}>{current.description}</desc>
        <defs>
          <marker
            id={arrowId}
            markerHeight="8"
            markerWidth="8"
            orient="auto-start-reverse"
            refX="7"
            refY="4"
          >
            <path className="context-map-arrowhead" d="M0,0 L8,4 L0,8 z" />
          </marker>
        </defs>

        <rect
          className="context-map-box"
          height="60"
          width="160"
          x="80"
          y="12"
        />
        <text className="context-map-name" x="160" y="40">
          ERP
        </text>
        <text className="context-map-role" x="160" y="60">
          upstream
        </text>

        <line
          className="context-map-edge"
          markerEnd={arrow}
          x1="160"
          x2="160"
          y1="72"
          y2={translating ? "122" : "152"}
        />
        <text className="context-map-edge-label" x="168" y="102">
          {current.edge}
        </text>

        {translating ? (
          <>
            <rect
              className="context-map-layer"
              height="30"
              width="200"
              x="60"
              y="124"
            />
            <text className="context-map-layer-label" x="160" y="144">
              anticorruption layer
            </text>
          </>
        ) : null}
        <rect
          className="context-map-box"
          data-conforming={translating ? undefined : ""}
          height="60"
          width="200"
          x="60"
          y="154"
        />
        <text className="context-map-name" x="160" y="182">
          Checkout
        </text>
        <text className="context-map-role" x="160" y="202">
          {current.checkoutModel}
        </text>

        <line
          className="context-map-edge"
          markerEnd={arrow}
          x1="160"
          x2="160"
          y1="214"
          y2="294"
        />
        <text className="context-map-edge-label" x="168" y="258">
          decides
        </text>

        <path
          className="context-map-edge"
          d="M240,42 H320 V326 H244"
          fill="none"
          markerEnd={arrow}
        />
        <text
          className="context-map-edge-label context-map-edge-label-vertical"
          transform="rotate(90 330 190)"
          x="330"
          y="190"
        >
          releases
        </text>

        <rect
          className="context-map-box"
          height="60"
          width="160"
          x="80"
          y="296"
        />
        <text className="context-map-name" x="160" y="324">
          Warehouse
        </text>
        <text className="context-map-role" x="160" y="344">
          downstream
        </text>
      </svg>
      {/* A polite live region, so switching the relationship is announced as
          well as drawn, like the outcome lines on the other examples. */}
      <figcaption aria-live="polite">{current.caption}</figcaption>
    </figure>
  );
}
