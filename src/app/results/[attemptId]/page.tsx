import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareCard from "@/components/ShareCard";

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
          <p className="text-white font-bold text-4xl tabular-nums">{attempt.accuracy}%</p>
          <p className="text-[var(--muted)] text-xs mt-1">accuracy</p>
        </div>
        <div className="bg-[var(--surface)] rounded-2xl p-5 text-center border border-[var(--border)]">
          <p className="text-white font-bold text-4xl tabular-nums">{attempt.time_elapsed}s</p>
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

      {/* Share card */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-center text-[var(--muted)] uppercase tracking-widest">
          share your results
        </h2>
        <ShareCard
          wpm={attempt.wpm}
          accuracy={Number(attempt.accuracy)}
          timeElapsed={attempt.time_elapsed}
          passageType={passage.type}
          passageTitle={passage.title}
          passageAuthor={passage.author}
          date={passage.date}
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
