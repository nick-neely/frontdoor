import type { ComponentType } from "react";

/**
 * A small vendored mark served out of `public/logos`, or the inline component
 * standing in for one, at the fixed size `/uses` and `/work` share.
 *
 * `dark` is set only where a second file is cut for dark grounds; a mark that
 * carries its own colour ships one file and is served to both themes. The
 * light/dark pair swaps in CSS on the same `dark:` variant the theme toggle
 * uses, so the server and the first client paint agree and neither theme
 * waits for hydration to show the right file.
 */
export type VendoredMarkSource =
  | { component: ComponentType<{ className?: string }> }
  | { dark?: string; src: string };

const vendoredMarkSize = 18;

const markClass = "size-[18px] shrink-0 object-contain";

/**
 * The mark, the component standing in for one, or the space either would
 * occupy - so a row list that carries any mark keeps its names in one column.
 * Decorative in every form: empty alt, aria-hidden slot.
 */
export function VendoredMark({ mark }: { mark?: VendoredMarkSource }) {
  if (mark === undefined) {
    return <span aria-hidden="true" className={markClass} />;
  }

  if ("component" in mark) {
    const Mark = mark.component;

    return <Mark className={markClass} />;
  }

  if (mark.dark === undefined) {
    return (
      <img
        alt=""
        className={markClass}
        decoding="async"
        height={vendoredMarkSize}
        src={mark.src}
        width={vendoredMarkSize}
      />
    );
  }

  return (
    <>
      <img
        alt=""
        className={`${markClass} dark:hidden`}
        decoding="async"
        height={vendoredMarkSize}
        src={mark.src}
        width={vendoredMarkSize}
      />
      <img
        alt=""
        className={`${markClass} hidden dark:block`}
        decoding="async"
        height={vendoredMarkSize}
        src={mark.dark}
        width={vendoredMarkSize}
      />
    </>
  );
}
