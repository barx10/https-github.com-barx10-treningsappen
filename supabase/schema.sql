-- Treningsappen – Supabase-skjema
--
-- Kjør hele denne filen i Supabase → SQL Editor. Den er idempotent, så du kan
-- kjøre den på nytt uten å miste data.
--
-- Tabellene her er de fire som utils/syncService.ts snakker med:
--   profiles, exercises, workout_sessions, favorite_workouts
--
-- Merk om id-kolonnene: de er `text`, ikke `uuid`. Egendefinerte øvelser får
-- id på formen `custom_<uuid>` (se components/ExerciseFormModal.tsx), og
-- eksempeløkta fra initialData.ts har id `past_session_1`. Med uuid-kolonner
-- ville de feile med "invalid input syntax for type uuid".
--
-- Filen speiler databasen slik den står i prosjektet «treningsappen». Endrer du
-- noe i Supabase-dashboardet, oppdater denne filen også.

-- ── profiles ──────────────────────────────────────────────────────────────────
-- Egen `id` som primærnøkkel, og `user_id` unik: klienten gjør upsert med
-- onConflict 'user_id' og sender aldri `id`, så id må ha default.
create table if not exists public.profiles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users (id) on delete cascade,
  name       text,
  age        integer,
  weight     numeric,
  height     integer,
  gender     text,
  goal       text,
  updated_at timestamptz not null default now()
);

-- ── exercises (kun egendefinerte øvelser synkes) ──────────────────────────────
-- Sammensatt primærnøkkel fordi klienten gjør upsert med onConflict 'id,user_id'.
create table if not exists public.exercises (
  id                      text not null,
  user_id                 uuid not null references auth.users (id) on delete cascade,
  name                    text not null,
  muscle_group            text,
  secondary_muscle_groups text[] not null default '{}',
  type                    text,
  description             text,
  is_custom               boolean not null default true,
  personal_best           numeric,
  last_performed          text,
  total_sessions          integer not null default 0,
  updated_at              timestamptz not null default now(),
  primary key (id, user_id)
);

create index if not exists exercises_user_id_idx on public.exercises (user_id);

-- ── workout_sessions ──────────────────────────────────────────────────────────
-- Øvelsene i en økt lagres som jsonb (samme form som WorkoutExercise[] i types.ts).
create table if not exists public.workout_sessions (
  id             text primary key,
  user_id        uuid not null references auth.users (id) on delete cascade,
  name           text not null,
  date           text not null,
  start_time     timestamptz,
  end_time       timestamptz,
  status         text,
  exercises_json jsonb not null default '[]'::jsonb,
  updated_at     timestamptz not null default now()
);

create index if not exists workout_sessions_user_id_start_time_idx
  on public.workout_sessions (user_id, start_time desc);

-- ── favorite_workouts ─────────────────────────────────────────────────────────
create table if not exists public.favorite_workouts (
  id                 text primary key,
  user_id            uuid not null references auth.users (id) on delete cascade,
  name               text not null,
  description        text,
  focus_areas        text[] not null default '{}',
  estimated_duration integer,
  times_used         integer not null default 0,
  created_date       text,
  exercises_json     jsonb not null default '[]'::jsonb,
  updated_at         timestamptz not null default now()
);

create index if not exists favorite_workouts_user_id_idx on public.favorite_workouts (user_id);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Uten dette ville alle innloggede brukere kunne lese hverandres treningsdata.
alter table public.profiles          enable row level security;
alter table public.exercises         enable row level security;
alter table public.workout_sessions  enable row level security;
alter table public.favorite_workouts enable row level security;

-- Én policy per tabell som dekker select/insert/update/delete: du ser og endrer
-- kun dine egne rader. `with check` hindrer at man skriver rader på andres user_id.
drop policy if exists "Users own data" on public.profiles;
create policy "Users own data" on public.profiles
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users own data" on public.exercises;
create policy "Users own data" on public.exercises
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users own data" on public.workout_sessions;
create policy "Users own data" on public.workout_sessions
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users own data" on public.favorite_workouts;
create policy "Users own data" on public.favorite_workouts
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
