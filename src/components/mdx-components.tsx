import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

/**
 * A link inside a Post. Prose links need to be visible before the pointer
 * arrives, which navigation links do not, so this uses the resting variant of
 * the site's one hover affordance. Off-site links get the same `rel` the footer
 * applies.
 */
export function ProseLink({
  children,
  href,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  const external = href !== undefined && /^https?:/u.test(href);

  return (
    <a
      className="link-underline-resting"
      href={href}
      rel={external ? "noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  );
}

/**
 * The only element a Post's prose overrides. Everything else is typography,
 * which `.prose` in `src/styles.css` handles, so adding a heading style does
 * not mean adding a component.
 */
export const mdxComponents: MDXComponents = { a: ProseLink };
