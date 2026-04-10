"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setCheckEmail(true);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    }

    setLoading(false);
  }

  if (checkEmail) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="text-4xl">✉️</div>
          <h1 className="text-2xl font-bold">check your email</h1>
          <p className="text-[var(--muted)] text-sm">
            we sent a confirmation link to <strong>{email}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === "signin" ? "welcome back" : "create account"}
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            {mode === "signin"
              ? "sign in to track your WPM over time"
              : "join to start tracking your daily passages"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-[var(--muted)]" htmlFor="email">
              email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm outline-none focus:border-[var(--accent)] placeholder-[var(--muted)]"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[var(--muted)]" htmlFor="password">
              password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm outline-none focus:border-[var(--accent)] placeholder-[var(--muted)]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-white font-semibold rounded-lg px-4 py-3 text-sm hover:bg-[var(--accent-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : mode === "signin" ? "sign in" : "create account"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--muted)]">
          {mode === "signin" ? "don't have an account? " : "already have an account? "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
            className="text-[var(--foreground)] underline underline-offset-2"
          >
            {mode === "signin" ? "sign up" : "sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
