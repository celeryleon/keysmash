import { getTodayDate } from "@/lib/date";
import { pickPassageIndexForDate } from "@/lib/passages";
import { createClient } from "@/lib/supabase/server";
import DuelPageClient from "./DuelPageClient";

// `getTodayDate()` reads the wall clock — must render per-request, not at
// build time, or today's excluded index would freeze at deploy.
export const dynamic = "force-dynamic";

export default async function DuelPage() {
  const todayIndex = pickPassageIndexForDate(getTodayDate());

  // Auth state drives the post-investment gate: signed-in challengers POST
  // immediately on completion, anonymous ones get the "sign in to send" CTA.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <DuelPageClient excludedIndex={todayIndex} isSignedIn={!!user} />;
}
