"use client";

import * as React from "react";
import { useEffect, useRef, type RefObject } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { EASE, QUERIES, gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Particle field                                                            */
/*                                                                            */
/*  A drifting point cloud that draws a line between any two points closer     */
/*  than `linkRadius`, and bends away from the pointer. Two things about the   */
/*  implementation are worth naming:                                          */
/*                                                                            */
/*  1. The naive version of this compares every point to every other point,    */
/*     which is O(n²) — at 1440x620 that is ~10,000 distance tests a frame,    */
/*     and it grows with the square of the area, so a wide monitor is what     */
/*     kills it. Points are binned into a uniform grid whose cell is the link  */
/*     radius instead, so each point only looks at its own cell and the eight  */
/*     around it. Nothing outside those can be in range.                       */
/*                                                                            */
/*  2. It sizes to its own container, not to the window, so it works as a      */
/*     band behind copy rather than only as a full-screen backdrop — and it    */
/*     reads the pointer in container coordinates, off an element you can      */
/*     nominate, since a background layer takes no pointer events of its own.  */
/* -------------------------------------------------------------------------- */

export type ParticleFieldProps = {
  /** Square pixels of canvas per particle. Lower is denser. */
  density?: number;
  /** Longest link drawn, in CSS pixels. Also the grid cell size. */
  linkRadius?: number;
  /** Drift speed, in CSS pixels per frame. */
  speed?: number;
  /** How far the pointer pushes points away, in CSS pixels. */
  pointerRadius?: number;
  /** "r,g,b" of the points and the links between them. */
  color?: string;
  /** "r,g,b" of the larger hub nodes, which carry the field's depth. */
  deepColor?: string;
  /** "r,g,b" of links inside the pointer's reach — the field lights up under it. */
  activeColor?: string;
  /** Share of nodes drawn as glowing hubs, 0 to 1. */
  hubRatio?: number;
  /** Overall weight, 0 to 1. */
  opacity?: number;
  /**
   * Horizontal falloff, as two fractions of the width: the field is held at
   * `falloffMin` up to the first and reaches full weight at the second. This
   * is how the copy column stays clear — the field thins out over it rather
   * than being washed flat by an overlay, which greys the whole thing and is
   * what makes an effect like this look cheap.
   */
  falloff?: [number, number];
  /** Weight at the quiet end of the falloff, 0 to 1. */
  falloffMin?: number;
  /** Let the pointer push the field around. */
  interactive?: boolean;
  /**
   * Element to read the pointer from. Defaults to the canvas's own parent —
   * pass something else when the field sits behind copy and so never receives
   * a pointer event itself.
   */
  pointerTarget?: RefObject<HTMLElement | null>;
  className?: string;
};

export function ParticleField({
  density = 4400,
  linkRadius = 132,
  speed = 0.32,
  pointerRadius = 210,
  // The action blue, the deeper tone for hubs, and ink where the pointer is.
  color = "32,117,255",
  deepColor = "26,102,224",
  activeColor = "5,21,36",
  hubRatio = 0.14,
  opacity = 1,
  falloff = [0.1, 0.56],
  falloffMin = 0.16,
  interactive = true,
  pointerTarget,
  className,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const config = {
    density, linkRadius, speed, pointerRadius, color, deepColor, activeColor,
    hubRatio, opacity, falloff, falloffMin, interactive, pointerTarget,
  };
  // The loop is set up once and reads live props off this ref, so a prop change
  // never tears it down. Written from an effect rather than during render.
  const props = useRef(config);
  useEffect(() => {
    props.current = config;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    let visible = true;

    /* --- the cloud ------------------------------------------------------- */
    // Flat typed arrays rather than an array of objects: the connect pass
    // walks these tens of thousands of times a second.
    let px = new Float32Array(0);
    let py = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);
    let pr = new Float32Array(0);
    let hub = new Uint8Array(0);
    let count = 0;

    function seed() {
      const C = props.current;
      count = Math.max(24, Math.min(700, Math.round((width * height) / C.density)));
      px = new Float32Array(count);
      py = new Float32Array(count);
      vx = new Float32Array(count);
      vy = new Float32Array(count);
      pr = new Float32Array(count);
      hub = new Uint8Array(count);
      for (let i = 0; i < count; i++) {
        // A minority of larger, deeper, glowing nodes. Without them every dot
        // is the same and the field reads as noise rather than a structure.
        const isHub = Math.random() < C.hubRatio;
        hub[i] = isHub ? 1 : 0;
        pr[i] = isHub ? Math.random() * 1.5 + 2.1 : Math.random() * 1.1 + 1.1;
        px[i] = Math.random() * width;
        py[i] = Math.random() * height;
        vx[i] = (Math.random() - 0.5) * 2 * C.speed;
        vy[i] = (Math.random() - 0.5) * 2 * C.speed;
      }
    }

    /* --- hub glow sprite --------------------------------------------------- */
    // One cached radial gradient, stamped at each hub. Cheaper than building a
    // gradient per node per frame, which is what makes naive glow expensive.
    let glow: HTMLCanvasElement | null = null;
    let glowFor = "";
    const GLOW_R = 26;
    function glowSprite(rgb: string) {
      if (glow && glowFor === rgb) return glow;
      const c = document.createElement("canvas");
      c.width = c.height = GLOW_R * 2;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(GLOW_R, GLOW_R, 0, GLOW_R, GLOW_R, GLOW_R);
      grad.addColorStop(0, `rgba(${rgb},0.5)`);
      grad.addColorStop(0.35, `rgba(${rgb},0.16)`);
      grad.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, GLOW_R * 2, GLOW_R * 2);
      glow = c;
      glowFor = rgb;
      return c;
    }

    /**
     * Horizontal weight ramp. The field thins out over the copy column instead
     * of being flattened by a white overlay — a wash greys the mesh uniformly
     * and kills the contrast that makes it read at all.
     */
    function ramp(x: number) {
      const C = props.current;
      const [a, b] = C.falloff;
      if (b <= a) return 1;
      const t = (x / width - a) / (b - a);
      return C.falloffMin + (1 - C.falloffMin) * Math.min(1, Math.max(0, t));
    }

    /* --- uniform grid ----------------------------------------------------- */
    // Rebuilt each frame. `heads`/`next` is a singly linked list per cell,
    // which needs no allocation after the first sizing.
    let cols = 0;
    let rows = 0;
    let heads = new Int32Array(0);
    let next = new Int32Array(0);

    function sizeGrid() {
      const C = props.current;
      cols = Math.max(1, Math.ceil(width / C.linkRadius));
      rows = Math.max(1, Math.ceil(height / C.linkRadius));
      heads = new Int32Array(cols * rows);
      next = new Int32Array(count);
    }

    function fillGrid() {
      const C = props.current;
      heads.fill(-1);
      for (let i = 0; i < count; i++) {
        const cxi = Math.min(cols - 1, Math.max(0, (px[i] / C.linkRadius) | 0));
        const cyi = Math.min(rows - 1, Math.max(0, (py[i] / C.linkRadius) | 0));
        const cell = cyi * cols + cxi;
        next[i] = heads[cell];
        heads[cell] = i;
      }
    }

    /* --- sizing ----------------------------------------------------------- */
    let dpr = 1;
    function resize() {
      const rect = host!.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (w === width && h === height) return;
      width = w;
      height = h;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      // All the maths below is in CSS pixels; the transform handles the rest.
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      sizeGrid();
    }

    /* --- pointer ---------------------------------------------------------- */
    // Container coordinates, not viewport ones: this is a band inside a page,
    // not a full-screen backdrop. -1 means "no pointer" — 0 is a real position
    // at the left edge, so a truthiness check would drop it.
    const pointer = { x: -1, y: -1 };
    const pointerHost = props.current.pointerTarget?.current ?? host;

    function onMove(ev: PointerEvent) {
      if (!props.current.interactive) return;
      const rect = canvas!.getBoundingClientRect();
      pointer.x = ev.clientX - rect.left;
      pointer.y = ev.clientY - rect.top;
    }
    function onLeave() {
      pointer.x = -1;
      pointer.y = -1;
    }

    /* --- one frame -------------------------------------------------------- */
    function step(move: boolean) {
      const C = props.current;
      const R = C.linkRadius;
      const R2 = R * R;
      const PR = C.pointerRadius;
      const hasPointer = pointer.x >= 0 && pointer.y >= 0;

      ctx!.clearRect(0, 0, width, height);
      ctx!.globalAlpha = C.opacity;

      /* drift, and bend away from the pointer */
      for (let i = 0; i < count; i++) {
        if (move) {
          if (px[i] > width || px[i] < 0) vx[i] = -vx[i];
          if (py[i] > height || py[i] < 0) vy[i] = -vy[i];

          if (hasPointer) {
            const dx = pointer.x - px[i];
            const dy = pointer.y - py[i];
            const d = Math.hypot(dx, dy);
            if (d < PR + pr[i] && d > 0.001) {
              const force = (PR - d) / PR;
              px[i] -= (dx / d) * force * 7;
              py[i] -= (dy / d) * force * 7;
            }
          }

          px[i] += vx[i];
          py[i] += vy[i];
        }
      }

      /* links first, so the nodes sit on top of them rather than under */
      fillGrid();
      for (let i = 0; i < count; i++) {
        const cxi = Math.min(cols - 1, Math.max(0, (px[i] / R) | 0));
        const cyi = Math.min(rows - 1, Math.max(0, (py[i] / R) | 0));

        const lit =
          hasPointer && Math.hypot(px[i] - pointer.x, py[i] - pointer.y) < PR;

        for (let gy = cyi - 1; gy <= cyi + 1; gy++) {
          if (gy < 0 || gy >= rows) continue;
          for (let gx = cxi - 1; gx <= cxi + 1; gx++) {
            if (gx < 0 || gx >= cols) continue;
            for (let j = heads[gy * cols + gx]; j !== -1; j = next[j]) {
              // Each pair once: only look forward.
              if (j <= i) continue;
              const dx = px[i] - px[j];
              const dy = py[i] - py[j];
              const d2 = dx * dx + dy * dy;
              if (d2 > R2) continue;
              // Squared rather than linear: near links stay strong and only the
              // ones at the edge of range fade, which keeps the mesh legible
              // instead of dissolving everything into an even haze.
              const t = 1 - d2 / R2;
              const w = ramp((px[i] + px[j]) * 0.5);
              const a = t * t * 0.95 * w;
              if (a < 0.012) continue;
              if (lit) {
                ctx!.strokeStyle = `rgba(${C.activeColor},${(a * 0.95).toFixed(3)})`;
                ctx!.lineWidth = 1.4;
              } else {
                ctx!.strokeStyle = `rgba(${C.color},${a.toFixed(3)})`;
                ctx!.lineWidth = hub[i] || hub[j] ? 1.25 : 1;
              }
              ctx!.beginPath();
              ctx!.moveTo(px[i], py[i]);
              ctx!.lineTo(px[j], py[j]);
              ctx!.stroke();
            }
          }
        }
      }

      /* nodes: hubs glow and carry the deeper tone, the rest are plain dots */
      const sprite = glowSprite(C.deepColor);
      for (let i = 0; i < count; i++) {
        const w = ramp(px[i]);
        if (w < 0.02) continue;
        if (hub[i]) {
          ctx!.globalAlpha = C.opacity * w;
          ctx!.drawImage(
            sprite,
            px[i] - GLOW_R, py[i] - GLOW_R, GLOW_R * 2, GLOW_R * 2,
          );
          ctx!.globalAlpha = C.opacity;
          ctx!.fillStyle = `rgba(${C.deepColor},${(0.95 * w).toFixed(3)})`;
        } else {
          ctx!.fillStyle = `rgba(${C.color},${(0.8 * w).toFixed(3)})`;
        }
        ctx!.beginPath();
        ctx!.arc(px[i], py[i], pr[i], 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }

    function tick() {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      step(true);
    }

    resize();
    step(false);
    if (!reduced) raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) step(false);
    });
    ro.observe(host);

    const io = new IntersectionObserver(
      (entries) => { visible = entries[0]?.isIntersecting ?? true; },
      { threshold: 0 },
    );
    io.observe(host);

    const onVisibility = () => { visible = !document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);
    if (!reduced) {
      pointerHost.addEventListener("pointermove", onMove);
      pointerHost.addEventListener("pointerleave", onLeave);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      pointerHost.removeEventListener("pointermove", onMove);
      pointerHost.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("absolute inset-0 h-full w-full", className)}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  The hero this field was written for                                       */
/* -------------------------------------------------------------------------- */

export type AetherFlowHeroProps = {
  eyebrow?: string;
  title?: string;
  body?: string;
  cta?: string;
  ctaHref?: string;
  className?: string;
  field?: ParticleFieldProps;
};

export function AetherFlowHero({
  eyebrow = "Dynamic Rendering Engine",
  title = "Aether Flow",
  body = "An intelligent, adaptive framework for creating fluid digital experiences that feel alive and respond to user interaction in real-time.",
  cta = "Explore the Engine",
  ctaHref = "#",
  className,
  field,
}: AetherFlowHeroProps) {
  const scope = useRef<HTMLDivElement>(null);

  // The source used framer-motion variants for this; the page's animation
  // layer is GSAP, so it runs on one timeline instead. Same shape — fade up,
  // staggered — and it creates nothing at all under prefers-reduced-motion,
  // which leaves the copy at its finished, readable state.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(QUERIES, (context) => {
        if (!context.conditions?.motion) return;
        gsap.from("[data-aether-rise]", {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: EASE,
          stagger: 0.2,
          delay: 0.5,
        });
      }, scope.current ?? undefined);
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div
      ref={scope}
      className={cn(
        "relative flex h-screen w-full flex-col items-center justify-center overflow-hidden",
        className,
      )}
      style={{ background: "var(--canvas)" }}
    >
      <ParticleField pointerTarget={scope} {...field} />

      <div className="relative z-10 p-6 text-center">
        <div
          data-aether-rise
          className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 backdrop-blur-sm"
          style={{
            background: "var(--blue-tint)",
            border: "1px solid var(--blue-tint-2)",
          }}
        >
          <Zap className="h-4 w-4" style={{ color: "var(--blue)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--blue-deep)" }}>
            {eyebrow}
          </span>
        </div>

        <h1
          data-aether-rise
          className="mb-6 text-5xl font-bold tracking-tighter md:text-8xl"
          style={{ color: "var(--ink)" }}
        >
          {title}
        </h1>

        <p
          data-aether-rise
          className="mx-auto mb-10 max-w-2xl text-lg"
          style={{ color: "var(--body)" }}
        >
          {body}
        </p>

        <div data-aether-rise>
          <a
            href={ctaHref}
            className="mx-auto inline-flex items-center gap-2 rounded-lg px-8 py-4 font-semibold transition-colors duration-300"
            style={{
              background: "var(--blue)",
              color: "#ffffff",
              boxShadow: "var(--shadow-blue)",
            }}
          >
            {cta}
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default AetherFlowHero;
