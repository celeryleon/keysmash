import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Rematch eligibility. See PRD §3.2 / §4.2: `intended_opponent_user_id` is
// only set when a rematch is created from a previous duel where both sides
// were known signed-in users.

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

// True when `userId` and `opponentId` have at least one completed duel
// against each other, in either direction. `opponentId` is caller-supplied,
// so it is checked as a UUID before being interpolated into the filter.
export async function canRematch(
  supabase: SupabaseClient<Database>,
  userId: string,
  opponentId: unknown
): Promise<boolean> {
  if (!isUuid(opponentId)) return false;
  if (opponentId === userId) return false;

  const { data, error } = await supabase
    .from("duels")
    .select("id")
    .not("challengee_wpm", "is", null)
    .or(
      `and(challenger_user_id.eq.${userId},challengee_user_id.eq.${opponentId}),` +
        `and(challenger_user_id.eq.${opponentId},challengee_user_id.eq.${userId})`
    )
    .limit(1);

  if (error) return false;
  return (data?.length ?? 0) > 0;
}
