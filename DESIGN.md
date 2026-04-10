# Design System — keysmash

## Product Context
- **What this is:** A daily typing speed game built around curated literary passages — one passage per day, one attempt.
- **Who it's for:** Readers and writers who want a calm daily ritual with a competitive edge.
- **Space/industry:** Typing games / daily challenge apps (Wordle-style)
- **Project type:** Web app

## Aesthetic Direction
- **Direction:** Organic/Natural + Brutally Minimal
- **Decoration level:** Intentional — subtle paper grain only, no illustrations or icons beyond necessity
- **Mood:** A warm reading nook on the surface; the timer reveals the competition underneath. The UI should feel unhurried until the moment you start typing.

## Typography
- **Passage text:** Fraunces (`--font-fraunces`) — optical-size variable serif, literary warmth, precise curves. Used for all passage content the user reads and types.
- **UI / labels / nav:** DM Sans (`--font-dm-sans`) — clean, airy, invisible. Handles everything that isn't the passage itself.
- **Scores / data:** DM Sans with `font-variant-numeric: tabular-nums`
- **Loading:** Via `next/font/google` — self-hosted, zero layout shift
- **Scale:** 11px (labels/caps) · 12px (meta) · 13px (UI) · 15px (body) · 19–21px (passage) · 28px+ (WPM scores)

## Color
- **Approach:** Restrained — one accent, warm neutrals, color is rare and meaningful
- **Background:** `#F5EFE0` — warm parchment
- **Surface:** `#EDE4CF` — linen (cards, panels)
- **Surface 2:** `#E3D8BC` — slightly deeper linen (hover states, nested surfaces)
- **Foreground:** `#2B1D0E` — dark walnut / espresso
- **Muted:** `#8B7355` — aged oak (labels, hints, secondary text)
- **Border:** `#D4C4A0` — pale wood grain
- **Border 2:** `#C4B08A` — darker border for interactive elements
- **Accent:** `#4C6B3F` — forest sage (scores, CTAs, cursor, correct state)
- **Accent dark:** `#3A5230` — hover state for accent
- **Error:** `#9B4535` — muted terracotta (wrong keystrokes, errors)

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable — the passage card gets maximum breathing room
- **Max content width:** 672px (max-w-2xl)

## Layout
- **Approach:** Grid-disciplined — single centered column
- **Max content width:** 672px
- **Border radius:** Small (rounded, not bubbly) — 4–6px on cards, 4px on buttons

## Motion
- **Approach:** Minimal-functional
- **Wrong keystroke:** Instant terracotta tint on the mistyped character — no animation, just color
- **Results reveal:** 200ms fade-in
- **Everything else:** Nothing moves unless it aids comprehension

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-10 | Fraunces for passage text | No typing app uses a serif. Makes the excerpt feel like literature being transcribed, not a benchmark being passed. |
| 2026-04-10 | Parchment background (#F5EFE0) | Entire category is dark-or-white. Warm parchment is immediately distinctive — you'd recognize keysmash in a screenshot. |
| 2026-04-10 | Sage green accent (#4C6B3F) | Productive tension — not warm amber (cozy but toothless). Sage has edge: calm, but present. WPM in sage feels like a result from the natural world, not a dashboard. |
| 2026-04-10 | Passage text hidden on home page | Daily challenge format — text is revealed only when you start typing. Keeps anticipation. |
| 2026-04-10 | One passage per day (classic only) | Simplified from two (AI + classic) while building out the core webapp. AI passages preserved in `src/app/api/passages/_ai-passage.ts`. |
