create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.player_progress (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  current_level integer not null default 1 check (current_level >= 1),
  best_score integer not null default 0 check (best_score >= 0),
  best_scores jsonb not null default '{}'::jsonb,
  unlocks jsonb not null default '{}'::jsonb,
  badges jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_challenges (
  id uuid primary key default gen_random_uuid(),
  challenge_date date not null unique,
  question_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.challenge_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.daily_challenges(id) on delete cascade,
  score integer not null check (score >= 0),
  total_questions integer not null check (total_questions > 0),
  completed_at timestamptz not null default now(),
  unique (user_id, challenge_id)
);

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  player_name text not null check (char_length(player_name) between 1 and 40),
  score integer not null check (score >= 0),
  category text not null,
  created_at timestamptz not null default now()
);

create index if not exists leaderboard_category_score_idx on public.leaderboard (category, score desc);
create index if not exists challenge_attempts_user_idx on public.challenge_attempts (user_id, completed_at desc);

alter table public.profiles enable row level security;
alter table public.player_progress enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.challenge_attempts enable row level security;
alter table public.leaderboard enable row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Profiles are writable by owner" on public.profiles;
create policy "Profiles are writable by owner" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Progress is readable by owner" on public.player_progress;
create policy "Progress is readable by owner" on public.player_progress for select using (auth.uid() = user_id);

drop policy if exists "Progress is writable by owner" on public.player_progress;
create policy "Progress is writable by owner" on public.player_progress for insert with check (auth.uid() = user_id);

drop policy if exists "Progress can be updated by owner" on public.player_progress;
create policy "Progress can be updated by owner" on public.player_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Daily challenges are public" on public.daily_challenges;
create policy "Daily challenges are public" on public.daily_challenges for select using (true);

drop policy if exists "Attempts are readable by owner" on public.challenge_attempts;
create policy "Attempts are readable by owner" on public.challenge_attempts for select using (auth.uid() = user_id);

drop policy if exists "Attempts are writable by owner" on public.challenge_attempts;
create policy "Attempts are writable by owner" on public.challenge_attempts for insert with check (auth.uid() = user_id);

drop policy if exists "Anyone can read leaderboard" on public.leaderboard;
create policy "Anyone can read leaderboard" on public.leaderboard for select using (true);

drop policy if exists "Authenticated users can submit scores" on public.leaderboard;
create policy "Authenticated users can submit scores" on public.leaderboard
  for insert with check (auth.uid() = user_id and score >= 0 and char_length(player_name) between 1 and 40);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), 'Player'))
  on conflict (id) do nothing;
  insert into public.player_progress (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();


-- Secure leaderboard submission: clients cannot write leaderboard rows directly.
drop policy if exists "Authenticated users can submit scores" on public.leaderboard;

create or replace function public.submit_leaderboard_score(p_category text, p_score integer)
returns public.leaderboard
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_name text;
  v_row public.leaderboard;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_category not in ('nigeria','africa','food','landmarks') then raise exception 'Invalid category'; end if;
  if p_score < 0 or p_score > 100 then raise exception 'Invalid score'; end if;

  select display_name into v_name from public.profiles where id = v_user;
  if v_name is null then raise exception 'Profile not found'; end if;

  insert into public.leaderboard(user_id, player_name, score, category)
  values (v_user, v_name, p_score, p_category)
  returning * into v_row;
  return v_row;
end;
$$;

grant execute on function public.submit_leaderboard_score(text, integer) to authenticated;
