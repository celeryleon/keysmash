import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
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

const FALLBACK_AI_PASSAGES = [
  "Time does not move in straight lines but pools in certain rooms, certain hours, collecting there like light through old glass. We return to those places not to relive them but to remind ourselves they were real, that we were real inside them.",
  "The city asks nothing of you and yet takes everything, trading your solitude for the low hum of strangers. To live among so many people is to practice a quiet faith that all of it matters, each passing face a world complete.",
  "Every tool we build to extend our reach also shortens our memory of reaching. We forget what it felt like to not know, and in forgetting, lose something we cannot name but still sometimes grieve.",
  "To belong somewhere is to have a version of yourself that only that place can unlock. Leave long enough and you find that person waiting on the corner, unchanged, wondering where you went.",
  "Youth is not a time but a permission, a willingness to be wrong in public and keep moving. Experience arrives not as wisdom but as the faint embarrassment of knowing better and choosing it anyway.",
  "Contentment does not announce itself but settles overnight like frost, and in the morning you notice the world looks different, quieter, though nothing has moved.",
  "What we leave unsaid does not disappear but accumulates in the walls of a conversation, changing its shape from the inside. Some silences become load-bearing, and we build our lives around them without knowing.",
];

function getFallbackAIPassage(date: string): string {
  const seed = date.replace(/-/g, "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return FALLBACK_AI_PASSAGES[seed % FALLBACK_AI_PASSAGES.length];
}

async function generateAIPassage(date: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const topics = [
    "the nature of time and memory",
    "urban life and human connection",
    "the relationship between technology and creativity",
    "what it means to belong somewhere",
    "the passage from youth to experience",
    "the tension between ambition and contentment",
    "silence and the things left unsaid",
  ];

  const seed = date.replace(/-/g, "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const topic = topics[seed % topics.length];

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Write a short, beautifully crafted prose passage (3-5 sentences, around 200-260 characters) about: ${topic}.

Requirements:
- No dialogue
- No special characters, em dashes, or curly quotes — use only straight apostrophes and standard punctuation
- Should feel literary but accessible
- Do not include a title or attribution
- Output only the passage text, nothing else`,
      },
    ],
  });

  const text = message.content[0];
  if (text.type !== "text") throw new Error("Unexpected response type");
  return text.text.trim();
}

export async function GET() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = getTodayDate();

  // Check if passages already exist for today
  const { data: existing } = await supabase
    .from("passages")
    .select("*")
    .eq("date", today);

  const hasAI = existing?.some((p) => p.type === "ai");
  const hasClassic = existing?.some((p) => p.type === "classic");

  const toInsert = [];

  if (!hasClassic) {
    const classic = pickClassicForDate(today);
    toInsert.push({ date: today, type: "classic" as const, ...classic });
  }

  if (!hasAI) {
    try {
      const content = await generateAIPassage(today);
      toInsert.push({
        date: today,
        type: "ai" as const,
        content,
        title: "Daily AI Passage",
        author: "Claude",
        source: null,
      });
    } catch (err) {
      console.error("Failed to generate AI passage, using fallback:", err);
      toInsert.push({
        date: today,
        type: "ai" as const,
        content: getFallbackAIPassage(today),
        title: "Daily AI Passage",
        author: "Claude",
        source: null,
      });
    }
  }

  if (toInsert.length > 0) {
    await supabase.from("passages").insert(toInsert);
  }

  // Fetch final passages
  const { data: passages, error } = await supabase
    .from("passages")
    .select("*")
    .eq("date", today)
    .order("type");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ passages });
}
