import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

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
    id: "the-machine",
    lead: "Two machines and a cloud box. The desktop is where I am most comfortable, the MacBook is where I go when I am not at the desk, and the work increasingly lives in a long-running agent session on a VM that neither of them has to be awake for. The direction is a mobile workflow: a phone or a laptop steering a session that never stopped.",
    rows: [
      {
        item: "Desktop",
        note: "The primary workstation, and where I am most comfortable working. Ryzen 7 9800X3D, 64GB of DDR5-6000 Trident Z5 Neo, 4TB plus 2TB of NVMe, an RTX 3070, an NZXT H9 Elite with a Kraken Elite 360 on top of it. Still holding out for a 5090 at a price I am willing to pay.",
      },
      {
        item: "MacBook",
        note: "Where I work when I am not at the desk: the couch, the balcony, anywhere that is not the chair. M5 Pro, 18 cores, 64GB, 2TB.",
      },
      {
        item: "exe.dev",
        note: "Agent sessions, repositories, and hours-long runs live on a persistent VM there and keep going after I disconnect. I reach it over mosh on the tailnet, so a closed laptop or a changed network does not end anything. Herdr and T3 Code open onto the same sessions, which is what turns a phone into a control surface.",
      },
      {
        item: "Keyboard",
        note: "Wooting 80HE in the zinc alloy housing, which is super heavy and never moves. Geon Raw HE linears, tape-modded for thock, under DROP MiTo MT3 Godspeed: the Apollo base with the Milky Way kit.",
      },
      {
        item: "Display",
        note: "Still unsettled. The plan is the Alienware AW3926QW when it ships, for the balance of OLED, refresh rate, and resolution I actually want.",
      },
      {
        item: "Desk + chair",
        note: "A Secretlab Magnus Pro XL, standing, with a LiberNovo Omni in front of it. The unglamorous reason the desktop is still the primary workstation.",
      },
      {
        item: "Nix + Home Manager",
        note: "One flake covers four hosts: the WSL desktop, the Mac, a mini PC, and the exe.dev VM. A small `dot` CLI drives it, and the prompt badge above is what says when a machine has stopped matching the checkout.",
      },
      {
        item: "Windows + WSL2",
        note: "One half of the setup; the MacBook is the other. Development happens only inside Ubuntu under WSL2, never on the Windows side, and the flake strips the Windows-side toolchain entries off PATH so exactly one of them answers. That is what keeps WSL and macOS interchangeable: both are whatever the dotfiles repo prescribes.",
      },
      {
        item: "direnv + 1Password",
        note: "Per-project environments from a committed `.envrc`, backed by nix-direnv. Secrets stay `op://` references, so nothing lands in a dotfile.",
      },
    ],
    title: "The machine",
  },
] as const satisfies readonly UseSection[];

/** One named thing on the spec sheet below. */
interface StackItem {
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
  note?: string;
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
      { logo: { src: "/logos/nextjs.svg" }, name: "Next.js" },
      {
        href: "https://github.com/neely-labs/tanstack-start-template",
        logo: { src: "/logos/tanstack.svg" },
        name: "TanStack Start",
      },
      {
        logo: { src: "/logos/electron.svg" },
        name: "Electron",
        qualifier: "desktop",
      },
    ],
    label: "Framework",
  },
  {
    items: [{ logo: { src: "/logos/typescript.svg" }, name: "TypeScript" }],
    label: "Language",
  },
  {
    items: [
      { logo: { src: "/logos/neon.svg" }, name: "Neon" },
      {
        logo: { dark: "/logos/drizzle-dark.svg", src: "/logos/drizzle.svg" },
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
        name: "Better Auth",
      },
    ],
    label: "Auth",
  },
  {
    items: [
      { logo: { src: "/logos/tailwindcss.svg" }, name: "Tailwind" },
      {
        logo: { dark: "/logos/shadcn-dark.svg", src: "/logos/shadcn.svg" },
        name: "shadcn/ui",
      },
      {
        logo: { dark: "/logos/base-ui-dark.svg", src: "/logos/base-ui.svg" },
        name: "Base UI",
      },
    ],
    label: "UI",
  },
  {
    items: [
      { name: "Zustand" },
      { logo: { src: "/logos/tanstack.svg" }, name: "TanStack Query" },
    ],
    label: "State",
  },
  {
    items: [{ logo: { src: "/logos/zod.svg" }, name: "zod" }],
    label: "Validation",
  },
  {
    items: [{ name: "AI SDK" }, { name: "eve", qualifier: "agents" }],
    label: "AI",
  },
  {
    items: [{ logo: { src: "/logos/stripe.svg" }, name: "Stripe" }],
    label: "Payments",
  },
  {
    items: [
      {
        logo: { dark: "/logos/resend-dark.svg", src: "/logos/resend.svg" },
        name: "Resend",
      },
      { logo: { src: "/logos/react-email.svg" }, name: "React Email" },
    ],
    label: "Email",
  },
  { items: [{ name: "Vercel Blob" }], label: "Storage" },
  { items: [{ name: "Vercel Queue" }], label: "Jobs" },
  {
    items: [{ logo: { src: "/logos/upstash.svg" }, name: "Upstash" }],
    label: "Rate limiting",
  },
  {
    items: [
      { logo: { src: "/logos/vitest.svg" }, name: "Vitest" },
      { name: "Testing Library" },
      { logo: { src: "/logos/playwright.svg" }, name: "Playwright" },
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
        name: "Ultracite",
      },
      { logo: { src: "/logos/oxc.svg" }, name: "Oxlint + Oxfmt" },
      { name: "Fallow" },
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
        name: "Turborepo",
      },
    ],
    label: "Monorepos",
  },
  {
    items: [{ logo: { src: "/logos/docker.svg" }, name: "Docker" }],
    label: "Local",
    note: "The whole environment comes up on the machine in front of me. There is nothing remote to connect to before work can start.",
  },
  {
    items: [
      {
        logo: { dark: "/logos/vercel-dark.svg", src: "/logos/vercel.svg" },
        name: "Vercel",
      },
    ],
    label: "Deploys",
  },
  { items: [{ name: "Flags SDK" }], label: "Flags" },
  {
    items: [
      {
        logo: { dark: "/logos/posthog-dark.svg", src: "/logos/posthog.svg" },
        name: "PostHog",
      },
    ],
    label: "Analytics",
  },
] as const satisfies readonly StackRow[];

const sectionHeading =
  "font-display text-2xl font-semibold tracking-tight sm:text-3xl";

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

        <section aria-labelledby="the-default-stack" className="mt-16 sm:mt-20">
          <h2 className={sectionHeading} id="the-default-stack">
            The default stack
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
            Starting something new on the web is one real decision, Next.js or
            TanStack Start. Everything under it rides either track unchanged.
          </p>
          <dl className="mt-8 max-w-2xl divide-y rounded-2xl border bg-card px-6 py-1 sm:px-8 sm:py-2">
            {stack.map((row) => {
              const note = "note" in row ? row.note : undefined;

              return (
                <div
                  className="grid gap-x-6 gap-y-2 py-5 sm:grid-cols-[9rem_1fr]"
                  key={row.label}
                >
                  <dt className="font-mono text-[13px] tracking-[0.18em] text-muted-foreground uppercase">
                    {row.label}
                  </dt>
                  <dd className="flex flex-wrap items-center gap-x-5 gap-y-3">
                    {row.items.map((item) => (
                      <StackName item={item} key={item.name} />
                    ))}
                    {note === undefined ? null : (
                      <span className="basis-full leading-7 text-muted-foreground">
                        {note}
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      </div>
    </main>
  );
}

/**
 * One entry on the spec sheet: its mark, if it has one, and its name.
 *
 * Unlike the rows above, the slot is not reserved when a mark is missing.
 * These names sit inline rather than in a column, so an empty 18px gap before
 * an unmarked name would read as a broken image instead of as alignment.
 */
function StackName({ item }: { item: StackItem }) {
  const logo = "logo" in item ? item.logo : undefined;
  const href = "href" in item ? item.href : undefined;
  const qualifier = "qualifier" in item ? item.qualifier : undefined;

  return (
    <span className="flex items-center gap-2 font-mono text-[13px]">
      {logo === undefined ? null : <ToolLogo logo={logo} />}
      {href === undefined ? (
        item.name
      ) : (
        <a
          className="link-underline link-underline-resting"
          href={href}
          rel="noreferrer"
        >
          {item.name}
        </a>
      )}
      {qualifier === undefined ? null : (
        <span className="text-muted-foreground">{qualifier}</span>
      )}
    </span>
  );
}
