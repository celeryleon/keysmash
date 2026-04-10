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

export default function PassageCard({ passage, attempt, isLoggedIn }: PassageCardProps) {
  const { label, emoji } = LABELS[passage.type] ?? { label: passage.type, emoji: "·" };
  const completed = !!attempt;

  return (
    <div
      className={`
        rounded-2xl border p-6 space-y-4
        ${completed
          ? "border-[var(--border)] bg-[var(--surface)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/40"
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[var(--accent)] text-xs font-mono">{emoji}</span>
            <span className="text-xs text-[var(--muted)] uppercase tracking-widest">
              {label}
            </span>
          </div>
          {passage.title && (
            <p className="font-semibold text-sm">
              {passage.title}
              {passage.author && (
                <span className="text-[var(--muted)] font-normal"> — {passage.author}</span>
              )}
            </p>
          )}
        </div>

        {completed && (
          <div className="shrink-0 text-right">
            <div className="text-2xl font-bold text-[var(--accent)] tabular-nums">
              {attempt.wpm}
            </div>
            <div className="text-xs text-[var(--muted)]">wpm</div>
          </div>
        )}
      </div>

      {/* Source info */}
      {passage.source && (
        <p className="text-xs text-[var(--muted)]">{passage.source}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        {completed ? (
          <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
            <span>{attempt.accuracy}% accuracy</span>
            <span>{attempt.time_elapsed}s</span>
          </div>
        ) : (
          <span className="text-xs text-[var(--muted)]">
            ~{Math.ceil(passage.content.split(" ").length / 5 / 0.7)}s at avg pace
          </span>
        )}

        {completed ? (
          <Link
            href={`/results/${attempt.id}`}
            className="text-xs text-[var(--accent)] hover:underline underline-offset-2"
          >
            view results →
          </Link>
        ) : isLoggedIn ? (
          <Link
            href={`/type/${passage.id}`}
            className="px-4 py-1.5 bg-[var(--accent)] text-white text-xs font-semibold rounded-full hover:bg-[var(--accent-dark)]"
          >
            type this
          </Link>
        ) : (
          <Link
            href={`/type/${passage.id}`}
            className="px-4 py-1.5 bg-[var(--surface-2)] text-[var(--foreground)] text-xs font-semibold rounded-full hover:bg-[var(--border)] border border-[var(--border)]"
          >
            try it
          </Link>
        )}
      </div>
    </div>
  );
}
