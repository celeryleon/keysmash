import { getTodayDate } from "@/lib/date";
import { pickPassageIndexForDate } from "@/lib/passages";
import DuelPageClient from "./DuelPageClient";

// `getTodayDate()` reads the wall clock — must render per-request, not at
// build time, or today's excluded index would freeze at deploy.
export const dynamic = "force-dynamic";

export default function DuelPage() {
  const todayIndex = pickPassageIndexForDate(getTodayDate());
  return <DuelPageClient excludedIndex={todayIndex} />;
}
