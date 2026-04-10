-- Passages table: holds daily AI-generated and classic passages
create table public.passages (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  type text not null check (type in ('ai', 'classic')),
  content text not null,
  title text,
  author text,
  source text,
  created_at timestamptz default now()
);

-- One passage of each type per day
create unique index passages_date_type_idx on public.passages (date, type);

-- Attempts table: one attempt per user per passage
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  passage_id uuid references public.passages(id) on delete cascade not null,
  wpm integer not null,
  accuracy numeric(5,2) not null,
  time_elapsed integer not null, -- seconds
  completed_at timestamptz default now(),
  unique(user_id, passage_id)
);

-- Profiles table for display names
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  created_at timestamptz default now()
);

-- RLS policies
alter table public.passages enable row level security;
alter table public.attempts enable row level security;
alter table public.profiles enable row level security;

-- Passages are readable by everyone
create policy "Passages are publicly readable"
  on public.passages for select using (true);

-- Only service role can insert passages (via API route)
create policy "Service role can manage passages"
  on public.passages for all using (auth.role() = 'service_role');

-- Users can read all attempts (for leaderboard potential)
create policy "Attempts are publicly readable"
  on public.attempts for select using (true);

-- Users can only insert their own attempts
create policy "Users can insert own attempts"
  on public.attempts for insert with check (auth.uid() = user_id);

-- Profiles are publicly readable
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

-- Users can manage their own profile
create policy "Users can manage own profile"
  on public.profiles for all using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
