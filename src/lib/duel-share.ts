// Text for the duel share image and SMS. See PRD §3.5: side-by-side WPMs,
// both usernames when known, and a verdict such as "@leon wins, 84-72".
// An unknown side renders as "?" so sharing is never gated on identity.

export interface DuelShareInput {
  challengerWpm: number;
  challengeeWpm: number;
  challengerUsername: string | null;
  challengeeUsername: string | null;
}

export interface DuelShareSummary {
  challengerLabel: string;
  challengeeLabel: string;
  winner: "challenger" | "challengee" | "tie";
  // e.g. "@leon wins, 84-72", "@sam wins, 90-84", "tie, 75-75"
  verdict: string;
}

export function formatPlayer(username: string | null): string {
  return username ? `@${username}` : "?";
}

export function summarizeDuel(input: DuelShareInput): DuelShareSummary {
  const challengerLabel = formatPlayer(input.challengerUsername);
  const challengeeLabel = formatPlayer(input.challengeeUsername);
  const { challengerWpm: a, challengeeWpm: b } = input;

  if (a === b) {
    return {
      challengerLabel,
      challengeeLabel,
      winner: "tie",
      verdict: `tie, ${a}-${b}`,
    };
  }

  const challengerWon = a > b;
  const winnerLabel = challengerWon ? challengerLabel : challengeeLabel;
  // The winner's score always comes first. An anonymous winner reads as
  // "opponent wins" rather than "? wins".
  const name =
    winnerLabel === "?"
      ? challengerWon
        ? "challenger"
        : "opponent"
      : winnerLabel;
  const high = Math.max(a, b);
  const low = Math.min(a, b);

  return {
    challengerLabel,
    challengeeLabel,
    winner: challengerWon ? "challenger" : "challengee",
    verdict: `${name} wins, ${high}-${low}`,
  };
}
