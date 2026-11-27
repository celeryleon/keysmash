import type { Duel } from "@/lib/supabase/types";

// Head-to-head grouping for the /history Duels tab. See PRD §3.6.
//
// Only completed duels where both sides are known signed-in users count
// (PRD §3.2). Pending duels and duels against an anonymous challengee have no
// opponent to group under, so they are skipped.

export type DuelOutcome = "win" | "loss" | "tie";

export interface HeadToHeadDuel {
  id: string;
  passageIndex: number;
  createdAt: string;
  myWpm: number;
  opponentWpm: number;
  outcome: DuelOutcome;
}

export interface HeadToHeadGroup {
  opponentId: string;
  wins: number;
  losses: number;
  ties: number;
  // Newest first.
  duels: HeadToHeadDuel[];
}

// Returns one group per opponent, ordered by most recent duel first.
export function groupDuelsByOpponent(
  duels: Duel[],
  userId: string
): HeadToHeadGroup[] {
  const groups = new Map<string, HeadToHeadGroup>();

  for (const duel of duels) {
    if (duel.challengee_wpm == null) continue;
    if (duel.challenger_user_id == null || duel.challengee_user_id == null) {
      continue;
    }
    // A self-duel is rejected by the API, but be defensive.
    if (duel.challenger_user_id === duel.challengee_user_id) continue;

    const iAmChallenger = duel.challenger_user_id === userId;
    const iAmChallengee = duel.challengee_user_id === userId;
    if (!iAmChallenger && !iAmChallengee) continue;

    const opponentId = iAmChallenger
      ? duel.challengee_user_id
      : duel.challenger_user_id;
    const myWpm = iAmChallenger ? duel.challenger_wpm : duel.challengee_wpm;
    const opponentWpm = iAmChallenger
      ? duel.challengee_wpm
      : duel.challenger_wpm;
    const outcome: DuelOutcome =
      myWpm > opponentWpm ? "win" : myWpm < opponentWpm ? "loss" : "tie";

    let group = groups.get(opponentId);
    if (!group) {
      group = { opponentId, wins: 0, losses: 0, ties: 0, duels: [] };
      groups.set(opponentId, group);
    }

    if (outcome === "win") group.wins += 1;
    else if (outcome === "loss") group.losses += 1;
    else group.ties += 1;

    group.duels.push({
      id: duel.id,
      passageIndex: duel.passage_index,
      createdAt: duel.created_at,
      myWpm,
      opponentWpm,
      outcome,
    });
  }

  const result = [...groups.values()];
  for (const group of result) {
    group.duels.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  result.sort((a, b) =>
    b.duels[0].createdAt.localeCompare(a.duels[0].createdAt)
  );
  return result;
}
