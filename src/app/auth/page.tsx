"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

function isEmail(value: string) {
  return value.includes("@");
}

// Restrict ?next= to same-origin paths so the redirect can't be turned into
// an open-redirect gadget. Must start with "/" but not "//" (protocol-relative).
function safeNext(value: string | null): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const [identifier, setIdentifier] = useState(""); // email or username (sign in)
  const [email, setEmail] = useState("");            // email only (sign up)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    setError(null);
    setUsernameError(null);
  }

  function validateUsername(value: string) {
    if (!value) return;
    if (!USERNAME_RE.test(value)) {
      setUsernameError("3–20 chars: letters, numbers, underscores only");
    } else {
      setUsernameError(null);
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signup") {
      if (!USERNAME_RE.test(username)) {
        setUsernameError("3–20 chars: letters, numbers, underscores only");
        setLoading(false);
        return;
      }

      const checkRes = await fetch("/api/auth/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!checkRes.ok) {
        const data = await checkRes.json();
        setError(data.error);
        setLoading(false);
        return;
      }

      // The confirmation email link bounces through /auth/callback so the
      // session is established server-side before landing on `next`.
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (next !== "/") callbackUrl.searchParams.set("next", next);

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: callbackUrl.toString(),
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setCheckEmail(true);
      }
    } else {
      // Resolve username → email if needed
      let resolvedEmail = identifier;

      if (!isEmail(identifier)) {
        const res = await fetch("/api/auth/resolve-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: identifier }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error);
          setLoading(false);
          return;
        }
        resolvedEmail = data.email;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push(next);
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
          {mode === "signin" ? (
            <div className="space-y-2">
              <label className="text-sm text-[var(--muted)]" htmlFor="identifier">
                email or username
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm outline-none focus:border-[var(--accent)] placeholder-[var(--muted)]"
                placeholder="you@example.com or yourname"
              />
            </div>
          ) : (
            <>
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

              <div className="space-y-2">
                <label className="text-sm text-[var(--muted)]" htmlFor="username">
                  username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase());
                    setUsernameError(null);
                  }}
                  onBlur={() => validateUsername(username)}
                  required
                  autoComplete="username"
                  className={`w-full bg-[var(--surface)] border rounded-lg px-4 py-3 text-sm outline-none focus:border-[var(--accent)] placeholder-[var(--muted)] ${
                    usernameError ? "border-[var(--error)]" : "border-[var(--border)]"
                  }`}
                  placeholder="yourname"
                />
                {usernameError && (
                  <p className="text-[var(--error)] text-xs">{usernameError}</p>
                )}
              </div>
            </>
          )}

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
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm outline-none focus:border-[var(--accent)] placeholder-[var(--muted)]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[var(--error)] text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-white font-semibold rounded-lg px-4 py-3 text-sm hover:bg-[var(--accent-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : mode === "signin" ? "sign in" : "create account"}
          </button>

          {mode === "signin" && (
            <p className="text-center text-sm text-[var(--muted)]">
              <Link
                href="/auth/forgot"
                className="text-[var(--foreground)] underline underline-offset-2"
              >
                forgot password?
              </Link>
            </p>
          )}
        </form>

        <p className="text-center text-sm text-[var(--muted)]">
          {mode === "signin" ? "don't have an account? " : "already have an account? "}
          <button
            onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
            className="text-[var(--foreground)] underline underline-offset-2"
          >
            {mode === "signin" ? "sign up" : "sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
