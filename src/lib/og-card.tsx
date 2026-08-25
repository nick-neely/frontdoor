import type { ReactElement } from "react";

import { fitTitle, ogCardSize } from "./og-card-layout.ts";
import { formatPostDate, pillarLabel } from "./writing-schema.ts";
import type { WritingFrontmatter } from "./writing-schema.ts";

/**
 * The card's own palette. It is deliberately literal rather than tokenised:
 * a social card is rendered once at build time, has no theme to follow, and
 * must keep looking the same in a feed that knows nothing about this site.
 * The values are the dark theme's ground, its foreground, and signal amber.
 */
const ink = {
  amber: "#F5A524",
  ground: "#0e0b08",
  muted: "#a9a49b",
  separator: "#5c554c",
  text: "#f4f1ed",
} as const;

/**
 * The site mark, recreated from `src/components/door-mark.tsx` with the frame
 * and leaf resolved to the card's foreground instead of `currentColor`. Satori
 * renders SVG through `img`, so it travels as a data URI.
 */
const doorMark = `data:image/svg+xml;base64,${Buffer.from(
  [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">',
    `<rect x="5.5" y="2.5" width="21" height="27" rx="2" stroke="${ink.text}" stroke-width="3"/>`,
    `<rect x="19.5" y="5.5" width="5.5" height="21" fill="${ink.amber}"/>`,
    `<path d="M8.5 6.5 L19.5 4.5 V27.5 L8.5 25.5 Z" fill="${ink.text}"/>`,
    `<circle cx="16" cy="16" r="1.3" fill="${ink.amber}"/>`,
    "</svg>",
  ].join("")
).toString("base64")}`;

export function OgCard(post: WritingFrontmatter): ReactElement {
  const { fontSize, lines } = fitTitle(post.title);

  return (
    <div
      style={{
        backgroundColor: ink.ground,
        display: "flex",
        flexDirection: "column",
        fontFamily: "JetBrains Mono",
        height: ogCardSize.height,
        justifyContent: "space-between",
        padding: ogCardSize.padding,
        width: ogCardSize.width,
      }}
    >
      <div style={{ alignItems: "center", display: "flex", gap: 20 }}>
        <img alt="" height={56} src={doorMark} width={56} />
        <div style={{ color: ink.muted, fontSize: 26 }}>nickneely.dev</div>
      </div>

      <div
        style={{
          color: ink.text,
          display: "flex",
          flexDirection: "column",
          fontFamily: "Bricolage Grotesque",
          fontWeight: 700,
        }}
      >
        {lines.map((line, index) => (
          <div
            key={line}
            style={{
              alignItems: "flex-end",
              display: "flex",
              fontSize,
              lineHeight: 1.12,
            }}
          >
            <div>{line}</div>
            {index === lines.length - 1 ? (
              // The front-door signature: the same amber block that ends the
              // name in the hero, parked after the last character.
              <div
                style={{
                  backgroundColor: ink.amber,
                  height: Math.round(fontSize * 0.74),
                  marginBottom: Math.round(fontSize * 0.14),
                  marginLeft: Math.round(fontSize * 0.16),
                  width: Math.round(fontSize * 0.42),
                }}
              />
            ) : null}
          </div>
        ))}
      </div>

      <div
        style={{
          alignItems: "center",
          color: ink.muted,
          display: "flex",
          fontSize: 24,
          gap: 14,
        }}
      >
        <div
          style={{
            backgroundColor: ink.amber,
            borderRadius: 5,
            height: 10,
            width: 10,
          }}
        />
        <div>{pillarLabel(post)}</div>
        <div style={{ color: ink.separator }}>·</div>
        <div>{formatPostDate(post.published)}</div>
      </div>
    </div>
  );
}
