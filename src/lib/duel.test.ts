import { describe, it, expect } from "vitest";
import { ALL_PASSAGES } from "./passages";
import { pickRandomDuelIndex } from "./duel";

describe("pickRandomDuelIndex", () => {
  const n = ALL_PASSAGES.length;

  // Drives the rng to deterministically produce internal index `i`. Uses
  // the midpoint of i's slot to avoid floating-point rounding at boundaries.
  function rngFor(i: number) {
    return () => (i + 0.5) / (n - 1);
  }

  it("never returns the excluded index", () => {
    const excluded = 5;
    for (let i = 0; i < n - 1; i++) {
      expect(pickRandomDuelIndex(excluded, rngFor(i))).not.toBe(excluded);
    }
  });

  it("covers all n-1 non-excluded indices when rng sweeps every internal slot", () => {
    const excluded = 7;
    const seen = new Set<number>();
    for (let i = 0; i < n - 1; i++) {
      seen.add(pickRandomDuelIndex(excluded, rngFor(i)));
    }
    expect(seen.size).toBe(n - 1);
    expect(seen.has(excluded)).toBe(false);
    for (const r of seen) {
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(n);
    }
  });

  it("works when excluded is index 0", () => {
    for (let i = 0; i < n - 1; i++) {
      const result = pickRandomDuelIndex(0, rngFor(i));
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(n);
    }
  });

  it("works when excluded is the last index", () => {
    const excluded = n - 1;
    for (let i = 0; i < n - 1; i++) {
      const result = pickRandomDuelIndex(excluded, rngFor(i));
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(excluded);
    }
  });

  it("each non-excluded index is reachable exactly once when sweeping internal slots", () => {
    const excluded = 10;
    const counts = new Map<number, number>();
    for (let i = 0; i < n - 1; i++) {
      const result = pickRandomDuelIndex(excluded, rngFor(i));
      counts.set(result, (counts.get(result) ?? 0) + 1);
    }
    expect(counts.has(excluded)).toBe(false);
    expect(counts.size).toBe(n - 1);
    for (const v of counts.values()) expect(v).toBe(1);
  });
});
