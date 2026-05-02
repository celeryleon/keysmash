import { describe, it, expect } from "vitest";
import { validateScore } from "./score-validation";

describe("validateScore", () => {
  // A representative happy-path case: 200-char passage typed in 30s.
  // 200 / 5 / 0.5 = 80 WPM.
  const happy = { wpm: 80, timeElapsed: 30, charsTyped: 200, accuracy: 95 };

  it("accepts a realistic submission", () => {
    expect(validateScore(happy)).toEqual({ ok: true });
  });

  it("accepts without accuracy (duel routes don't track it)", () => {
    expect(validateScore({ wpm: 80, timeElapsed: 30, charsTyped: 200 })).toEqual({ ok: true });
  });

  describe("WPM cap", () => {
    it("rejects WPM above 250", () => {
      const result = validateScore({ wpm: 300, timeElapsed: 30, charsTyped: 750 });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toMatch(/cap/);
    });

    it("accepts WPM at exactly 250", () => {
      // 250 wpm * 5 chars/word * (3 / 60) min = 62.5 chars
      expect(validateScore({ wpm: 250, timeElapsed: 3, charsTyped: 63 }).ok).toBe(true);
    });

    it("rejects negative WPM", () => {
      const result = validateScore({ wpm: -10, timeElapsed: 30, charsTyped: 200 });
      expect(result.ok).toBe(false);
    });

    it("rejects non-finite WPM", () => {
      expect(validateScore({ wpm: Infinity, timeElapsed: 30, charsTyped: 200 }).ok).toBe(false);
      expect(validateScore({ wpm: NaN, timeElapsed: 30, charsTyped: 200 }).ok).toBe(false);
    });
  });

  describe("time floor", () => {
    it("rejects time under 3 seconds", () => {
      const result = validateScore({ wpm: 80, timeElapsed: 1, charsTyped: 200 });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toMatch(/time_elapsed/);
    });

    it("accepts time at exactly 3 seconds", () => {
      // 3 seconds, 20 chars: 20 / 5 / (3/60) = 80 WPM
      expect(validateScore({ wpm: 80, timeElapsed: 3, charsTyped: 20 }).ok).toBe(true);
    });
  });

  describe("accuracy", () => {
    it("rejects accuracy above 100", () => {
      expect(validateScore({ ...happy, accuracy: 101 }).ok).toBe(false);
    });

    it("rejects accuracy below 0", () => {
      expect(validateScore({ ...happy, accuracy: -1 }).ok).toBe(false);
    });

    it("accepts accuracy at 100", () => {
      expect(validateScore({ ...happy, accuracy: 100 }).ok).toBe(true);
    });
  });

  describe("WPM-time-chars math consistency", () => {
    it("rejects when WPM is way higher than charsTyped/time would imply", () => {
      // 60s typing 200 chars = 40 WPM expected; claiming 80 = 40 over tolerance
      const result = validateScore({ wpm: 80, timeElapsed: 60, charsTyped: 200 });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toMatch(/inconsistent/);
    });

    it("rejects when WPM is way lower than charsTyped/time would imply", () => {
      // 30s typing 500 chars = 200 WPM expected; claiming 50 = 150 under tolerance
      const result = validateScore({ wpm: 50, timeElapsed: 30, charsTyped: 500 });
      expect(result.ok).toBe(false);
    });

    it("accepts within tolerance (rounding slack)", () => {
      // Expected = 80.0 exactly; submitted 83 is within tolerance of 5
      expect(validateScore({ wpm: 83, timeElapsed: 30, charsTyped: 200 }).ok).toBe(true);
      // Submitted 77 also within tolerance
      expect(validateScore({ wpm: 77, timeElapsed: 30, charsTyped: 200 }).ok).toBe(true);
    });

    it("rejects just outside tolerance", () => {
      expect(validateScore({ wpm: 86, timeElapsed: 30, charsTyped: 200 }).ok).toBe(false);
    });
  });

  it("rejects zero or negative charsTyped", () => {
    expect(validateScore({ wpm: 0, timeElapsed: 30, charsTyped: 0 }).ok).toBe(false);
    expect(validateScore({ wpm: 0, timeElapsed: 30, charsTyped: -5 }).ok).toBe(false);
  });
});
