-- Impulse Learning World — Supabase PostgreSQL Schema
-- Run this SQL in the Supabase SQL Editor when connecting a live backend.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Alex Mercer',
  explorer_title text not null default 'Harbor Pathfinder',
  current_level text not null default 'A1' check (current_level in ('A1', 'A2', 'B1', 'B2')),
  xp integer not null default 0,
  weekly_xp integer not null default 0,
  coins integer not null default 250,
  gems integer not null default 20,
  streak_days integer not null default 1,
  active_avatar_id text not null default 'kai',
  unlocked_avatar_ids text[] not null default array['kai'],
  owned_relic_ids text[] not null default array[]::text[],
  skill_mastery jsonb not null default '{"vocabulary":60,"grammar":55,"listening":50,"reading":60,"speaking":45}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id text not null,
  city_id text not null,
  cefr_level text not null check (cefr_level in ('A1', 'A2', 'B1', 'B2')),
  best_score integer not null check (best_score between 0 and 100),
  xp_earned integer not null default 0,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.daily_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  quest_key text not null,
  quest_date date not null default current_date,
  progress integer not null default 0,
  target integer not null,
  claimed boolean not null default false,
  unique (user_id, quest_key, quest_date)
);

create or replace view public.weekly_leaderboard as
select
  id,
  display_name,
  active_avatar_id,
  current_level,
  weekly_xp,
  streak_days
from public.profiles
order by weekly_xp desc
limit 50;

-- Row-Level Security
alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.daily_quests enable row level security;

create policy "Users can view leaderboard profiles"
  on public.profiles for select using (true);

create policy "Users manage own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users manage own lesson progress"
  on public.lesson_progress for all using (auth.uid() = user_id);

create policy "Users manage own daily quests"
  on public.daily_quests for all using (auth.uid() = user_id);
