"use client";

import { useRef } from "react";
import { ParticleField } from "@/components/ui/aether-flow-hero";
import { Countdown } from "./countdown";
import { SignupForm } from "./signup-form";
import { RevenueLedger } from "./revenue-ledger";
import { CountUp, useIntro } from "./gsap-primitives";
import { useMediaQuery } from "./use-media-query";
import styles from "./page.module.css";

const RAIL = [
  { label: "Median payback", value: 5.2, decimals: 1, suffix: " mo", up: false },
  { label: "Systems in production", value: 14, decimals: 0, suffix: "", up: false },
  { label: "Bytes leaving your network", value: 0, decimals: 0, suffix: "", up: true },
];

export function Hero() {
  const scope = useRef<HTMLElement>(null);
  // Below 980px the grid stacks and the copy takes the full measure, so the
  // field runs behind live text rather than beside it. It stays — an even mesh
  // reads as texture where the orbital field's bright focus did not — but it
  // is thinned out and held further back. See .heroSky in page.module.css.
  const wide = useMediaQuery("(min-width: 981px)");

  // One timeline over the five `data-intro` blocks below, in DOM order:
  // headline, lede, form, rail column, ledger.
  useIntro(scope);

  return (
    <section ref={scope} className={styles.hero}>
      <div className={styles.heroStage}>
        <div className={styles.heroSky} aria-hidden="true">
          <ParticleField
            density={wide ? 4200 : 9000}
            linkRadius={wide ? 138 : 104}
            speed={0.3}
            pointerRadius={wide ? 220 : 150}
            // Quiet over the copy column on the left, full weight in the open
            // right-hand half. On a stacked phone layout there is no clear
            // column, so the ramp runs top-heavy instead via a lower ceiling.
            falloff={wide ? [0.1, 0.56] : [0, 0.3]}
            falloffMin={wide ? 0.16 : 0.3}
            opacity={wide ? 1 : 0.62}
            // The canvas sits behind the copy and takes no pointer events of
            // its own, so it reads the pointer off the whole hero instead.
            pointerTarget={scope}
          />
        </div>

        <div className={styles.heroGrid}>
          <div>
            <h1 className={styles.h1} data-intro>
              AI systems measured in revenue, not usage.
            </h1>
            <p className={styles.lede} data-intro>
              modulariti is an engineering studio. We build models, agents and pipelines that run
              inside your own infrastructure — and we are judged on the line they move, not on the
              seats we fill.
            </p>
            <div data-intro>
              <SignupForm />
            </div>
          </div>

          <div data-intro>
            <div className={styles.rail}>
              {RAIL.map((r) => (
                <div key={r.label} className={styles.railItem}>
                  <span className={styles.railLabel}>{r.label}</span>
                  <span
                    className={`${styles.railValue} ${r.up ? styles.railValueUp : ""} tnum`}
                  >
                    <CountUp to={r.value} decimals={r.decimals} suffix={r.suffix} />
                  </span>
                </div>
              ))}
            </div>
            <p className={styles.railNote}>Illustrative portfolio figures</p>
            <Countdown />
          </div>
        </div>
      </div>

      <RevenueLedger />
    </section>
  );
}
