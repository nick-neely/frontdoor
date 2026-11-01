// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MorningHandoff } from "@/components/posts/morning-handoff.tsx";

describe(MorningHandoff, () => {
  afterEach(cleanup);

  it("starts on the transcript of the night", () => {
    render(<MorningHandoff />);

    expect(screen.getByText("bump logging library")).toBeDefined();
    expect(screen.queryByRole("region", { name: /judgment/u })).toBeNull();
  });

  it("sorts the same night into what finished and what waits", () => {
    render(<MorningHandoff />);

    fireEvent.click(
      screen.getByRole("button", { name: "Evidence and decisions" })
    );

    const waiting = screen.getByRole("region", {
      name: "Waiting for your judgment",
    });
    expect(waiting.textContent).toContain("Drop a database column");
    expect(screen.queryByText("bump logging library")).toBeNull();
  });
});
