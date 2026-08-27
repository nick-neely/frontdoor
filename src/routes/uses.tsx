import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import {
  createGraph,
  createSeoHead,
  createWebPageSchema,
  pageTitle,
} from "@/lib/seo.ts";

const description =
  "The editor, agent setup, terminal, and machines Nick Neely actually works in, and the Nix flake the software half is rebuilt from.";

/**
 * A vendored tool mark, retrieved from svgl and served out of `public/logos`.
 *
 * `dark` is set only where svgl ships a second file cut for dark grounds. A
 * mark that carries its own colour ships one file and is served to both
 * themes. A tool svgl does not have gets no mark at all: an incomplete set of
 * real logos beats a complete set with substitutes in it.
 */
interface UseLogo {
  dark?: string;
  src: string;
}

/**
 * One row: the thing, and what it is doing here.
 *
 * `note: null` marks a row only Nick can answer and renders a visible
 * `[pending]` in its place. Guessing a monitor or a keyboard would read fine
 * and be worth nothing, which is the same rule the Proof Points on `/work`
 * are held to.
 */
interface UseRow {
  item: string;
  logo?: UseLogo;
  note: ReactNode;
}

interface UseSection {
  id: string;
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
        note: "The primary driver. `gpt-5.6-sol` at medium reasoning effort, a workspace-write sandbox, approvals on request, and room for nine threads in one session on the rare work that genuinely splits nine ways.",
      },
      {
        item: "Claude Code",
        logo: {
          dark: "/logos/anthropic-dark.svg",
          src: "/logos/anthropic.svg",
        },
        note: "The second opinion, on a different model, and the harness carrying the sub-agents: builder, assistant, and fast-search, one model each, Opus for implementation, Sonnet for light scoped work, Haiku for retrieval with its tools clamped to read and grep. Which one gets a job is a written rule rather than a mood. Permissions run in auto mode, and a custom status line publishes the model and the remaining context out to the pane border.",
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
        item: "MCP",
        note: "Exactly one server, Neon. A tool that has not earned a permanent seat in the context window does not get one.",
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
    rows: [
      {
        item: "Nix + Home Manager",
        note: "One flake covers four hosts: the WSL desktop, a mini PC, a cloud box, and a Mac. A small `dot` CLI drives it, and the prompt badge above is what says when the machine has stopped matching the checkout.",
      },
      {
        item: "Windows + WSL2",
        note: "The work happens in Ubuntu under WSL2. The flake strips the Windows-side Node, Volta, and pnpm entries off PATH, so exactly one toolchain answers and it is the declared one.",
      },
      {
        item: "direnv + 1Password",
        note: "Per-project environments from a committed `.envrc`, backed by nix-direnv. Secrets stay `op://` references, so nothing lands in a dotfile.",
      },
      // The rows below are Nick's to fill in. A plausible model number is
      // worth less than an obvious gap.
      { item: "Desktop", note: null },
      { item: "Display", note: null },
      { item: "Keyboard", note: null },
    ],
    title: "The machine",
  },
] as const satisfies readonly UseSection[];

const sectionHeading =
  "font-display text-2xl font-semibold tracking-tight sm:text-3xl";

const logoSize = 18;
const logoClass = "size-[18px] shrink-0 object-contain";

/**
 * The mark, or the space one would occupy.
 *
 * A section that carries any mark reserves the slot on every row in it, so the
 * mono names stay in a single column instead of stepping in and out around the
 * tools svgl happens to have. The light/dark pair swaps in CSS on the same
 * `dark:` variant the theme toggle uses, so the server and the first client
 * paint agree and neither theme waits for hydration to show the right file.
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

          return (
            <section
              aria-labelledby={section.id}
              className="mt-16 sm:mt-20"
              key={section.id}
            >
              <h2 className={sectionHeading} id={section.id}>
                {section.title}
              </h2>
              <dl className="mt-8 max-w-2xl divide-y">
                {section.rows.map((row) => {
                  // `as const` leaves the rows without a mark with no `logo`
                  // key at all, so the property has to be reached for through
                  // an `in` check rather than read off the union.
                  const logo = "logo" in row ? row.logo : undefined;

                  return (
                    <div className="py-6 first:pt-0 last:pb-0" key={row.item}>
                      <dt className="flex items-center gap-2.5 font-mono text-[13px]">
                        {hasLogo ? <ToolLogo logo={logo} /> : null}
                        {row.item}
                      </dt>
                      <dd className="mt-2 leading-7 text-muted-foreground">
                        {row.note ?? (
                          /* Nick fills in */
                          <span className="font-mono text-[13px]">
                            [pending]
                          </span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          );
        })}
      </div>
    </main>
  );
}
