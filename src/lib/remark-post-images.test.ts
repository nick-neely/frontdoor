import { compile } from "@mdx-js/mdx";
import { describe, expect, it } from "vitest";

import { remarkPostImages } from "./remark-post-images.ts";

const postPath = "content/writing/a-post.mdx";

async function build(body: string): Promise<string> {
  return String(
    await compile(
      { path: postPath, value: body },
      { remarkPlugins: [remarkPostImages] }
    )
  );
}

describe("colocated Post images", () => {
  it("resolves a relative path against the Post's asset directory", async () => {
    const compiled = await build("![A shot](./shot.png)\n");

    // `./shot.png` in `a-post.mdx` means `content/writing/a-post/shot.png`, so
    // the prose never has to repeat the slug.
    expect(compiled).toContain('import _postImage0 from "./a-post/shot.png?');
  });

  it("asks for the widths and formats the reading measure needs", async () => {
    const compiled = await build("![A shot](./shot.png)\n");

    expect(compiled).toContain("w=640;1280");
    expect(compiled).toContain("format=avif;webp");
    expect(compiled).toContain("as=picture");
  });

  it("renders through Figure, carrying the alt text", async () => {
    const compiled = await build("![A shot](./shot.png)\n");

    expect(compiled).toContain("Figure");
    expect(compiled).toContain('alt: "A shot"');
    expect(compiled).toContain("image: _postImage0");
  });

  it("takes the caption from the Markdown title slot", async () => {
    const compiled = await build('![A shot](./shot.png "What it shows")\n');

    expect(compiled).toContain('caption: "What it shows"');
  });

  it("leaves an image with no title uncaptioned rather than empty", async () => {
    const compiled = await build("![A shot](./shot.png)\n");

    expect(compiled).not.toContain("caption");
  });

  // The first picture is the only one that can plausibly be the largest
  // contentful paint. Everything after it is below the fold by definition.
  it("loads the first picture eagerly and the rest lazily", async () => {
    const compiled = await build(
      "![One](./one.png)\n\n![Two](./two.png)\n\n![Three](./three.png)\n"
    );

    expect(compiled.match(/eager: true/gu)).toHaveLength(1);
    expect(compiled).toMatch(/image: _postImage0,\s+eager: true/u);
  });

  // A `<figure>` inside a `<p>` is invalid markup, and React says so at
  // runtime. A picture in a sentence is placed inline instead.
  it("places a picture inside a sentence inline", async () => {
    const compiled = await build("Text with ![a glyph](./glyph.png) in it.\n");

    expect(compiled).toContain("inline: true");
  });

  it("leaves a picture that is a paragraph of its own as a block", async () => {
    const compiled = await build("![A shot](./shot.png)\n");

    expect(compiled).not.toContain("inline: true");
  });

  it.each([
    ["a rooted path already in public/", "/og/card.png"],
    ["an image on someone else's origin", "https://example.com/shot.png"],
  ])("leaves %s exactly as authored", async (_case, url) => {
    const compiled = await build(`![A shot](${url})\n`);

    expect(compiled).not.toContain("_postImage0");
    expect(compiled).toContain(url);
  });

  it("refuses to guess when the file being compiled has no path", async () => {
    await expect(
      compile("![A shot](./shot.png)\n", { remarkPlugins: [remarkPostImages] })
    ).rejects.toThrow("asset directory is unknown");
  });
});
