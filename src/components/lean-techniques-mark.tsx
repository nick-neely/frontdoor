interface LeanTechniquesMarkProps {
  className?: string;
}

/**
 * Lean TECHniques' compact LT mark, traced from the company's official
 * wordmark. It follows the surrounding text colour so it remains legible in
 * both of this site's themes.
 */
export function LeanTechniquesMark({ className }: LeanTechniquesMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      viewBox="0 0 56 55"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.17 16.27v21.5h17.05v.74H12.43V16.27h.74Z"
        fill="currentColor"
      />
      <path
        d="M36.87 18.99v19.57h-2.82V18.99h-7.25v-2.81h17.33v2.81h-7.26Z"
        fill="currentColor"
      />
      <path
        d="M52.78 28.17V2.58H2.66V52.3h47.06"
        stroke="currentColor"
        strokeWidth="5"
      />
    </svg>
  );
}
