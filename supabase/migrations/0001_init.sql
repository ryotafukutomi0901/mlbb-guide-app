-- MLBB LAB Phase 3: ユーザーデータ層
-- Game Knowledge Layer(ヒーロー/装備等)はコード側の静的データが持つ。
-- ここにはユーザー固有のデータだけを置く(docs/redesign/05_PHASE3_SAAS.md S1)。

create extension if not exists pgcrypto;

-- ── プロファイル ────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  locale text not null default 'ja',
  rank_tier text,
  rank_stars int check (rank_stars between 0 and 5),
  main_heroes text[] not null default '{}',
  preferred_role text,
  preferred_lane text,
  playstyle text check (playstyle in ('aggressive','balanced','passive')),
  goals text[] not null default '{}',
  plan text not null default 'free' check (plan in ('free','pro')),
  stripe_customer_id text,
  plan_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── 試合記録(手入力。将来はスクリーンショット解析) ──────────
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  hero_slug text not null,
  lane text,
  result text not null check (result in ('victory','defeat')),
  kills int not null default 0,
  deaths int not null default 0,
  assists int not null default 0,
  gold int,
  duration_seconds int,
  enemy_heroes text[] not null default '{}',
  ally_heroes text[] not null default '{}',
  notes text,
  played_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists matches_user_played_idx on public.matches (user_id, played_at desc);

-- ── コーチレポート(AI出力の永続化) ─────────────────────────
create table if not exists public.coach_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  match_id uuid references public.matches on delete cascade,
  report jsonb not null,
  model text not null,
  input_tokens int,
  output_tokens int,
  cost_usd numeric(10,6),
  patch text,
  created_at timestamptz not null default now()
);
create index if not exists coach_reports_user_created_idx on public.coach_reports (user_id, created_at desc);

-- ── 利用量(quota判定 + 原価追跡) ──────────────────────────
create table if not exists public.usage_events (
  id bigserial primary key,
  user_id uuid references auth.users on delete cascade,
  anon_key text,
  kind text not null check (kind in ('match_review','followup')),
  model text,
  input_tokens int,
  output_tokens int,
  cost_usd numeric(10,6),
  created_at timestamptz not null default now(),
  constraint usage_events_identity check (user_id is not null or anon_key is not null)
);
create index if not exists usage_events_user_idx on public.usage_events (user_id, kind, created_at desc);
create index if not exists usage_events_anon_idx on public.usage_events (anon_key, kind, created_at desc);

-- ── RLS: 自分のデータ以外は見えない ────────────────────────
alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.coach_reports enable row level security;
alter table public.usage_events enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "matches_select_own" on public.matches for select using (auth.uid() = user_id);
create policy "matches_insert_own" on public.matches for insert with check (auth.uid() = user_id);
create policy "matches_update_own" on public.matches for update using (auth.uid() = user_id);
create policy "matches_delete_own" on public.matches for delete using (auth.uid() = user_id);

create policy "coach_reports_select_own" on public.coach_reports for select using (auth.uid() = user_id);
create policy "coach_reports_insert_own" on public.coach_reports for insert with check (auth.uid() = user_id);

-- 利用量は本人が閲覧できるのみ。書き込みはservice roleに限る
create policy "usage_events_select_own" on public.usage_events for select using (auth.uid() = user_id);

-- ── 新規ユーザーに空のプロファイルを作る ───────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
