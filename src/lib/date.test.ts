import { describe, it, expect } from "vitest";
import { getTodayDate } from "./date";

describe("getTodayDate", () => {
  it("returns YYYY-MM-DD format", () => {
    expect(getTodayDate(new Date("2026-05-02T15:00:00Z"))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  describe("EDT (UTC-4, daylight saving)", () => {
    it("late evening UTC counts as same day in ET", () => {
      // May 2 22:00 EDT = May 3 02:00 UTC
      expect(getTodayDate(new Date("2026-05-03T02:00:00Z"))).toBe("2026-05-02");
    });

    it("midnight ET rollover", () => {
      // May 3 00:00 EDT = May 3 04:00 UTC
      expect(getTodayDate(new Date("2026-05-03T04:00:00Z"))).toBe("2026-05-03");
    });

    it("just before midnight ET", () => {
      // May 2 23:59 EDT = May 3 03:59 UTC
      expect(getTodayDate(new Date("2026-05-03T03:59:00Z"))).toBe("2026-05-02");
    });
  });

  describe("EST (UTC-5, standard time)", () => {
    it("late evening UTC counts as same day in ET", () => {
      // Jan 14 22:00 EST = Jan 15 03:00 UTC
      expect(getTodayDate(new Date("2026-01-15T03:00:00Z"))).toBe("2026-01-14");
    });

    it("midnight ET rollover", () => {
      // Jan 15 00:00 EST = Jan 15 05:00 UTC
      expect(getTodayDate(new Date("2026-01-15T05:00:00Z"))).toBe("2026-01-15");
    });
  });

  it("never returns the UTC date when ET is on the previous day", () => {
    // 11pm PT on May 2 = 06:00 UTC on May 3 = 02:00 EDT on May 3
    // Old UTC implementation would return "2026-05-03"; ET should also return "2026-05-03"
    // because it's already past midnight in ET. This case was NOT broken by UTC.
    expect(getTodayDate(new Date("2026-05-03T06:00:00Z"))).toBe("2026-05-03");
  });

  it("fixes the regression case: late-evening US users", () => {
    // 7pm PT on May 2 = 02:00 UTC on May 3 = 22:00 EDT on May 2
    // Old UTC implementation returned "2026-05-03" (wrong — passage flipped mid-evening).
    // New ET implementation returns "2026-05-02" (correct — still today for US users).
    expect(getTodayDate(new Date("2026-05-03T02:00:00Z"))).toBe("2026-05-02");
  });
});
