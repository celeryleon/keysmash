import { describe, it, expect } from "vitest";
import { formatPlayer, summarizeDuel } from "./duel-share";

describe("formatPlayer", () => {
  it("prefixes a known username with @", () => {
    expect(formatPlayer("leon")).toBe("@leon");
  });

  it("renders an unknown player as ?", () => {
    expect(formatPlayer(null)).toBe("?");
    expect(formatPlayer("")).toBe("?");
  });
});

describe("summarizeDuel", () => {
  it("names the challenger when they win, winner's score first", () => {
    expect(
      summarizeDuel({
        challengerWpm: 84,
        challengeeWpm: 72,
        challengerUsername: "leon",
        challengeeUsername: "sam",
      })
    ).toEqual({
      challengerLabel: "@leon",
      challengeeLabel: "@sam",
      winner: "challenger",
      verdict: "@leon wins, 84-72",
    });
  });

  it("names the challengee when they win, winner's score first", () => {
    const s = summarizeDuel({
      challengerWpm: 72,
      challengeeWpm: 90,
      challengerUsername: "leon",
      challengeeUsername: "sam",
    });
    expect(s.winner).toBe("challengee");
    expect(s.verdict).toBe("@sam wins, 90-72");
  });

  it("reports a tie", () => {
    const s = summarizeDuel({
      challengerWpm: 75,
      challengeeWpm: 75,
      challengerUsername: "leon",
      challengeeUsername: "sam",
    });
    expect(s.winner).toBe("tie");
    expect(s.verdict).toBe("tie, 75-75");
  });

  it("renders an anonymous opponent as ? and still names a known winner", () => {
    const s = summarizeDuel({
      challengerWpm: 84,
      challengeeWpm: 72,
      challengerUsername: "leon",
      challengeeUsername: null,
    });
    expect(s.challengeeLabel).toBe("?");
    expect(s.verdict).toBe("@leon wins, 84-72");
  });

  it("does not print '? wins' for an anonymous winner", () => {
    expect(
      summarizeDuel({
        challengerWpm: 60,
        challengeeWpm: 72,
        challengerUsername: "leon",
        challengeeUsername: null,
      }).verdict
    ).toBe("opponent wins, 72-60");
    expect(
      summarizeDuel({
        challengerWpm: 80,
        challengeeWpm: 72,
        challengerUsername: null,
        challengeeUsername: null,
      }).verdict
    ).toBe("challenger wins, 80-72");
  });
});
