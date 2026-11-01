// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ComprehensionGap } from "@/components/posts/comprehension-gap.tsx";

describe(ComprehensionGap, () => {
  afterEach(cleanup);

  it("starts with both jobs done by the person writing the code", () => {
    const { container } = render(<ComprehensionGap />);

    expect(container.querySelectorAll("[data-skipped]")).toHaveLength(0);
    expect(container.querySelector("figcaption")?.textContent).toMatch(
      /^I write it:/u
    );
  });

  it("skips the understanding when an agent writes the change", () => {
    const { container } = render(<ComprehensionGap />);

    fireEvent.click(screen.getByRole("button", { name: "An agent writes it" }));

    expect(container.querySelectorAll("[data-skipped]")).toHaveLength(3);
    expect(screen.getByText("Written by the agent")).toBeDefined();
    const caption = container.querySelector("figcaption");
    expect(caption?.getAttribute("aria-live")).toBe("polite");
    expect(caption?.textContent).toContain("comprehension gap");
  });
});
