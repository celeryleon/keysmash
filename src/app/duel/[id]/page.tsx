import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ALL_PASSAGES } from "@/lib/passages";
import { isDuelExpired } from "@/lib/duel-expiry";
import Link from "next/link";
import DuelChallengeClient from "./DuelChallengeClient";
import ClaimChallengeeButton from "./ClaimChallengeeButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DuelPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: duel } = await supabase
    .from("duels")
    .select("*")
    .eq("id", id)
    .single();

  if (!duel) notFound();

  const passage = ALL_PASSAGES[duel.passage_index];
  if (!passage) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  // The optional claim CTA only renders when the challengee is anonymous
  // (challengee_user_id IS NULL) and the viewer isn't the challenger
  // themselves. The client further gates on a sessionStorage marker so a
  // random link visitor never sees it.
  const canShowClaim =
    duel.challengee_wpm != null &&
    duel.challengee_user_id == null &&
    duel.challenger_user_id !== user?.id;

  // Both players done — show comparison
  if (duel.challengee_wpm !== null) {
    const challengerWon = duel.challenger_wpm > duel.challengee_wpm;
    const diff = Math.abs(duel.challenger_wpm - duel.challengee_wpm);

    return (
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full px-6 py-12 gap-8">
        <div className="text-center space-y-2">
          <p className="text-xs text-[var(--muted)] uppercase tracking-widest">
            duel results
          </p>
          <h1 className="text-3xl font-bold">
            {challengerWon ? "challenger wins" : "challenger defeated"}
          </h1>
          <p className="text-sm text-[var(--muted)]">{diff} wpm difference</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-[var(--surface)] rounded-2xl p-5 text-center border border-[var(--border)]">
            <p
              className={`font-black text-4xl tabular-nums ${
                challengerWon
                  ? "text-[var(--accent)]"
                  : "text-[var(--foreground)]"
              }`}
            >
              {duel.challenger_wpm}
            </p>
            <p className="text-[var(--muted)] text-xs mt-1">challenger</p>
          </div>
          <div className="bg-[var(--surface)] rounded-2xl p-5 text-center border border-[var(--border)]">
            <p
              className={`font-black text-4xl tabular-nums ${
                !challengerWon
                  ? "text-[var(--accent)]"
                  : "text-[var(--foreground)]"
              }`}
            >
              {duel.challengee_wpm}
            </p>
            <p className="text-[var(--muted)] text-xs mt-1">opponent</p>
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

        {canShowClaim && (
          <Suspense>
            <ClaimChallengeeButton duelId={id} isSignedIn={!!user} />
          </Suspense>
        )}

        <Link
          href="/duel"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          start your own duel →
        </Link>
      </div>
    );
  }

  // Soft-expired (PRD §3.2): the challengee never played within 7 days. The
  // row is kept; the page just stops offering the passage.
  if (isDuelExpired(duel)) {
    const viewerIsChallenger =
      user != null && duel.challenger_user_id === user.id;
    const canRematch = duel.challenger_user_id != null && !viewerIsChallenger;

    let challengerName: string | null = null;
    if (duel.challenger_user_id) {
      const { data: challenger } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", duel.challenger_user_id)
        .maybeSingle();
      challengerName = challenger?.username ?? null;
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full px-6 py-12 gap-8">
        <div className="text-center space-y-2">
          <p className="text-xs text-[var(--muted)] uppercase tracking-widest">
            duel expired
          </p>
          <h1 className="text-3xl font-bold">this challenge ran out</h1>
          <p className="text-sm text-[var(--muted)]">
            {viewerIsChallenger
              ? "nobody took it within 7 days"
              : "challenges stay open for 7 days"}
          </p>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl p-5 text-center border border-[var(--border)] w-full">
          <p className="font-black text-4xl tabular-nums text-[var(--foreground)]">
            {duel.challenger_wpm}
          </p>
          <p className="text-[var(--muted)] text-xs mt-1">
            {viewerIsChallenger
              ? "your wpm"
              : challengerName
                ? `@${challengerName}'s wpm`
                : "challenger's wpm"}
          </p>
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

        {canRematch ? (
          <div className="w-full space-y-3 text-center">
            <Link
              href={`/duel?rematchOf=${id}`}
              className="w-full flex items-center justify-center px-5 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm hover:bg-[var(--accent-dark)] transition-colors"
            >
              rematch?
            </Link>
            <p className="text-xs text-[var(--muted)]">
              type a new passage and send it back
              {challengerName ? ` to @${challengerName}` : ""}
            </p>
          </div>
        ) : (
          <Link
            href="/duel"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            start a new duel →
          </Link>
        )}
      </div>
    );
  }

  // Challengee hasn't gone yet
  return (
    <DuelChallengeClient
      duelId={id}
      passage={passage}
      challengerWpm={duel.challenger_wpm}
    />
  );
}
