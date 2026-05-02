"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import TypingArea from "@/components/TypingArea";
import type { PassageEntry } from "@/lib/passages";
import { writePendingClaim } from "@/lib/duel-handoff";

interface Props {
  duelId: string;
  passage: PassageEntry;
  challengerWpm: number;
}

export default function DuelChallengeClient({
  duelId,
  passage,
  challengerWpm,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleComplete = useCallback(
    async (wpm: number, _accuracy: number, timeElapsed: number) => {
      setSaving(true);
      const res = await fetch(`/api/duels/${duelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wpm, time_elapsed: timeElapsed }),
      });
      // Mark this duel as "I just typed it" so the result page can offer the
      // optional claim CTA without trusting any random viewer (PRD §3.2).
      // Only set the marker when the PATCH succeeded *and* the typer is
      // anonymous — a signed-in challengee already had their user_id attached
      // by the server, so there's nothing to claim.
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const challengeeUserId = data?.duel?.challengee_user_id ?? null;
        if (challengeeUserId === null) {
          writePendingClaim({ duelId });
        }
      }
      router.refresh();
    },
    [duelId, router]
  );

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-6 py-12 gap-10">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent)] text-xs font-mono">⚔</span>
          <span className="text-xs text-[var(--muted)] uppercase tracking-widest">
            you were challenged
          </span>
        </div>
        <h1 className="text-2xl font-bold">
          {passage.title}
          {passage.author && (
            <span className="text-[var(--muted)] font-normal text-xl">
              {" "}— {passage.author}
            </span>
          )}
        </h1>
        <p className="text-xs text-[var(--muted)]">
          {passage.content.split(" ").length} words · beat{" "}
          <span className="text-[var(--accent)] font-semibold">
            {challengerWpm} wpm
          </span>
        </p>
      </div>

      <TypingArea
        passage={passage.content}
        onComplete={handleComplete}
      />

      {saving && (
        <p className="text-center text-sm text-[var(--muted)]">
          saving results...
        </p>
      )}
    </div>
  );
}
