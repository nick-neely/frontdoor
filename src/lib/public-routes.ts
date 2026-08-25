import type { FileRouteTypes } from "../routeTree.gen.ts";
import { postPath } from "./writing-schema.ts";
import { readPublishedWriting } from "./writing-source.ts";

type RoutePath = FileRouteTypes["fullPaths"];

/** Routes whose path still contains a parameter, such as `/writing/$slug`. */
type DynamicRoutePath = Extract<RoutePath, `${string}$${string}`>;

/**
 * Every file route, classified once.
 *
 * `public` routes are prerendered by `vite.config.ts`, listed in the generated
 * `sitemap.xml`, and checked by `pnpm seo:verify`. `private` routes are
 * deliberately excluded from all three.
 *
 * TanStack Router regenerates `RoutePath` from `src/routes`, so a route that is
 * added without being classified here fails `pnpm typecheck` instead of
 * silently shipping without prerendering, a sitemap entry, or SEO verification.
 */
const routeVisibility = {
  "/": "public",
  // A server route renders no document, so there is nothing to prerender,
  // list in the sitemap, or verify with `pnpm seo:verify`.
  "/api/health": "private",
  "/projects": "public",
  "/work": "public",
  "/writing": "public",
  "/writing/$slug": "public",
} as const satisfies Record<RoutePath, "private" | "public">;

/**
 * How each dynamic route becomes real paths. The type is exhaustive over
 * `DynamicRoutePath`, so adding a parameterised route without teaching this map
 * to expand it fails `pnpm typecheck`.
 */
const dynamicRouteExpansions = {
  "/writing/$slug": () => readPublishedWriting().map(postPath),
} as const satisfies Record<DynamicRoutePath, () => string[]>;

const expansions = new Map<string, () => string[]>(
  Object.entries(dynamicRouteExpansions)
);

function expand(routePath: string): string[] {
  const expansion = expansions.get(routePath);

  if (expansion !== undefined) {
    return expansion();
  }

  // `vite.config.ts` prerenders with `failOnError: true`, so a literal `$slug`
  // reaching the prerenderer is a build failure. Refusing here names the cause.
  if (routePath.includes("$")) {
    throw new Error(
      `${routePath} is a public dynamic route with no entry in dynamicRouteExpansions.`
    );
  }

  return [routePath];
}

export const publicPaths = Object.entries(routeVisibility).flatMap(
  ([routePath, visibility]) =>
    visibility === "public" ? expand(routePath) : []
);
