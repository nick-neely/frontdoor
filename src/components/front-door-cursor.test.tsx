// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { FrontDoorCursor } from "./front-door-cursor.tsx";

const openName = "Open the front door";
const closeName = "Close the front door";
const portalName =
  "View the source of nickneely.dev in the frontdoor repository on GitHub";
const captionText = "View the source.";

/*
 * The dither is a WebGL shader, and jsdom has no WebGL. The component asks
 * before it imports, so nothing here mocks anything: in jsdom the portal is
 * always the plain dark doorway with the link in it, which is exactly the
 * fallback a reader on an old device gets. The shader itself is judged with
 * eyes in a browser, which is the only place it can be.
 */

describe(FrontDoorCursor, () => {
  afterEach(cleanup);

  it("renders shut, with nothing behind the door to find", () => {
    render(<FrontDoorCursor />);

    const button = screen.getByRole("button", { name: openName });

    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-controls")).toBe("front-door-portal");
    expect(screen.queryByRole("link", { name: portalName })).toBeNull();
    expect(screen.queryByText(captionText)).toBeNull();
  });

  it("opens and closes on the button, swapping what it is called", () => {
    render(<FrontDoorCursor />);

    fireEvent.click(screen.getByRole("button", { name: openName }));

    const opened = screen.getByRole("button", { name: closeName });
    expect(opened.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("link", { name: portalName })).toBeDefined();

    fireEvent.click(opened);

    expect(
      screen
        .getByRole("button", { name: openName })
        .getAttribute("aria-expanded")
    ).toBe("false");
    expect(screen.queryByRole("link", { name: portalName })).toBeNull();
  });

  it("sends the portal to this site's source repository", () => {
    render(<FrontDoorCursor />);

    fireEvent.click(screen.getByRole("button", { name: openName }));

    const portal = screen.getByRole("link", { name: portalName });

    expect(portal.getAttribute("href")).toBe(
      "https://github.com/nick-neely/frontdoor"
    );
    expect(portal.getAttribute("id")).toBe("front-door-portal");
    // Same tab keeps the portal feeling like a doorway rather than a launcher.
    expect(portal.getAttribute("rel")).toBe("noreferrer");
    expect(portal.getAttribute("target")).toBeNull();
  });

  it("takes the door's own footprint and stands behind the leaf", () => {
    const { container } = render(<FrontDoorCursor />);

    fireEvent.click(screen.getByRole("button", { name: openName }));

    const button = container.querySelector(".front-door-button");
    const portal = container.querySelector(".front-door-portal");

    // The portal follows the button, which is what puts it second in the tab
    // order: the reader opens the door and then reaches what is behind it.
    // Paint order runs the other way, and is `z-index`'s job rather than the
    // document's, because the button's `perspective` seals its own children
    // into a 3D scene the portal cannot be inserted into.
    expect(portal).not.toBeNull();
    expect(button?.nextElementSibling).toBe(portal);
  });

  it("names the destination in the caption only while the door is open", () => {
    render(<FrontDoorCursor />);

    fireEvent.click(screen.getByRole("button", { name: openName }));

    const caption = screen.getByText(captionText);

    // Decoration: the portal's own name already says where it goes, so the
    // caption would only repeat it to a screen reader. Whether it is visible
    // is hover and focus, which is CSS and is judged in a browser. The rail
    // it hangs from is what carries the offset that clears the poster line.
    expect(caption.parentElement?.getAttribute("aria-hidden")).toBe("true");
    expect(
      caption.parentElement?.classList.contains("front-door-caption-rail")
    ).toBeTruthy();
    expect(caption.classList.contains("link-underline")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: closeName }));

    expect(screen.queryByText(captionText)).toBeNull();
  });

  it("hangs the knob on the leaf and keeps the doorway behind it", () => {
    const { container } = render(<FrontDoorCursor />);

    const leaf = container.querySelector(".front-door-leaf");
    const aperture = container.querySelector(".front-door-aperture");

    // The knob is a child of the leaf rather than a sibling, which is the
    // whole of why it travels and foreshortens with the swinging door.
    expect(leaf?.querySelector(".front-door-knob")).not.toBeNull();

    // The doorway is in the markup before the door is ever opened, because a
    // hole that appears on click has nothing to fade in from - and it precedes
    // the leaf, which is what paints it behind the door rather than over it.
    expect(leaf).not.toBeNull();
    expect(aperture?.nextElementSibling).toBe(leaf);

    // None of it is a thing a screen reader is told about: the `sr-only` span
    // is the door's name, and it has to stay the door's whole name.
    expect(leaf?.getAttribute("aria-hidden")).toBe("true");
    expect(aperture?.getAttribute("aria-hidden")).toBe("true");
  });

  it("closes on Escape and hands focus back to the door", () => {
    render(<FrontDoorCursor />);

    const button = screen.getByRole("button", { name: openName });
    button.focus();
    fireEvent.click(button);
    screen.getByRole("link", { name: portalName }).focus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("link", { name: portalName })).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it("closes on Escape from elsewhere and leaves that reader's place alone", () => {
    render(
      <>
        <FrontDoorCursor />
        <button type="button">Elsewhere on the page</button>
      </>
    );

    fireEvent.click(screen.getByRole("button", { name: openName }));

    const elsewhere = screen.getByRole("button", {
      name: "Elsewhere on the page",
    });
    elsewhere.focus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("link", { name: portalName })).toBeNull();
    // Focus is only reclaimed when it was inside the door; a reader who was
    // somewhere else entirely is not dragged back to it.
    expect(document.activeElement).toBe(elsewhere);
  });

  it("ignores keys that are not Escape", () => {
    render(<FrontDoorCursor />);

    fireEvent.click(screen.getByRole("button", { name: openName }));
    fireEvent.keyDown(document, { key: "Enter" });

    expect(screen.getByRole("link", { name: portalName })).toBeDefined();
  });

  it("renders identically on the server and at the first client paint", () => {
    // The door is the one interactive thing in the hero, and the hero is
    // prerendered. Any state read from the browser at mount would show up here
    // as a mismatch before it showed up as a flash of the wrong door - and the
    // shader, which cannot render on a server at all, is behind a dynamic
    // import that nothing but a click starts.
    const { container } = render(<FrontDoorCursor />);

    expect(container.innerHTML).toBe(renderToStaticMarkup(<FrontDoorCursor />));
  });
});
