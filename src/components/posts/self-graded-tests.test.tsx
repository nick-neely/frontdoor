// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SelfGradedTests } from "@/components/posts/self-graded-tests.tsx";

describe(SelfGradedTests, () => {
  afterEach(cleanup);

  it("passes every test the agent wrote", () => {
    render(<SelfGradedTests />);

    fireEvent.click(
      screen.getByRole("button", { name: "Run the agent's tests" })
    );

    const outcome = screen.getByRole("status");
    expect(outcome.textContent).toContain("3 passed.");
    expect(Object.hasOwn(outcome.dataset, "threw")).toBeFalsy();
  });

  it("fails the example agreed with the product owner", () => {
    render(<SelfGradedTests />);

    fireEvent.click(
      screen.getByRole("button", { name: "Check the agreed example" })
    );

    const outcome = screen.getByRole("status");
    expect(outcome.textContent).toContain(
      "✗ needsApproval(500) → false, expected true"
    );
    expect(Object.hasOwn(outcome.dataset, "threw")).toBeTruthy();
  });
});
