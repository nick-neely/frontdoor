/**
 * The social card's canvas, and how a Post title is fitted into it.
 *
 * Satori does the real line breaking, but it cannot be asked whether the
 * result fit, so the card picks a size by wrapping the title itself and
 * renders the lines it chose. Without that, a long title pushes the bottom
 * metadata row off the canvas with nothing to catch it.
 */
export const ogCardSize = { height: 630, padding: 80, width: 1200 } as const;

const contentWidth = ogCardSize.width - ogCardSize.padding * 2;

const titleSizes = [76, 66, 58, 50] as const;
const maxTitleLines = 3;

/**
 * Average glyph advance for Bricolage Grotesque Bold, as a fraction of the
 * font size. Satori does the real line breaking; this only has to be close
 * enough to pick a size, because the lines it produces are what gets rendered.
 */
const averageGlyphWidth = 0.54;

function wrap(title: string, fontSize: number): string[] {
  const maxCharacters = Math.floor(
    contentWidth / (fontSize * averageGlyphWidth)
  );
  const lines: string[] = [];
  let current = "";

  for (const word of title.split(/\s+/u).filter((part) => part.length > 0)) {
    const candidate = current === "" ? word : `${current} ${word}`;

    if (candidate.length <= maxCharacters || current === "") {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current !== "") {
    lines.push(current);
  }

  return lines;
}

/**
 * The largest size at which the title still fits three lines. Wrapping here
 * rather than leaving it to Satori means a long title can never push the
 * bottom metadata row off the card; past the smallest size it is truncated.
 */
export function fitTitle(title: string) {
  for (const fontSize of titleSizes) {
    const lines = wrap(title, fontSize);

    if (lines.length <= maxTitleLines) {
      return { fontSize, lines };
    }
  }

  const fontSize = titleSizes.at(-1) ?? 50;
  const lines = wrap(title, fontSize).slice(0, maxTitleLines);
  const last = lines.at(-1);

  if (last !== undefined) {
    lines[lines.length - 1] = `${last.replace(/[\s.,;:]+$/u, "")}…`;
  }

  return { fontSize, lines };
}
