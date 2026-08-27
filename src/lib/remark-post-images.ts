import path from "node:path";

import type { Program } from "estree";
import type { Image, Paragraph, Root } from "mdast";
import type {
  MdxJsxAttribute,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from "mdast-util-mdx-jsx";
import type { MdxjsEsm } from "mdast-util-mdxjs-esm";
import { CONTINUE, SKIP, visit } from "unist-util-visit";
import type { VisitorResult } from "unist-util-visit";

/**
 * Where a Post keeps its pictures, and how they are asked for.
 *
 * A Post is one file, `content/writing/<slug>.mdx`, and its assets live in the
 * sibling directory `content/writing/<slug>/`. Authors write the ordinary
 * Markdown they already know - `![alt](./shot.png "Optional caption")` - and a
 * relative URL is resolved against that directory rather than against the file,
 * so nothing in the prose repeats the slug.
 *
 * The rewrite turns each such image into a real ES import, which is what buys
 * everything the reader gets: `vite-imagetools` resizes and re-encodes through
 * sharp at build time, the bundler hashes the output so it can be cached
 * forever, and the imported record carries intrinsic dimensions so the element
 * reserves its box before a byte of image arrives.
 *
 * Per ADR-0001 this stays a compile-time concern of the MDX pipeline. It reads
 * the file being compiled and nothing else: no content index, no frontmatter,
 * no second reader of the collection.
 */
const imageDirectives = "w=640;1280&format=avif;webp&as=picture";

/** The component the rewritten image renders through. */
const componentName = "Figure";

const bindingPrefix = "_postImage";
const mdxExtension = ".mdx";

/** Where the image sits, which decides whether a `<figure>` is legal there. */
type Placement = "block" | "inline";

/** The subset of unified's `VFile` this plugin reads. */
interface CompiledFile {
  path?: string | undefined;
}

/**
 * Only a path the author wrote as relative is a colocated asset. A rooted path
 * is something already in `public/` and a URL belongs to someone else; both are
 * left exactly as authored and render as a plain `<img>`.
 */
function isColocated(url: string): boolean {
  return url.startsWith("./") || url.startsWith("../");
}

/**
 * The asset directory's name, which is the Post's slug. The file name is the
 * only thing that can answer this, and `content-collections.ts` already refuses
 * a Post whose frontmatter slug disagrees with it.
 */
function assetDirectory(file: CompiledFile, url: string): string {
  const filePath = file.path;

  if (filePath === undefined || filePath.length === 0) {
    throw new Error(
      `Cannot resolve the colocated image "${url}": the MDX being compiled has no path, so its asset directory is unknown.`
    );
  }

  // `@mdx-js/rollup` hands over a module id, which may carry a query.
  const [withoutQuery = filePath] = filePath.split("?");

  return path.basename(withoutQuery, mdxExtension);
}

/** `./shot.png` in `slug.mdx` becomes `./slug/shot.png` plus the directives. */
function assetSpecifier(directory: string, url: string): string {
  return `./${path.posix.join(directory, url)}?${imageDirectives}`;
}

function importProgram(binding: string, specifier: string): Program {
  return {
    body: [
      {
        attributes: [],
        source: { type: "Literal", value: specifier },
        specifiers: [
          {
            local: { name: binding, type: "Identifier" },
            type: "ImportDefaultSpecifier",
          },
        ],
        type: "ImportDeclaration",
      },
    ],
    comments: [],
    sourceType: "module",
    type: "Program",
  };
}

function identifierProgram(binding: string): Program {
  return {
    body: [
      {
        expression: { name: binding, type: "Identifier" },
        type: "ExpressionStatement",
      },
    ],
    comments: [],
    sourceType: "module",
    type: "Program",
  };
}

function esmImport(binding: string, specifier: string): MdxjsEsm {
  return {
    data: { estree: importProgram(binding, specifier) },
    type: "mdxjsEsm",
    value: `import ${binding} from ${JSON.stringify(specifier)}`,
  };
}

function figureAttributes(
  image: Image,
  binding: string,
  placement: Placement,
  eager: boolean
): MdxJsxAttribute[] {
  const attributes: MdxJsxAttribute[] = [
    { name: "alt", type: "mdxJsxAttribute", value: image.alt ?? "" },
    {
      name: "image",
      type: "mdxJsxAttribute",
      value: {
        data: { estree: identifierProgram(binding) },
        type: "mdxJsxAttributeValueExpression",
        value: binding,
      },
    },
  ];

  // The Markdown title slot is the caption. An image with no title stays a
  // bare picture rather than an empty `<figure>`.
  if (image.title !== null && image.title !== undefined) {
    attributes.push({
      name: "caption",
      type: "mdxJsxAttribute",
      value: image.title,
    });
  }

  if (placement === "inline") {
    attributes.push({ name: "inline", type: "mdxJsxAttribute", value: null });
  }

  if (eager) {
    attributes.push({ name: "eager", type: "mdxJsxAttribute", value: null });
  }

  return attributes;
}

function figureNode(
  image: Image,
  binding: string,
  placement: Placement,
  eager: boolean
): MdxJsxFlowElement | MdxJsxTextElement {
  return {
    attributes: figureAttributes(image, binding, placement, eager),
    children: [],
    name: componentName,
    position: image.position,
    type: placement === "block" ? "mdxJsxFlowElement" : "mdxJsxTextElement",
  };
}

/**
 * The image a paragraph exists only to hold. Anything else in the paragraph
 * means the image is part of a sentence, where a `<figure>` would be invalid
 * markup inside a `<p>`.
 */
function soleImage(paragraph: Paragraph): Image | undefined {
  const [child, ...rest] = paragraph.children;

  return child?.type === "image" && rest.length === 0 ? child : undefined;
}

/**
 * Rewrites every colocated Markdown image into a `<Figure>` fed by an imported,
 * optimized picture record.
 *
 * The first such image in a Post loads eagerly and the rest lazily: the first
 * one is the only image that can plausibly be the largest contentful paint, and
 * deferring it would trade a measurable delay for nothing.
 */
export function remarkPostImages() {
  return (tree: Root, file: CompiledFile): undefined => {
    const colocated: Image[] = [];

    visit(tree, "image", (node) => {
      if (isColocated(node.url)) {
        colocated.push(node);
      }
    });

    const [first] = colocated;

    if (first === undefined) {
      return;
    }

    const bindings = new Map<Image, string>();
    const imports: MdxjsEsm[] = [];

    for (const [index, image] of colocated.entries()) {
      const binding = `${bindingPrefix}${index}`;

      bindings.set(image, binding);
      imports.push(
        esmImport(
          binding,
          assetSpecifier(assetDirectory(file, image.url), image.url)
        )
      );
    }

    // Block images first, so the paragraph that holds nothing but a picture is
    // replaced outright rather than leaving a `<figure>` wrapped in a `<p>`.
    visit(tree, "paragraph", (node, index, parent): VisitorResult => {
      if (parent === undefined || index === undefined) {
        return CONTINUE;
      }

      const image = soleImage(node);
      const binding = image === undefined ? undefined : bindings.get(image);

      if (image === undefined || binding === undefined) {
        return CONTINUE;
      }

      parent.children[index] = figureNode(
        image,
        binding,
        "block",
        image === first
      );

      return [SKIP, index];
    });

    // Whatever is left is an image inside a sentence.
    visit(tree, "image", (node, index, parent): VisitorResult => {
      const binding = bindings.get(node);

      if (
        parent === undefined ||
        index === undefined ||
        binding === undefined
      ) {
        return CONTINUE;
      }

      parent.children[index] = figureNode(
        node,
        binding,
        "inline",
        node === first
      );

      return [SKIP, index];
    });

    tree.children.unshift(...imports);
  };
}
