import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: attempts } = await supabase
    .from("attempts")
    .select(`*, passages (id, date, type, title, author)`)
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  type AttemptWithPassage = NonNullable<typeof attempts>[number] & {
    passages: { id: string; date: string; type: "ai" | "classic"; title: string | null; author: string | null };
  };

  const rows = (attempts ?? []) as AttemptWithPassage[];

  // Stats
  const totalAttempts = rows.length;
  const avgWpm =
    totalAttempts > 0
      ? Math.round(rows.reduce((s, a) => s + a.wpm, 0) / totalAttempts)
      : 0;
  const bestWpm = totalAttempts > 0 ? Math.max(...rows.map((a) => a.wpm)) : 0;

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-12 gap-10">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">history</h1>
        <p className="text-[var(--muted)] text-sm">
          {profile?.username ?? user.email}
        </p>
      </div>

      {/* Stats strip */}
      {totalAttempts > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)]">
            <p className="text-[var(--accent)] font-black text-3xl tabular-nums">{bestWpm}</p>
            <p className="text-[var(--muted)] text-xs mt-1">best WPM</p>
          </div>
          <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)]">
            <p className="text-white font-bold text-3xl tabular-nums">{avgWpm}</p>
            <p className="text-[var(--muted)] text-xs mt-1">avg WPM</p>
          </div>
          <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)]">
            <p className="text-white font-bold text-3xl tabular-nums">{totalAttempts}</p>
            <p className="text-[var(--muted)] text-xs mt-1">passages typed</p>
          </div>
        </div>
      )}

      {/* Attempt list */}
      {rows.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-[var(--muted)]">no attempts yet</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-[var(--accent)] text-white font-semibold rounded-full text-sm hover:bg-[var(--accent-dark)]"
          >
            type today's passages
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((attempt) => {
            const p = attempt.passages;
            const date = new Date(p.date + "T00:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <Link
                key={attempt.id}
                href={`/results/${attempt.id}`}
                className="flex items-center gap-4 bg-[var(--surface)] rounded-xl px-5 py-4 border border-[var(--border)] hover:border-[var(--accent)]/40 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--accent)] text-xs font-mono">
                      {p.type === "ai" ? "✦" : "◆"}
                    </span>
                    <span className="text-xs text-[var(--muted)]">{date}</span>
                  </div>
                  <p className="text-sm font-medium truncate mt-0.5">
                    {p.title ?? "Untitled"}
                    {p.author && (
                      <span className="text-[var(--muted)] font-normal"> — {p.author}</span>
                    )}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[var(--accent)] font-bold tabular-nums">
                    {attempt.wpm} <span className="text-[var(--muted)] font-normal text-xs">wpm</span>
                  </p>
                  <p className="text-xs text-[var(--muted)]">{attempt.accuracy}% acc</p>
                </div>

                <span className="text-[var(--muted)] group-hover:text-[var(--foreground)] text-sm">
                  →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
