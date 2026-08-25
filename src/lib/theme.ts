import { siteConfig } from "./site-config.ts";

export type ThemeName = "dark" | "light";

/** Dark is the product default, so an absent preference resolves to dark. */
const defaultTheme = "dark";
const storageKey = "theme";

/**
 * The rendered `dark` class is the single source of truth for the current
 * theme. It is set before first paint by `themeScript` and is therefore
 * correct earlier than any React state could be.
 */
export function currentTheme(): ThemeName {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function setTheme(theme: ThemeName): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", siteConfig.themeColors[theme]);

  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // Storage is unavailable in private modes and behind some blockers. The
    // theme still applies for this page; only the preference is lost.
  }
}

/**
 * Runs blocking in the document head so the stored theme is on `<html>` before
 * the first paint. The server renders the dark default, which means this only
 * has work to do for a reader who chose light.
 */
export const themeScript = `(()=>{try{const s=localStorage.getItem(${JSON.stringify(storageKey)});const t=s==="light"||s==="dark"?s:${JSON.stringify(defaultTheme)};document.documentElement.classList.toggle("dark",t==="dark");document.querySelector('meta[name="theme-color"]')?.setAttribute("content",t==="dark"?${JSON.stringify(siteConfig.themeColors.dark)}:${JSON.stringify(siteConfig.themeColors.light)});}catch(e){}})();`;
