"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

// Registered once, at module scope, so every consumer shares one registration.
// Safe during SSR: none of these touch `window` at import time.
gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase, DrawSVGPlugin);

// Three webfonts load async and reflow the copy under them, which moves every
// trigger position ScrollTrigger measured at creation. One refresh once the
// fonts have settled; resize is already handled internally.
if (typeof document !== "undefined") {
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/** The house curve — the same cubic-bezier the page already eases on. */
export const EASE = CustomEase.create("modulariti", "0.16, 1, 0.3, 1");

/** One motion vocabulary, so every reveal on the page agrees. */
export const MOTION = {
  /** Short enough that copy is readable before the tween finishes. */
  rise: { duration: 0.5, y: 10 },
  reveal: { duration: 0.6, y: 14 },
  card: { duration: 0.7 },
  stagger: 0.055,
  /** Reveals fire once, a little before the element is fully in view. */
  start: "top 85%",
} as const;

/**
 * Media queries shared by every animation on the page. `motion` gates the
 * full treatment; when it doesn't match, the handler bails and elements are
 * left in their CSS resting state — which is the finished, readable state,
 * because every entrance is a `from()` tween.
 */
export const QUERIES = {
  motion: "(prefers-reduced-motion: no-preference)",
  hover: "(hover: hover) and (pointer: fine)",
} as const;

export { gsap, useGSAP, ScrollTrigger };
