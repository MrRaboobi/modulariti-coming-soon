"use client";

import { useRef } from "react";
import {
  OrbitalHeroSection,
  SOLAR_SYSTEM_LIGHT,
} from "@/components/ui/orbital-hero-section";
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

/* Mercury through Saturn. The ice giants are dropped rather than drawn: after
   the radial squeeze they sit almost on top of Saturn, and each one costs a
   few hundred stroke calls a frame for a coil nobody can pick out. */
const BODIES = SOLAR_SYSTEM_LIGHT.slice(0, 6);

export function Hero() {
  const scope = useRef<HTMLElement>(null);
  // Below 980px the grid stacks: the copy takes the full measure, so there is
  // no empty quadrant left to put the field in — it would run straight through
  // the headline. It is also the per-frame stroke loop phones can least afford,
  // so it is not rendered at all rather than rendered and hidden.
  const wide = useMediaQuery("(min-width: 981px)");

  // One timeline over the five `data-intro` blocks below, in DOM order:
  // headline, lede, form, rail column, ledger.
  useIntro(scope);

  return (
    <section ref={scope} className={styles.hero}>
      <div className={styles.heroStage}>
        {wide ? (
          <div className={styles.heroSky} aria-hidden="true">
            <OrbitalHeroSection
              theme="light"
              planets={BODIES}
              // The Sun sits high and right — clear of the headline on the left
              // and above the stat rail below it — and the scrim veils the left
              // edge, which is the column the copy actually runs down.
              focus={[0.81, 0.15]}
              scrim="left"
              scrimStrength={0.82}
              viewRadius={3.9}
              lead={0.08}
              glow={0.85}
              // Slower than the component's default: this runs under live copy,
              // so it has to read as drift rather than as something happening.
              yearSeconds={26}
              trailYears={2.2}
              maxTurns={2.2}
              starCount={520}
              // The canvas sits behind the copy and takes no pointer events of
              // its own, so the camera reads the pointer off the whole hero.
              pointerTarget={scope}
            />
          </div>
        ) : null}

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
