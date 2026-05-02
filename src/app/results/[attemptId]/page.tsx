import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import { getTodayDate } from "@/lib/date";

interface Props {
  params: Promise<{ attemptId: string }>;
}

export default async function ResultsPage({ params }: Props) {
  const { attemptId } = await params;
  const supabase = await createClient();

  const { data: attempt, error } = await supabase
    .from("attempts")
    .select(`*, passages (*)`)
    .eq("id", attemptId)
    .single();

  if (error || !attempt) notFound();

  const passage = (attempt as { passages: { id: string; date: string; type: "ai" | "classic"; title: string | null; author: string | null } }).passages;

  // Only attach the current streak to a share for *today's* attempt — older
  // attempts shouldn't display the user's current streak number, since the
  // streak at the time of that attempt may have been different.
  const isToday = passage.date === getTodayDate();
  let streak: number | undefined;
  if (isToday) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("current_streak")
        .eq("id", user.id)
        .single();
      if (profile && profile.current_streak > 0) streak = profile.current_streak;
    }
  }

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-12 gap-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-[var(--muted)] text-sm">
          {new Date(attempt.completed_at).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">nice work</h1>
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--surface)] rounded-2xl p-5 text-center border border-[var(--border)]">
          <p className="text-[var(--accent)] font-black text-4xl tabular-nums">{attempt.wpm}</p>
          <p className="text-[var(--muted)] text-xs mt-1">WPM</p>
        </div>
        <div className="bg-[var(--surface)] rounded-2xl p-5 text-center border border-[var(--border)]">
          <p className="text-[var(--accent)] font-bold text-4xl tabular-nums">{attempt.accuracy}%</p>
          <p className="text-[var(--muted)] text-xs mt-1">accuracy</p>
        </div>
        <div className="bg-[var(--surface)] rounded-2xl p-5 text-center border border-[var(--border)]">
          <p className="text-[var(--accent)] font-bold text-4xl tabular-nums">{attempt.time_elapsed}s</p>
          <p className="text-[var(--muted)] text-xs mt-1">time</p>
        </div>
      </div>

      {/* Passage info */}
      <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] space-y-1">
        <p className="text-xs text-[var(--muted)] uppercase tracking-widest">
          {passage.type === "ai" ? "AI-generated" : "Classic"}
        </p>
        <p className="font-semibold">
          {passage.title ?? "Untitled"}
          {passage.author && (
            <span className="text-[var(--muted)] font-normal"> — {passage.author}</span>
          )}
        </p>
      </div>

{/* Share */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-center text-[var(--muted)] uppercase tracking-widest">
          brag to your friends
        </h2>
        <ShareButtons
          wpm={attempt.wpm}
          accuracy={Number(attempt.accuracy)}
          timeElapsed={attempt.time_elapsed}
          passageTitle={passage.title}
          passageAuthor={passage.author}
          date={passage.date}
          streak={streak}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4 text-sm">
        <Link href="/" className="text-[var(--muted)] hover:text-[var(--foreground)]">
          ← today's passages
        </Link>
        <Link href="/history" className="text-[var(--muted)] hover:text-[var(--foreground)]">
          history →
        </Link>
      </div>
    </div>
  );
}
