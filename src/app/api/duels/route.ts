import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { ALL_PASSAGES } from "@/lib/passages";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { passage_index, wpm } = body;

  if (passage_index == null || wpm == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (passage_index < 0 || passage_index >= ALL_PASSAGES.length) {
    return NextResponse.json({ error: "Invalid passage_index" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("duels")
    .insert({ passage_index, challenger_wpm: wpm })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
