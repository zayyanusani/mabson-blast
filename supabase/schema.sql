create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  player_name text not null check (char_length(player_name) between 1 and 40),
  score integer not null check (score >= 0),
  category text not null,
  created_at timestamptz not null default now()
);

alter table public.leaderboard enable row level security;

drop policy if exists "Anyone can read leaderboard" on public.leaderboard;
create policy "Anyone can read leaderboard" on public.leaderboard for select using (true);

drop policy if exists "Anyone can submit scores" on public.leaderboard;
create policy "Anyone can submit scores" on public.leaderboard for insert with check (score >= 0 and char_length(player_name) between 1 and 40);

create index if not exists leaderboard_score_idx on public.leaderboard (score desc);
create index if not exists leaderboard_category_idx on public.leaderboard (category, score desc);
