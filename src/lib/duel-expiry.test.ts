import { describe, it, expect } from "vitest";
import { isDuelExpired } from "./duel-expiry";

const EXPIRES_AT = "2026-05-08T12:00:00+00:00";

describe("isDuelExpired", () => {
  it("is false for a pending duel before its expiry", () => {
    expect(
      isDuelExpired(
        { challengee_wpm: null, expires_at: EXPIRES_AT },
        new Date("2026-05-08T11:59:59Z")
      )
    ).toBe(false);
  });

  it("is true for a pending duel at and after its expiry", () => {
    const duel = { challengee_wpm: null, expires_at: EXPIRES_AT };
    expect(isDuelExpired(duel, new Date("2026-05-08T12:00:00Z"))).toBe(true);
    expect(isDuelExpired(duel, new Date("2026-11-27T00:00:00Z"))).toBe(true);
  });

  it("is never true for a completed duel", () => {
    expect(
      isDuelExpired(
        { challengee_wpm: 72, expires_at: EXPIRES_AT },
        new Date("2026-11-27T00:00:00Z")
      )
    ).toBe(false);
  });

  it("treats a zero-wpm completion as completed", () => {
    expect(
      isDuelExpired(
        { challengee_wpm: 0, expires_at: EXPIRES_AT },
        new Date("2026-11-27T00:00:00Z")
      )
    ).toBe(false);
  });

  it("is false when expires_at cannot be parsed", () => {
    expect(
      isDuelExpired(
        { challengee_wpm: null, expires_at: "not a date" },
        new Date("2026-11-27T00:00:00Z")
      )
    ).toBe(false);
  });
});
