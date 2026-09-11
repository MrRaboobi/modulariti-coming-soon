"use client";

import { useRef } from "react";
import { SignupForm } from "./signup-form";
import { useReveal } from "./gsap-primitives";
import styles from "./sections.module.css";

export function ClosingCta() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope, { y: 20, duration: 0.6, start: "top 75%" });

  return (
    <div className={styles.band}>
      <section ref={scope} className={`${styles.section} ${styles.closing}`} data-reveal>
        <h2 className={styles.closingTitle}>Be first through the door</h2>
        <p className={styles.closingBody}>
          We open on 1 October 2026. Leave your address and we&apos;ll tell you the day it goes
          live — nothing before that.
        </p>
        <div className={styles.closingForm}>
          <SignupForm fieldId="email-closing" label="Get notified at launch" />
        </div>
      </section>
    </div>
  );
}
