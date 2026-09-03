import type { Metadata, Viewport } from "next";
import { Unbounded, Manrope, JetBrains_Mono } from "next/font/google";
import { MotionConfig } from "motion/react";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-display",
  weight: ["500", "700", "800"],
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "modulariti — Coming Soon",
  description:
    "Powerful AI, without handing over your data. modulariti builds composable models, agents, and pipelines that run on your own infrastructure — launching soon.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a12",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${unbounded.variable} ${manrope.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
