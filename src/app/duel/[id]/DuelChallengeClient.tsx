"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import TypingArea from "@/components/TypingArea";
import type { PassageEntry } from "@/lib/passages";

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
    async (wpm: number) => {
      setSaving(true);
      await fetch(`/api/duels/${duelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wpm }),
      });
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
        onComplete={(wpm) => handleComplete(wpm)}
      />

      {saving && (
        <p className="text-center text-sm text-[var(--muted)]">
          saving results...
        </p>
      )}
    </div>
  );
}
