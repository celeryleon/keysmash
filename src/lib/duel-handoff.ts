// Anonymous → signed-in duel handoff (PRD §3.3).
//
// SessionStorage carries the score across the auth round-trip. Two keys —
// one for the challenger's pending duel, one for the challengee's "I just
// typed this" claim hint. SSR-safe: every accessor no-ops when window is
// undefined.

export const PENDING_DUEL_KEY = "keysmash:pendingDuel";
export const PENDING_CLAIM_KEY = "keysmash:pendingDuelClaim";

export interface PendingDuel {
  passage_index: number;
  wpm: number;
  time_elapsed: number;
}

export interface PendingClaim {
  duelId: string;
}

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function isPendingDuel(value: unknown): value is PendingDuel {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.passage_index === "number" &&
    typeof v.wpm === "number" &&
    typeof v.time_elapsed === "number"
  );
}

function isPendingClaim(value: unknown): value is PendingClaim {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.duelId === "string" && v.duelId.length > 0;
}

export function readPendingDuel(): PendingDuel | null {
  const storage = safeStorage();
  if (!storage) return null;
  const raw = storage.getItem(PENDING_DUEL_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isPendingDuel(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writePendingDuel(value: PendingDuel): void {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(PENDING_DUEL_KEY, JSON.stringify(value));
}

export function clearPendingDuel(): void {
  const storage = safeStorage();
  if (!storage) return;
  storage.removeItem(PENDING_DUEL_KEY);
}

export function readPendingClaim(): PendingClaim | null {
  const storage = safeStorage();
  if (!storage) return null;
  const raw = storage.getItem(PENDING_CLAIM_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isPendingClaim(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writePendingClaim(value: PendingClaim): void {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(PENDING_CLAIM_KEY, JSON.stringify(value));
}

export function clearPendingClaim(): void {
  const storage = safeStorage();
  if (!storage) return;
  storage.removeItem(PENDING_CLAIM_KEY);
}
