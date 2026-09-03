"use client";

import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { Hero } from "./hero";
import { NetworkCanvas } from "./network-canvas";
import { PipelineScreen } from "./pipeline-screen";
import styles from "./page.module.css";

function MacbookTitle() {
  return (
    <span className="font-[family-name:var(--font-display)] font-semibold tracking-[-0.01em]" style={{ color: "var(--text)" }}>
      AI that fits your business, and stays inside it.
    </span>
  );
}

function MacbookBadge() {
  return (
    <div
      className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3"
      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
    >
      <div className="grid grid-cols-2 grid-rows-2 gap-[2px]" style={{ width: 16, height: 16 }}>
        <span className="rounded-[2px]" style={{ background: "var(--violet)" }} />
        <span className="rounded-[2px]" style={{ background: "var(--cyan)" }} />
        <span className="rounded-[2px]" style={{ background: "var(--cyan)" }} />
        <span className="rounded-[2px]" style={{ background: "var(--violet)" }} />
      </div>
      <span className="font-[family-name:var(--font-mono)] text-xs tracking-wide" style={{ color: "var(--text-dim)" }}>
        modulariti
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <NetworkCanvas />
      <div className={`${styles.orb} ${styles.orbA}`} aria-hidden="true" />
      <div className={`${styles.orb} ${styles.orbB}`} aria-hidden="true" />

      <Hero />

      <section className="relative z-[2]">
        <MacbookScroll
          screen={(progress) => <PipelineScreen progress={progress} />}
          showGradient={false}
          title={<MacbookTitle />}
          badge={<MacbookBadge />}
        />
      </section>
    </>
  );
}
