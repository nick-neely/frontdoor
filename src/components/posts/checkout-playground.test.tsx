// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CheckoutPlayground } from "@/components/posts/checkout-playground.tsx";

describe(CheckoutPlayground, () => {
  afterEach(cleanup);

  it("throws the invariant when a picking checkout is cancelled", () => {
    render(<CheckoutPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "startPicking()" }));
    fireEvent.click(screen.getByRole("button", { name: "cancel()" }));

    expect(screen.getByRole("status").textContent).toBe(
      "cancel() threw: A Checkout cannot be cancelled once picking starts."
    );
    expect(screen.getByText('"picking"')).toBeTruthy();
  });

  it("cancels a submitted checkout and starts over on reset", () => {
    render(<CheckoutPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "cancel()" }));
    expect(screen.getByText('"cancelled"')).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "reset" }));
    expect(screen.getByText('"submitted"')).toBeTruthy();
  });
});
