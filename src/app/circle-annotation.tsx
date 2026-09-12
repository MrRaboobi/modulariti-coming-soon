"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { EASE, gsap } from "@/lib/gsap";
import { useMotion } from "./gsap-primitives";

/**
 * A rough ellipse stroked around whatever it wraps, as if circled by hand,
 * drawn on once when it scrolls into view.
 *
 * The overlay is absolutely positioned and inert, so wrapping a phrase costs
 * the surrounding layout nothing — the wrapper is an inline-block that takes
 * exactly the size of its own text.
 *
 * Reduced motion needs no fallback rule: the stroke is hidden by the `from()`
 * tween itself, so when that tween is never created the ellipse simply renders
 * complete.
 */

/* One pen stroke. Three things separate a drawn circle from a geometric one,
   and all three are in here: radii that do not quite match, a lean off the
   horizontal, and an overshoot past the start where the hand kept going.
   Normalised to a 100x60 box and stretched to whatever it wraps —
   `vector-effect` is what keeps the stroke an even weight through that. */
const STROKE =
  "M96,26C94,13 77,4 51,4C26,4 5,12 4,29C3,45 25,57 52,57C78,57 97,47 95,30C94,20 87,12 74,7";

export type CircleAnnotationProps = {
  children: ReactNode;
  /** Stroke colour. */
  color?: string;
  /** Stroke weight in CSS pixels — it does not scale with the box. */
  strokeWidth?: number;
  /** Seconds the stroke takes to draw. */
  duration?: number;
  /** Seconds to wait after the trigger, so the circle lands after the copy. */
  delay?: number;
  /** Breathing room around the text, in em, as [horizontal, vertical]. */
  pad?: [number, number];
  className?: string;
};

export function CircleAnnotation({
  children,
  color = "#F26B5B",
  strokeWidth = 2,
  duration = 0.75,
  delay = 0.25,
  pad = [0.46, 0.42],
  className,
}: CircleAnnotationProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const path = useRef<SVGPathElement>(null);

  useMotion(
    ({ motion }) => {
      if (!motion || !path.current) return;
      gsap.from(path.current, {
        drawSVG: "0%",
        duration,
        delay,
        ease: EASE,
        scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
      });
    },
    ref,
    [duration, delay],
  );

  return (
    <span
      ref={ref}
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
        // A circle drawn around a phrase that has wrapped onto two lines reads
        // as a mistake, so the phrase is kept on one line.
        whiteSpace: "nowrap",
        // The ellipse is drawn outside the text box and takes no space of its
        // own, so without this it laps over the words either side. The only
        // layout this effect touches, and it is the minimum it needs.
        marginInline: `${(pad[0] * 0.72).toFixed(3)}em`,
      }}
    >
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        style={
          {
            position: "absolute",
            inset: `-${pad[1]}em -${pad[0]}em`,
            overflow: "visible",
            pointerEvents: "none",
          } as CSSProperties
        }
      >
        <path
          ref={path}
          d={STROKE}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}
