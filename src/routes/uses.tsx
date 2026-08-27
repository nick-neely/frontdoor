import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";
import type { ReactNode } from "react";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import {
  createGraph,
  createSeoHead,
  createWebPageSchema,
  pageTitle,
} from "@/lib/seo.ts";

const description =
  "The editor, agent setup, terminal, and machines Nick Neely actually works in, the Nix flake the software half is rebuilt from, and the stack he starts a new project on.";

/**
 * A vendored tool mark, served out of `public/logos`.
 *
 * Most come from svgl; a tool svgl does not carry can still get a mark when
 * the project publishes one itself, as Herdr does. What is not allowed is a
 * substitute: an incomplete set of real logos beats a complete set with
 * stand-ins in it.
 *
 * `dark` is set only where a second file is cut for dark grounds. A mark that
 * carries its own colour ships one file and is served to both themes.
 */
interface UseLogo {
  dark?: string;
  src: string;
}

/** One row: the thing, and what it is doing here. */
interface UseRow {
  item: string;
  logo?: UseLogo;
  note: ReactNode;
}

interface UseSection {
  id: string;
  lead?: string;
  /** The jump row's label, when the heading is too long to be a jump target. */
  nav?: string;
  rows: readonly UseRow[];
  title: string;
}

/*
 * Two sources feed the notes below, and neither of them is memory. Anything
 * about how a tool is configured comes off a file in `nick-neely/dotfiles`;
 * anything about how much a tool is actually used comes from Nick. A row that
 * could claim neither is not a row, which is why this page is shorter than the
 * install list behind it.
 */
const sections = [
  {
    id: "editor",
    rows: [
      {
        item: "Zed",
        logo: { dark: "/logos/zed-dark.svg", src: "/logos/zed.svg" },
        note: "Mainly Zed lately, and mainly for reading: what changed, the diff beside it, project-wide search. The typing is done by an agent, so the editor is where I navigate a codebase rather than where I compose it.",
      },
      {
        item: "Cursor",
        logo: { dark: "/logos/cursor-dark.svg", src: "/logos/cursor.svg" },
        note: "The other main editor, and the one I still switch back to. Zed has had most of the hours recently, but the job either one is doing is identical.",
      },
      {
        item: "Neovim",
        logo: { src: "/logos/neovim.svg" },
        note: "Configured in Lua and symlinked out of the Nix store on purpose, so a keymap can change without rebuilding anything. It is a small share of the day now, and saying otherwise would be nostalgia.",
      },
    ],
    title: "Editor",
  },
  {
    id: "ai-coding-setup",
    nav: "AI",
    rows: [
      {
        item: "Codex",
        logo: { dark: "/logos/codex-dark.svg", src: "/logos/codex.svg" },
        note: "The primary driver, and like Claude Code it runs in auto mode. `gpt-5.6-sol` at medium, high when the work earns it, and `luna-max` for the tasks that need less thinking, where it is still very effective. Sub-agents are doing more of it now.",
      },
      {
        item: "Claude Code",
        logo: {
          dark: "/logos/anthropic-dark.svg",
          src: "/logos/anthropic.svg",
        },
        note: "The second opinion, on a different model, running the same sub-agent workflow. Which agent gets a job is a written rule rather than a mood.",
      },
      {
        item: "T3 Code",
        logo: { dark: "/logos/t3-dark.svg", src: "/logos/t3.svg" },
        note: "The biggest change to how I work lately. A session started at the desktop reopens on the MacBook, or on a phone with both machines shut, because the session lives on the VM below and T3 is only a surface onto it.",
      },
      {
        item: "AGENTS.md",
        note: "One shared base file, concatenated with a per-harness and a per-host overlay into whatever file each agent actually reads. Same rules across four machines and two harnesses.",
      },
      {
        item: "Skills",
        note: (
          <>
            Pinned by revision in a lockfile and pulled from other people&apos;s
            repositories and my own, so an agent&apos;s instructions version
            like a dependency. Mine are published as source in{" "}
            <a
              className="link-underline text-foreground"
              href="https://github.com/nick-neely/agent-skills"
              rel="noreferrer"
            >
              nick-neely/agent-skills
            </a>
            , plain Markdown and the scripts it calls, so the same skill works
            in every harness above.
          </>
        ),
      },
      {
        item: "Hunk",
        note: "Diff review with a CLI attached, so an agent and I can work through the same hunks in the same session.",
      },
    ],
    title: "AI coding setup",
  },
  {
    id: "terminal",
    rows: [
      {
        item: "Ghostty",
        logo: { src: "/logos/ghostty.svg" },
        note: "Terminal on the Mac: FiraCode Nerd Font Mono at 14, Dracula. On the WSL desktop the shell is the same one and the window around it is not mine to configure.",
      },
      {
        item: "Starship",
        logo: { src: "/logos/starship.svg" },
        note: "Prompt, with its timeouts raised because WSL2 stats a filesystem slowly. A custom segment lights yellow when my dotfiles or my skills have drifted from the flake and red when that drift matters, and it reads a cache with a shell builtin, so the badge costs nothing per prompt. Empty is its normal state, which is the point: a badge that is always lit stops being read.",
      },
      {
        item: "Herdr",
        logo: { dark: "/logos/herdr-dark.svg", src: "/logos/herdr.svg" },
        note: "A multiplexer built for running coding agents side by side. Ctrl-A is the prefix, the sidebar carries what each agent is doing, and prefix-m and prefix-d open btop and a diff without leaving the session.",
      },
      {
        item: "Atuin",
        note: "Shell history in SQLite, on Ctrl-R. The up arrow stays dumb, deliberately.",
      },
    ],
    title: "Terminal",
  },
  {
    id: "hardware",
    lead: "Two machines and the desk one of them sits at.",
    rows: [
      {
        item: "Desktop",
        note: "The primary workstation, and where I am most comfortable working. Ryzen 7 9800X3D, 64GB of DDR5-6000 Trident Z5 Neo, 4TB plus 2TB of NVMe, an RTX 3070, an NZXT H9 Elite with a Kraken Elite 360 on top of it. Still holding out for a 5090 at a price I am willing to pay.",
      },
      {
        item: "MacBook",
        logo: { dark: "/logos/apple-dark.svg", src: "/logos/apple.svg" },
        note: "Where I work when I am not at the desk: the couch, the balcony, anywhere that is not the chair. M5 Pro, 18 cores, 64GB, 2TB.",
      },
      {
        item: "Keyboard",
        logo: { dark: "/logos/wooting-dark.svg", src: "/logos/wooting.svg" },
        note: "Wooting 80HE in the zinc alloy housing, which is super heavy and never moves. Geon Raw HE linears, tape-modded for thock, under DROP MiTo MT3 Godspeed: the Apollo base with the Milky Way kit.",
      },
      {
        item: "Desk + chair",
        note: "A Secretlab Magnus Pro XL, standing, with a LiberNovo Omni in front of it. The unglamorous reason the desktop is still the primary workstation.",
      },
    ],
    title: "Hardware",
  },
  {
    id: "hosts",
    lead: "Where the work actually runs, and what keeps two operating systems interchangeable. Increasingly it runs in a long-running agent session on a VM that neither machine has to be awake for, and the direction is a mobile workflow: a phone or a laptop steering a session that never stopped.",
    nav: "Hosts",
    rows: [
      {
        item: "exe.dev",
        logo: { src: "/logos/exe-dev.png" },
        note: "Agent sessions, repositories, and hours-long runs live on a persistent VM there and keep going after I disconnect. I reach it over mosh on the tailnet, so a closed laptop or a changed network does not end anything. Herdr and T3 Code open onto the same sessions, which is what turns a phone into a control surface.",
      },
      {
        item: "Tailscale",
        logo: {
          dark: "/logos/tailscale-dark.svg",
          src: "/logos/tailscale.svg",
        },
        note: "The private network everything else here is addressed on. Both machines, the exe.dev VM, and a Raspberry Pi at home that serves as the exit node, all reachable by name without a port opened anywhere. The mosh session above rides on it.",
      },
      {
        item: "Nix + Home Manager",
        logo: { src: "/logos/nix.svg" },
        note: "One flake covers four hosts: the WSL desktop, the Mac, a mini PC, and the exe.dev VM. A small `dot` CLI drives it, and the prompt badge above is what says when a machine has stopped matching the checkout.",
      },
      {
        item: "Windows + WSL2",
        logo: { src: "/logos/windows.svg" },
        note: "One half of the setup; the MacBook is the other. Development happens only inside Ubuntu under WSL2, never on the Windows side, and the flake strips the Windows-side toolchain entries off PATH so exactly one of them answers. That is what keeps WSL and macOS interchangeable: both are whatever the dotfiles repo prescribes.",
      },
      {
        item: "direnv + 1Password",
        logo: {
          dark: "/logos/1password-dark.svg",
          src: "/logos/1password.svg",
        },
        note: "Per-project environments from a committed `.envrc`, backed by nix-direnv. Secrets stay `op://` references, so nothing lands in a dotfile.",
      },
    ],
    title: "Hosts & config",
  },
] as const satisfies readonly UseSection[];

/** One named thing on the spec sheet below. */
interface StackItem {
  /**
   * Why this one, in a sentence or two, behind the name rather than beside it.
   * The sheet's job is to answer "what" at a glance; every reader's next
   * question is "why that", and answering it inline would cost the glance.
   */
  blurb?: string;
  href?: string;
  logo?: UseLogo;
  name: string;
  /**
   * A muted word after the name, for an entry that answers a different
   * question than the rest of its row. Electron is tagged `desktop` because
   * the framework row is otherwise a fork between two web tracks; eve is
   * tagged `agents` because the AI row's other name is the model-call layer
   * and eve is the layer above it. Both say "different axis, same row"
   * without a second row or a sentence of prose.
   */
  qualifier?: string;
}

interface StackRow {
  items: readonly StackItem[];
  label: string;
}

/*
 * The sections above are tools in daily use. This one is a different question:
 * what a new project starts as. It is a specification rather than an
 * explanation, so it reads as a spec sheet and carries almost no prose. The
 * framework row leads because it is the only real fork; every row under it is
 * the same on either track, which is the point the layout is making.
 *
 * A name here gets a mark on the same terms as the rows above: a real logo for
 * that exact tool, or nothing. Oxlint and Oxfmt share one entry under the Oxc
 * mark by Nick's call: both are Oxc tools, the mark is the family's, and one
 * glyph for the pair says that without printing it twice.
 */
const stack = [
  {
    items: [
      {
        logo: { dark: "/logos/nextjs-dark.svg", src: "/logos/nextjs.svg" },
        blurb:
          "The safe half of the fork. The largest ecosystem, the most examples, and the shortest path when the thing will outlive my attention or be handed to someone else.",
        name: "Next.js",
      },
      {
        href: "https://github.com/neely-labs/tanstack-start-template",
        logo: { src: "/logos/tanstack.svg" },
        blurb:
          "The half I reach for on my own work. Routing is typed end to end, and the data layer I would have bolted on anyway is already the framework.",
        name: "TanStack Start",
      },
      {
        logo: { src: "/logos/electron.svg" },
        blurb:
          "Same web stack, no second toolchain, so a desktop build reuses everything above it. Tauri kept being slow and clogged up for me; Electron runs well as long as you stay honest about optimisation.",
        name: "Electron",
        qualifier: "desktop",
      },
    ],
    label: "Framework",
  },
  {
    items: [
      {
        logo: { src: "/logos/typescript.svg" },
        blurb: "Not a preference so much as the floor every other row assumes.",
        name: "TypeScript",
      },
    ],
    label: "Language",
  },
  {
    items: [
      {
        logo: { src: "/logos/neon.svg" },
        blurb:
          "Scales to zero, which is the thing that makes starting the next one cheap. An idle side project costs nothing to leave running.",
        name: "Neon",
      },
      {
        logo: { dark: "/logos/drizzle-dark.svg", src: "/logos/drizzle.svg" },
        blurb:
          "SQL I can still read, with the types generated off the schema instead of off a second modelling language.",
        name: "Drizzle",
      },
    ],
    label: "Data",
  },
  {
    items: [
      {
        logo: {
          dark: "/logos/better-auth-dark.svg",
          src: "/logos/better-auth.svg",
        },
        blurb:
          "I control it, so it runs locally with nothing to sign up for and costs nothing beyond the database it already needed. The plugins cover the rest, and it is TypeScript end to end.",
        name: "Better Auth",
      },
    ],
    label: "Auth",
  },
  {
    items: [
      {
        logo: { src: "/logos/tailwindcss.svg" },
        blurb:
          "Styles live in the file with the markup, so deleting a component deletes its styles with it.",
        name: "Tailwind",
      },
      {
        logo: { dark: "/logos/shadcn-dark.svg", src: "/logos/shadcn.svg" },
        blurb:
          "Components I own the source of. They land in the repo and get edited rather than fought with through props.",
        name: "shadcn/ui",
      },
      {
        logo: { dark: "/logos/base-ui-dark.svg", src: "/logos/base-ui.svg" },
        blurb:
          "The layer under shadcn that does focus, keyboard behaviour, and positioning properly. I am not going to write that better myself.",
        name: "Base UI",
      },
    ],
    label: "UI",
  },
  {
    items: [
      {
        blurb:
          "The small amount of state that is genuinely client-side. No provider, no boilerplate.",
        name: "Zustand",
      },
      {
        logo: { src: "/logos/tanstack.svg" },
        blurb:
          "Everything that came from the server: caching, revalidation, and the loading states I would otherwise hand-roll in every component.",
        name: "TanStack Query",
      },
    ],
    label: "State",
  },
  {
    items: [
      {
        logo: { src: "/logos/zod.svg" },
        blurb:
          "One schema doing duty at the form, the request boundary, and the type. Parse at the edge and the inside stays honest.",
        name: "zod",
      },
    ],
    label: "Validation",
  },
  {
    items: [
      {
        blurb:
          "The model-call layer. One interface, and changing provider is a line rather than a rewrite.",
        name: "AI SDK",
      },
      {
        blurb:
          "Vercel's framework for durable agents, where every part of an agent is an ordinary file in the project instead of a graph buried in config.",
        name: "eve",
        qualifier: "agents",
      },
    ],
    label: "AI",
  },
  {
    items: [
      {
        logo: { src: "/logos/stripe.svg" },
        blurb:
          "Checkout, subscriptions, and tax, in the one place where building it yourself is never the cheaper answer.",
        name: "Stripe",
      },
    ],
    label: "Payments",
  },
  {
    items: [
      {
        logo: { dark: "/logos/resend-dark.svg", src: "/logos/resend.svg" },
        blurb:
          "Transactional mail without running a mail server, and an API that does not fight the rest of the stack.",
        name: "Resend",
      },
      {
        logo: { src: "/logos/react-email.svg" },
        blurb:
          "Templates as components, so the review that catches a broken page catches a broken email too.",
        name: "React Email",
      },
    ],
    label: "Email",
  },
  {
    items: [
      {
        blurb:
          "File storage already on the account the deploy is on. Nothing to provision before it works.",
        name: "Vercel Blob",
      },
    ],
    label: "Storage",
  },
  {
    items: [
      {
        blurb:
          "Background work off the request path without standing up a worker fleet to hold it.",
        name: "Vercel Queue",
      },
    ],
    label: "Jobs",
  },
  {
    items: [
      {
        logo: { src: "/logos/upstash.svg" },
        blurb:
          "Serverless Redis for the counters behind a rate limit. Per-request pricing fits something nobody is hammering yet.",
        name: "Upstash",
      },
    ],
    label: "Rate limiting",
  },
  {
    items: [
      {
        logo: { src: "/logos/vitest.svg" },
        blurb:
          "Fast enough to leave in watch mode, and it shares the Vite config the app already has.",
        name: "Vitest",
      },
      {
        blurb:
          "Tests that touch what a reader touches, so a refactor that keeps the behaviour keeps the test.",
        name: "Testing Library",
      },
      {
        logo: { src: "/logos/playwright.svg" },
        blurb:
          "The handful of paths that have to work in a real browser, end to end.",
        name: "Playwright",
      },
    ],
    label: "Testing",
  },
  {
    items: [
      {
        logo: {
          dark: "/logos/ultracite-dark.svg",
          src: "/logos/ultracite.svg",
        },
        blurb:
          "The entry point. One command covers formatting, linting, and types, so nobody has to remember three.",
        name: "Ultracite",
      },
      {
        logo: { src: "/logos/oxc.svg" },
        blurb:
          "The mechanical half, in Rust, and fast enough that running it on every save stops being a decision.",
        name: "Oxlint + Oxfmt",
      },
      {
        blurb:
          "Static analysis for what a linter cannot see: dead code, duplication, circular imports, and which part of a change actually carries risk.",
        name: "Fallow",
      },
    ],
    label: "Quality",
  },
  {
    items: [
      {
        logo: {
          dark: "/logos/turborepo-dark.svg",
          src: "/logos/turborepo.svg",
        },
        blurb:
          "Only once there is more than one app in the repo. Cached tasks, so CI stops rebuilding what did not change.",
        name: "Turborepo",
      },
    ],
    label: "Monorepos",
  },
  {
    items: [
      {
        logo: { src: "/logos/docker.svg" },
        blurb:
          "Spins up the local services: the Postgres database, Redis, whatever else the project wants. The whole environment comes up on the machine in front of me.",
        name: "Docker",
      },
    ],
    label: "Local",
  },
  {
    items: [
      {
        logo: { dark: "/logos/vercel-dark.svg", src: "/logos/vercel.svg" },
        blurb:
          "Push and it is live, with a preview URL hanging off every branch.",
        name: "Vercel",
      },
    ],
    label: "Deploys",
  },
  {
    items: [
      {
        blurb:
          "Flags that work on the server too, so one can gate a whole route rather than only a button.",
        name: "Flags SDK",
      },
    ],
    label: "Flags",
  },
  {
    items: [
      {
        logo: { dark: "/logos/posthog-dark.svg", src: "/logos/posthog.svg" },
        blurb:
          "Product analytics, session context, and flags in one place, and self-hostable if it ever has to be.",
        name: "PostHog",
      },
    ],
    label: "Analytics",
  },
] as const satisfies readonly StackRow[];

/*
 * `scroll-mt` is here because every h2 on this page is also a jump target and
 * the header does not stick: without it a jump lands the heading flush against
 * the top edge, which reads as a page that scrolled too far rather than one
 * that arrived.
 */
const sectionHeading =
  "scroll-mt-12 font-display text-2xl font-semibold tracking-tight sm:text-3xl";

/** The closer's heading id, shared by the jump row and the preview's link. */
const stackSectionId = "the-default-stack";

/** The spec sheet's row label, used by the closer and by the preview above it. */
const stackLabel =
  "font-mono text-[13px] tracking-[0.18em] text-muted-foreground uppercase";

/*
 * The jump row's labels are shorter than the headings they point at: "AI"
 * rather than "AI coding setup", "Default stack" rather than "The default
 * stack". A row of six that has to be read phrase by phrase is not a row
 * anybody jumps from. Every href resolves to a heading id rendered below.
 */
const jumpTargets = [
  ...sections.map((section) => ({
    href: `#${section.id}`,
    label: "nav" in section ? section.nav : section.title,
  })),
  { href: `#${stackSectionId}`, label: "Default stack" },
];

const logoSize = 18;
const logoClass = "size-[18px] shrink-0 object-contain";

/**
 * The mark, or the space one would occupy.
 *
 * A section that carries any mark reserves the slot on every row in it, so the
 * mono names stay in a single column instead of stepping in and out around the
 * tools that have one. The light/dark pair swaps in CSS on the same `dark:`
 * variant the theme toggle uses, so the server and the first client paint
 * agree and neither theme waits for hydration to show the right file.
 */
function ToolLogo({ logo }: { logo?: UseLogo }) {
  if (logo === undefined) {
    return <span aria-hidden="true" className={logoClass} />;
  }

  if (logo.dark === undefined) {
    return (
      <img
        alt=""
        className={logoClass}
        decoding="async"
        height={logoSize}
        src={logo.src}
        width={logoSize}
      />
    );
  }

  return (
    <>
      <img
        alt=""
        className={`${logoClass} dark:hidden`}
        decoding="async"
        height={logoSize}
        src={logo.src}
        width={logoSize}
      />
      <img
        alt=""
        className={`hidden ${logoClass} dark:block`}
        decoding="async"
        height={logoSize}
        src={logo.dark}
        width={logoSize}
      />
    </>
  );
}

export const Route = createFileRoute("/uses")({
  component: UsesPage,
  head: () =>
    createSeoHead({
      canonicalPath: "/uses",
      description,
      structuredData: createGraph([
        createWebPageSchema({
          description,
          name: "Uses",
          path: "/uses",
        }),
      ]),
      title: pageTitle("Uses"),
    }),
});

function UsesPage() {
  return (
    <main className="flex-1" id="main-content">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
          Uses
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          The tools I actually work in. The software half is checked into a Nix
          flake, so this is what my machines get rebuilt from rather than what I
          remember using.
        </p>

        <StackPreview />

        <nav aria-label="Sections on this page" className="mt-8">
          <ul className="flex max-w-2xl flex-wrap items-center gap-x-3 gap-y-2">
            {jumpTargets.map((target, index) => (
              <li className="flex items-center gap-x-3" key={target.href}>
                <a
                  className="link-underline font-mono text-[13px] text-muted-foreground hover:text-foreground"
                  href={target.href}
                >
                  {target.label}
                </a>
                {index === jumpTargets.length - 1 ? null : (
                  <span aria-hidden="true" className="text-muted-foreground/50">
                    &middot;
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {sections.map((section) => {
          const hasLogo = section.rows.some((row) => "logo" in row);
          // `as const` leaves the sections without a lead with no `lead` key at
          // all, so the property has to be reached for through an `in` check
          // rather than read off the union. Same for `logo` on a row below.
          const lead = "lead" in section ? section.lead : undefined;

          return (
            <section
              aria-labelledby={section.id}
              className="mt-16 sm:mt-20"
              key={section.id}
            >
              <h2 className={sectionHeading} id={section.id}>
                {section.title}
              </h2>
              {lead === undefined ? null : (
                <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
                  {lead}
                </p>
              )}
              <dl className="mt-8 max-w-2xl divide-y">
                {section.rows.map((row) => {
                  const logo = "logo" in row ? row.logo : undefined;

                  return (
                    <div className="py-6 first:pt-0 last:pb-0" key={row.item}>
                      <dt className="flex items-center gap-2.5 font-mono text-[13px]">
                        {hasLogo ? <ToolLogo logo={logo} /> : null}
                        {row.item}
                      </dt>
                      <dd className="mt-2 leading-7 text-muted-foreground">
                        {row.note}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          );
        })}

        <section aria-labelledby={stackSectionId} className="mt-16 sm:mt-20">
          <h2 className={sectionHeading} id={stackSectionId}>
            The default stack
          </h2>
          <p className="mt-5 max-w-2xl font-mono text-[13px] text-muted-foreground">
            Every name opens a line on why that one.
          </p>
          <dl className="mt-8 max-w-2xl divide-y rounded-2xl border bg-card px-6 py-1 sm:px-8 sm:py-2">
            {stack.map((row) => (
              <div
                className="grid gap-x-6 gap-y-2 py-5 sm:grid-cols-[9rem_1fr]"
                key={row.label}
              >
                <dt className={stackLabel}>{row.label}</dt>
                <dd className="flex flex-wrap items-center gap-x-5 gap-y-3 font-mono text-[13px]">
                  {row.items.map((item) => (
                    <StackName item={item} key={item.name} />
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}

/**
 * The spec sheet, compressed to the one line of it that is a decision.
 *
 * Twenty rows belong at the bottom of the page; the fork at the top of them
 * does not, because it is the only row a reader has to answer and the sheet is
 * the last thing they reach. This band lifts it: the framework tracks at full
 * size, every row under the fork as its lead pick in one muted run, and a link
 * down to the sheet itself. Both halves are read out of `stack`, so the
 * preview cannot drift from what it previews.
 *
 * A qualifier on a stack item means "same row, different axis", so qualified
 * items drop below the fork rather than joining it. Electron is not a third
 * web track, and an `or` that implied it were one would be a lie the closer
 * would then have to correct.
 */
function StackPreview() {
  const [frameworkRow, ...restRows] = stack;
  const tracks = frameworkRow.items.filter((item) => !("qualifier" in item));
  const asides = frameworkRow.items.filter((item) => "qualifier" in item);

  return (
    <div className="mt-10 max-w-2xl border-y py-7">
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[9rem_1fr] sm:gap-y-6">
        <dt className={stackLabel}>Start with</dt>
        <dd className="flex flex-wrap items-center gap-x-4 gap-y-3 font-mono text-[15px]">
          {tracks.map((item, index) => (
            <Fragment key={item.name}>
              {index === 0 ? null : (
                <span className="text-[13px] text-muted-foreground">or</span>
              )}
              <StackName item={item} />
            </Fragment>
          ))}
          {asides.length === 0 ? null : (
            <span className="flex basis-full flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
              {asides.map((item) => (
                <StackName item={item} key={item.name} />
              ))}
            </span>
          )}
        </dd>

        <dt className={`${stackLabel} mt-6 sm:mt-0`}>Under it</dt>
        <dd>
          <p className="font-mono text-[13px] leading-6 text-muted-foreground">
            {restRows.map((row, index) => (
              <Fragment key={row.label}>
                <span className="whitespace-nowrap">
                  {row.items[0].name}
                  {index === restRows.length - 1 ? null : (
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground/40"
                    >
                      {"\u00A0\u00B7"}
                    </span>
                  )}
                </span>
                {index === restRows.length - 1 ? null : " "}
              </Fragment>
            ))}
          </p>
          <a
            className="link-underline-resting mt-5 inline-block font-mono text-[13px]"
            href={`#${stackSectionId}`}
          >
            The default stack, all {stack.length} rows
          </a>
        </dd>
      </dl>
    </div>
  );
}

/*
 * A name with a blurb behind it carries no resting mark. Thirty-two of them do,
 * and any rule under all thirty-two turns a spec sheet into what looks like a
 * page of links -- which is the one thing these are not, since nothing here
 * navigates. The line under the heading says the blurbs exist; the affordance
 * is the amber the whole site already uses to mean "the pointer is on this",
 * as a colour rather than a rule, because a rule would say "link" again.
 */
const stackTriggerClass =
  "cursor-pointer bg-transparent p-0 text-inherit hover:text-ring focus-visible:text-ring data-popup-open:text-ring";

/**
 * One entry on the spec sheet: its mark, if it has one, and its name.
 *
 * Unlike the rows above, the slot is not reserved when a mark is missing.
 * These names sit inline rather than in a column, so an empty 18px gap before
 * an unmarked name would read as a broken image instead of as alignment.
 */
function StackName({ item }: { item: StackItem }) {
  const logo = "logo" in item ? item.logo : undefined;
  const qualifier = "qualifier" in item ? item.qualifier : undefined;

  return (
    <span className="flex items-center gap-2">
      {logo === undefined ? null : <ToolLogo logo={logo} />}
      <StackNameBody item={item} />
      {qualifier === undefined ? null : (
        <span className="text-muted-foreground">{qualifier}</span>
      )}
    </span>
  );
}

/**
 * The name itself, and whatever it opens.
 *
 * Base UI's PreviewCard is the literal hover card, and it is the wrong one
 * here: it is `mouseOnly` plus keyboard focus with no click handler, so on a
 * phone the blurb would not exist at all. A Popover trigger opens on hover
 * exactly the same way and is a real button underneath, so a tap and the Enter
 * key reach the same sentence a pointer does.
 *
 * A row's own link moves inside the popup rather than sitting on the sheet. A
 * repository worth linking is worth a sentence of context first, and the sheet
 * keeps one vocabulary for its names instead of two.
 */
function StackNameBody({ item }: { item: StackItem }) {
  const blurb = "blurb" in item ? item.blurb : undefined;
  const href = "href" in item ? item.href : undefined;

  if (blurb === undefined) {
    if (href === undefined) {
      return item.name;
    }

    return (
      <a className="link-underline-resting" href={href} rel="noreferrer">
        {item.name}
      </a>
    );
  }

  return (
    <Popover>
      <PopoverTrigger
        className={stackTriggerClass}
        closeDelay={80}
        delay={220}
        openOnHover
      >
        {item.name}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 gap-3 rounded-xl border bg-popover p-4 font-sans text-sm leading-6 shadow-lg ring-0"
        sideOffset={8}
      >
        <PopoverDescription className="text-popover-foreground">
          {blurb}
        </PopoverDescription>
        {href === undefined ? null : (
          <a
            className="link-underline-resting self-start font-mono text-[13px]"
            href={href}
            rel="noreferrer"
          >
            The template I start from
          </a>
        )}
      </PopoverContent>
    </Popover>
  );
}
