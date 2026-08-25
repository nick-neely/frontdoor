import { createFileRoute, Link } from "@tanstack/react-router";

import {
  createGraph,
  createSeoHead,
  createWebPageSchema,
  pageTitle,
} from "@/lib/seo.ts";
import {
  formatPostDate,
  pillarLabel,
  postTitleTransitionName,
  posts,
  writingDescription,
} from "@/lib/writing.ts";
import type { Post } from "@/lib/writing.ts";

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

function WritingRow({ post }: { post: Post }) {
  return (
    <li className="border-t border-border py-8 first:border-t-0 first:pt-0">
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        <Link
          className="link-underline"
          params={{ slug: post.slug }}
          // The one shared element in the site's route transitions: this title
          // is the same object as the heading on the page it opens.
          style={{ viewTransitionName: postTitleTransitionName(post) }}
          to="/writing/$slug"
        >
          {post.title}
        </Link>
      </h2>
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

function WritingPage() {
  return (
    <main className="flex-1" id="main-content">
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Writing
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Product engineering, practical AI, and building in public.
        </p>
        {posts.length === 0 ? (
          <p className="mt-16 font-mono text-[13px] text-muted-foreground">
            Nothing published yet.
          </p>
        ) : (
          <ul className="mt-16 flex max-w-2xl flex-col">
            {posts.map((post) => (
              <WritingRow key={post.slug} post={post} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
