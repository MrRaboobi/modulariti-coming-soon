"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import styles from "./page.module.css";

const LAUNCH_TARGET = new Date("2026-09-11T00:00:00+05:00").getTime();

type CountdownState =
  | { status: "pending" }
  | { status: "counting"; days: number; hours: number; mins: number; secs: number }
  | { status: "live" };

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function computeState(): CountdownState {
  const diff = LAUNCH_TARGET - Date.now();
  if (diff <= 0) return { status: "live" };
  return {
    status: "counting",
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
}

let cached: CountdownState = computeState();

function subscribe(callback: () => void) {
  const timer = setInterval(() => {
    cached = computeState();
    callback();
  }, 1000);
  return () => clearInterval(timer);
}

function getSnapshot() {
  return cached;
}

const PENDING_STATE: CountdownState = { status: "pending" };

function getServerSnapshot(): CountdownState {
  return PENDING_STATE;
}

const digitSpring = { type: "spring" as const, stiffness: 300, damping: 26 };

function Digit({ value }: { value: string }) {
  return (
    <span className={styles.numWrap}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className={styles.num}
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={digitSpring}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Tile({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className={styles.tile}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

export function Countdown() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isLive = state.status === "live";
  const d = state.status === "counting" ? pad(state.days) : "00";
  const h = state.status === "counting" ? pad(state.hours) : "00";
  const m = state.status === "counting" ? pad(state.mins) : "00";
  const s = state.status === "counting" ? pad(state.secs) : "00";

  return (
    <>
      <div className={styles.countdown} role="timer" aria-live="off" aria-label="Countdown to launch">
        <Tile>
          <Digit value={d} />
          <span className={styles.lbl}>Days</span>
        </Tile>
        <span className={styles.sep}>:</span>
        <Tile>
          <Digit value={h} />
          <span className={styles.lbl}>Hrs</span>
        </Tile>
        <span className={styles.sep}>:</span>
        <Tile>
          <Digit value={m} />
          <span className={styles.lbl}>Min</span>
        </Tile>
        <span className={styles.sep}>:</span>
        <Tile>
          <Digit value={s} />
          <span className={styles.lbl}>Sec</span>
        </Tile>
      </div>
      <p className={`${styles.launchDate} ${isLive ? styles.isLive : ""}`}>
        {isLive ? "We're live — thank you for waiting." : "Launching September 11, 2026 · PKT"}
      </p>
    </>
  );
}
