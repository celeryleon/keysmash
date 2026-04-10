import { createClient } from "@/lib/supabase/server";
import PassageCard from "@/components/PassageCard";
import type { Passage, Attempt } from "@/lib/supabase/types";

async function getTodayPassages(): Promise<Passage[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/passages/today`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.passages ?? [];
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const passages = await getTodayPassages();

  let attempts: Attempt[] = [];
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
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const aiPassage = passages.find((p) => p.type === "ai");
  const classicPassage = passages.find((p) => p.type === "classic");
  const aiAttempt = attempts.find((a) => a.passage_id === aiPassage?.id) ?? null;
  const classicAttempt =
    attempts.find((a) => a.passage_id === classicPassage?.id) ?? null;

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-12 gap-12">
      <div className="space-y-1">
        <p className="text-[var(--muted)] text-sm">{today}</p>
        <h1 className="text-3xl font-bold tracking-tight">today's passages</h1>
        <p className="text-[var(--muted)] text-sm">
          two passages · one shot each · how fast are you?
        </p>
      </div>

      <div className="space-y-4">
        {aiPassage && (
          <PassageCard
            passage={aiPassage}
            attempt={aiAttempt}
            isLoggedIn={!!user}
          />
        )}
        {classicPassage && (
          <PassageCard
            passage={classicPassage}
            attempt={classicAttempt}
            isLoggedIn={!!user}
          />
        )}
        {passages.length === 0 && (
          <div className="text-center py-12 text-[var(--muted)]">
            loading today's passages...
          </div>
        )}
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
