import { describe, it, expect } from "vitest";
import { computeNextStreak } from "./streak";

describe("computeNextStreak", () => {
  describe("first-ever attempt", () => {
    it("starts streak at 1 and bumps longest from 0", () => {
      const next = computeNextStreak("2026-05-02", {
        currentStreak: 0,
        longestStreak: 0,
        lastAttemptDate: null,
      });
      expect(next).toEqual({
        currentStreak: 1,
        longestStreak: 1,
        lastAttemptDate: "2026-05-02",
      });
    });
  });

  describe("consecutive day", () => {
    it("increments and bumps longest when streak overtakes it", () => {
      const next = computeNextStreak("2026-05-03", {
        currentStreak: 5,
        longestStreak: 5,
        lastAttemptDate: "2026-05-02",
      });
      expect(next).toEqual({
        currentStreak: 6,
        longestStreak: 6,
        lastAttemptDate: "2026-05-03",
      });
    });

    it("does not lower longest when current is below it", () => {
      const next = computeNextStreak("2026-05-03", {
        currentStreak: 2,
        longestStreak: 50,
        lastAttemptDate: "2026-05-02",
      });
      expect(next).toEqual({
        currentStreak: 3,
        longestStreak: 50,
        lastAttemptDate: "2026-05-03",
      });
    });

    it("crosses month boundary", () => {
      const next = computeNextStreak("2026-06-01", {
        currentStreak: 30,
        longestStreak: 30,
        lastAttemptDate: "2026-05-31",
      });
      expect(next.currentStreak).toBe(31);
    });

    it("crosses year boundary", () => {
      const next = computeNextStreak("2027-01-01", {
        currentStreak: 100,
        longestStreak: 100,
        lastAttemptDate: "2026-12-31",
      });
      expect(next.currentStreak).toBe(101);
    });
  });

  describe("gap (two or more days missed)", () => {
    it("resets current to 1, preserves longest", () => {
      const next = computeNextStreak("2026-05-10", {
        currentStreak: 7,
        longestStreak: 7,
        lastAttemptDate: "2026-05-02",
      });
      expect(next).toEqual({
        currentStreak: 1,
        longestStreak: 7,
        lastAttemptDate: "2026-05-10",
      });
    });

    it("two-day gap also resets", () => {
      const next = computeNextStreak("2026-05-04", {
        currentStreak: 5,
        longestStreak: 5,
        lastAttemptDate: "2026-05-02",
      });
      expect(next.currentStreak).toBe(1);
    });
  });

  describe("same-day duplicate", () => {
    it("returns state unchanged", () => {
      const state = {
        currentStreak: 3,
        longestStreak: 10,
        lastAttemptDate: "2026-05-02",
      };
      expect(computeNextStreak("2026-05-02", state)).toBe(state);
    });
  });

  describe("backfill (earlier passage)", () => {
    it("does not touch the streak", () => {
      const state = {
        currentStreak: 5,
        longestStreak: 10,
        lastAttemptDate: "2026-05-10",
      };
      expect(computeNextStreak("2026-05-01", state)).toBe(state);
    });
  });
});
