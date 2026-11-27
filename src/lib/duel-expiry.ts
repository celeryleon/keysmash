import type { Duel } from "@/lib/supabase/types";

// Soft-expire for pending duels. See PRD §3.2: a duel the challengee has not
// played expires 7 days after creation (`expires_at`, set by the database).
// Rows are never deleted; expiry only changes how the duel renders and
// whether it can still be played. A completed duel never expires.
export function isDuelExpired(
  duel: Pick<Duel, "challengee_wpm" | "expires_at">,
  now: Date = new Date()
): boolean {
  if (duel.challengee_wpm != null) return false;
  const expiresAt = Date.parse(duel.expires_at);
  // An unparseable timestamp is treated as not expired rather than locking
  // the duel.
  if (Number.isNaN(expiresAt)) return false;
  return now.getTime() >= expiresAt;
}
