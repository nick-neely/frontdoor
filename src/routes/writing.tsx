import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { NewsletterCapture } from "@/components/newsletter-capture.tsx";
import {
  createGraph,
  createSeoHead,
  createWebPageSchema,
  pageTitle,
} from "@/lib/seo.ts";
import {
  formatPostDate,
  notes,
  pillarLabel,
  postTitleTransitionName,
  posts,
  writingDescription,
} from "@/lib/writing.ts";
import type { WritingEntry } from "@/lib/writing.ts";

export const Route = createFileRoute("/writing")({
  component: WritingPage,
  head: () =>
    createSeoHead({
      canonicalPath: "/writing",
      description: writingDescription,
      structuredData: createGraph([
        createWebPageSchema({
          description: writingDescription,
          name: "Writing",
          path: "/writing",
          type: "CollectionPage",
        }),
      ]),
      title: pageTitle("Writing"),
    }),
});

/**
 * Row titles are the page's second heading level while one list is the whole
 * page, and its third once a "Posts" and a "Notes" heading sit above two. The
 * level is passed rather than fixed so the outline stays true in both shapes.
 */
type RowHeading = "h2" | "h3";

const rowClassName = "border-t border-border py-8 first:border-t-0 first:pt-0";
const listClassName = "flex max-w-2xl flex-col";

function RowTitle({
  entry,
  heading: Heading,
}: {
  entry: WritingEntry;
  heading: RowHeading;
}) {
  return (
    <Heading className="font-display text-2xl font-semibold tracking-tight">
      <Link
        className="link-underline"
        params={{ slug: entry.slug }}
        // The one shared element in the site's route transitions: this title
        // is the same object as the heading on the page it opens.
        style={{ viewTransitionName: postTitleTransitionName(entry) }}
        to="/writing/$slug"
      >
        {entry.title}
      </Link>
    </Heading>
  );
}

function PostRow({
  heading,
  post,
}: {
  heading: RowHeading;
  post: WritingEntry;
}) {
  return (
    <li className={rowClassName}>
      <RowTitle entry={post} heading={heading} />
      <p className="mt-2 leading-7 text-muted-foreground">{post.description}</p>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-muted-foreground">
        <time dateTime={post.published}>{formatPostDate(post.published)}</time>
        <span aria-hidden="true" className="text-border">
          ·
        </span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-signal"
          />
          {pillarLabel(post)}
        </span>
      </p>
    </li>
  );
}

/**
 * A Note row is the title and the dek and nothing else. Every piece of
 * metadata a Post row carries is a claim about when it happened, and a Note is
 * revised rather than superseded: there is no moment to print.
 */
function NoteRow({
  heading,
  note,
}: {
  heading: RowHeading;
  note: WritingEntry;
}) {
  return (
    <li className={rowClassName}>
      <RowTitle entry={note} heading={heading} />
      <p className="mt-2 leading-7 text-muted-foreground">{note.description}</p>
    </li>
  );
}

/**
 * One list, labelled only when the page holds more than one. An unlabelled
 * section is deliberately left without `aria-labelledby`: pointing it at a
 * heading that is not rendered would name it after nothing.
 */
function WritingSection({
  children,
  className,
  id,
  title,
}: {
  children: ReactNode;
  className: string;
  id: string;
  title: string | undefined;
}) {
  return (
    <section
      aria-labelledby={title === undefined ? undefined : id}
      className={className}
    >
      {title === undefined ? null : (
        <h2
          className="font-mono text-[13px] tracking-[0.18em] text-muted-foreground uppercase"
          id={id}
        >
          {title}
        </h2>
      )}
      <ul
        className={
          title === undefined ? listClassName : `mt-8 ${listClassName}`
        }
      >
        {children}
      </ul>
    </section>
  );
}

function WritingPage() {
  // Two headings appear only when there are two lists to tell apart. With no
  // published Note - which is the state the site ships in until one is written
  // - the page is the single undivided list it has always been, and labelling
  // that one list "Posts" would be an answer to a question nobody asked.
  const sectioned = posts.length > 0 && notes.length > 0;
  const rowHeading: RowHeading = sectioned ? "h3" : "h2";

  return (
    <main className="flex-1" id="main-content">
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Writing
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Product engineering, practical AI, and building in public.
        </p>
        {posts.length === 0 && notes.length === 0 ? (
          <p className="mt-16 font-mono text-[13px] text-muted-foreground">
            Nothing published yet.
          </p>
        ) : null}
        {posts.length === 0 ? null : (
          <WritingSection
            className="mt-16"
            id="posts"
            title={sectioned ? "Posts" : undefined}
          >
            {posts.map((post) => (
              <PostRow heading={rowHeading} key={post.slug} post={post} />
            ))}
          </WritingSection>
        )}
        {notes.length === 0 ? null : (
          <WritingSection
            className="mt-16 sm:mt-20"
            id="notes"
            title={sectioned ? "Notes" : undefined}
          >
            {notes.map((note) => (
              <NoteRow heading={rowHeading} key={note.slug} note={note} />
            ))}
          </WritingSection>
        )}
        <NewsletterCapture className="mt-20" source="/writing" />
      </section>
    </main>
  );
}
