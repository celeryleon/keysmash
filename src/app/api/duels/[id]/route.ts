import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
  const { wpm } = body;

  if (wpm == null) {
    return NextResponse.json({ error: "Missing wpm" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("duels")
    .update({ challengee_wpm: wpm })
    .eq("id", id)
    .is("challengee_wpm", null)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Could not update duel" }, { status: 500 });
  }

  return NextResponse.json({ duel: data });
}
