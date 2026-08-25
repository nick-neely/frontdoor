import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const router = createTanStackRouter({
    defaultPreload: "intent",

    defaultPreloadStaleTime: 0,

    /** Route changes are the one place motion explains where the page went. */
    defaultViewTransition: true,

    routeTree,

    scrollRestoration: true,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
