"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CountUp, DrawPath, seriesPath } from "./gsap-primitives";
import styles from "./tabs.module.css";

type Metric = { label: string; value: number; prefix?: string; suffix?: string; decimals?: number };

type Tab = {
  key: string;
  label: string;
  thesis: string;
  metrics: Metric[];
  ships: string[];
  series: number[];
};

const TABS: Tab[] = [
  {
    key: "revenue",
    label: "Revenue systems",
    thesis:
      "Systems that sit directly on a revenue line — quoting, pricing, upsell, recovery — and are measured on what they return, not on usage.",
    metrics: [
      { label: "Median payback", value: 5.2, suffix: " mo", decimals: 1 },
      { label: "Quote cycle", value: -71, suffix: "%" },
      { label: "Attach rate", value: 18.4, suffix: "%", decimals: 1 },
    ],
    ships: [
      "Quote and pricing engines wired to your CPQ",
      "Retention and win-back agents on your own CRM",
      "Attribution back to the ledger, not to a dashboard",
    ],
    series: [10, 13, 12, 17, 21, 20, 26, 31, 36, 40, 47, 55],
  },
  {
    key: "cost",
    label: "Cost recovery",
    thesis:
      "The unglamorous half. Triage, extraction and reconciliation that take fixed cost out of operations and hand the hours back.",
    metrics: [
      { label: "Hours returned / wk", value: 1840 },
      { label: "Manual touch", value: -64, suffix: "%" },
      { label: "Error rate", value: 0.4, suffix: "%", decimals: 1 },
    ],
    ships: [
      "Document extraction with a reviewed exception queue",
      "Claims and ticket triage inside your boundary",
      "Reconciliation agents with a full audit trail",
    ],
    series: [40, 38, 36, 33, 31, 28, 26, 22, 20, 17, 15, 12],
  },
  {
    key: "data",
    label: "Data foundation",
    thesis:
      "Most pilots die here. Pipelines, contracts and warehousing built to production standard before a model is chosen.",
    metrics: [
      { label: "Pipeline uptime", value: 99.9, suffix: "%", decimals: 1 },
      { label: "Sources unified", value: 27 },
      { label: "Freshness", value: 4, suffix: " min" },
    ],
    ships: [
      "Ingestion, contracts and lineage you can inspect",
      "A warehouse your analysts can query without us",
      "Evaluation sets that outlive the engagement",
    ],
    series: [14, 18, 24, 29, 35, 41, 48, 53, 59, 64, 69, 74],
  },
  {
    key: "governance",
    label: "Governance",
    thesis:
      "Controls, documentation and EU AI Act readiness in place before an auditor asks — because retrofitting them costs more than building them.",
    metrics: [
      { label: "Controls mapped", value: 48 },
      { label: "Audit prep", value: -83, suffix: "%" },
      { label: "Bytes egressed", value: 0 },
    ],
    ships: [
      "Risk classification and technical documentation",
      "Model and prompt versioning with rollback",
      "Access, retention and egress policy enforced in code",
    ],
    series: [8, 12, 15, 19, 23, 28, 32, 37, 41, 46, 50, 55],
  },
];

export function CapabilityTabs() {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent) {
    const last = TABS.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  const tab = TABS[active];

  return (
    <div className={styles.wrap}>
      <div
        role="tablist"
        aria-label="What we build"
        className={styles.tablist}
        onKeyDown={onKeyDown}
      >
        {TABS.map((t, i) => (
          <button
            key={t.key}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            id={`${baseId}-tab-${t.key}`}
            aria-selected={i === active}
            aria-controls={`${baseId}-panel-${t.key}`}
            tabIndex={i === active ? 0 : -1}
            className={`${styles.tab} ${i === active ? styles.tabOn : ""}`}
            onClick={() => setActive(i)}
          >
            {i === active && (
              <motion.span
                layoutId="tab-indicator"
                className={styles.indicator}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className={styles.tabText}>{t.label}</span>
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${tab.key}`}
        aria-labelledby={`${baseId}-tab-${tab.key}`}
        className={styles.panel}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={styles.grid}
          >
            <div className={styles.left}>
              <p className={styles.thesis}>{tab.thesis}</p>
              <ul className={styles.ships}>
                {tab.ships.map((s) => (
                  <li key={s}>
                    <span className={styles.tick} aria-hidden="true">
                      <svg viewBox="0 0 12 12" width="11" height="11">
                        <path
                          d="M2.5 6.2 4.8 8.5 9.5 3.6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.right}>
              <dl className={styles.metrics}>
                {tab.metrics.map((m) => (
                  <div key={m.label} className={styles.metric}>
                    <dt>{m.label}</dt>
                    <dd className="tnum">
                      <CountUp
                        to={m.value}
                        decimals={m.decimals ?? 0}
                        prefix={m.prefix ?? (m.value > 0 && m.suffix === "%" ? "+" : "")}
                        suffix={m.suffix ?? ""}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
              <svg
                className={styles.chart}
                viewBox="0 0 240 64"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {[16, 32, 48].map((y) => (
                  <line key={y} x1="0" y1={y} x2="240" y2={y} stroke="var(--hairline)" strokeWidth="1" />
                ))}
                <DrawPath
                  key={tab.key}
                  d={seriesPath(tab.series, 240, 64, 6)}
                  stroke="var(--up)"
                  strokeWidth={1.75}
                  duration={1}
                />
              </svg>
              <p className={styles.chartNote}>Illustrative, 12-month shape</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
