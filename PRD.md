# PRD — keysmash

## 1. Product summary

keysmash is a daily typing speed game built around curated literary passages. One passage per day, one attempt, scored on WPM and accuracy. Duels are a social amplifier: a signed-in user generates a shareable link, a friend (signed in or not) types the same passage, and both see a head-to-head result.

The load-bearing pillar is the **daily ritual**. Duels, sharing, and streaks exist to amplify that ritual, not compete with it. Practice mode and public leaderboards are explicitly out of scope.

## 2. Pillar and non-goals

**Pillar:** Daily ritual — one curated passage per day, one shot, no retries.

**Amplifiers (in scope):**
- Duels with rematch capability between friends
- Streak tracking
- Shareable result images (daily and duel variants)
- Personal history of daily attempts and duel records

**Non-goals:**
- Public global leaderboards
- Practice / repeat-typing mode
- Push notifications, email nags, friend lists, @username typeahead, in-app messaging
- Mobile-optimized typing UX (mobile is supported but not first-class)
- Anti-cheat beyond lightweight server-side sanity checks

## 3. Core flows

### 3.1 Daily ritual

- Home page shows today's passage card. Logged-out: "smash!" leads to a preview-mode typing session. Logged-in: attempt is saved on completion.
- One passage per day per user, enforced by a unique constraint on `(user_id, passage_id)`.
- After completing today's passage, the home card shows "view results →" with stats inline. The `/type/[passageId]` route redirects to `/results/[id]` if the user has already attempted.
- Result page offers an Instagram and SMS share.

### 3.2 Duels

- `/duel` picks a random passage from `ALL_PASSAGES`, **excluding today's daily**, and renders the typing UI.
- Anyone (signed in or not) can type the duel passage. After completion, a post-investment auth gate appears: "sign in to send" replaces the "copy challenge link" CTA.
- Score is held in `sessionStorage` during the auth round-trip, then attached to the new duel row with `challenger_user_id` set.
- The challenger receives a shareable URL. Delivery is link-only — they paste it into iMessage, Slack, AirDrop, etc. There is no in-app delivery mechanism.
- The challengee opens the link, types the passage, and sees the head-to-head result. They are not required to sign in. After typing, they may optionally claim their score by signing up; if they do, their `challengee_user_id` is set on the duel row.
- The completed duel result page offers a duel-specific share image (see 3.5).
- When both sides of a duel are signed-in users, the duel becomes part of each user's `/history` "Duels" tab, with a one-click rematch button that creates a new duel with `intended_opponent_user_id` pre-set.
- Pending duels (`challengee_wpm IS NULL`) soft-expire after 7 days. The duel page renders an "expired" state with a "rematch?" CTA that creates a new duel addressed to the original challenger. Rows are not deleted on soft-expire; an optional much-later cleanup may run for very stale rows.

### 3.3 Anonymous → signed-in claim

- Forward-only, single-score handoff. No persistent anonymous identity, no `anon_id` cookie.
- Pattern: stash `{wpm, accuracy, time, passageId}` (or duel equivalent) in `sessionStorage` before the auth redirect. Drain it on the first authenticated page load. Run the appropriate INSERT.
- If the user already has an attempt for today's daily and a preview score is in `sessionStorage`, the unique-constraint rejection is swallowed silently — no error surfaced.
- Three claim sites: daily preview claim, duel challenger claim (gate at "send"), duel challengee claim (optional after the result screen).

### 3.4 Streaks

- Tracked per user on `profiles`: `current_streak`, `longest_streak`, `last_attempt_date`.
- Updated in the same transaction as the daily attempt insert.
- Streak is keyed off the **passage's date**, not the row insert timestamp — typing today's passage past midnight (ET) still counts for today.
- Counts daily attempts only. Duels do not extend or break streaks.
- Displayed on the home page and the `/history` Daily tab.
- Daily share image includes streak ("Day 14 — 84 WPM"). Duel share image does not.
- No "streak at risk" UI, no streak freezes, no nag emails, no push.

### 3.5 Sharing

- Daily share: existing `/api/share-image` route, edge runtime, 1080x1920 ImageResponse. Now also includes streak.
- Duel share: new `mode=duel` branch in the same route. Side-by-side WPMs, both usernames when known, passage title, verdict ("@leon wins, 84-72"). Anonymous opponent renders as "vs ?" or similar — sharing is never gated on opponent identity.

### 3.6 History

- `/history` is the unified "your stuff" page for signed-in users.
- Two tabs: **Daily** (default) and **Duels**.
- Daily tab: best WPM, average WPM, attempt count, current streak, longest streak, reverse-chron attempt list with links to result pages.
- Duels tab: head-to-head list grouped by opponent ("vs @leon — 3-2"), with a rematch button per row that creates a new duel addressed to that user.
- `/duels` does not exist as a separate route.

## 4. Time, identity, and trust rules

### 4.1 Timezone

- All "today" computations use `America/New_York`. The daily passage rotates at midnight ET for every user, regardless of their local timezone.
- `getTodayDate()` is implemented to return the ET date string, not UTC.
- Postgres stores `passages.date` as a `date` type, unchanged.

### 4.2 Identity model in duels

- `duels.challenger_user_id` (nullable; required for new duels post-launch but historic rows may have NULL).
- `duels.intended_opponent_user_id` (nullable; set only when a rematch is created from a previous duel where both sides were known).
- `duels.challengee_user_id` (nullable; set only if an anonymous challengee opts to claim their score).
- Pull-based only — there is no notification channel, no email, no push. Users see incoming duels by visiting `/history`.

### 4.3 Score trust (sanity checks)

Both `/api/attempts` and `/api/duels` validate every submission:

1. WPM math consistency: `(charsTyped / 5) / (time_elapsed / 60)` must roughly match submitted WPM (within tolerance).
2. WPM cap: reject anything above 250 WPM (real-world record is ~216).
3. Accuracy cap: 100% maximum (already enforced client-side).
4. Time floor: `time_elapsed >= 3` seconds.

These checks defeat curl/script-kiddie cheating without UX cost. They are not server-authoritative scoring — keystroke logs are not sent to the server. If a public leaderboard ever ships, that is the moment to revisit.

## 5. Schema changes

```
profiles
  + current_streak       int  not null default 0
  + longest_streak       int  not null default 0
  + last_attempt_date    date null

duels
  + challenger_user_id          uuid null  references auth.users
  + intended_opponent_user_id   uuid null  references auth.users
  + challengee_user_id          uuid null  references auth.users
```

`passages.type` enum keeps both `'classic'` and `'ai'`. AI passages are hibernating, not removed.

RLS policies for new identity columns: a signed-in user can read duels where they are the challenger, challengee, or intended opponent. Public read remains for anonymous duel-link access (the link itself is the access token).

## 6. Mobile

Mobile is supported but not optimized. The existing single-input typing UI is kept. Layout uses `dvh`/`svh` viewport units so the passage remains visible when the OS keyboard is up. Touch targets on the input are large enough to tap easily. There is no mobile-specific WPM bracket, no device-class duel filtering, no tap-to-confirm-word mode.

Cross-device duels are accepted as structurally uneven. Phone users will generally lose to laptop users; this is not a problem we solve in v1.

## 7. AI passages (hibernating)

- `src/app/api/passages/_ai-passage.ts` is preserved.
- `@anthropic-ai/sdk` stays in `package.json`.
- `passages.type` enum keeps `'ai'`.
- New code (streaks, duel identity, share images) must not assume `type === 'classic'` in a way that breaks when AI passages ship later. The discriminator stays usable.
- AI passages are not part of v1 scope; they will be designed as a real feature when revived.

## 8. Out of scope (explicit)

- Practice mode (typing today's daily a second time, repeating any passage on demand)
- Public global leaderboards
- @username typeahead for duel targeting
- Push notifications or email of any kind beyond transactional auth
- Friends list, blocking, abuse reporting
- Streak freezes, "streak at risk" warnings, daily nag emails
- Server-authoritative keystroke scoring
- Mobile-specific UI mode

## 9. Implementation order

Each block roughly unblocks the next.

1. **Foundation fixes** — `getTodayDate()` switches to ET; `/duel` passage roll excludes today's daily index. One-line changes, no schema.
2. **Schema migration** — streak columns on `profiles`; identity columns on `duels`. RLS updates for the new columns. Single migration.
3. **Score sanity checks** — math/cap/floor validation on `/api/attempts` and `/api/duels`. Independent of everything else.
4. **Streaks** — update logic in attempt-save path. Display on home and history Daily tab. Add to daily share image.
5. **Duel identity + claim** — post-investment auth gate on `/duel`, sessionStorage handoff, attach `challenger_user_id`. Optional challengee claim after result screen.
6. **`/history` unification** — Daily/Duels tabs. Reuse existing route.
7. **Duel rematch** — pull-based rematch button on the Duels tab. Creates new duel with `intended_opponent_user_id`.
8. **Duel soft-expire** — expired-state rendering on duel pages, "rematch?" CTA. (No automated cleanup job in v1.)
9. **Duel share image** — `mode=duel` branch in `/api/share-image`.
10. **Mobile sweep** — dvh/svh audit, touch target review.
