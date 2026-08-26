/**
 * What `vite-imagetools` returns for `?as=picture`: one srcset per output
 * format, plus the fallback element's source and its intrinsic dimensions.
 *
 * The dimensions are the reason this shape is worth carrying around. They are
 * measured by sharp during the build and written onto the `<img>`, so the
 * browser reserves the right box before the first byte of image arrives and
 * nothing below the picture ever moves.
 */
export interface PostImage {
  img: { h: number; src: string; w: number };
  /** Keyed by output format, valued by that format's srcset. */
  sources: Record<string, string>;
}

/**
 * Preference order for the `<source>` list, best first. Stated rather than
 * taken from the object's key order so the emitted markup cannot depend on how
 * the plugin happened to build the record.
 *
 * The `<img>` fallback is WebP rather than the original file. A browser that
 * reaches it understands neither AVIF nor WebP, which in practice means it also
 * predates everything else this site is built on; shipping a second full-size
 * PNG per image to serve it would be a real cost for an imaginary reader.
 */
const sourceFormats = ["avif", "webp"] as const;

/**
 * The prose measure is capped at 70ch, which lands near 40rem for the reading
 * face, and the picture never exceeds it. Below that the picture is as wide as
 * the column.
 */
const imageSizes = "(min-width: 40rem) 40rem, 100vw";

interface FigureProps {
  alt: string;
  /** The Markdown title slot. Absent means a bare picture, not an empty rule. */
  caption?: string;
  /**
   * Loads immediately instead of lazily. Reserved for the first picture in a
   * Post, the only one that can plausibly be the largest contentful paint.
   */
  eager?: boolean;
  image: PostImage;
  /**
   * The picture sits inside a sentence, where `<figure>` would be invalid
   * markup inside the surrounding `<p>`.
   */
  inline?: boolean;
}

/**
 * A picture in a Post, and the shape project detail pages will reuse.
 *
 * Authors do not write this. `remarkPostImages` rewrites ordinary Markdown
 * images into it, so `![alt](./shot.png "A caption")` is the whole authoring
 * surface and the optimization is not something anyone has to remember.
 */
export function Figure({
  alt,
  caption,
  eager = false,
  image,
  inline = false,
}: FigureProps) {
  const picture = (
    <picture>
      {sourceFormats
        .filter((format) => image.sources[format] !== undefined)
        .map((format) => (
          <source
            key={format}
            sizes={imageSizes}
            srcSet={image.sources[format]}
            type={`image/${format}`}
          />
        ))}
      <img
        alt={alt}
        decoding="async"
        height={image.img.h}
        loading={eager ? "eager" : "lazy"}
        src={image.img.src}
        width={image.img.w}
      />
    </picture>
  );

  if (inline || caption === undefined) {
    return picture;
  }

  return (
    <figure>
      {picture}
      <figcaption className="mt-3 font-mono text-[13px] text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}
