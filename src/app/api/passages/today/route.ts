import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";
import { pickPassageForDate } from "@/lib/passages";

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export async function GET() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = getTodayDate();

  // Check if today's passage already exists
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

  const { data: passages, error } = await supabase
    .from("passages")
    .select("*")
    .eq("date", today)
    .eq("type", "classic");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ passages });
}
