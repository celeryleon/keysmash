import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { ALL_PASSAGES } from "@/lib/passages";
import { validateScore } from "@/lib/score-validation";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("duels")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ duel: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();
  const { wpm, time_elapsed } = body;

  if (wpm == null || time_elapsed == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Anonymous challengees are allowed (PRD §3.2). Auth is only consulted to
  // attribute the score when a session happens to be present.
  const { data: { user } } = await supabase.auth.getUser();

  // Look up the duel's passage to validate the score against actual content length.
  const { data: duel, error: duelError } = await supabase
    .from("duels")
    .select("passage_index, challengee_wpm, challenger_user_id")
    .eq("id", id)
    .single();

  if (duelError || !duel) {
    return NextResponse.json({ error: "Duel not found" }, { status: 404 });
  }

  if (duel.challengee_wpm != null) {
    return NextResponse.json({ error: "Duel already complete" }, { status: 409 });
  }

  // A signed-in user typing their own challenge link would erroneously become
  // their own challengee. Reject that — they should open the link in a private
  // window or share it instead.
  if (user && duel.challenger_user_id === user.id) {
    return NextResponse.json(
      { error: "Cannot challenge yourself" },
      { status: 409 }
    );
  }

  const passage = ALL_PASSAGES[duel.passage_index];
  if (!passage) {
    return NextResponse.json({ error: "Invalid duel" }, { status: 500 });
  }

  const validation = validateScore({
    wpm,
    timeElapsed: time_elapsed,
    charsTyped: passage.content.length,
  });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.reason }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("duels")
    .update({
      challengee_wpm: wpm,
      challengee_user_id: user?.id ?? null,
    })
    .eq("id", id)
    .is("challengee_wpm", null)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Could not update duel" }, { status: 500 });
  }

  return NextResponse.json({ duel: data });
}
