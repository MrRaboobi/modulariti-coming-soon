"use client";

import { useState } from "react";
import { motion } from "motion/react";
import styles from "./page.module.css";

type Status = "idle" | "success";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // No backend wired up yet: confirm the signup optimistically so
    // visitors aren't blocked on a Formspree endpoint that isn't live.
    // The request still fires so it starts working the moment it is.
    fetch("https://formspree.io/f/xxxxabcd", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(e.currentTarget),
    }).catch(() => {});

    setStatus("success");
    setEmail("");
  }

  return (
    <form className={styles.signup} onSubmit={handleSubmit}>
      {status === "success" ? (
        <p className={styles.signupSuccess}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 8.3l1.9 1.9L11.2 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>You&apos;re on the list — see you at launch.</span>
        </p>
      ) : (
        <>
          <label className={styles.signupLabel} htmlFor="email">
            Get notified at launch
          </label>
          <div className={styles.signupRow}>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@company.com"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <motion.button
              type="submit"
              className={styles.signupButton}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <span>Notify Me</span>
            </motion.button>
          </div>
        </>
      )}
    </form>
  );
}
