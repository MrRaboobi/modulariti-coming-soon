"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMotion } from "./gsap-primitives";

/**
 * Copy that resolves as it scrolls: each word lifts from muted to full ink in
 * sequence, scrubbed against the scrollbar rather than played on a timer.
 *
 * Colour, not opacity, is what moves — that is the design, and it is a paint
 * on a handful of inline spans rather than a layout change. The reduced-motion
 * fallback is the existing `.sh-word` rule in globals.css, which pins every
 * word to full ink; this hook simply never runs.
 */

/** GSAP interpolates real colours, not `var(--x)` — resolve the token first. */
function resolveColor(value: string) {
  if (!value.startsWith("var(")) return value;
  const name = value.slice(4, -1).split(",")[0].trim();
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || value;
}

export function ScrollHighlight({
  text,
  className,
  from = "var(--resting)",
  to = "var(--ink)",
}: {
  text: string;
  className?: string;
  from?: string;
  to?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useMotion(
    ({ motion }) => {
      if (!motion || !ref.current) return;

      const words = gsap.utils.toArray<HTMLElement>(".sh-word", ref.current);
        if (!words.length) return;

      // `amount` spreads the whole run across the scrub range; the per-word
      // duration overlaps neighbours so the sentence resolves as a wave rather
      // than one word at a time.
      gsap.fromTo(
        words,
        { color: resolveColor(from) },
        {
          color: resolveColor(to),
          ease: "none",
          duration: 0.6,
          stagger: { amount: 1.4 },
          scrollTrigger: {
            trigger: ref.current,
            start: "top 90%",
            end: "top 40%",
            scrub: true,
          },
        },
      );
    },
    ref,
    [text, from, to],
  );

  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`} className="sh-word">
          {word}{" "}
        </span>
      ))}
    </p>
  );
}
