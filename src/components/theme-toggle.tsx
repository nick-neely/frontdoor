import { IconMoon, IconSun } from "@tabler/icons-react";

import { currentTheme, setTheme } from "@/lib/theme.ts";

/**
 * Which theme is active is expressed entirely in CSS, through the `dark`
 * variant, so the server and the first client paint render the same markup and
 * the button never has to wait for hydration to say the right thing. The label
 * follows the same route: the inactive one is `display: none` and therefore
 * absent from the accessible name.
 */
export function ThemeToggle() {
  return (
    <button
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
      onClick={() => {
        setTheme(currentTheme() === "dark" ? "light" : "dark");
      }}
      type="button"
    >
      <IconMoon
        aria-hidden="true"
        className="size-[18px] dark:hidden"
        stroke={1.75}
      />
      <IconSun
        aria-hidden="true"
        className="hidden size-[18px] dark:block"
        stroke={1.75}
      />
      <span className="sr-only dark:hidden">Switch to dark theme</span>
      <span className="sr-only hidden dark:inline">Switch to light theme</span>
    </button>
  );
}
