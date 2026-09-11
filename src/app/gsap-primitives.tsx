"use client";

import { useRef, type RefObject } from "react";
import { EASE, MOTION, QUERIES, gsap, useGSAP } from "@/lib/gsap";

type Scope = RefObject<Element | null>;

/* ---------- Shared matchMedia wrapper ----------

   Every animation on the page goes through this. It gives one place where
   `prefers-reduced-motion` is honoured, and one place where teardown happens:
   `mm.revert()` kills the tweens, the ScrollTriggers and the inline styles
   they wrote, both on unmount and when a query stops matching. Reverting an
   entrance therefore lands on the finished, readable state, which is why the
   reduced-motion branch is simply "do nothing". */

export function useMotion(
  setup: (conditions: Record<string, boolean>) => void | (() => void),
  scope: Scope,
  dependencies: unknown[] = [],
) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(QUERIES, (context) => setup(context.conditions as Record<string, boolean>), scope.current ?? undefined);
      return () => mm.revert();
    },
    { scope, dependencies, revertOnUpdate: true },
  );
}

/* ---------- Hero intro ---------- */

/**
 * Staggered load-in for every `[data-intro]` element inside `scope`, in DOM
 * order, on a single timeline.
 */
export function useIntro(scope: Scope) {
  useMotion(({ motion }) => {
    if (!motion) return;
    const items = gsap.utils.toArray<HTMLElement>("[data-intro]", scope.current);
    if (!items.length) return;

    // fromTo, not from: these elements are held at opacity 0 by CSS (see the
    // `[data-intro]` rule in globals.css), so `from()` would read 0 as the
    // destination and animate nothing.
    gsap
      .timeline({ defaults: { ease: EASE, duration: MOTION.rise.duration } })
      .fromTo(
        items,
        { opacity: 0, y: MOTION.rise.y },
        { opacity: 1, y: 0, stagger: MOTION.stagger, delay: 0.04 },
      );
  }, scope);
}

/* ---------- Scroll reveal ---------- */

/**
 * Reveals every `[data-reveal]` element inside `scope` as the section enters
 * the viewport, once. `data-reveal="card"` wipes up from
 * its own bottom edge instead of rising — a composited clip, not a layout
 * change. Positions are set explicitly rather than via `stagger` so the two
 * variants can share one ordered timeline. These sections are all below the
 * fold, so `from()` is safe here: ScrollTrigger hides them at hydration, long
 * before they are scrolled to.
 */
export function useReveal(
  scope: Scope,
  {
    y = MOTION.reveal.y,
    duration = MOTION.reveal.duration,
    stagger = MOTION.stagger,
    start = MOTION.start,
  }: { y?: number; duration?: number; stagger?: number; start?: string } = {},
) {
  useMotion(({ motion }) => {
    if (!motion) return;
    const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", scope.current);
    if (!items.length) return;

    const tl = gsap.timeline({
      defaults: { ease: EASE },
      scrollTrigger: { trigger: scope.current, start, once: true },
    });

    items.forEach((el, i) => {
      const at = i * stagger;
      if (el.dataset.reveal === "card") {
        tl.from(
          el,
          { opacity: 0, clipPath: "inset(0% 0% 100% 0%)", duration: MOTION.card.duration },
          at,
        );
      } else {
        tl.from(el, { opacity: 0, y, duration }, at);
      }
    });
  }, scope);
}

/* ---------- Parallax ---------- */

/**
 * Drifts an element against the scroll of `trigger`. Transform only, scrubbed,
 * so it costs a compositor update per frame and nothing else.
 *
 * `centered` re-expresses a CSS `translateX(-50%)` as GSAP's own `xPercent`
 * before tweening — GSAP owns the whole transform once it writes to it, and
 * `xPercent` stays correct across resizes where a baked-in pixel value would not.
 */
export function useParallax(
  target: Scope,
  trigger: Scope,
  { distance = 60, centered = false }: { distance?: number; centered?: boolean } = {},
) {
  useMotion(({ motion }) => {
    if (!motion || !target.current) return;
    if (centered) gsap.set(target.current, { xPercent: -50, x: 0 });

    gsap.fromTo(
      target.current,
      { y: -distance },
      {
        y: distance,
        ease: "none",
        scrollTrigger: {
          trigger: trigger.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  }, trigger);
}

/* ---------- Hover ---------- */

/**
 * Lift on hover, press on pointer-down, for every `selector` match inside
 * `scope`. Gated on a real hover-capable pointer so touch devices never get
 * stuck in the lifted state, and wired through `quickTo` so a fast pointer
 * reuses one tween per element instead of spawning a new one per event.
 */
export function useHoverLift(
  scope: Scope,
  selector: string,
  {
    y = -2,
    hoverScale = 1,
    press = 0.95,
    deps = [],
  }: { y?: number; hoverScale?: number; press?: number; deps?: unknown[] } = {},
) {
  useMotion(({ motion, hover }) => {
    if (!motion || !hover) return;
    const els = gsap.utils.toArray<HTMLElement>(selector, scope.current);

    const teardown = els.map((el) => {
      const lift = gsap.quickTo(el, "y", { duration: 0.3, ease: "power3.out" });
      const squash = gsap.quickTo(el, "scale", { duration: 0.22, ease: "power3.out" });

      const onEnter = () => {
        lift(y);
        squash(hoverScale);
      };
      const onLeave = () => {
        lift(0);
        squash(1);
      };
      const onDown = () => squash(press);
      const onUp = () => squash(1);

      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);
      el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("focus", onEnter);
      el.addEventListener("blur", onLeave);

      // The listeners are created after useGSAP has run, so they are not in
      // the context and have to be removed by hand.
      return () => {
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerleave", onLeave);
        el.removeEventListener("pointerdown", onDown);
        el.removeEventListener("pointerup", onUp);
        el.removeEventListener("focus", onEnter);
        el.removeEventListener("blur", onLeave);
      };
    });

    return () => teardown.forEach((off) => off());
  }, scope, deps);
}

/* ---------- Count-up ---------- */

export function CountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.1,
  className,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const format = (n: number) =>
    prefix +
    n.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    suffix;

  useMotion(
    ({ motion }) => {
      const el = ref.current;
      if (!motion || !el) return;

      // Tween a plain object and write the formatted string out on update —
      // the number itself is never a DOM property GSAP could interpolate.
      // React renders the final value (below), so the server output and the
      // reduced-motion state are already correct; this only takes it back to
      // zero and plays it forward, before first paint.
      const counter = { value: 0 };
      el.textContent = format(0);

      gsap.to(counter, {
        value: to,
        duration,
        ease: "expo.out",
        onUpdate: () => {
          el.textContent = format(counter.value);
        },
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      });
    },
    ref,
    [to, decimals, prefix, suffix, duration],
  );

  return (
    <span ref={ref} className={className}>
      {format(to)}
    </span>
  );
}

/* ---------- Self-drawing line ---------- */

export function DrawPath({
  d,
  stroke,
  strokeWidth = 1.5,
  delay = 0,
  duration = 1.2,
  fill = "none",
}: {
  d: string;
  stroke?: string;
  strokeWidth?: number;
  delay?: number;
  duration?: number;
  fill?: string;
}) {
  const ref = useRef<SVGPathElement>(null);

  useMotion(
    ({ motion }) => {
      if (!motion || !ref.current) return;

      gsap
        .timeline({
          scrollTrigger: { trigger: ref.current, start: "top 95%", once: true },
          delay,
        })
        .from(ref.current, { drawSVG: "0%", duration, ease: EASE })
        .from(ref.current, { opacity: 0, duration: 0.2 }, 0);
    },
    ref,
    [d, delay, duration],
  );

  return (
    <path
      ref={ref}
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/** Builds a smooth-ish polyline path across a fixed box from 0-1 values. */
export function seriesPath(values: number[], w: number, h: number, pad = 2) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = pad + (1 - (v - min) / span) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
