import type { Metadata, Viewport } from "next";
import { Archivo, Public_Sans, Geist_Mono } from "next/font/google";
import { MotionConfig } from "motion/react";
import "./globals.css";

// Variable, with the width axis exposed — headlines run semi-condensed.
const archivo = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const DIRECTION_CONTRACT = `<!--
THESIS: An AI engineering studio is judged on traced revenue, so the page opens on the ledger
instead of a claim. Refuses the soft-SaaS card grid and the neon-on-black accent page.
OWN-WORLD: Blue-shifted obsidian (#0A0C10) with charcoal and slate panels divided by 1px
hairlines — a trading blotter, not a marketing page. Colour is a data semantic only: emerald
means up, amber at risk, rust down; the action colour is bone white. Archivo at wdth 88 for
structure, Public Sans for prose, Geist Mono for every figure. Small radii, no radial glow.
STORY: An operator who has funded AI pilots that never paid sees systems mapped to traced
revenue, how the work runs, and what they own at the end — then leaves an email.
FIRST VIEWPORT: Obsidian. Hairline masthead with a live status. Headline left, then the
Revenue Ledger panel: monospace rows, sparklines that draw on scroll, figures that count up,
all marked illustrative.
FORM: Category canon (institutional fintech terminal), pinned by the brief; no concept roll.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

export const metadata: Metadata = {
  title: "modulariti — AI systems that pay for themselves",
  description:
    "modulariti is an AI engineering studio. We build production systems — models, agents and pipelines — that run on your infrastructure and are measured on the revenue they return.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${publicSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full flex flex-col">
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
