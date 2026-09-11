"use client";

import { useRef, useState } from "react";
import { useHoverLift } from "./gsap-primitives";
import styles from "./page.module.css";

type Status = "idle" | "success";

export function SignupForm({ fieldId = "email", label = "Get notified at launch" }: { fieldId?: string; label?: string } = {}) {
  const scope = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  // Re-runs when the form swaps to its success state and the button unmounts.
  useHoverLift(scope, `.${styles.signupButton}`, {
    y: 0,
    hoverScale: 1.04,
    press: 0.96,
    deps: [status],
  });

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
    <form ref={scope} className={styles.signup} onSubmit={handleSubmit}>
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
          <label className={styles.signupLabel} htmlFor={fieldId}>
            {label}
          </label>
          <div className={styles.signupRow}>
            <input
              type="email"
              id={fieldId}
              name="email"
              placeholder="you@company.com"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className={styles.signupButton}>
              <span>Notify Me</span>
            </button>
          </div>
          <p className={styles.signupNote}>One email when we launch. No newsletter, no sharing.</p>
        </>
      )}
    </form>
  );
}
