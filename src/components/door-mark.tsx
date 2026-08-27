interface DoorMarkProps {
  className?: string;
}

/**
 * The site mark: a door standing ajar with accent amber leaking through the
 * opening. The frame and the leaf take `currentColor` so the mark follows
 * whatever text colour it sits in; the light is the one sanctioned colour
 * literal on the site, because it is the same amber in both themes.
 */
export function DoorMark({ className }: DoorMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        height="27"
        rx="2"
        stroke="currentColor"
        strokeWidth="3"
        width="21"
        x="5.5"
        y="2.5"
      />
      <rect fill="#F5A524" height="21" width="5.5" x="19.5" y="5.5" />
      <path d="M8.5 6.5 L19.5 4.5 V27.5 L8.5 25.5 Z" fill="currentColor" />
      <circle cx="16" cy="16" fill="#F5A524" r="1.3" />
    </svg>
  );
}
