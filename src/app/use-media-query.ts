"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a media query without tearing during hydration. Matches the
 * pattern in use-reduced-motion.ts: the server snapshot is always false, so
 * the first client render agrees with the server and the real value lands on
 * the commit after.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
