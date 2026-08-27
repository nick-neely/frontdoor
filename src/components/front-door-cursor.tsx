import { useEffect, useRef, useState } from "react";
import type {
  AnimationEvent as ReactAnimationEvent,
  ComponentType,
  CSSProperties,
  MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";

import type { FrontDoorPortalProps } from "@/components/front-door-portal.tsx";
import { siteConfig } from "@/lib/site-config.ts";
import { cn } from "@/lib/utils.ts";

/**
 * The site's signature detail: the hero's blinking block cursor, which is also
 * the door in the site mark. It blinks at a terminal cadence until the reader
 * opens it, and behind it is the portal to this site's source repository.
 *
 * Every motion here is reader-triggered, which is the whole of `DESIGN.md`'s
 * doctrine: the blink, the hover crack, and the swing all live in
 * `src/styles.css` behind `prefers-reduced-motion`, and the component only
 * moves the state they key off. Nothing about the portal is load-bearing - the
 * page reads completely with the door shut.
 */

/** `aria-controls` needs a stable target, and there is one door per page. */
const portalId = "front-door-portal";

/**
 * The portal is a picture, so its name has to say both where it goes and that
 * going there is the point of the door. The visible caption can stay concise,
 * because by then the reader is already pointing at it.
 */
const portalName =
  "View the source of nickneely.dev in the frontdoor repository on GitHub";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

interface PortalTransit {
  destination: string;
  shaderOffsetX: number;
  shaderOffsetY: number;
  style: CSSProperties & {
    "--front-door-transit-radius": string;
    "--front-door-transit-start-scale": number;
    "--front-door-transit-x": string;
    "--front-door-transit-y": string;
  };
}

function canAnimatePortalClick(
  event: ReactMouseEvent<HTMLAnchorElement>
): boolean {
  const modified =
    event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

  return (
    event.button === 0 &&
    !modified &&
    !window.matchMedia(reducedMotionQuery).matches
  );
}

function portalTransitFrom(
  portal: HTMLAnchorElement,
  destination: string
): PortalTransit {
  const bounds = portal.getBoundingClientRect();
  const x = bounds.left + bounds.width / 2;
  const y = bounds.top + bounds.height / 2;
  const radius =
    Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    ) * 1.04;
  const portalRadius = Math.max(bounds.width, bounds.height) / 2;

  return {
    destination,
    // Paper's object UV uses half-width coordinates around the viewport
    // centre. Matching that system puts the shader's swirl under the doorway
    // rather than under the screen's generic midpoint.
    shaderOffsetX: x / window.innerWidth - 0.5,
    shaderOffsetY: y / window.innerHeight - 0.5,
    style: {
      "--front-door-transit-radius": `${radius.toFixed(2)}px`,
      "--front-door-transit-start-scale": portalRadius / radius,
      "--front-door-transit-x": `${x.toFixed(2)}px`,
      "--front-door-transit-y": `${y.toFixed(2)}px`,
    },
  };
}

/** The shader lives behind a dynamic import and takes no props. */
type PortalComponent = ComponentType<FrontDoorPortalProps>;

/**
 * One in-flight import per document, kept at module scope so closing the door
 * and opening it again is instant rather than a second network round trip.
 */
let portalChunk: Promise<PortalComponent> | null = null;

async function importPortal(): Promise<PortalComponent> {
  const chunk = await import("./front-door-portal.tsx");

  return chunk.FrontDoorPortal;
}

async function loadPortal(): Promise<PortalComponent> {
  portalChunk ??= importPortal();

  return await portalChunk;
}

/** Asked once per document; the answer cannot change while the page lives. */
let webGl2Available: boolean | null = null;

/**
 * Whether this browser can light the portal at all.
 *
 * Paper's shader mount throws from an unawaited promise when the context is
 * refused, which lands as an unhandled rejection rather than something an
 * error boundary can catch. Asking first is what keeps an old device, a
 * blocked GPU, or a headless renderer on the plain dark doorway with no
 * console noise and no missing link.
 */
function canLightThePortal(): boolean {
  if (webGl2Available !== null) {
    return webGl2Available;
  }

  // Checked before the probe because it is free, and because it is the check
  // that keeps jsdom from being asked for a canvas it does not implement.
  if (!("WebGL2RenderingContext" in window)) {
    webGl2Available = false;
    return false;
  }

  try {
    const context = document.createElement("canvas").getContext("webgl2");

    // The probe is released immediately: a browser only allows a handful of
    // live contexts, and the one the portal actually draws in should not be
    // competing with this one for a slot.
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    webGl2Available = context !== null;
  } catch {
    webGl2Available = false;
  }

  return webGl2Available;
}

interface FrontDoorCursorProps {
  className?: string;
}

export function FrontDoorCursor({ className }: FrontDoorCursorProps) {
  // Closed on the server and closed on the first client paint, so there is
  // nothing for hydration to disagree about.
  const [open, setOpen] = useState(false);
  // Null until the chunk lands, which is what the plain dark doorway is for.
  const [portal, setPortal] = useState<PortalComponent | null>(null);
  const [transit, setTransit] = useState<PortalTransit | null>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigationStartedRef = useRef(false);

  useEffect(() => {
    function clearRestoredTransit(event: PageTransitionEvent) {
      if (!event.persisted) {
        return;
      }

      // Back/forward cache revives the exact React tree that navigated away,
      // including the completed black overlay. Remove it as the page becomes
      // visible again so browser Back returns to the homepage beneath it.
      navigationStartedRef.current = false;
      setTransit(null);
    }

    window.addEventListener("pageshow", clearRestoredTransit);

    return () => {
      window.removeEventListener("pageshow", clearRestoredTransit);
    };
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      setOpen(false);

      // Focus is only reclaimed when it was inside the door - most often on
      // the portal that is about to stop existing. A reader who pressed Escape
      // from elsewhere on the page keeps their place.
      if (rootRef.current?.contains(document.activeElement) === true) {
        buttonRef.current?.focus();
      }
    }

    // Only while the door is open, so Escape stays free everywhere else.
    if (open) {
      document.addEventListener("keydown", closeOnEscape);
    }

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    let fallback: number | undefined;

    if (transit !== null) {
      // `animationend` is the normal handoff. This fallback keeps navigation
      // functional if the browser drops the animation after it has begun (for
      // example, when the motion preference changes during the transition).
      fallback = window.setTimeout(() => {
        if (!navigationStartedRef.current) {
          navigationStartedRef.current = true;
          window.location.assign(transit.destination);
        }
      }, 900);
    }

    return () => {
      if (fallback !== undefined) {
        window.clearTimeout(fallback);
      }
    };
  }, [transit]);

  useEffect(() => {
    let live = true;

    async function light() {
      try {
        const component = await loadPortal();

        if (live) {
          // The updater form, because the value being stored is itself a
          // function and React would otherwise call it.
          setPortal(() => component);
        }
      } catch {
        // The chunk did not arrive. The doorway stays the solid dark hole it
        // already is and the link inside it still works, which is the whole
        // reason the shader is decoration rather than content.
      }
    }

    // Nothing is fetched until a reader opens the door, and nothing is fetched
    // at all on a browser that could not draw it. The component is kept once
    // it lands, so every open after the first one is already lit.
    if (open && canLightThePortal()) {
      void light();
    }

    return () => {
      live = false;
    };
  }, [open]);

  // React needs a capitalised binding to treat this as a component, and the
  // state it comes from has to be named for the hook convention instead.
  const Portal = portal;

  return (
    <span className={cn("front-door", className)} ref={rootRef}>
      <button
        aria-controls={portalId}
        aria-expanded={open}
        className="front-door-button"
        onClick={() => {
          setOpen((wasOpen) => !wasOpen);
        }}
        ref={buttonRef}
        type="button"
      >
        {/*
          The doorway, in the closed cursor's exact footprint and behind the
          leaf in both source order and paint order. It is always in the
          markup - CSS fades it in - because a hole that appears on click has
          nothing to fade from.
        */}
        <span aria-hidden="true" className="front-door-aperture" />
        <span aria-hidden="true" className="front-door-leaf">
          {/*
            The knob rides on the leaf rather than beside it, so it travels and
            foreshortens with the door. A fixed point on a moving surface is
            what tells the eye this is a rotation and not a resize.
          */}
          <span className="front-door-knob" />
        </span>
        <span className="sr-only">
          {open ? "Close the front door" : "Open the front door"}
        </span>
      </button>
      {/*
        The portal: the room behind the door, and the link through it. It is in
        the markup only while the door is open, which is what keeps it out of
        the tab order and out of the accessibility tree the rest of the time -
        the difference between an easter egg and a stray link.

        After the button in source order so it comes second in the tab order,
        and painted under it by `z-index`, because an open door stands in front
        of its own doorway.
      */}
      {open ? (
        // oxlint-disable-next-line react-doctor/no-prevent-default -- the same link is followed after the bounded traversal animation
        <a
          className="front-door-portal"
          href={siteConfig.links.source}
          id={portalId}
          onClick={(event) => {
            if (!canAnimatePortalClick(event)) {
              return;
            }
            event.preventDefault();
            navigationStartedRef.current = false;
            setTransit(
              portalTransitFrom(event.currentTarget, event.currentTarget.href)
            );
          }}
          rel="noreferrer"
        >
          {Portal === null ? null : <Portal />}
          <span className="sr-only">{portalName}</span>
        </a>
      ) : null}
      {/*
        The destination, named only while the reader is pointing at the portal.
        It hangs below the whole poster line rather than below the door, so the
        open leaf - which overhangs the closed footprint - cannot reach it at
        any type size. `aria-hidden` because the portal's own name already says
        all of this to a screen reader.

        The rail exists because the offset that clears the poster is stated in
        the poster's `em` and `top` resolves `em` against the element it is
        declared on. The rail inherits the display size and the caption does
        not: its type is restated, because the poster line sets a weight and a
        negative tracking that would make this illegible - at 368px, `-0.04em`
        of tracking is -15px per character.
      */}
      {open ? (
        <span aria-hidden="true" className="front-door-caption-rail">
          <span className="front-door-caption link-underline font-mono text-[12px] leading-5 font-normal tracking-normal text-muted-foreground sm:text-[13px]">
            View the source.
          </span>
        </span>
      ) : null}
      {transit === null
        ? null
        : createPortal(
            <span
              aria-hidden="true"
              className="front-door-transit"
              onAnimationEnd={(event: ReactAnimationEvent<HTMLSpanElement>) => {
                if (
                  event.currentTarget === event.target &&
                  !navigationStartedRef.current
                ) {
                  navigationStartedRef.current = true;
                  window.location.assign(transit.destination);
                }
              }}
              style={transit.style}
            >
              <span className="front-door-transit-field" />
              <span className="front-door-transit-energy">
                {Portal === null ? null : (
                  <Portal
                    mode="transit"
                    offsetX={transit.shaderOffsetX}
                    offsetY={transit.shaderOffsetY}
                  />
                )}
              </span>
              <span className="front-door-transit-core" />
            </span>,
            document.body
          )}
    </span>
  );
}
