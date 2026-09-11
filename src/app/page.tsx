"use client";

import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { About } from "./about";
import { Capabilities } from "./capabilities";
import { StackMarquee } from "./stack-marquee";
import { ClosingCta } from "./closing-cta";
import { Hero } from "./hero";
import { Masthead, BrandMark } from "./masthead";
import { PipelineScreen } from "./pipeline-screen";
import { RealProblem } from "./real-problem";
import { SiteFooter } from "./site-footer";
import pageStyles from "./page.module.css";
import styles from "./sections.module.css";

function MacbookTitle() {
  return <span>Every system runs inside your boundary.</span>;
}

function MacbookBadge() {
  return (
    <div
      className="flex items-center gap-2 rounded-full py-2 pl-2.5 pr-4"
      style={{
        background: "rgba(255,255,255,0.8)",
        border: "1px solid var(--hairline)",
        backdropFilter: "saturate(140%) blur(10px)",
        WebkitBackdropFilter: "saturate(140%) blur(10px)",
        boxShadow: "var(--shadow-sm), var(--lit)",
      }}
    >
      <BrandMark className={pageStyles.brandMark} />
      <span
        className="text-xs font-medium"
        style={{ color: "var(--ink)", letterSpacing: "-0.01em" }}
      >
        modulariti
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Masthead />
      <main>
        <Hero />

        <section
          className={styles.band}
          aria-label="How modulariti runs inside your environment"
        >
          <MacbookScroll
            screen={(progress) => <PipelineScreen progress={progress} />}
            showGradient={false}
            title={<MacbookTitle />}
            badge={<MacbookBadge />}
          />
        </section>

        <StackMarquee />
        <Capabilities />
        <RealProblem />
        <About />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
