"use client";

import { useRef } from "react";
import { CapabilityTabs } from "./capability-tabs";
import { useReveal } from "./gsap-primitives";
import { ScrollHighlight } from "./scroll-highlight";
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
        {/* Outside the reveal stagger on purpose: it owns its own scrubbed
            trigger, the same way the lead paragraphs in About do. `to` holds
            it at the colour the stylesheet already gives it. */}
        <ScrollHighlight
          className={styles.sectionIntro}
          to="var(--body)"
          text="Every engagement starts by naming the line it is supposed to move. These are the four attachment points, and what each one actually ships."
        />
        <div data-reveal>
          <CapabilityTabs />
        </div>
      </section>
    </div>
  );
}
