"use client";

import { useRef } from "react";
import { ScrollHighlight } from "./scroll-highlight";
import { useReveal } from "./gsap-primitives";
import styles from "./sections.module.css";

const BREAKDOWNS = [
  "No production-grade data infrastructure",
  "No executive governance alignment",
  "No ROI-based use-case prioritization",
  "No MLOps planning",
  "No workforce transition strategy",
];

function XMark() {
  return (
    <span className={styles.xIcon} aria-hidden="true">
      <svg width="10" height="10" viewBox="0 0 18 18" fill="none">
        <path d="M4.6 4.6l8.8 8.8M13.4 4.6l-8.8 8.8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function RealProblem() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope, { y: 18, duration: 0.55, stagger: 0.07, start: "top 82%" });

  return (
    <div className={styles.band}>
      <section ref={scope} id="problem" className={styles.section}>
        <div className={styles.problemGrid}>
          <div className={styles.problemAside}>
            <h2 className={styles.h2} data-reveal>
              The Real Problem
            </h2>
            <p className={styles.problemDeck} data-reveal>
              Why <span className={styles.stat}>88%</span> of AI projects never reach production
            </p>
            <ScrollHighlight
              className={styles.problemBody}
              text="Most organizations don't fail because of algorithms. They fail because they were never AI-ready."
            />
            <p className={styles.problemNote} data-reveal>
              Readiness is infrastructure, governance, prioritisation, operations and people. Model
              choice is the last decision, not the first.
            </p>
          </div>

          <div className={styles.breakdownCard} data-reveal="card">
            <h3 className={styles.breakdownHeading}>Where the money stops</h3>
            <ul className={styles.breakdownList}>
              {BREAKDOWNS.map((text) => (
                <li key={text} className={styles.breakdownItem} data-reveal>
                  <XMark />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <p className={styles.breakdownClose}>
              AI readiness is not about experimenting. It&apos;s about building deployable capability.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
