// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Figure } from "./figure.tsx";
import type { PostImage } from "./figure.tsx";

const image: PostImage = {
  img: { h: 720, src: "/assets/shot-abc123.webp", w: 1280 },
  sources: {
    avif: "/assets/shot-a.avif 640w, /assets/shot-b.avif 1280w",
    webp: "/assets/shot-c.webp 640w, /assets/shot-abc123.webp 1280w",
  },
};

describe(Figure, () => {
  afterEach(cleanup);

  // The whole point of measuring during the build: the box is reserved before
  // the file arrives, so nothing under the picture ever moves.
  it("writes the intrinsic dimensions onto the image", () => {
    render(<Figure alt="A shot" image={image} />);

    const rendered = screen.getByAltText("A shot");

    expect(rendered.getAttribute("width")).toBe("1280");
    expect(rendered.getAttribute("height")).toBe("720");
  });

  it("decodes off the main thread and defers loading by default", () => {
    render(<Figure alt="A shot" image={image} />);

    const rendered = screen.getByAltText("A shot");

    expect(rendered.getAttribute("decoding")).toBe("async");
    expect(rendered.getAttribute("loading")).toBe("lazy");
  });

  it("loads eagerly when it is the Post's first picture", () => {
    render(<Figure alt="A shot" eager image={image} />);

    expect(screen.getByAltText("A shot").getAttribute("loading")).toBe("eager");
  });

  // Best format first, because the browser takes the first source it can read.
  it("offers the modern formats in preference order", () => {
    const { container } = render(<Figure alt="A shot" image={image} />);
    const types = [...container.querySelectorAll("source")].map((node) =>
      node.getAttribute("type")
    );

    expect(types).toStrictEqual(["image/avif", "image/webp"]);
  });

  it("renders a figure only when the Markdown supplied a caption", () => {
    const { container } = render(
      <Figure alt="A shot" caption="What it shows" image={image} />
    );

    expect(container.querySelector("figcaption")?.textContent).toBe(
      "What it shows"
    );
  });

  it.each([
    ["with no caption", { alt: "A shot", image }],
    [
      "inside a sentence",
      { alt: "A shot", caption: "Ignored", image, inline: true },
    ],
  ])("stays a bare picture %s", (_case, props) => {
    const { container } = render(<Figure {...props} />);

    expect(container.querySelector("figure")).toBeNull();
  });
});
