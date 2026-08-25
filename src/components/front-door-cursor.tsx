import { useEffect, useRef, useState } from "react";

import { siteConfig } from "@/lib/site-config.ts";
import { cn } from "@/lib/utils.ts";

/**
 * The site's signature detail: the hero's blinking block cursor, which is also
 * the door in the site mark. It blinks at a terminal cadence until the reader
 * opens it, and opening it reveals the one link to the terminal résumé this
 * site replaced.
 *
 * Every motion here is reader-triggered, which is the whole of `DESIGN.md`'s
 * doctrine: the blink, the hover crack, and the swing all live in
 * `src/styles.css` behind `prefers-reduced-motion`, and the component only
 * moves the state they key off. Nothing about the reveal is load-bearing - the
 * page reads completely with the door shut.
 */

/** `aria-controls` needs a stable target, and there is one door per page. */
const revealId = "front-door-reveal";

interface FrontDoorCursorProps {
  className?: string;
}

export function FrontDoorCursor({ className }: FrontDoorCursorProps) {
  // Closed on the server and closed on the first client paint, so there is
  // nothing for hydration to disagree about.
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      setOpen(false);

      // Focus is only reclaimed when it was inside the door - most often on
      // the link that is about to stop existing. A reader who pressed Escape
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

  return (
    <span className={cn("front-door", className)} ref={rootRef}>
      <button
        aria-controls={revealId}
        aria-expanded={open}
        className="front-door-button"
        onClick={() => {
          setOpen((wasOpen) => !wasOpen);
        }}
        ref={buttonRef}
        type="button"
      >
        <span aria-hidden="true" className="front-door-leaf" />
        <span className="sr-only">
          {open ? "Close the front door" : "Open the front door"}
        </span>
      </button>
      {/*
        `hidden` rather than a visually-hidden class: while the door is shut
        the line is out of the tab order and out of the accessibility tree,
        which is the difference between an easter egg and a stray link.

        The type is restated rather than inherited because the poster line sets
        a display size, weight, and negative tracking that would make this
        illegible - at 368px, `-0.04em` of tracking is -15px per character.
      */}
      <span
        className="front-door-reveal font-mono text-[12px] leading-5 font-normal tracking-normal text-muted-foreground sm:text-[13px]"
        hidden={!open}
        id={revealId}
      >
        You found the old front door
        <a
          className="link-underline text-foreground"
          href={siteConfig.links.terminal}
          rel="noreferrer"
        >
          terminal.nickneely.dev →
        </a>
      </span>
    </span>
  );
}
