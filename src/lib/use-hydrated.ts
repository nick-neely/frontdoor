import { useSyncExternalStore } from "react";

const unsubscribe = () => {
  // Nothing was subscribed to, so there is nothing to tear down.
};
const subscribe = () => unsubscribe;
const onClient = () => true;
const onServer = () => false;

/**
 * Whether this render runs in a hydrated browser. A prerendered page has no
 * JavaScript behind it, so a control in its HTML would do nothing when
 * pressed; components render their controls only once this is true, and the
 * page before hydration shows their resting state instead.
 *
 * Read through `useSyncExternalStore` rather than an effect because the
 * answer differs between the server and the client by design, which is
 * exactly the case its server snapshot exists for.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, onClient, onServer);
}
