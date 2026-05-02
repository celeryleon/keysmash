// Soft streak tracking. See PRD §3.4.
//
// Streak is keyed off the *passage's* date (not row insert time), so a
// session that begins at 11:59 ET and finishes past midnight still counts
// for the day the passage belongs to.

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastAttemptDate: string | null; // YYYY-MM-DD, ET
}

export function computeNextStreak(
  passageDate: string,
  state: StreakState
): StreakState {
  if (state.lastAttemptDate === null) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(state.longestStreak, 1),
      lastAttemptDate: passageDate,
    };
  }

  if (passageDate === state.lastAttemptDate) {
    // Already counted (the unique constraint should make this unreachable,
    // but be defensive).
    return state;
  }

  const dayDiff = daysBetween(state.lastAttemptDate, passageDate);

  if (dayDiff < 0) {
    // Backfill of a strictly-earlier passage. Don't disturb the streak.
    return state;
  }

  if (dayDiff === 1) {
    const nextCurrent = state.currentStreak + 1;
    return {
      currentStreak: nextCurrent,
      longestStreak: Math.max(state.longestStreak, nextCurrent),
      lastAttemptDate: passageDate,
    };
  }

  // Gap of two or more days — streak breaks, today restarts at 1.
  return {
    currentStreak: 1,
    longestStreak: Math.max(state.longestStreak, 1),
    lastAttemptDate: passageDate,
  };
}

// Pure day-difference between two YYYY-MM-DD strings. Anchors both to UTC
// midnight to avoid DST drift; the result is the integer day delta.
function daysBetween(from: string, to: string): number {
  const fromMs = Date.parse(`${from}T00:00:00Z`);
  const toMs = Date.parse(`${to}T00:00:00Z`);
  return Math.round((toMs - fromMs) / 86_400_000);
}
