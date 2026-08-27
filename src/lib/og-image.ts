import { readFileSync } from "node:fs";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import type { SatoriOptions } from "satori";

import { ogCardSize } from "./og-card-layout.ts";
import type { OgCardContent } from "./og-card-layout.ts";
import { OgCard } from "./og-card.tsx";

function fontFile(name: string): Buffer {
  return readFileSync(new URL(`../../assets/fonts/${name}`, import.meta.url));
}

/**
 * Satori reads static TTFs only, which is why these are vendored under
 * `assets/fonts` rather than taken from the variable `woff2` files the site
 * itself serves. Both are recorded in `THIRD_PARTY_NOTICES.md`.
 */
const fonts: SatoriOptions["fonts"] = [
  {
    data: fontFile("BricolageGrotesque-Bold.ttf"),
    name: "Bricolage Grotesque",
    style: "normal",
    weight: 700,
  },
  {
    data: fontFile("JetBrainsMono-Regular.ttf"),
    name: "JetBrains Mono",
    style: "normal",
    weight: 400,
  },
];

/** Renders one social card to PNG bytes. Build time only. */
export async function renderOgImage(
  content: OgCardContent
): Promise<Uint8Array> {
  const svg = await satori(OgCard(content), {
    fonts,
    height: ogCardSize.height,
    width: ogCardSize.width,
  });

  return new Resvg(svg, {
    fitTo: { mode: "width", value: ogCardSize.width },
  })
    .render()
    .asPng();
}
