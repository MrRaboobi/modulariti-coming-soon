"use client";

import { CountUp, DrawPath, seriesPath } from "./gsap-primitives";
import styles from "./ledger.module.css";

type Row = {
  system: string;
  id: string;
  scope: string;
  status: "Live" | "Scaling" | "Pilot";
  revenue: number;
  delta: number;
  series: number[];
};

/* Illustrative portfolio — labelled as such in the panel header. These are
   shaped like real engagements, not drawn from a client. */
const ROWS: Row[] = [
  {
    system: "Quote automation",
    id: "DOC-01",
    scope: "Industrial distribution",
    status: "Live",
    revenue: 1284000,
    delta: 31.4,
    series: [12, 14, 13, 18, 22, 21, 27, 33, 38, 41, 48, 56],
  },
  {
    system: "Churn intercept",
    id: "RET-04",
    scope: "B2B subscription",
    status: "Live",
    revenue: 842500,
    delta: 18.2,
    series: [20, 19, 22, 24, 23, 27, 29, 28, 33, 35, 37, 41],
  },
  {
    system: "Sales copilot",
    id: "CRM-02",
    scope: "Enterprise software",
    status: "Scaling",
    revenue: 511300,
    delta: 44.6,
    series: [6, 7, 9, 8, 12, 15, 19, 22, 27, 31, 38, 47],
  },
  {
    system: "Claims triage",
    id: "OPS-07",
    scope: "Insurance",
    status: "Live",
    revenue: 396900,
    delta: 9.1,
    series: [26, 27, 26, 28, 29, 28, 30, 31, 30, 32, 33, 34],
  },
  {
    system: "Demand forecast",
    id: "FIN-03",
    scope: "Consumer goods",
    status: "Pilot",
    revenue: 128400,
    delta: -3.2,
    series: [18, 19, 17, 18, 16, 17, 15, 16, 15, 14, 15, 14],
  },
];

const TOTAL = ROWS.reduce((sum, r) => sum + r.revenue, 0);

function Delta({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={`${styles.delta} ${up ? styles.up : styles.down} tnum`}>
      <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true">
        <path
          d={up ? "M5 1.5 L9 8.5 H1 Z" : "M5 8.5 L1 1.5 H9 Z"}
          fill="currentColor"
        />
      </svg>
      {up ? "+" : "−"}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function Spark({ row, index }: { row: Row; index: number }) {
  const up = row.delta >= 0;
  const stroke = up ? "var(--up)" : "var(--down)";
  return (
    <svg
      className={styles.spark}
      viewBox="0 0 120 28"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <DrawPath
        d={seriesPath(row.series, 120, 28, 3)}
        stroke={stroke}
        strokeWidth={1.5}
        delay={0.15 + index * 0.08}
        duration={1.1}
      />
    </svg>
  );
}

export function RevenueLedger() {
  return (
    <div className={styles.panel} data-intro>
      <header className={styles.head}>
        <div className={styles.headLeft}>
          <span className={styles.live} aria-hidden="true">
            <span className={`${styles.liveDot} livedot`} />
          </span>
          <h2 className={styles.headTitle}>Revenue ledger</h2>
          <span className={styles.tag}>Illustrative</span>
        </div>
        <span className={`${styles.headMeta} tnum`}>Trailing 90 days</span>
      </header>

      <div
        className={styles.scroller}
        role="region"
        aria-label="Revenue ledger, scrollable"
        tabIndex={0}
      >
        <table className={styles.table}>
          <caption className={styles.caption}>
            Deployed systems mapped to the revenue they are measured on. Figures are illustrative
            and shaped like real engagements, not drawn from a client.
          </caption>
          <thead>
            <tr>
              <th scope="col">System</th>
              <th scope="col" className={styles.hideSm}>
                Sector
              </th>
              <th scope="col">Status</th>
              <th scope="col" className={styles.num}>
                Traced revenue
              </th>
              <th scope="col" className={styles.hideSm}>
                Trend
              </th>
              <th scope="col" className={styles.num}>
                Δ
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.id}>
                <th scope="row" className={styles.systemCell}>
                  <span className={styles.systemName}>{row.system}</span>
                  <span className={`${styles.systemId} tnum`}>{row.id}</span>
                </th>
                <td className={styles.hideSm}>{row.scope}</td>
                <td>
                  <span
                    className={`${styles.status} ${
                      row.status === "Live"
                        ? styles.stLive
                        : row.status === "Scaling"
                          ? styles.stScaling
                          : styles.stPilot
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className={`${styles.num} ${styles.revenue} tnum`}>
                  <CountUp to={row.revenue} prefix="$" duration={1 + i * 0.09} />
                </td>
                <td className={styles.hideSm}>
                  <Spark row={row} index={i} />
                </td>
                <td className={styles.num}>
                  <Delta value={row.delta} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={3} className={styles.totalLabel}>
                Portfolio, trailing 90 days
              </th>
              <td className={`${styles.num} ${styles.total} tnum`} colSpan={2}>
                <CountUp to={TOTAL} prefix="$" duration={1.5} />
              </td>
              <td className={styles.num}>
                <Delta value={24.8} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
