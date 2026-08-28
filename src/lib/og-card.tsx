import type { ReactElement } from "react";

import { fitTitle, ogCardSize } from "./og-card-layout.ts";
import type { OgCardContent } from "./og-card-layout.ts";

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

interface OgCardProps extends OgCardContent {
  siteMark: string;
}

export function OgCard({ meta, siteMark, title }: OgCardProps): ReactElement {
  const { fontSize, lines } = fitTitle(title);

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
        <img alt="" height={56} src={siteMark} width={56} />
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
        {meta.map((part, index) => (
          <div
            key={part}
            style={{ alignItems: "center", display: "flex", gap: 14 }}
          >
            {index === 0 ? null : <div style={{ color: ink.separator }}>·</div>}
            <div>{part}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
