"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const isTypingPage = pathname?.startsWith("/type/");

  return (
    <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
      <Link
        href="/"
        className="text-xl font-bold tracking-tight text-[var(--accent)] hover:opacity-80"
      >
        keysmash
      </Link>

      {!isTypingPage && (
        <nav className="flex items-center gap-6 text-sm">
          {user ? (
            <>
              <Link
                href="/history"
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                history
              </Link>
              <button
                onClick={signOut}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
