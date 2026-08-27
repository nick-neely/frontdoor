import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

import { FrontDoorCursor } from "@/components/front-door-cursor.tsx";
import { LeanTechniquesMark } from "@/components/lean-techniques-mark.tsx";
import { readLatestPush } from "@/lib/github-activity.server.ts";
import { privateRepoLabel, relativePushLabel } from "@/lib/github-activity.ts";
import { projects } from "@/lib/projects.ts";
import {
  createGraph,
  createOrganizationSchema,
  createPersonSchema,
  createSeoHead,
  createWebPageSchema,
  createWebsiteSchema,
  pageTitle,
} from "@/lib/seo.ts";
import { siteConfig } from "@/lib/site-config.ts";
import type { Update } from "@/lib/updates.ts";
import { mergeUpdates } from "@/lib/updates.ts";
import { formatPostDate, posts } from "@/lib/writing.ts";

/**
 * The one Experience moment on the site. Everything else is restrained so this
 * page can carry the identity, which is also why nothing here animates on
 * arrival: the only motion is the door, and only when the reader opens it.
 */

/**
 * The merged Update feed, computed once at module scope. Both sources are
 * static frontmatter, so this is the same three rows for the life of the
 * process and there is nothing for a render to recompute.
 */
const updates = mergeUpdates(posts, projects);

/**
 * `DESIGN.md` permits parallax only as a bounded, transform-only exception on
 * a non-textual layer, behind a flag, judged with eyes. Default off.
 */
const heroParallaxEnabled = import.meta.env.VITE_HERO_PARALLAX === "true";

/**
 * The differential the doctrine caps at 20% of the reader's scroll. 8% was the
 * original ceiling and read as nothing at all on a poster this large, so the
 * cap moved and this sits just under it: enough drift to be seen, still
 * bounded by the poster's own height so the line never reaches the copy below.
 */
const parallaxRatio = 0.18;

/**
 * The one thing that crosses the server boundary on this page.
 *
 * The handler is compiled out of the client bundle, and the import of
 * `github-activity.server.ts` goes with it - which is what keeps the token,
 * the request, and the raw events server-side rather than a convention
 * somebody has to remember.
 */
const fetchLatestPush = createServerFn().handler(async () => {
  const push = await readLatestPush(new Date());

  return push;
});

/** The Now Line's live clause, already resolved to the words it renders as. */
interface NowActivity {
  repoLabel: string;
  when: string;
}

/**
 * Moves the poster line, and only the poster line, against the scroll.
 *
 * The line is decoration - the heading's accessible name lives in a `sr-only`
 * span that does not move, and the cursor travels with the word because it is
 * one graphic object rather than two. Everything a reader has to read stays
 * fixed to the page. Bounded to the poster's own height, so the offset stops
 * growing the moment the hero has scrolled past.
 */
function useHeroParallax(posterRef: RefObject<HTMLDivElement | null>): void {
  useEffect(() => {
    const poster = posterRef.current;
    const enabled =
      heroParallaxEnabled &&
      poster !== null &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;

    function apply() {
      frame = 0;

      if (poster === null) {
        return;
      }

      const travelled = Math.min(
        Math.max(window.scrollY, 0),
        poster.offsetHeight
      );
      const offset = (-travelled * parallaxRatio).toFixed(2);

      poster.style.transform = `translate3d(0, ${offset}px, 0)`;
    }

    function onScroll() {
      if (frame === 0) {
        frame = requestAnimationFrame(apply);
      }
    }

    if (enabled) {
      apply();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", onScroll);

      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }

      if (poster !== null) {
        poster.style.transform = "";
      }
    };
  }, [posterRef]);
}

/**
 * The live half of the Now Line.
 *
 * The page is prerendered, so this arrives after hydration and hangs on its
 * own line under a Now Line that already reads as finished. Every failure
 * resolves to `null` and the clause simply never appears: no loader, no
 * Suspense boundary, no reserved gap. The relative day is resolved here
 * rather than in the markup, because a clock read from JSX is a hydration
 * mismatch waiting to happen and this one only ever has to be read once.
 */
function useLatestActivity(): NowActivity | null {
  const [activity, setActivity] = useState<NowActivity | null>(null);

  useEffect(() => {
    let live = true;

    async function read() {
      try {
        const push = await fetchLatestPush();

        if (live && push !== null) {
          setActivity({
            repoLabel: push.repoLabel,
            when: relativePushLabel(push.pushedAt, new Date()),
          });
        }
      } catch {
        // Offline, rate-limited, or misconfigured. Absence is the right answer
        // and the only one the Now Line was written to need.
      }
    }

    void read();

    return () => {
      live = false;
    };
  }, []);

  return activity;
}

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () =>
    createSeoHead({
      canonicalPath: "/",
      description: siteConfig.description,
      structuredData: createGraph([
        createPersonSchema(),
        createOrganizationSchema(),
        createWebsiteSchema(),
        createWebPageSchema({
          description: siteConfig.description,
          name: siteConfig.name,
          path: "/",
        }),
      ]),
      title: pageTitle(),
    }),
});

function Separator() {
  return <span aria-hidden="true"> · </span>;
}

function NowLine() {
  const activity = useLatestActivity();
  const { now } = siteConfig;
  const repoHref =
    activity !== null && activity.repoLabel !== privateRepoLabel
      ? `https://github.com/${activity.repoLabel}`
      : null;

  return (
    <p className="mt-10 flex max-w-2xl items-start gap-2.5 font-mono text-[13px] leading-6 text-muted-foreground sm:mt-12">
      <span
        aria-hidden="true"
        className="mt-2 size-1.5 shrink-0 rounded-full bg-signal"
      />
      <span className="min-w-0">
        <span>
          Currently: building{" "}
          <a
            className="link-underline text-foreground"
            href={now.buildingUrl}
            rel="noreferrer"
          >
            {now.building}
          </a>
          <Separator />
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="mr-0.5">consulting at</span>{" "}
            <LeanTechniquesMark className="relative top-px size-4 shrink-0 text-foreground" />
            <span className="text-foreground">{now.consulting}</span>
          </span>
          <Separator />
          {now.location}
        </span>
        {activity === null ? null : (
          <span className="block">
            pushed to{" "}
            {repoHref === null ? (
              activity.repoLabel
            ) : (
              <a
                className="link-underline text-foreground"
                href={repoHref}
                rel="noreferrer"
              >
                {activity.repoLabel}
              </a>
            )}{" "}
            {activity.when}
          </span>
        )}
      </span>
    </p>
  );
}

function UpdateRow({ update }: { update: Update }) {
  return (
    <li className="border-t border-border py-6 first:border-t-0 first:pt-0">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-muted-foreground">
        <time dateTime={update.date}>{formatPostDate(update.date)}</time>
        <span aria-hidden="true" className="text-border">
          ·
        </span>
        <span>{update.sourceLabel}</span>
      </p>
      <p className="mt-2 font-display text-xl font-semibold tracking-tight">
        {update.kind === "post" ? (
          <Link
            className="link-underline"
            params={{ slug: update.slug }}
            // The same shared element the `/writing` list hands over, so a Post
            // opened from here travels exactly as it does from the list.
            style={{ viewTransitionName: update.transitionName }}
            to="/writing/$slug"
          >
            {update.title}
          </Link>
        ) : (
          <a className="link-underline" href={update.url} rel="noreferrer">
            {update.title}
          </a>
        )}
      </p>
    </li>
  );
}

function HomePage() {
  const posterRef = useRef<HTMLDivElement>(null);

  useHeroParallax(posterRef);

  return (
    <main className="flex-1" id="main-content">
      <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-24 sm:px-8 sm:pt-12 sm:pb-28">
        <div
          className="flex items-baseline gap-[0.06em] font-display text-[clamp(5rem,29vw,23rem)] leading-none font-extrabold tracking-[-0.04em]"
          ref={posterRef}
        >
          <h1>
            <span className="sr-only">{siteConfig.name}</span>
            {/* The letters are decoration; the heading's name is the span above. */}
            <span aria-hidden="true">NICK</span>
          </h1>
          <FrontDoorCursor />
        </div>

        <p className="mt-14 max-w-2xl font-display text-2xl leading-9 font-semibold tracking-[-0.02em] text-balance sm:text-3xl sm:leading-11">
          {siteConfig.tagline}
        </p>

        {/* Bio approved by Nick 2026-08-25; edit freely */}
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          I&apos;m a product-minded software consultant. By day I help teams
          turn the workflows everyone dreads into software they can actually
          maintain. The rest of the time I&apos;m experimenting: shipping my own
          products, exploring AI-agentic workflows, and writing about what
          actually holds up. Away from the keyboard: weightlifting, 3D printing,
          and four cats with strong opinions.
        </p>

        <NowLine />

        <section aria-labelledby="start-here" className="mt-20 sm:mt-24">
          <h2
            className="font-display text-lg font-semibold tracking-tight"
            id="start-here"
          >
            Start here
          </h2>
          <div className="mt-6 grid max-w-3xl gap-8 sm:grid-cols-3">
            <div className="border-t border-border pt-5">
              <h3 className="font-display text-xl font-semibold tracking-tight">
                <Link className="link-underline" to="/work">
                  Work
                </Link>
              </h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                Roles, documented Proof Points, and how I approach software
                consulting.
              </p>
            </div>
            <div className="border-t border-border pt-5">
              <h3 className="font-display text-xl font-semibold tracking-tight">
                <Link className="link-underline" to="/projects">
                  Projects
                </Link>
              </h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                Products, Client Work, and Experiments that have shipped.
              </p>
            </div>
            <div className="border-t border-border pt-5">
              <h3 className="font-display text-xl font-semibold tracking-tight">
                <Link className="link-underline" to="/writing">
                  Writing
                </Link>
              </h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                Posts on product engineering, practical AI, and building in
                public.
              </p>
            </div>
          </div>
        </section>

        {updates.length === 0 ? null : (
          <section aria-labelledby="latest" className="mt-20 sm:mt-24">
            <h2
              className="font-display text-lg font-semibold tracking-tight"
              id="latest"
            >
              Latest
            </h2>
            <ul className="mt-6 flex max-w-2xl flex-col">
              {updates.map((update) => (
                <UpdateRow
                  key={`${update.date}-${update.title}`}
                  update={update}
                />
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
