import { Dithering } from "@paper-design/shaders-react";
import { useSyncExternalStore } from "react";

/**
 * The light behind the open door: an amber-on-dark dither swirl in the
 * doorway's own footprint.
 *
 * This module is the only thing on the site that pulls in a WebGL shader, and
 * it is never part of the home page's entry chunk - `front-door-cursor.tsx`
 * imports it dynamically the first time a reader opens the door, which is the
 * whole reason it is a separate file. Nothing here runs on the server.
 *
 * `DESIGN.md` sanctions this as ambient motion on the blink's precedent: it
 * exists only after the reader opened the door, it is confined to the doorway,
 * and it holds still for anyone who asked motion to stop.
 */

const stillPreference = "(prefers-reduced-motion: reduce)";

/**
 * Paper's own swirl preset runs at 1, which reads as a loading indicator at
 * the size of a cursor. At this speed the pattern takes long enough to turn
 * that the eye reads it as something alive behind the door rather than
 * something spinning in front of it.
 */
const swirlSpeed = 0.24;

/**
 * The dither grid, in device pixels. Paper's preset uses 2, which at this
 * scale is fine enough to read as film grain; 3 keeps the individual cells
 * visible, which is the entire point of dithering rather than shading.
 */
const ditherSize = 3;

/**
 * How much of the swirl the doorway shows. At Paper's default of 1 the whole
 * pattern is fitted to the aperture, and its bright arm covers most of a hole
 * this small - which turns the doorway into a lit amber panel and reads
 * against every other thing `DESIGN.md` says about using one accent sparingly.
 * Zoomed in this far it is a dark room with amber drifting through it, which
 * is what a door standing open onto a lit room actually looks like, and the
 * arm still sweeps the opening often enough to read as alive.
 */
const swirlScale = 1.35;

/**
 * The brand amber as a literal, for the same reason `door-mark.tsx` states it:
 * this is a graphic rather than a text colour, and it is the same amber in
 * both themes. The theme-aware `--signal` token is the one that darkens for
 * contrast on a light page, and nothing here sits on a light page - the
 * doorway is a hole with an unlit room behind it in either theme.
 */
const portalAmber = "#F5A524";

/** Transparent, so the room's own ground shows through the unlit cells. */
const portalVoid = "#00000000";

function subscribeToStillness(onChange: () => void): () => void {
  const query = window.matchMedia(stillPreference);

  query.addEventListener("change", onChange);

  return () => {
    query.removeEventListener("change", onChange);
  };
}

function prefersStillness(): boolean {
  return window.matchMedia(stillPreference).matches;
}

/**
 * The server never renders this component, so this exists only to satisfy
 * `useSyncExternalStore`. Still is the safe answer if it ever were rendered.
 */
function stillOnTheServer(): boolean {
  return true;
}

export function FrontDoorPortal() {
  const still = useSyncExternalStore(
    subscribeToStillness,
    prefersStillness,
    stillOnTheServer
  );

  return (
    <Dithering
      className="front-door-portal-shader"
      colorBack={portalVoid}
      colorFront={portalAmber}
      scale={swirlScale}
      // The prop is Paper's, and naming the pattern source is exactly what it
      // does here - there is no domain role to rename it for.
      // oxlint-disable-next-line anti-slop/no-shape-in-symbol-names
      shape="swirl"
      size={ditherSize}
      // Zero stops the animation frame loop outright rather than slowing it,
      // which is what makes the reduced-motion portal a still image and not a
      // very slow one.
      speed={still ? 0 : swirlSpeed}
      type="8x8"
    />
  );
}
