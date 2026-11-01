// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ReviewBottleneckChart } from "@/components/posts/review-bottleneck-chart.tsx";

describe(ReviewBottleneckChart, () => {
  afterEach(cleanup);

  it("prints every value from the newest report as text", () => {
    render(<ReviewBottleneckChart />);

    const review = screen.getByRole("region", { name: "Review" });
    expect(review.textContent).toContain("Median time in PR review");
    expect(review.textContent).toContain("+441.5%");
    expect(screen.getByText("+33.7%")).toBeDefined();
  });

  it("swaps to the 2025 report and credits its own sample", () => {
    const { container } = render(<ReviewBottleneckChart />);

    fireEvent.click(screen.getByRole("button", { name: "2025 report" }));

    expect(screen.getByText("+98%")).toBeDefined();
    expect(screen.queryByText("+441.5%")).toBeNull();
    expect(container.querySelector("figcaption")?.textContent).toContain(
      "1,255 teams"
    );
  });
});
