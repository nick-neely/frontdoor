import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { MDXContent } from "mdx/types";
import { Fragment } from "react";
import type { ReactNode } from "react";

import { mdxComponents } from "@/components/mdx-components.tsx";
import { NewsletterCapture } from "@/components/newsletter-capture.tsx";
import {
  createArticleSchema,
  createGraph,
  createSeoHead,
  absoluteUrl,
  pageTitle,
} from "@/lib/seo.ts";
import {
  findReadableWriting,
  formatPostDate,
  isNote,
  pillarLabel,
  postCanonicalPath,
  postModuleId,
  postOgImagePath,
  postPath,
  postTitleTransitionName,
} from "@/lib/writing.ts";
import type { WritingEntry } from "@/lib/writing.ts";

/**
 * The compiled MDX bodies, per ADR-0001: each file is a real module rather than
 * prose serialized into the index, so `/writing` and the home feed never load
 * any of this.
 *
 * The glob is eager because the body has to be present in the very first render
 * on both sides. A dynamic import resolves after hydration has already run,
 * which leaves either a Suspense boundary in the prerendered HTML or a Post
 * whose prose is missing until JavaScript arrives.
 *
 * Only the component reads it, never the loader or the head, which is what
 * keeps it in the route's split chunk instead of the entry bundle. Moving that
 * read into the loader silently moves every Post's prose onto every page, so
 * check the chunk sizes if this ever needs to change.
 */
const bodies = import.meta.glob<{ default: MDXContent }>(
  "/content/writing/*.mdx",
  { eager: true }
);

export const Route = createFileRoute("/writing_/$slug")({
  // In production a draft and an unknown slug are the same thing to a reader: a
  // wrong door. Deciding here rather than in the component settles the 404
  // before anything renders, and it keeps the body glob out of the eager route
  // module.
  loader: ({ params }) => {
    if (findReadableWriting(params.slug) === undefined) {
      // `notFound()` returns TanStack Router's control-flow signal rather
      // than an Error, which is exactly what the router expects to catch.
      // oxlint-disable-next-line typescript/only-throw-error
      throw notFound();
    }
  },
  // Both kinds carry an Article: the structured data still states when the
  // piece was first published and when it was last revised, because a machine
  // reading the page has no other way to date it. Only the visible line under
  // the title distinguishes them.
  head: ({ params }) => {
    const entry = findReadableWriting(params.slug);

    if (entry === undefined) {
      return {};
    }

    const url = absoluteUrl(postPath(entry));
    const imageUrl = absoluteUrl(postOgImagePath(entry));

    return createSeoHead({
      canonicalPath: postCanonicalPath(entry),
      description: entry.description,
      image: { alt: entry.title, path: postOgImagePath(entry) },
      structuredData: createGraph([
        createArticleSchema({
          dateModified: entry.updated,
          datePublished: entry.published,
          description: entry.description,
          headline: entry.title,
          imageUrl,
          url,
        }),
      ]),
      title: pageTitle(entry.title),
      type: "article",
    });
  },
  component: WritingPage,
});

/** One dot-separated part of the metadata line, and the key it renders under. */
interface MetaPart {
  key: string;
  node: ReactNode;
}

/**
 * What the line under a title says, which is the only place the two kinds of
 * writing look different.
 *
 * A Post prints the day it was published, because that is when it happened and
 * it will not be rewritten. A Note does not: it is revised rather than
 * superseded, so its first publication is provenance rather than news, and
 * printing it would invite a reader to judge evergreen writing by its age.
 * What a Note can honestly say is when it was last touched, and it says that
 * whenever frontmatter records it. Everything after the date - the reading
 * time, the Pillar - is true of both and reads identically.
 */
function metaParts(entry: WritingEntry): MetaPart[] {
  const parts: MetaPart[] = [];

  if (!isNote(entry)) {
    parts.push({
      key: "published",
      node: (
        <time dateTime={entry.published}>
          {formatPostDate(entry.published)}
        </time>
      ),
    });
  }

  if (entry.updated !== undefined) {
    parts.push({
      key: "updated",
      node: (
        <span>
          Updated{" "}
          <time dateTime={entry.updated}>{formatPostDate(entry.updated)}</time>
        </span>
      ),
    });
  }

  parts.push(
    {
      key: "reading",
      node: <span>{entry.readingMinutes} min read</span>,
    },
    {
      key: "pillar",
      node: (
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-signal"
          />
          {pillarLabel(entry)}
        </span>
      ),
    }
  );

  return parts;
}

function WritingMeta({ entry }: { entry: WritingEntry }) {
  return (
    <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-muted-foreground">
      {metaParts(entry).map((part, index) => (
        <Fragment key={part.key}>
          {index === 0 ? null : (
            <span aria-hidden="true" className="text-border">
              ·
            </span>
          )}
          {part.node}
        </Fragment>
      ))}
    </p>
  );
}

function WritingPage() {
  const { slug } = Route.useParams();
  const entry = findReadableWriting(slug);
  const body = entry === undefined ? undefined : bodies[postModuleId(entry)];

  if (entry === undefined || body === undefined) {
    // `notFound()` returns TanStack Router's control-flow signal rather than
    // an Error, which is exactly what the router expects to catch.
    // oxlint-disable-next-line typescript/only-throw-error
    throw notFound();
  }

  const Body = body.default;

  return (
    <main className="flex-1" id="main-content">
      <article className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <header className="max-w-2xl">
          <h1
            className="font-display text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl"
            style={{ viewTransitionName: postTitleTransitionName(entry) }}
          >
            {entry.title}
          </h1>
          <WritingMeta entry={entry} />
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {entry.description}
          </p>
        </header>
        <div className="prose mt-12">
          <Body components={mdxComponents} />
        </div>
        {/* After the prose and before the way back: the reader has finished,
            which is the only moment asking for an address is not an interruption.
            The source is the piece's own path, so the analytics event answers
            which piece of writing earned the signup. */}
        <NewsletterCapture className="mt-16" source={postPath(entry)} />
        <footer className="mt-16 max-w-2xl border-t border-border pt-8">
          <Link
            className="link-underline font-mono text-[13px] text-foreground"
            to="/writing"
          >
            ← All writing
          </Link>
        </footer>
      </article>
    </main>
  );
}
