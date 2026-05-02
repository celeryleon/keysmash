-- Block 2: Adds schema needed for streaks (PRD §3.4) and duel identity (PRD §4.2).
-- Strictly additive: no existing columns or RLS policies are touched.
-- RLS for the new duel identity columns will land in Block 5, alongside the
-- application code that uses them.

-- ---------------------------------------------------------------------------
-- profiles: streak tracking
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column current_streak    integer not null default 0,
  add column longest_streak    integer not null default 0,
  add column last_attempt_date date;

-- ---------------------------------------------------------------------------
-- duels: identity for challenger, intended opponent (rematch), and challengee
-- ---------------------------------------------------------------------------
alter table public.duels
  add column challenger_user_id          uuid references auth.users(id) on delete set null,
  add column intended_opponent_user_id   uuid references auth.users(id) on delete set null,
  add column challengee_user_id          uuid references auth.users(id) on delete set null;

create index duels_challenger_user_id_idx
  on public.duels (challenger_user_id);

create index duels_intended_opponent_user_id_idx
  on public.duels (intended_opponent_user_id);

create index duels_challengee_user_id_idx
  on public.duels (challengee_user_id);
