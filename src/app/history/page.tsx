import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ALL_PASSAGES } from "@/lib/passages";
import { groupDuelsByOpponent } from "@/lib/duel-history";

type Tab = "daily" | "duels";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Unified "your stuff" page. See PRD §3.6: Daily (default) and Duels tabs on
// the one /history route; there is no separate /duels route.
export default async function HistoryPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const tab: Tab = (await searchParams).tab === "duels" ? "duels" : "daily";

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, current_streak, longest_streak")
    .eq("id", user.id)
    .single();

  const tabs: { id: Tab; label: string; href: string }[] = [
    { id: "daily", label: "daily", href: "/history" },
    { id: "duels", label: "duels", href: "/history?tab=duels" },
  ];

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-12 gap-10">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">history</h1>
        <p className="text-[var(--muted)] text-sm">
          {profile?.username ?? user.email}
        </p>
      </div>

      {/* Tabs */}
      <nav
        aria-label="history sections"
        className="flex gap-6 border-b border-[var(--border)]"
      >
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            aria-current={t.id === tab ? "page" : undefined}
            className={`-mb-px pb-3 text-sm border-b-2 ${
              t.id === tab
                ? "border-[var(--accent)] text-[var(--foreground)] font-semibold"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "daily" ? (
        <DailyTab
          userId={user.id}
          currentStreak={profile?.current_streak ?? 0}
          longestStreak={profile?.longest_streak ?? 0}
        />
      ) : (
        <DuelsTab userId={user.id} />
      )}
    </div>
  );
}

async function DailyTab({
  userId,
  currentStreak,
  longestStreak,
}: {
  userId: string;
  currentStreak: number;
  longestStreak: number;
}) {
  const supabase = await createClient();

  const { data: attempts } = await supabase
    .from("attempts")
    .select(`*, passages (id, date, type, title, author)`)
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  type AttemptWithPassage = NonNullable<typeof attempts>[number] & {
    passages: { id: string; date: string; type: "ai" | "classic"; title: string | null; author: string | null };
  };

  const rows = (attempts ?? []) as AttemptWithPassage[];

  // Stats
  const totalAttempts = rows.length;
  const avgWpm =
    totalAttempts > 0
      ? Math.round(rows.reduce((s, a) => s + a.wpm, 0) / totalAttempts)
      : 0;
  const bestWpm = totalAttempts > 0 ? Math.max(...rows.map((a) => a.wpm)) : 0;

  if (rows.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-[var(--muted)]">no attempts yet</p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-[var(--accent)] text-white font-semibold rounded-full text-sm hover:bg-[var(--accent-dark)]"
        >
          type today's passages
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)]">
          <p className="text-[var(--accent)] font-black text-3xl tabular-nums">{bestWpm}</p>
          <p className="text-[var(--muted)] text-xs mt-1">best WPM</p>
        </div>
        <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)]">
          <p className="text-[var(--accent)] font-bold text-3xl tabular-nums">{avgWpm}</p>
          <p className="text-[var(--muted)] text-xs mt-1">avg WPM</p>
        </div>
        <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)]">
          <p className="text-[var(--accent)] font-bold text-3xl tabular-nums">{totalAttempts}</p>
          <p className="text-[var(--muted)] text-xs mt-1">passages typed</p>
        </div>
        <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)]">
          <p className="text-[var(--accent)] font-bold text-3xl tabular-nums">
            {currentStreak}
          </p>
          <p className="text-[var(--muted)] text-xs mt-1">
            day streak
            {longestStreak ? (
              <span className="block text-[10px] opacity-70">
                longest: {longestStreak}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      {/* Attempt list */}
      <div className="space-y-3">
        {rows.map((attempt) => {
          const p = attempt.passages;
          const date = formatDate(p.date + "T00:00:00");

          return (
            <Link
              key={attempt.id}
              href={`/results/${attempt.id}`}
              className="flex items-center gap-4 bg-[var(--surface)] rounded-xl px-5 py-4 border border-[var(--border)] hover:border-[var(--accent)]/40 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--accent)] text-xs font-mono">
                    {p.type === "ai" ? "✦" : "◆"}
                  </span>
                  <span className="text-xs text-[var(--muted)]">{date}</span>
                </div>
                <p className="text-sm font-medium truncate mt-0.5">{p.title ?? "Untitled"}</p>
                {p.author && (
                  <p className="text-xs text-[var(--muted)] truncate">{p.author}</p>
                )}
              </div>

              <div className="text-right shrink-0">
                <p className="text-[var(--accent)] font-bold tabular-nums">
                  {attempt.wpm} <span className="text-[var(--muted)] font-normal text-xs">wpm</span>
                </p>
                <p className="text-xs text-[var(--muted)]">{attempt.accuracy}% acc</p>
              </div>

              <span className="text-[var(--muted)] group-hover:text-[var(--foreground)] text-sm">
                →
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

async function DuelsTab({ userId }: { userId: string }) {
  const supabase = await createClient();

  // userId comes from the verified session, so it is safe to interpolate
  // into the PostgREST filter string.
  const { data: duels } = await supabase
    .from("duels")
    .select("*")
    .or(`challenger_user_id.eq.${userId},challengee_user_id.eq.${userId}`)
    .not("challengee_wpm", "is", null)
    .order("created_at", { ascending: false });

  const groups = groupDuelsByOpponent(duels ?? [], userId);

  // Incoming rematches: pull-based, so this list is the only place the
  // intended opponent finds out about them (PRD §4.2).
  const { data: incomingRows } = await supabase
    .from("duels")
    .select("*")
    .eq("intended_opponent_user_id", userId)
    .is("challengee_wpm", null)
    .order("created_at", { ascending: false });
  const incoming = (incomingRows ?? []).filter(
    (d) => d.challenger_user_id != null && d.challenger_user_id !== userId
  );

  const usernames = new Map<string, string | null>();
  const profileIds = [
    ...new Set([
      ...groups.map((g) => g.opponentId),
      ...incoming.map((d) => d.challenger_user_id as string),
    ]),
  ];
  if (profileIds.length > 0) {
    const { data: opponents } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", profileIds);
    for (const o of opponents ?? []) usernames.set(o.id, o.username);
  }
  const displayName = (id: string) => {
    const username = usernames.get(id);
    return username ? `@${username}` : "unknown player";
  };

  if (groups.length === 0 && incoming.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-[var(--muted)]">no duels yet</p>
        <p className="text-xs text-[var(--muted)]">
          duels show up here once both players are signed in
        </p>
        <Link
          href="/duel"
          className="inline-block px-5 py-2.5 bg-[var(--accent)] text-white font-semibold rounded-full text-sm hover:bg-[var(--accent-dark)]"
        >
          start a duel
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {incoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs text-[var(--muted)] uppercase tracking-widest">
            challenges waiting on you
          </h2>
          {incoming.map((duel) => (
            <div
              key={duel.id}
              className="flex items-center gap-4 bg-[var(--surface)] rounded-xl px-5 py-4 border border-[var(--accent)]/40"
            >
              <div className="flex-1 min-w-0">
                <span className="text-xs text-[var(--muted)]">
                  {formatDate(duel.created_at)}
                </span>
                <p className="text-sm font-medium truncate mt-0.5">
                  {displayName(duel.challenger_user_id as string)} wants a
                  rematch
                </p>
                <p className="text-xs text-[var(--muted)]">
                  beat {duel.challenger_wpm} wpm
                </p>
              </div>
              <Link
                href={`/duel/${duel.id}`}
                className="shrink-0 px-4 py-1.5 bg-[var(--accent)] text-white text-xs font-semibold rounded-full hover:bg-[var(--accent-dark)]"
              >
                accept
              </Link>
            </div>
          ))}
        </section>
      )}

      {groups.map((group) => {
        return (
          <section
            key={group.opponentId}
            className="bg-[var(--surface)] rounded-xl border border-[var(--border)]"
          >
            <div className="flex items-center gap-4 px-5 py-4">
              <h2 className="flex-1 min-w-0 text-sm font-semibold truncate">
                vs {displayName(group.opponentId)}
              </h2>
              <p className="shrink-0 text-sm tabular-nums">
                <span className="text-[var(--accent)] font-bold">
                  {group.wins}-{group.losses}
                </span>
                {group.ties > 0 && (
                  <span className="text-[var(--muted)] text-xs">
                    {" "}
                    · {group.ties} {group.ties === 1 ? "tie" : "ties"}
                  </span>
                )}
              </p>
              <Link
                href={`/duel?rematch=${group.opponentId}`}
                className="shrink-0 px-4 py-1.5 border border-[var(--border-2)] text-xs font-semibold rounded-full hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                rematch
              </Link>
            </div>

            <ul className="border-t border-[var(--border)] divide-y divide-[var(--border)]">
              {group.duels.map((duel) => {
                const passage = ALL_PASSAGES[duel.passageIndex];

                return (
                  <li key={duel.id}>
                    <Link
                      href={`/duel/${duel.id}`}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--surface-2)] group"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-[var(--muted)]">
                          {formatDate(duel.createdAt)}
                        </span>
                        <p className="text-sm font-medium truncate mt-0.5">
                          {passage?.title ?? "Untitled"}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold tabular-nums">
                          <span
                            className={
                              duel.outcome === "win" ? "text-[var(--accent)]" : ""
                            }
                          >
                            {duel.myWpm}
                          </span>
                          <span className="text-[var(--muted)] font-normal">
                            {" "}
                            –{" "}
                          </span>
                          <span
                            className={
                              duel.outcome === "loss" ? "text-[var(--accent)]" : ""
                            }
                          >
                            {duel.opponentWpm}
                          </span>
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {duel.outcome === "win"
                            ? "won"
                            : duel.outcome === "loss"
                              ? "lost"
                              : "tied"}
                        </p>
                      </div>

                      <span className="text-[var(--muted)] group-hover:text-[var(--foreground)] text-sm">
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
