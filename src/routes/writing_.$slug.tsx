import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { MDXContent } from "mdx/types";

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
  findReadablePost,
  formatPostDate,
  pillarLabel,
  postCanonicalPath,
  postModuleId,
  postOgImagePath,
  postPath,
  postTitleTransitionName,
} from "@/lib/writing.ts";
import type { Post } from "@/lib/writing.ts";

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
    if (findReadablePost(params.slug) === undefined) {
      // `notFound()` returns TanStack Router's control-flow signal rather
      // than an Error, which is exactly what the router expects to catch.
      // oxlint-disable-next-line typescript/only-throw-error
      throw notFound();
    }
  },
  head: ({ params }) => {
    const post = findReadablePost(params.slug);

    if (post === undefined) {
      return {};
    }

    const url = absoluteUrl(postPath(post));
    const imageUrl = absoluteUrl(postOgImagePath(post));

    return createSeoHead({
      canonicalPath: postCanonicalPath(post),
      description: post.description,
      image: { alt: post.title, path: postOgImagePath(post) },
      structuredData: createGraph([
        createArticleSchema({
          dateModified: post.updated,
          datePublished: post.published,
          description: post.description,
          headline: post.title,
          imageUrl,
          url,
        }),
      ]),
      title: pageTitle(post.title),
      type: "article",
    });
  },
  component: PostPage,
});

function PostMeta({ post }: { post: Post }) {
  return (
    <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-muted-foreground">
      <time dateTime={post.published}>{formatPostDate(post.published)}</time>
      {post.updated === undefined ? null : (
        <>
          <span aria-hidden="true" className="text-border">
            ·
          </span>
          <span>
            Updated{" "}
            <time dateTime={post.updated}>{formatPostDate(post.updated)}</time>
          </span>
        </>
      )}
      <span aria-hidden="true" className="text-border">
        ·
      </span>
      <span>{post.readingMinutes} min read</span>
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
  );
}

function PostPage() {
  const { slug } = Route.useParams();
  const post = findReadablePost(slug);
  const body = post === undefined ? undefined : bodies[postModuleId(post)];

  if (post === undefined || body === undefined) {
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
            style={{ viewTransitionName: postTitleTransitionName(post) }}
          >
            {post.title}
          </h1>
          <PostMeta post={post} />
        </header>
        <div className="prose mt-12">
          <Body components={mdxComponents} />
        </div>
        {/* After the prose and before the way back: the reader has finished,
            which is the only moment asking for an address is not an interruption.
            The source is the Post's own path, so the analytics event answers
            which piece of writing earned the signup. */}
        <NewsletterCapture className="mt-16" source={postPath(post)} />
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
