import { getTodayDate } from "@/lib/date";
import { pickPassageIndexForDate } from "@/lib/passages";
import { createClient } from "@/lib/supabase/server";
import { canRematch } from "@/lib/duel-rematch";
import DuelPageClient, { type RematchOpponent } from "./DuelPageClient";

// `getTodayDate()` reads the wall clock — must render per-request, not at
// build time, or today's excluded index would freeze at deploy.
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DuelPage({ searchParams }: Props) {
  const todayIndex = pickPassageIndexForDate(getTodayDate());

  // Auth state drives the post-investment gate: signed-in challengers POST
  // immediately on completion, anonymous ones get the "sign in to send" CTA.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // `?rematch=<userId>` comes from the /history Duels tab (PRD §3.6). It is
  // honored only for a signed-in user who has already completed a duel with
  // that opponent; anything else falls back to a normal open duel.
  const rematchId = (await searchParams).rematch;
  let rematchOpponent: RematchOpponent | null = null;
  if (user && (await canRematch(supabase, user.id, rematchId))) {
    const { data: opponent } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("id", rematchId as string)
      .maybeSingle();
    rematchOpponent = {
      id: rematchId as string,
      username: opponent?.username ?? null,
    };
  }

  return (
    <DuelPageClient
      excludedIndex={todayIndex}
      isSignedIn={!!user}
      rematchOpponent={rematchOpponent}
    />
  );
}
