import { createFileRoute } from "@tanstack/react-router";

import {
  createGraph,
  createSeoHead,
  createWebPageSchema,
  pageTitle,
} from "@/lib/seo.ts";
import { siteConfig } from "@/lib/site-config.ts";

const description =
  "The editor, agent setup, terminal, and machines Nick Neely actually works in, and the Nix flake the software half is rebuilt from.";

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
  note: string | null;
}

interface UseSection {
  id: string;
  rows: readonly UseRow[];
  title: string;
}

/*
 * Every note below is written from a config file in `nick-neely/dotfiles`
 * rather than from memory, which is the only reason this page is worth
 * publishing. Change a row when the config changes, not the other way around.
 */
const sections = [
  {
    id: "editor",
    rows: [
      {
        item: "Neovim",
        note: "Configured in Lua and symlinked out of the Nix store on purpose, so a keymap can change without rebuilding anything. The plugin lockfile is committed, so every machine gets the same revisions rather than whatever resolved that morning.",
      },
      {
        item: "rose-pine",
        note: "Colour scheme, moon variant, italics off. Transparent on macOS and WSL so the terminal's own background shows through.",
      },
      {
        item: "oil.nvim",
        note: "The filesystem as an editable buffer. Renaming a file is editing a line.",
      },
      {
        item: "snacks.nvim",
        note: "Picker, notifications, and go-to-definition. Space-f finds files, space-s searches inside them, gd jumps to the definition.",
      },
      {
        item: "neogit + gitsigns",
        note: "Git without leaving the editor, with blame on the current line.",
      },
      {
        item: "<Esc> → :w",
        note: "Escape is mapped to write, so leaving insert mode and saving are one keystroke instead of two.",
      },
    ],
    title: "Editor",
  },
  {
    id: "ai-coding-setup",
    rows: [
      {
        item: "Claude Code",
        note: "The daily driver. Opus at high reasoning effort, permissions in auto mode, and a custom status line that publishes the model and remaining context out to the pane border.",
      },
      {
        item: "Codex",
        note: "The second opinion, on a different model. Workspace-write sandbox, approvals on request.",
      },
      {
        item: "builder / assistant / fast-search",
        note: "Three sub-agents, one model each: Opus for implementation, Sonnet for light scoped work, Haiku for retrieval with its tools clamped to read and grep. Which one gets a job is a written rule rather than a mood.",
      },
      {
        item: "AGENTS.md",
        note: "One shared base file, concatenated with a per-harness and a per-host overlay into whatever file each agent actually reads. Same rules across four machines and two harnesses.",
      },
      {
        item: "Skills",
        note: "Pinned by revision in a lockfile and pulled from other people's repositories and my own, so an agent's instructions version like a dependency.",
      },
      {
        item: "MCP",
        note: "Exactly one server, Neon. A tool that has not earned a permanent seat in the context window does not get one.",
      },
    ],
    title: "AI coding setup",
  },
  {
    id: "terminal",
    rows: [
      {
        item: "Ghostty",
        note: "Terminal on the Mac: FiraCode Nerd Font Mono at 14, Dracula. On the WSL desktop the shell is the same one and the window around it is not mine to configure.",
      },
      {
        item: "zsh",
        note: "Completion, autosuggestions, syntax highlighting, and history substring search, all on. Ctrl-F accepts the suggestion.",
      },
      {
        item: "Starship",
        note: "Prompt, with its timeouts raised because WSL2 stats a filesystem slowly. A custom segment lights yellow when my dotfiles have drifted from the flake and red when that drift matters; it reads a cache with a shell builtin, so the badge costs nothing per prompt.",
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
    id: "command-line",
    rows: [
      {
        item: "Nix + Home Manager",
        note: "One flake covers four hosts: the WSL desktop, a mini PC, a cloud box, and a Mac. A small `dot` CLI drives it, and the prompt badge above is what says when the machine has stopped matching the checkout.",
      },
      {
        item: "ripgrep, fd, fzf, zoxide",
        note: "Search, find, filter, jump. Together they are the reason I open a file tree roughly never.",
      },
      {
        item: "Node 24, pnpm, bun",
        note: "Runtimes come from the flake. pnpm is a wrapper around Corepack, so a repository's committed `packageManager` field stays authoritative and a project pinning pnpm 9 and one pinning pnpm 10 both just work.",
      },
      {
        item: "gh + gh-stack",
        note: "GitHub from the shell, plus a stacked-pull-request extension the flake builds from source.",
      },
      {
        item: "Hunk",
        note: "Diff review with a CLI attached, so an agent and I can work through the same hunks in the same session.",
      },
      {
        item: "direnv",
        note: "Per-project environments, backed by nix-direnv.",
      },
      {
        item: "1Password CLI",
        note: "Secrets stay `op://` references. Nothing lands in a dotfile.",
      },
    ],
    title: "Command line",
  },
  {
    id: "the-machine",
    rows: [
      {
        item: "Windows + WSL2",
        note: "The work happens in Ubuntu under WSL2. The flake strips the Windows-side Node, Volta, and pnpm entries off PATH, so exactly one toolchain answers and it is the declared one.",
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

        {sections.map((section) => (
          <section
            aria-labelledby={section.id}
            className="mt-16 sm:mt-20"
            key={section.id}
          >
            <h2 className={sectionHeading} id={section.id}>
              {section.title}
            </h2>
            <dl className="mt-8 max-w-2xl divide-y">
              {section.rows.map((row) => (
                <div className="py-6 first:pt-0 last:pb-0" key={row.item}>
                  <dt className="font-mono text-[13px]">{row.item}</dt>
                  <dd className="mt-2 leading-7 text-muted-foreground">
                    {row.note ?? (
                      /* Nick fills in */
                      <span className="font-mono text-[13px]">[pending]</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <section
          aria-labelledby="the-old-front-door"
          className="mt-16 max-w-2xl border-t pt-10 sm:mt-20"
        >
          <h2 className={sectionHeading} id="the-old-front-door">
            The old front door
          </h2>
          <p className="mt-6 leading-8 text-muted-foreground">
            Before this site existed, the résumé was a terminal you typed into.
            It still answers, at{" "}
            <a
              className="link-underline text-foreground"
              href={siteConfig.links.terminal}
              rel="noreferrer"
            >
              terminal.nickneely.dev
            </a>
            , and this page is the closest thing it has to a second home: the
            same instinct about what is worth showing a developer, minus the
            command parser.
          </p>
        </section>
      </div>
    </main>
  );
}
