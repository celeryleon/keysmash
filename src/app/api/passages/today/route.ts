import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

// Classic passages — add your curated set here
const CLASSIC_PASSAGES = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    source: "Chapter 1",
    content:
      "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. Whenever you feel like criticizing anyone, he told me, just remember that all the people in this world haven't had the advantages that you've had.",
  },
  {
    title: "1984",
    author: "George Orwell",
    source: "Part One",
    content:
      "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.",
  },
  {
    title: "Moby Dick",
    author: "Herman Melville",
    source: "Chapter 1",
    content:
      "Call me Ishmael. Some years ago, never mind how long precisely, having little money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    source: "Chapter 1",
    content:
      "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.",
  },
  {
    title: "A Tale of Two Cities",
    author: "Charles Dickens",
    source: "Book the First",
    content:
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.",
  },
];

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function pickClassicForDate(date: string) {
  // Deterministic pick based on date so everyone gets the same passage
  const seed = date.replace(/-/g, "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CLASSIC_PASSAGES[seed % CLASSIC_PASSAGES.length];
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
    const classic = pickClassicForDate(today);
    await supabase.from("passages").insert({ date: today, type: "classic" as const, ...classic });
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
