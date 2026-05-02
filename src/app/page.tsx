import { createClient } from "@/lib/supabase/server";
import PassageCard from "@/components/PassageCard";
import type { Attempt } from "@/lib/supabase/types";
import { getTodayPassages } from "@/lib/passages-today";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const passages = await getTodayPassages();

  let attempts: Attempt[] = [];
  let currentStreak = 0;
  if (user) {
    const passageIds = passages.map((p) => p.id);
    if (passageIds.length > 0) {
      const { data } = await supabase
        .from("attempts")
        .select("*")
        .eq("user_id", user.id)
        .in("passage_id", passageIds);
      attempts = data ?? [];
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("current_streak")
      .eq("id", user.id)
      .single();
    currentStreak = profile?.current_streak ?? 0;
  }

  const classicPassage = passages.find((p) => p.type === "classic");
  const classicAttempt =
    attempts.find((a) => a.passage_id === classicPassage?.id) ?? null;

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-12 gap-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">keysmash</h1>
        <p className="text-[var(--muted)] text-sm">
          one passage · one shot · how fast are you?
        </p>
        {currentStreak > 0 && (
          <p className="text-[var(--accent)] text-xs font-mono pt-2">
            {currentStreak}-day streak
          </p>
        )}
      </div>

      <div className="space-y-4">
        {classicPassage && (
          <PassageCard
            passage={classicPassage}
            attempt={classicAttempt}
            isLoggedIn={!!user}
          />
        )}
        {passages.length === 0 && (
          <div className="text-center py-12 text-[var(--muted)]">
            loading today's passage...
          </div>
        )}

        {/* Duel card */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 hover:border-[var(--accent)]/40 transition-colors">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent)] text-xs font-mono">⚔</span>
              <span className="text-xs text-[var(--muted)] uppercase tracking-widest">duel</span>
            </div>
            <span className="text-xs text-[var(--muted)]">no account needed</span>
          </div>
          <div className="border-t border-[var(--border)] mt-2" />
          <div className="flex items-end justify-between gap-4 mt-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm">challenge anyone</p>
              <p className="text-xs text-[var(--muted)]">random passage · shareable link · see who's faster</p>
            </div>
            <a
              href="/duel"
              className="shrink-0 px-4 py-1.5 bg-[var(--accent)] text-white text-xs font-semibold rounded-full hover:bg-[var(--accent-dark)] transition-colors"
            >
              duel!
            </a>
          </div>
        </div>
      </div>

      {!user && (
        <p className="text-center text-sm text-[var(--muted)]">
          <a
            href="/auth"
            className="text-[var(--foreground)] underline underline-offset-2"
          >
            sign in
          </a>{" "}
          to save your scores and track progress
        </p>
      )}
    </div>
  );
}
