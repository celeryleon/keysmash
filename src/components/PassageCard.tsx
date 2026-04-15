import Link from "next/link";
import type { Passage, Attempt } from "@/lib/supabase/types";

interface PassageCardProps {
  passage: Passage;
  attempt: Attempt | null;
  isLoggedIn: boolean;
}

const LABELS: Record<string, { label: string; emoji: string }> = {
  ai: { label: "AI-generated", emoji: "✦" },
  classic: { label: "Classic", emoji: "◆" },
};

export default function PassageCard({ passage, attempt }: PassageCardProps) {
  const { label, emoji } = LABELS[passage.type] ?? { label: passage.type, emoji: "·" };
  const completed = !!attempt;

  return (
    <div
      className={`
        rounded-xl border px-5 py-4
        ${completed
          ? "border-[var(--border)] bg-[var(--surface)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/40"
        }
      `}
    >
      {/* Top row: type label left, date right */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent)] text-xs font-mono">{emoji}</span>
          <span className="text-xs text-[var(--muted)] uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-xs text-[var(--muted)]">
          {new Date(passage.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </span>
      </div>

      <div className="border-t border-[var(--border)] mt-2" />

      {/* Bottom row: title/author left, action right */}
      <div className="flex items-end justify-between gap-4 mt-2">
        <div className="min-w-0">
          {passage.title && (
            <p className="font-semibold text-sm">{passage.title}</p>
          )}
          {passage.author && (
            <p className="text-xs text-[var(--muted)]">{passage.author}</p>
          )}
          {completed && (
            <div className="flex items-center gap-3 text-xs text-[var(--muted)] pt-0.5">
              <span className="text-[var(--accent)] font-semibold tabular-nums">{attempt.wpm} wpm</span>
              <span>{attempt.accuracy}% accuracy</span>
              <span>{attempt.time_elapsed}s</span>
            </div>
          )}
        </div>

        {completed ? (
          <Link
            href={`/results/${attempt.id}`}
            className="shrink-0 text-xs text-[var(--accent)] hover:underline underline-offset-2"
          >
            view results →
          </Link>
        ) : (
          <Link
            href={`/type/${passage.id}`}
            className="shrink-0 px-4 py-1.5 bg-[var(--accent)] text-white text-xs font-semibold rounded-full hover:bg-[var(--accent-dark)]"
          >
            smash!
          </Link>
        )}
      </div>
    </div>
  );
}
