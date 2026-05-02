// Lightweight server-side score sanity checks. See PRD §4.3.
//
// Defends against curl/script-kiddie cheating. Not server-authoritative
// scoring — keystrokes aren't sent to the server. If a public leaderboard
// ever ships, revisit.

const MAX_WPM = 250; // Real-world record is ~216
const MAX_ACCURACY = 100;
const MIN_TIME_SECONDS = 3;

// WPM math = (chars / 5 chars-per-word) / (time / 60 seconds-per-minute).
// Allow a small tolerance to account for client-side rounding (Math.round
// in TypingArea) and the fact that "chars typed" doesn't perfectly equal
// "passage length" in edge cases like the trailing-no-space final word.
const WPM_MATH_TOLERANCE = 5;

export interface ScoreInput {
  wpm: number;
  timeElapsed: number;
  charsTyped: number;
  accuracy?: number;
}

export type ScoreValidation =
  | { ok: true }
  | { ok: false; reason: string };

export function validateScore(input: ScoreInput): ScoreValidation {
  const { wpm, timeElapsed, charsTyped, accuracy } = input;

  if (!Number.isFinite(wpm) || wpm < 0) {
    return { ok: false, reason: "wpm must be a non-negative finite number" };
  }
  if (wpm > MAX_WPM) {
    return { ok: false, reason: `wpm exceeds cap of ${MAX_WPM}` };
  }

  if (!Number.isFinite(timeElapsed) || timeElapsed < MIN_TIME_SECONDS) {
    return { ok: false, reason: `time_elapsed must be at least ${MIN_TIME_SECONDS}s` };
  }

  if (!Number.isFinite(charsTyped) || charsTyped <= 0) {
    return { ok: false, reason: "charsTyped must be positive" };
  }

  if (accuracy != null) {
    if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > MAX_ACCURACY) {
      return { ok: false, reason: `accuracy must be in [0, ${MAX_ACCURACY}]` };
    }
  }

  const expectedWpm = charsTyped / 5 / (timeElapsed / 60);
  if (Math.abs(wpm - expectedWpm) > WPM_MATH_TOLERANCE) {
    return {
      ok: false,
      reason: `wpm (${wpm}) inconsistent with charsTyped (${charsTyped}) and time (${timeElapsed}s); expected ~${expectedWpm.toFixed(1)}`,
    };
  }

  return { ok: true };
}
