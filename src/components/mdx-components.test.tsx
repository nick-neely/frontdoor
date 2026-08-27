// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  Process,
  ProcessStep,
  mdxComponents,
} from "@/components/mdx-components.tsx";

describe("MDX process diagram", () => {
  afterEach(cleanup);

  it("renders a labelled ordered sequence", () => {
    const { container } = render(
      <Process label="Invoice workflow">
        <ProcessStep title="Collect">Read merged pull requests.</ProcessStep>
        <ProcessStep title="Review">Approve the draft.</ProcessStep>
      </Process>
    );

    expect(screen.getByText("Invoice workflow")).toBeTruthy();
    expect(container.querySelector("ol")).not.toBeNull();
    expect(container.querySelectorAll("li")).toHaveLength(2);
    expect(screen.getByText("Collect")).toBeTruthy();
    expect(screen.getByText("Review")).toBeTruthy();
  });

  it("is available to MDX documents", () => {
    expect(mdxComponents.Process).toBe(Process);
    expect(mdxComponents.ProcessStep).toBe(ProcessStep);
  });
});
