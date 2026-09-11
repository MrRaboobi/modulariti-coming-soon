"use client";

import { useRef } from "react";
import { BrandMark } from "./masthead";
import { useHoverLift } from "./gsap-primitives";
import styles from "./sections.module.css";

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} aria-label={label}>
      {children}
    </a>
  );
}

export function SiteFooter() {
  const scope = useRef<HTMLElement>(null);

  // Lift on hover, press on pointer-down — and on keyboard focus too, which
  // the old spring did not cover.
  useHoverLift(scope, "a", { y: -2, press: 0.95 });

  return (
    <div className={`${styles.band} ${styles.bandInk}`}>
      <footer ref={scope} className={styles.siteFooter}>
        <div className={styles.footBrand}>
          <BrandMark className={styles.footMark} />
          modulariti
        </div>

        <div className={styles.socials}>
          <SocialLink href="#" label="modulariti on X">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.1l-5.6-6.9L4.2 22H1l8.2-9.3L.9 2h7.3l5 6.3L18.9 2Zm-1.2 18h1.9L7.4 4H5.4l12.3 16Z" />
            </svg>
          </SocialLink>
          <SocialLink href="#" label="modulariti on LinkedIn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.94 8.5H3.56V20.5h3.38V8.5ZM5.25 3.25a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.5 20.5h-3.38v-6.3c0-1.5-.03-3.44-2.1-3.44-2.1 0-2.42 1.64-2.42 3.33v6.41H9.22V8.5h3.24v1.64h.05c.45-.86 1.56-1.77 3.21-1.77 3.43 0 4.06 2.26 4.06 5.2v6.93Z" />
            </svg>
          </SocialLink>
          <SocialLink href="#" label="modulariti on GitHub">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.58 2 12.2c0 4.5 2.87 8.3 6.84 9.65.5.1.68-.22.68-.5v-1.94c-2.78.62-3.37-1.36-3.37-1.36-.46-1.2-1.11-1.51-1.11-1.51-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.9-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .28.18.61.69.5A10.03 10.03 0 0 0 22 12.2C22 6.58 17.52 2 12 2Z" />
            </svg>
          </SocialLink>
          <SocialLink href="mailto:hello@modulariti.ai" label="Email modulariti">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
              <path d="m3.5 6 8.5 6.5L20.5 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </SocialLink>
        </div>

        <p className={styles.finePrint}>&copy; 2026 modulariti. All rights reserved.</p>
      </footer>
    </div>
  );
}
