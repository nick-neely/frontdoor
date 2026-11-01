// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MergeDanger } from "@/components/posts/merge-danger.tsx";

describe(MergeDanger, () => {
  afterEach(cleanup);

  it("labels every quadrant by both axes", () => {
    render(<MergeDanger />);

    expect(
      screen.getByRole("columnheader", { name: "Wide blast" })
    ).toBeDefined();
    expect(
      screen.getByRole("rowheader", { name: "One-way door" })
    ).toBeDefined();
    expect(screen.getAllByRole("cell", { name: /^Waits/u })).toHaveLength(2);
  });

  it("marks the quadrant a change lands in and says why", () => {
    render(<MergeDanger />);

    fireEvent.click(
      screen.getByRole("button", { name: "Drop a database column" })
    );

    const active = document.querySelectorAll("td[data-active]");
    expect(active).toHaveLength(1);
    expect(active[0]?.textContent).toBe("Waits for human judgment");
    expect(screen.getByRole("status").textContent).toMatch(
      /^Waits for human judgment\. A destructive migration/u
    );
  });
});
