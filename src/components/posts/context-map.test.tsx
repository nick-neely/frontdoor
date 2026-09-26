// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ContextMap } from "@/components/posts/context-map.tsx";

describe(ContextMap, () => {
  afterEach(cleanup);

  it("names the picture and describes every relationship in text", () => {
    render(<ContextMap />);

    const map = screen.getByRole("img", {
      name: /context map for the online store/iu,
    });

    expect(map.textContent).toContain("anticorruption layer");
    expect(map.querySelector("desc")?.textContent).toMatch(
      /upstream.*anticorruption layer.*downstream/su
    );
  });

  it("keeps marker ids unique when rendered twice", () => {
    const { container } = render(
      <>
        <ContextMap />
        <ContextMap />
      </>
    );

    const ids = [...container.querySelectorAll("[id]")].map(
      (element) => element.id
    );

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("drops the anticorruption layer when Checkout conforms", () => {
    render(<ContextMap />);

    fireEvent.click(screen.getByRole("button", { name: "Conform" }));

    const map = screen.getByRole("img");
    expect(map.textContent).not.toContain("anticorruption layer");
    expect(map.textContent).toContain("ERP's model");
    expect(
      screen
        .getByRole("button", { name: "Conform" })
        .getAttribute("aria-pressed")
    ).toBe("true");
  });

  it("announces the new relationship through a live caption", () => {
    const { container } = render(<ContextMap />);

    fireEvent.click(screen.getByRole("button", { name: "Conform" }));

    const caption = container.querySelector("figcaption");
    expect(caption?.getAttribute("aria-live")).toBe("polite");
    expect(caption?.textContent).toMatch(/^Conform:/u);
  });
});
