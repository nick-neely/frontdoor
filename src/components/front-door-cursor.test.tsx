// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { FrontDoorCursor } from "./front-door-cursor.tsx";

const openName = "Open the front door";
const closeName = "Close the front door";
const terminalName = "terminal.nickneely.dev →";

describe(FrontDoorCursor, () => {
  afterEach(cleanup);

  it("renders shut, with nothing behind the door to find", () => {
    render(<FrontDoorCursor />);

    const button = screen.getByRole("button", { name: openName });

    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-controls")).toBe("front-door-reveal");
    expect(screen.queryByRole("link", { name: terminalName })).toBeNull();
  });

  it("opens and closes on the button, swapping what it is called", () => {
    render(<FrontDoorCursor />);

    fireEvent.click(screen.getByRole("button", { name: openName }));

    const opened = screen.getByRole("button", { name: closeName });
    expect(opened.getAttribute("aria-expanded")).toBe("true");
    expect(
      screen.getByRole("link", { name: terminalName }).getAttribute("href")
    ).toBe("https://terminal.nickneely.dev");

    fireEvent.click(opened);

    expect(
      screen
        .getByRole("button", { name: openName })
        .getAttribute("aria-expanded")
    ).toBe("false");
    expect(screen.queryByRole("link", { name: terminalName })).toBeNull();
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
    expect(aperture).not.toBeNull();
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
    screen.getByRole("link", { name: terminalName }).focus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("link", { name: terminalName })).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it("ignores keys that are not Escape", () => {
    render(<FrontDoorCursor />);

    fireEvent.click(screen.getByRole("button", { name: openName }));
    fireEvent.keyDown(document, { key: "Enter" });

    expect(screen.getByRole("link", { name: terminalName })).toBeDefined();
  });

  it("renders identically on the server and at the first client paint", () => {
    // The door is the one interactive thing in the hero, and the hero is
    // prerendered. Any state read from the browser at mount would show up here
    // as a mismatch before it showed up as a flash of the wrong door.
    const { container } = render(<FrontDoorCursor />);

    expect(container.innerHTML).toBe(renderToStaticMarkup(<FrontDoorCursor />));
  });
});
