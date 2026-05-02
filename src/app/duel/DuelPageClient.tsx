"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ALL_PASSAGES } from "@/lib/passages";
import { pickRandomDuelIndex } from "@/lib/duel";
import TypingArea from "@/components/TypingArea";
import { createClient } from "@/lib/supabase/client";
import {
  readPendingDuel,
  clearPendingDuel,
  writePendingDuel,
  type PendingDuel,
} from "@/lib/duel-handoff";

type Phase = "typing" | "auth-gate" | "creating" | "waiting" | "complete";

interface DuelPageClientProps {
  excludedIndex: number;
  isSignedIn: boolean;
}

export default function DuelPageClient({
  excludedIndex,
  isSignedIn,
}: DuelPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResume = searchParams.get("resume") === "1";

  // Lazily seed: if we're resuming a pending duel, reuse its passage_index
  // verbatim so the WPM the user typed matches the row we create. Otherwise
  // pick a fresh random one.
  const [passageIndex] = useState(() => {
    if (typeof window === "undefined") return pickRandomDuelIndex(excludedIndex);
    const pending = readPendingDuel();
    if (pending) return pending.passage_index;
    return pickRandomDuelIndex(excludedIndex);
  });
  const passage = ALL_PASSAGES[passageIndex];

  const [phase, setPhase] = useState<Phase>("typing");
  const [myWpm, setMyWpm] = useState<number | null>(null);
  const [duelId, setDuelId] = useState<string | null>(null);
  const [theirWpm, setTheirWpm] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDuel = useCallback(
    async (payload: PendingDuel) => {
      setPhase("creating");
      setMyWpm(payload.wpm);

      const res = await fetch("/api/duels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage_index: payload.passage_index,
          wpm: payload.wpm,
          time_elapsed: payload.time_elapsed,
        }),
      });

      if (!res.ok) {
        // 401 here means session was lost between gate and resume. Re-stash
        // and bounce back through /auth so the user can recover.
        if (res.status === 401) {
          writePendingDuel(payload);
          router.push("/auth?next=/duel?resume=1");
          return;
        }
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to create duel");
        setPhase("auth-gate");
        return;
      }

      const data = await res.json();
      clearPendingDuel();
      setDuelId(data.id);
      setPhase("waiting");
    },
    [router]
  );

  // On resume from /auth, drain the stash and POST automatically. We use a
  // ref to ensure this only fires once even if the effect re-runs.
  const drainedRef = useRef(false);
  useEffect(() => {
    if (drainedRef.current) return;
    if (!isResume) return;
    const pending = readPendingDuel();
    if (!pending) {
      // Nothing to resume — strip the param and let the user start fresh.
      router.replace("/duel");
      return;
    }
    drainedRef.current = true;

    if (!isSignedIn) {
      // Session didn't survive the round-trip — keep the stash, send back to /auth.
      router.push("/auth?next=/duel?resume=1");
      return;
    }

    // Defer the createDuel call (which sets state) out of the effect's sync
    // path so React doesn't see a setState inside the effect body.
    queueMicrotask(() => {
      void createDuel(pending);
    });
  }, [isResume, isSignedIn, createDuel, router]);

  // Realtime subscription for the opponent's score, exactly as before.
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
    async (wpm: number, _accuracy: number, timeElapsed: number) => {
      const payload: PendingDuel = {
        passage_index: passageIndex,
        wpm,
        time_elapsed: timeElapsed,
      };

      if (!isSignedIn) {
        // Post-investment gate: stash and show "sign in to send" (PRD §3.2).
        writePendingDuel(payload);
        setMyWpm(wpm);
        setPhase("auth-gate");
        return;
      }

      await createDuel(payload);
    },
    [passageIndex, isSignedIn, createDuel]
  );

  const goToAuth = () => {
    router.push("/auth?next=/duel?resume=1");
  };

  const cancelGate = () => {
    clearPendingDuel();
    setMyWpm(null);
    setError(null);
    setPhase("typing");
  };

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
          onComplete={handleComplete}
        />
      </div>
    );
  }

  if (phase === "auth-gate") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full px-6 py-12 gap-8">
        <div className="text-center space-y-2">
          <p className="text-xs text-[var(--muted)] uppercase tracking-widest">
            nice run
          </p>
          <div className="text-7xl font-black tabular-nums text-[var(--accent)]">
            {myWpm}
          </div>
          <p className="text-sm text-[var(--muted)]">
            wpm · sign in to send the challenge
          </p>
        </div>

        <div className="w-full space-y-3">
          <button
            onClick={goToAuth}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm hover:bg-[var(--accent-dark)] transition-colors"
          >
            sign in to send
          </button>
          <button
            onClick={cancelGate}
            className="w-full text-center text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            cancel and start over
          </button>
        </div>

        {error && (
          <p className="text-center text-[var(--error)] text-sm">{error}</p>
        )}

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

  if (phase === "creating") {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <p className="text-sm text-[var(--muted)]">creating duel...</p>
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

