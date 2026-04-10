// AI passage generation — not yet wired up.
// Re-integrate into today/route.ts when ready.

import Anthropic from "@anthropic-ai/sdk";

const FALLBACK_AI_PASSAGES = [
  "Time does not move in straight lines but pools in certain rooms, certain hours, collecting there like light through old glass. We return to those places not to relive them but to remind ourselves they were real, that we were real inside them.",
  "The city asks nothing of you and yet takes everything, trading your solitude for the low hum of strangers. To live among so many people is to practice a quiet faith that all of it matters, each passing face a world complete.",
  "Every tool we build to extend our reach also shortens our memory of reaching. We forget what it felt like to not know, and in forgetting, lose something we cannot name but still sometimes grieve.",
  "To belong somewhere is to have a version of yourself that only that place can unlock. Leave long enough and you find that person waiting on the corner, unchanged, wondering where you went.",
  "Youth is not a time but a permission, a willingness to be wrong in public and keep moving. Experience arrives not as wisdom but as the faint embarrassment of knowing better and choosing it anyway.",
  "Contentment does not announce itself but settles overnight like frost, and in the morning you notice the world looks different, quieter, though nothing has moved.",
  "What we leave unsaid does not disappear but accumulates in the walls of a conversation, changing its shape from the inside. Some silences become load-bearing, and we build our lives around them without knowing.",
];

const TOPICS = [
  "the nature of time and memory",
  "urban life and human connection",
  "the relationship between technology and creativity",
  "what it means to belong somewhere",
  "the passage from youth to experience",
  "the tension between ambition and contentment",
  "silence and the things left unsaid",
];

function dateSeed(date: string): number {
  return date.replace(/-/g, "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export function getFallbackAIPassage(date: string): string {
  return FALLBACK_AI_PASSAGES[dateSeed(date) % FALLBACK_AI_PASSAGES.length];
}

export async function generateAIPassage(date: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const topic = TOPICS[dateSeed(date) % TOPICS.length];

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
