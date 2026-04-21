"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }

    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="text-4xl">✉️</div>
          <h1 className="text-2xl font-bold">check your email</h1>
          <p className="text-[var(--muted)] text-sm">
            if an account exists for <strong>{email}</strong>, we sent a reset link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">reset password</h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            we'll email you a link to set a new one.
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
              autoComplete="email"
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm outline-none focus:border-[var(--accent)] placeholder-[var(--muted)]"
              placeholder="you@example.com"
            />
          </div>

          {error && <p className="text-[var(--error)] text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-white font-semibold rounded-lg px-4 py-3 text-sm hover:bg-[var(--accent-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : "send reset link"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--muted)]">
          <Link href="/auth" className="text-[var(--foreground)] underline underline-offset-2">
            back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
