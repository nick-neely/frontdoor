// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { honeypotFieldName, newsletterFootnote } from "@/lib/newsletter.ts";

import { NewsletterCapture } from "./newsletter-capture.tsx";

const source = "/writing/building-the-new-front-door";

describe(NewsletterCapture, () => {
  afterEach(cleanup);

  it("offers one field, one button, and the promise under them", () => {
    render(<NewsletterCapture source={source} />);

    expect(screen.getByLabelText("Email address")).toBeDefined();
    expect(screen.getByRole("button", { name: "Subscribe" })).toBeDefined();
    expect(screen.getByText(newsletterFootnote)).toBeDefined();
  });

  it("hides the honeypot from every reader on every device", () => {
    const { container } = render(<NewsletterCapture source={source} />);
    const trap = container.querySelector(`input[name="${honeypotFieldName}"]`);

    expect(trap).not.toBeNull();
    // Out of the tab order and out of the accessibility tree. A field that is
    // merely off-screen still reaches a screen reader.
    expect(trap?.getAttribute("tabindex")).toBe("-1");
    expect(trap?.closest("[aria-hidden='true']")).not.toBeNull();
    // Role queries honour `aria-hidden`, which is what a screen reader does.
    expect(screen.queryByRole("textbox", { name: "Company" })).toBeNull();
  });

  it("names a malformed address before anything is sent", () => {
    render(<NewsletterCapture source={source} />);

    const input = screen.getByLabelText<HTMLInputElement>("Email address");
    fireEvent.change(input, { target: { value: "not-an-address" } });
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));

    // Announced rather than merely shown: the message lands in the live region.
    expect(screen.getByRole("status").textContent).toBe(
      "That doesn't look like an email address."
    );
    expect(input.getAttribute("aria-invalid")).toBe("true");
    // The address stays put, so correcting it costs one keystroke.
    expect(input.value).toBe("not-an-address");
  });

  it("is complete in the prerendered HTML, before any JavaScript runs", () => {
    // Every page carrying this block is prerendered. The mount-time stamp the
    // heuristics need is taken in an effect rather than during render so that
    // this stays true and hydration has nothing to disagree about.
    const markup = renderToStaticMarkup(<NewsletterCapture source={source} />);

    expect(markup).toContain("<form");
    expect(markup).toContain('name="email"');
    expect(markup).toContain(`name="${honeypotFieldName}"`);
    expect(markup).toContain(newsletterFootnote);
    expect(markup).toContain(">Subscribe<");
  });
});
