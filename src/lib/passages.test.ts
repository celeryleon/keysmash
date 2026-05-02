import { describe, it, expect } from "vitest";
import { ALL_PASSAGES, pickPassageForDate, pickPassageIndexForDate } from "./passages";

describe("pickPassageIndexForDate", () => {
  it("is deterministic for the same date", () => {
    expect(pickPassageIndexForDate("2026-05-02")).toBe(pickPassageIndexForDate("2026-05-02"));
  });

  it("returns an integer in [0, ALL_PASSAGES.length)", () => {
    const dates = ["2024-01-01", "2025-06-15", "2026-05-02", "2026-12-31"];
    for (const d of dates) {
      const i = pickPassageIndexForDate(d);
      expect(Number.isInteger(i)).toBe(true);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(ALL_PASSAGES.length);
    }
  });

  it("differs across days within a typical week", () => {
    const week = [
      "2026-05-02",
      "2026-05-03",
      "2026-05-04",
      "2026-05-05",
      "2026-05-06",
      "2026-05-07",
      "2026-05-08",
    ].map(pickPassageIndexForDate);
    const unique = new Set(week);
    // Not all 7 days need to be unique, but at least 4 should be.
    expect(unique.size).toBeGreaterThanOrEqual(4);
  });
});

describe("pickPassageForDate", () => {
  it("returns the entry at pickPassageIndexForDate's index", () => {
    const date = "2026-05-02";
    expect(pickPassageForDate(date)).toBe(ALL_PASSAGES[pickPassageIndexForDate(date)]);
  });

  it("returns a passage with content", () => {
    const p = pickPassageForDate("2026-05-02");
    expect(typeof p.content).toBe("string");
    expect(p.content.length).toBeGreaterThan(0);
  });
});
