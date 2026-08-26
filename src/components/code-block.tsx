import { useRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

import { CopyButton } from "@/components/copy-button.tsx";

/**
 * `data-title` is written onto the `<pre>` by `transformerCodeBlockTitle`, and
 * it is the only thing the fence's `title="..."` meta survives as.
 */
type CodeBlockProps = ComponentPropsWithoutRef<"pre"> & {
  "data-title"?: string;
};

/**
 * The chrome around a highlighted fence: an optional filename bar and a copy
 * control, both quiet, neither of them load-bearing for reading the code.
 *
 * The `<pre>` itself is Shiki's output, spread through untouched, so the
 * highlighting stays exactly what the build produced and this component adds
 * only the surround.
 */
export function CodeBlock({ children, ...props }: CodeBlockProps) {
  const code = useRef<HTMLPreElement>(null);
  const title = props["data-title"];

  return (
    <div className="code-block">
      {title === undefined ? null : <p className="code-block-title">{title}</p>}
      <CopyButton source={code} />
      <pre {...props} ref={code}>
        {children}
      </pre>
    </div>
  );
}
