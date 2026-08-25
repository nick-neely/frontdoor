import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

import {
  agentToolingIgnorePatterns,
  vendoredToolingIgnorePatterns,
} from "./agent-tooling.ts";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    ...agentToolingIgnorePatterns,
    ...vendoredToolingIgnorePatterns,
    // Oxfmt formats MDX as Markdown, so it rewrites `*` to `_` inside `{/* */}`
    // and turns a comment into an expression MDX cannot parse. Authored writing
    // is prose, not source, and is left exactly as written.
    "content/**",
  ],
  sortTailwindcss: {
    functions: ["clsx", "cva", "tw", "twMerge", "cn", "twJoin", "tv"],
    stylesheet: "./src/styles.css",
  },
});
