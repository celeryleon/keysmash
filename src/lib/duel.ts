import { ALL_PASSAGES } from "@/lib/passages";

// Picks a uniform random passage index excluding `excludedIndex`. Used by
// /duel to skip today's daily passage so duels can't spoil the daily ritual
// or be used as a practice loophole. See PRD §3.2.
export function pickRandomDuelIndex(
  excludedIndex: number,
  rng: () => number = Math.random
): number {
  const n = ALL_PASSAGES.length;
  if (n < 2) throw new Error("Need at least 2 passages to exclude one");
  const i = Math.floor(rng() * (n - 1));
  return i < excludedIndex ? i : i + 1;
}
