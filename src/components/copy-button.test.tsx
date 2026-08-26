// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { RefObject } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CopyButton } from "./copy-button.tsx";

const code = "pnpm validate";

type WriteText = (text: string) => Promise<void>;

/** A clipboard that accepts everything, which is the ordinary case. */
async function acceptWrite(): Promise<void> {
  await Promise.resolve();
}

/** A clipboard that refuses, which is a browser decision and not an error. */
async function refuseWrite(): Promise<void> {
  await Promise.reject(new Error("denied"));
}

/**
 * A `<pre>` outside the render tree, standing in for the one `CodeBlock` puts
 * the ref on. The control copies whatever text that element holds, which is
 * what keeps the highlighted markup from having to be re-parsed to copy it.
 */
function sourceRef(): RefObject<HTMLElement | null> {
  const element = document.createElement("pre");
  element.textContent = code;

  return { current: element };
}

function stubClipboard(writeText: WriteText) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}

describe(CopyButton, () => {
  beforeEach(() => {
    stubClipboard(acceptWrite);
  });

  afterEach(cleanup);

  // The prerendered HTML has no JavaScript behind it, so a button in it would
  // be a control that does nothing. This is the assertion that keeps it out.
  it("renders nothing on the server", () => {
    expect(renderToStaticMarkup(<CopyButton source={sourceRef()} />)).toBe("");
  });

  it("renders nothing where the clipboard is unavailable", () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });

    const { container } = render(<CopyButton source={sourceRef()} />);

    expect(container.innerHTML).toBe("");
  });

  it("names the action rather than the state", () => {
    render(<CopyButton source={sourceRef()} />);

    expect(screen.getByRole("button", { name: "Copy code" })).toBeDefined();
  });

  it("hands the block's text to the clipboard", async () => {
    const writeText = vi.fn<WriteText>(acceptWrite);

    stubClipboard(writeText);
    render(<CopyButton source={sourceRef()} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("button").textContent).toBe("Copied");
    });

    expect(writeText).toHaveBeenCalledWith(code);
  });

  // The confirmation is the one thing the reader's click is allowed to move,
  // and it goes away on its own.
  it("confirms briefly and then goes back to naming the action", async () => {
    render(<CopyButton source={sourceRef()} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("button").textContent).toBe("Copied");
    });

    expect(screen.getByRole("status").textContent).toBe("Copied");

    // Real time rather than a fake clock: the confirmation clearing itself is
    // the behaviour under test, and this is the only slow test in the suite.
    await waitFor(
      () => {
        expect(screen.getByRole("button").textContent).toBe("Copy");
      },
      { timeout: 3000 }
    );

    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("stays quiet when the browser refuses the write", async () => {
    stubClipboard(refuseWrite);
    render(<CopyButton source={sourceRef()} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toBe("");
    });

    expect(screen.getByRole("button").textContent).toBe("Copy");
  });
});
