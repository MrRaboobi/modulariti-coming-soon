"use client";

import { useRef } from "react";
import { ScrollHighlight } from "./scroll-highlight";
import { useReveal } from "./gsap-primitives";
import styles from "./sections.module.css";

const STAGES = [
  {
    title: "Diagnose",
    body: "We start at the business problem, not the technology — what is actually broken, and what changes when it works.",
  },
  {
    title: "Build",
    body: "Production-grade from the first commit: secure, documented, and built to a published engineering standard, in public.",
  },
  {
    title: "Hand over",
    body: "The system lands in repositories you own, with your team able to run it without us.",
  },
];

const NOTS = ["Not an AI vendor", "Not a staffing supplier", "Not advice for someone else to implement"];

export function About() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope, { y: 14, duration: 0.6, stagger: 0.07, start: "top 88%" });

  return (
    <div className={styles.band}>
      <section ref={scope} id="about" className={styles.section}>
        {/* 1 — hero composition: title across, then the claim against the account */}
        <h2 className={styles.aboutTitle} data-reveal>
          We solve the problems holding a business back
        </h2>

        <div className={styles.aboutHero}>
          <ScrollHighlight
            className={styles.aboutLead}
            text="AI, data and cloud engineering are our tools, not the point — and the systems we build are secure, accountable, and made to hold."
          />

          <div className={styles.aboutAside} data-reveal>
            <ScrollHighlight
              className={styles.aboutPara}
              text="modulariti.ai is an engineering studio. We solve business problems with complete, production-grade systems for organisations whose real problem is broken process and unused data, not a lack of technology."
              to="var(--body)"
            />
            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>Who it&apos;s for</dt>
                <dd>Organisations held back by broken process and data nobody is using.</dd>
              </div>
              <div className={styles.fact}>
                <dt>What you get</dt>
                <dd>The working system, in repositories you own, documented and yours to run.</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* The three stages, joined by a rail */}
        <h3 className={styles.subhead} data-reveal>
          How the work runs
        </h3>
        <ol className={styles.process} data-reveal>
          {STAGES.map(({ title, body }, i) => (
            <li key={title} className={styles.stage}>
              <span className={styles.stageNode} aria-hidden="true">
                {i + 1}
              </span>
              <h4 className={styles.stageTitle}>{title}</h4>
              <p className={styles.stageBody}>{body}</p>
            </li>
          ))}
        </ol>

        {/* 4 — closing statement */}
        <div className={styles.statement} data-reveal>
          <p className={styles.statementText}>
            We take responsibility for the outcome, and hand over a system your own team can run
            without us.
          </p>
          <ul className={styles.notList}>
            {NOTS.map((text) => (
              <li key={text} className={styles.notItem}>
                <span className={styles.notMark} aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
