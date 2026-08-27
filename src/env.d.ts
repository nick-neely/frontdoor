/// <reference types="vite/client" />

/**
 * Build-time flags the client bundle is allowed to read. Vite's own
 * `ImportMetaEnv` carries an index signature, so declaring each flag here is
 * what makes a typo a type error and what documents the flag next to its type.
 */
interface ImportMetaEnv {
  /**
   * `"true"` enables the hero parallax layer. Absent or anything else leaves
   * it off, which is the default; see `DESIGN.md` on why it ships behind a
   * flag and is judged with eyes rather than in a specification.
   */
  readonly VITE_HERO_PARALLAX?: string;
}
