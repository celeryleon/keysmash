"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">new password</h1>
          <p className="text-[var(--muted)] text-sm mt-1">choose something you'll remember.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-[var(--muted)]" htmlFor="password">
              new password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm outline-none focus:border-[var(--accent)] placeholder-[var(--muted)]"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-[var(--error)] text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-white font-semibold rounded-lg px-4 py-3 text-sm hover:bg-[var(--accent-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : "update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
