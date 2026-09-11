"use client";

import { useRef } from "react";
import { EASE, gsap } from "@/lib/gsap";
import { useMotion } from "./gsap-primitives";
import styles from "./page.module.css";

const SQUARES = ["var(--blue)", "var(--blue-deep)", "#0b47a8", "#5c9bff"];

export function BrandMark({ className }: { className: string }) {
  return (
    <span className={className} aria-hidden="true">
      {SQUARES.map((color) => (
        <span key={color} style={{ background: color }} />
      ))}
    </span>
  );
}

export function Masthead() {
  const scope = useRef<HTMLElement>(null);

  // The bar drops in first, then the four marks assemble under it. Both are
  // `from()` tweens, so the reduced-motion branch — which creates nothing —
  // already shows the finished bar.
  useMotion(({ motion }) => {
    if (!motion) return;

    gsap
      .timeline({ defaults: { ease: EASE } })
      .fromTo(
        scope.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.45 },
      )
      .from(
        `.${styles.brandMark} span`,
        { scale: 0, duration: 0.4, stagger: 0.04, ease: "back.out(2)" },
        0.15,
      );
  }, scope);

  return (
    <header ref={scope} className={styles.masthead} data-intro>
      <div className={styles.mastheadInner}>
        <div className={styles.brand}>
          <BrandMark className={styles.brandMark} />
          modulariti
        </div>
        <span className={styles.mastheadMeta}>
          <span className={`${styles.mastheadDot} livedot`} aria-hidden="true" />
          LAUNCHING 01 OCT 2026
        </span>
      </div>
    </header>
  );
}
