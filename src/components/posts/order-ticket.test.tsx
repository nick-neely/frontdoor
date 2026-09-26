// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { OrderTicket } from "@/components/posts/order-ticket.tsx";

describe(OrderTicket, () => {
  afterEach(cleanup);

  it("prompts before any meaning is chosen", () => {
    render(<OrderTicket />);

    expect(screen.getByRole("status").textContent).toBe(
      "Pick one. The code gives you no hint."
    );
  });

  it("shows what the chosen meaning builds and breaks", () => {
    render(<OrderTicket />);

    fireEvent.click(screen.getByRole("button", { name: "The sales order" }));

    const outcome = screen.getByRole("status").textContent;
    expect(outcome).toContain("You write: Code that calls the ERP");
    expect(outcome).toContain("What breaks: The ERP owns that record.");
    expect(
      screen
        .getByRole("button", { name: "The sales order" })
        .getAttribute("aria-pressed")
    ).toBe("true");
  });
});
