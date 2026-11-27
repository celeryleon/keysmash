import { describe, it, expect } from "vitest";
import type { Duel } from "./supabase/types";
import { groupDuelsByOpponent } from "./duel-history";

const ME = "user-me";
const ALEX = "user-alex";
const SAM = "user-sam";

let seq = 0;
function duel(overrides: Partial<Duel>): Duel {
  seq += 1;
  return {
    id: `duel-${seq}`,
    passage_index: 0,
    challenger_wpm: 80,
    challengee_wpm: 70,
    created_at: "2026-05-01T12:00:00Z",
    expires_at: "2026-05-08T12:00:00Z",
    challenger_user_id: ME,
    intended_opponent_user_id: null,
    challengee_user_id: ALEX,
    ...overrides,
  };
}

describe("groupDuelsByOpponent", () => {
  it("returns no groups for no duels", () => {
    expect(groupDuelsByOpponent([], ME)).toEqual([]);
  });

  it("tallies wins, losses, and ties from the viewer's side", () => {
    const [group, ...rest] = groupDuelsByOpponent(
      [
        duel({ challenger_wpm: 90, challengee_wpm: 70 }),
        duel({ challenger_wpm: 60, challengee_wpm: 70 }),
        duel({ challenger_wpm: 75, challengee_wpm: 75 }),
      ],
      ME
    );
    expect(rest).toEqual([]);
    expect(group.opponentId).toBe(ALEX);
    expect(group).toMatchObject({ wins: 1, losses: 1, ties: 1 });
  });

  it("flips perspective when the viewer is the challengee", () => {
    const [group] = groupDuelsByOpponent(
      [
        duel({
          challenger_user_id: ALEX,
          challengee_user_id: ME,
          challenger_wpm: 90,
          challengee_wpm: 70,
        }),
      ],
      ME
    );
    expect(group.opponentId).toBe(ALEX);
    expect(group).toMatchObject({ wins: 0, losses: 1, ties: 0 });
    expect(group.duels[0]).toMatchObject({
      myWpm: 70,
      opponentWpm: 90,
      outcome: "loss",
    });
  });

  it("merges duels in both directions under the same opponent", () => {
    const groups = groupDuelsByOpponent(
      [
        duel({ challenger_wpm: 90, challengee_wpm: 70 }),
        duel({
          challenger_user_id: ALEX,
          challengee_user_id: ME,
          challenger_wpm: 60,
          challengee_wpm: 85,
        }),
      ],
      ME
    );
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ wins: 2, losses: 0, ties: 0 });
  });

  it("skips pending duels", () => {
    expect(
      groupDuelsByOpponent([duel({ challengee_wpm: null })], ME)
    ).toEqual([]);
  });

  it("skips duels with an anonymous side", () => {
    expect(
      groupDuelsByOpponent(
        [
          duel({ challengee_user_id: null }),
          duel({ challenger_user_id: null, challengee_user_id: ME }),
        ],
        ME
      )
    ).toEqual([]);
  });

  it("skips duels the viewer is not part of", () => {
    expect(
      groupDuelsByOpponent(
        [duel({ challenger_user_id: ALEX, challengee_user_id: SAM })],
        ME
      )
    ).toEqual([]);
  });

  it("skips self-duels", () => {
    expect(
      groupDuelsByOpponent([duel({ challengee_user_id: ME })], ME)
    ).toEqual([]);
  });

  it("orders groups and their duels newest first", () => {
    const groups = groupDuelsByOpponent(
      [
        duel({ id: "alex-old", created_at: "2026-05-01T00:00:00Z" }),
        duel({
          id: "sam-mid",
          challengee_user_id: SAM,
          created_at: "2026-05-03T00:00:00Z",
        }),
        duel({ id: "alex-new", created_at: "2026-05-05T00:00:00Z" }),
      ],
      ME
    );
    expect(groups.map((g) => g.opponentId)).toEqual([ALEX, SAM]);
    expect(groups[0].duels.map((d) => d.id)).toEqual(["alex-new", "alex-old"]);
  });
});
