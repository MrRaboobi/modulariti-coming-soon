"use client";

import { useRef } from "react";
import { CapabilityTabs } from "./capability-tabs";
import { useReveal } from "./gsap-primitives";
import styles from "./sections.module.css";

export function Capabilities() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope, { y: 10, duration: 0.5, start: "top 80%" });

  return (
    <div className={`${styles.band} ${styles.bandPanel}`}>
      <section ref={scope} id="capabilities" className={styles.section}>
        <h2 className={styles.h2} data-reveal>
          Four places we attach to the business
        </h2>
        <p className={styles.sectionIntro} data-reveal>
          Every engagement starts by naming the line it is supposed to move. These are the four
          attachment points, and what each one actually ships.
        </p>
        <div data-reveal>
          <CapabilityTabs />
        </div>
      </section>
    </div>
  );
}
