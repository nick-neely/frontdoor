import type { MDXComponents } from "mdx/types";
import { isValidElement } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { CodeBlock } from "@/components/code-block.tsx";
import { Figure } from "@/components/figure.tsx";
import { cn } from "@/lib/utils.ts";

/**
 * Whether a link's whole content is one inline code span, as in
 * [`CONTEXT.md`](...). Such a link carries its underline on the chip instead
 * of beneath it, because the chip's rounded corners would otherwise leave the
 * link's own underline showing at its bottom edges. Mixed content keeps the
 * ordinary underline, since a chip inside a phrase is a small part of it.
 */
function isCodeOnly(children: ReactNode): boolean {
  return isValidElement(children) && children.type === "code";
}

/**
 * A link inside a Post. Prose links need to be visible before the pointer
 * arrives, which navigation links do not, so this uses the resting variant of
 * the site's one hover affordance. Off-site links get the same `rel` the footer
 * applies.
 *
 * The class is merged rather than assigned: GFM footnote references and their
 * backrefs arrive here carrying classes of their own, and overwriting them
 * would take the underline off exactly the links that most need one.
 */
export function ProseLink({
  children,
  className,
  href,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  const external = href !== undefined && /^https?:/u.test(href);

  return (
    <a
      className={cn(
        isCodeOnly(children) ? "prose-code-link" : "link-underline-resting",
        className
      )}
      href={href}
      rel={external ? "noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  );
}

/**
 * The affordance that makes a section shareable. It occupies its space at all
 * times and only becomes visible on hover or focus, so revealing it never moves
 * a word of the heading it belongs to.
 */
function HeadingAnchor({ id }: { id: string | undefined }) {
  if (id === undefined) {
    return null;
  }

  return (
    <a
      aria-label="Permalink to this section"
      className="heading-anchor link-underline"
      href={`#${id}`}
    >
      #
    </a>
  );
}

function ProseH2({ children, ...props }: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2 {...props}>
      {children}
      <HeadingAnchor id={props.id} />
    </h2>
  );
}

function ProseH3({ children, ...props }: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3 {...props}>
      {children}
      <HeadingAnchor id={props.id} />
    </h3>
  );
}

/**
 * A GFM table, in its own scroller. A table wide enough to break the measure
 * scrolls inside this box rather than pushing the page sideways, which is the
 * difference between one awkward table and a document that no longer fits the
 * viewport.
 */
function ProseTable({ children, ...props }: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="prose-scroll">
      <table {...props}>{children}</table>
    </div>
  );
}

interface CalloutProps {
  children: ReactNode;
  /** A mono line above the body, e.g. "Note". Optional and unstyled by value. */
  label?: string;
}

/**
 * The site's one aside style. There is no severity, no icon, and no colour
 * variant on purpose: a callout says "this is beside the argument", and every
 * further distinction a reader has to decode is a distinction the prose should
 * have made instead.
 */
export function Callout({ children, label }: CalloutProps) {
  return (
    <aside className="callout">
      {label === undefined ? null : <p className="callout-label">{label}</p>}
      {children}
    </aside>
  );
}

interface ProcessProps {
  children: ReactNode;
  /** A visible caption that names the sequence for sighted readers and AT. */
  label: string;
}

/**
 * A compact four-step sequence for workflows that prose would otherwise make
 * a reader reconstruct. The steps remain an ordinary list in the document,
 * and CSS only changes their spatial arrangement when the measure can hold it.
 */
export function Process({ children, label }: ProcessProps) {
  return (
    <figure className="process">
      <figcaption className="process-label">{label}</figcaption>
      <ol>{children}</ol>
    </figure>
  );
}

interface ProcessStepProps {
  children: ReactNode;
  title: string;
}

export function ProcessStep({ children, title }: ProcessStepProps) {
  return (
    <li>
      <p className="process-step-title">{title}</p>
      <div className="process-step-body">{children}</div>
    </li>
  );
}

interface GlossaryProps {
  children: ReactNode;
  /** A mono line above the entries, usually the file the glossary lives in. */
  label: string;
}

/**
 * A glossary excerpt, shaped like an entry in `CONTEXT.md`: a term, what it
 * means, and the words to avoid for it. The entries are a definition list,
 * so the term-to-meaning pairing survives without the styling.
 */
export function Glossary({ children, label }: GlossaryProps) {
  return (
    <figure className="glossary">
      <figcaption className="glossary-label">{label}</figcaption>
      <dl>{children}</dl>
    </figure>
  );
}

interface GlossaryEntryProps {
  /** Words that must not stand in for this term. Rendered struck through. */
  avoid?: string[];
  children: ReactNode;
  term: string;
}

export function GlossaryEntry({ avoid, children, term }: GlossaryEntryProps) {
  return (
    <div className="glossary-entry">
      <dt>{term}</dt>
      <dd>{children}</dd>
      {avoid === undefined || avoid.length === 0 ? null : (
        <dd className="glossary-avoid">
          Avoid:{" "}
          {avoid.map((word, index) => (
            <span key={word}>
              {index === 0 ? null : ", "}
              <s>{word}</s>
            </span>
          ))}
        </dd>
      )}
    </div>
  );
}

interface CompareProps {
  children: ReactNode;
}

/**
 * Two things read against each other. Side by side when the measure can hold
 * both, stacked on a phone, and in both cases in source order, so a reader
 * who cannot see the layout still meets one side and then the other.
 */
export function Compare({ children }: CompareProps) {
  return <div className="compare">{children}</div>;
}

interface CompareSideProps {
  children: ReactNode;
  title: string;
}

export function CompareSide({ children, title }: CompareSideProps) {
  return (
    <section aria-label={title} className="compare-side">
      <p className="compare-title">{title}</p>
      {children}
    </section>
  );
}

/**
 * What a Post's prose overrides. Everything not listed here is typography,
 * which `.prose` in `src/styles.css` handles - `details`, `kbd`, footnotes and
 * the rest are styled there rather than wrapped in a component.
 *
 * `Figure` is in the map rather than imported by an author because
 * `remarkPostImages` writes it into the tree; a plain Markdown image is what
 * gets authored.
 */
export const mdxComponents: MDXComponents = {
  Callout,
  Compare,
  CompareSide,
  Figure,
  Glossary,
  GlossaryEntry,
  Process,
  ProcessStep,
  a: ProseLink,
  h2: ProseH2,
  h3: ProseH3,
  pre: CodeBlock,
  table: ProseTable,
};
