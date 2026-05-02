import { createClient } from "@supabase/supabase-js";
import type { Database, Passage } from "@/lib/supabase/types";
import { pickPassageForDate } from "@/lib/passages";
import { getTodayDate } from "@/lib/date";

export async function getTodayPassages(): Promise<Passage[]> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = getTodayDate();

  const { data: existing } = await supabase
    .from("passages")
    .select("*")
    .eq("date", today)
    .eq("type", "classic");

  if (!existing || existing.length === 0) {
    const classic = pickPassageForDate(today);
    await supabase.from("passages").insert({ date: today, type: "classic" as const, ...classic });
  } else if (existing[0] && !existing[0].title) {
    const classic = pickPassageForDate(today);
    await supabase
      .from("passages")
      .update({ title: classic.title, author: classic.author, source: classic.source })
      .eq("id", existing[0].id);
  }

  const { data: passages } = await supabase
    .from("passages")
    .select("*")
    .eq("date", today)
    .eq("type", "classic");

  return passages ?? [];
}
