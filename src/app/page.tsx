"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("https://formspree.io/f/xxxxabcd", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(e.target as HTMLFormElement),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">modulariti</h1>

        <p className="text-neutral-400 text-lg">
          Something new is on the way. Leave your email and we&apos;ll let you know the moment we launch.
        </p>

        {status === "success" ? (
          <p className="text-green-400">You&apos;re on the list — talk soon.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-md bg-neutral-900 border border-neutral-700 px-4 py-2 text-sm outline-none focus:border-neutral-400"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-md bg-white text-black px-5 py-2 text-sm font-medium hover:bg-neutral-200 disabled:opacity-50"
            >
              {status === "loading" ? "Joining..." : "Notify me"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-red-400 text-sm">Something went wrong — please try again.</p>
        )}
      </div>
    </main>
  );
}