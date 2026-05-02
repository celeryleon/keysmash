"use client";

import { useState, useEffect, useCallback } from "react";
import { ALL_PASSAGES } from "@/lib/passages";
import { pickRandomDuelIndex } from "@/lib/duel";
import TypingArea from "@/components/TypingArea";
import { createClient } from "@/lib/supabase/client";

type Phase = "typing" | "waiting" | "complete";

interface DuelPageClientProps {
  excludedIndex: number;
}

export default function DuelPageClient({ excludedIndex }: DuelPageClientProps) {
  const [passageIndex] = useState(() => pickRandomDuelIndex(excludedIndex));
  const passage = ALL_PASSAGES[passageIndex];

  const [phase, setPhase] = useState<Phase>("typing");
  const [myWpm, setMyWpm] = useState<number | null>(null);
  const [theirWpm, setTheirWpm] = useState<number | null>(null);
  const [duelId, setDuelId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!duelId || phase !== "waiting") return;

    const supabase = createClient();
    const channel = supabase
      .channel(`duel-${duelId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "duels",
          filter: `id=eq.${duelId}`,
        },
        (payload: { new: { challengee_wpm: number | null } }) => {
          if (payload.new.challengee_wpm != null) {
            setTheirWpm(payload.new.challengee_wpm);
            setPhase("complete");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [duelId, phase]);

  const handleComplete = useCallback(
    async (wpm: number) => {
      setMyWpm(wpm);
      setCreating(true);

      const res = await fetch("/api/duels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passage_index: passageIndex, wpm }),
      });

      const data = await res.json();
      setDuelId(data.id);
      setCreating(false);
      setPhase("waiting");
    },
    [passageIndex]
  );

  const duelUrl =
    typeof window !== "undefined" && duelId
      ? `${window.location.origin}/duel/${duelId}`
      : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(duelUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (phase === "typing") {
    return (
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-6 py-12 gap-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[var(--accent)] text-xs font-mono">⚔</span>
            <span className="text-xs text-[var(--muted)] uppercase tracking-widest">
              duel mode
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
            {passage.content.split(" ").length} words ·{" "}
            {passage.content.length} characters
          </p>
        </div>

        <TypingArea
          passage={passage.content}
          onComplete={(wpm) => handleComplete(wpm)}
        />

        {creating && (
          <p className="text-center text-sm text-[var(--muted)]">
            creating duel...
          </p>
        )}
      </div>
    );
  }

  if (phase === "waiting") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full px-6 py-12 gap-8">
        <div className="text-center space-y-2">
          <p className="text-xs text-[var(--muted)] uppercase tracking-widest">
            duel created
          </p>
          <div className="text-7xl font-black tabular-nums text-[var(--accent)]">
            {myWpm}
          </div>
          <p className="text-sm text-[var(--muted)]">
            wpm · waiting for your opponent
          </p>
        </div>

        <div className="w-full space-y-3">
          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm hover:bg-[var(--accent-dark)] transition-colors"
          >
            {copied ? "copied!" : "copy challenge link"}
          </button>
          <p className="text-center text-xs text-[var(--muted)] break-all">
            {duelUrl}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          listening for opponent...
        </div>

        <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] w-full space-y-1">
          <p className="text-xs text-[var(--muted)] uppercase tracking-widest">
            the passage
          </p>
          <p className="font-semibold text-sm">{passage.title}</p>
          {passage.author && (
            <p className="text-xs text-[var(--muted)]">{passage.author}</p>
          )}
        </div>
      </div>
    );
  }

  // phase === "complete" — opponent finished, notified via Realtime
  const iWon = (myWpm ?? 0) > (theirWpm ?? 0);
  const diff = Math.abs((myWpm ?? 0) - (theirWpm ?? 0));

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full px-6 py-12 gap-8">
      <div className="text-center space-y-2">
        <p className="text-xs text-[var(--muted)] uppercase tracking-widest">
          duel complete
        </p>
        <h1 className="text-3xl font-bold">{iWon ? "you win" : "you lose"}</h1>
        <p className="text-sm text-[var(--muted)]">
          {iWon ? `${diff} wpm faster` : `${diff} wpm slower`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="bg-[var(--surface)] rounded-2xl p-5 text-center border border-[var(--border)]">
          <p
            className={`font-black text-4xl tabular-nums ${
              iWon ? "text-[var(--accent)]" : "text-[var(--foreground)]"
            }`}
          >
            {myWpm}
          </p>
          <p className="text-[var(--muted)] text-xs mt-1">you</p>
        </div>
        <div className="bg-[var(--surface)] rounded-2xl p-5 text-center border border-[var(--border)]">
          <p
            className={`font-black text-4xl tabular-nums ${
              !iWon ? "text-[var(--accent)]" : "text-[var(--foreground)]"
            }`}
          >
            {theirWpm}
          </p>
          <p className="text-[var(--muted)] text-xs mt-1">them</p>
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] w-full space-y-1">
        <p className="text-xs text-[var(--muted)] uppercase tracking-widest">
          the passage
        </p>
        <p className="font-semibold text-sm">{passage.title}</p>
        {passage.author && (
          <p className="text-xs text-[var(--muted)]">{passage.author}</p>
        )}
      </div>

      <a
        href="/duel"
        className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        challenge someone else →
      </a>
    </div>
  );
}
