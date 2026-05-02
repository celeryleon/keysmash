import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { ALL_PASSAGES } from "@/lib/passages";
import { validateScore } from "@/lib/score-validation";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Auth gate: anonymous users get a 401 with reason="auth_required" so the
  // client can stash the score in sessionStorage and route through /auth.
  // PRD §3.2: post-investment auth gate, score never enters the DB anonymously.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const body = await request.json();
  const { passage_index, wpm, time_elapsed } = body;

  if (passage_index == null || wpm == null || time_elapsed == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (passage_index < 0 || passage_index >= ALL_PASSAGES.length) {
    return NextResponse.json({ error: "Invalid passage_index" }, { status: 400 });
  }

  const validation = validateScore({
    wpm,
    timeElapsed: time_elapsed,
    charsTyped: ALL_PASSAGES[passage_index].content.length,
  });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.reason }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("duels")
    .insert({
      passage_index,
      challenger_wpm: wpm,
      challenger_user_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
