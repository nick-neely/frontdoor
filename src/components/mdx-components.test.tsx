// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  Compare,
  CompareSide,
  Glossary,
  GlossaryEntry,
  Process,
  ProcessStep,
  ProseLink,
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

describe("MDX glossary", () => {
  afterEach(cleanup);

  it("pairs each term with its meaning and strikes the words to avoid", () => {
    const { container } = render(
      <Glossary label="CONTEXT.md">
        <GlossaryEntry avoid={["article", "entry"]} term="Post">
          A dated piece of writing.
        </GlossaryEntry>
        <GlossaryEntry term="Tag">A free-form label.</GlossaryEntry>
      </Glossary>
    );

    expect(screen.getByText("CONTEXT.md")).toBeTruthy();
    expect(container.querySelectorAll("dt")).toHaveLength(2);
    expect(
      [...container.querySelectorAll("s")].map((word) => word.textContent)
    ).toStrictEqual(["article", "entry"]);
    expect(container.querySelectorAll(".glossary-avoid")).toHaveLength(1);
  });

  it("is available to MDX documents", () => {
    expect(mdxComponents.Glossary).toBe(Glossary);
    expect(mdxComponents.GlossaryEntry).toBe(GlossaryEntry);
  });
});

describe("MDX comparison", () => {
  afterEach(cleanup);

  it("names both sides as regions in source order", () => {
    render(
      <Compare>
        <CompareSide title="Before">One word.</CompareSide>
        <CompareSide title="After">Three words.</CompareSide>
      </Compare>
    );

    expect(
      screen
        .getAllByRole("region")
        .map((side) => side.getAttribute("aria-label"))
    ).toStrictEqual(["Before", "After"]);
  });

  it("is available to MDX documents", () => {
    expect(mdxComponents.Compare).toBe(Compare);
    expect(mdxComponents.CompareSide).toBe(CompareSide);
  });
});

describe("MDX prose link", () => {
  afterEach(cleanup);

  it("moves the underline onto a link made only of code", () => {
    render(
      <ProseLink href="https://example.com">
        <code>CONTEXT.md</code>
      </ProseLink>
    );

    expect(screen.getByRole("link").className).toBe("prose-code-link");
  });

  it("keeps the ordinary underline for mixed content", () => {
    render(
      <ProseLink href="https://example.com">
        the <code>x</code> skill
      </ProseLink>
    );

    expect(screen.getByRole("link").className).toBe("link-underline-resting");
  });
});
