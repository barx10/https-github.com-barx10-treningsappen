-- Treningsappen – Supabase-skjema
--
-- Dette er en tro kopi av databasen i prosjektet «treningsappen», avstemt mot
-- information_schema.columns og pg_policies. Endrer du noe i Supabase-
-- dashboardet, oppdater denne filen også.
--
-- Filen er idempotent: `create table if not exists` rører ikke eksisterende
-- tabeller, og policyene droppes før de opprettes på nytt. Kjør den i
-- Supabase → SQL Editor.
--
-- Tabellene er de fire som utils/syncService.ts snakker med:
--   profiles, exercises, workout_sessions, favorite_workouts
--
-- Om id-kolonnene: de er `text`, ikke `uuid`. Egendefinerte øvelser får id på
-- formen `custom_<uuid>` (components/ExerciseFormModal.tsx), og eksempeløkta
-- fra initialData.ts har id `past_session_1`. Med uuid-kolonner ville de feile
-- med "invalid input syntax for type uuid".
--
-- Avstemt mot det opprinnelige oppsett-skriptet i SQL Editor («User Fitness
-- Schema»), som bekrefter unique på profiles.user_id, `on delete cascade` på
-- fremmednøklene, presisjonen på weight og CHECK-listene på gender og goal.

-- ── profiles ──────────────────────────────────────────────────────────────────
-- Egen `id` som primærnøkkel med default: klienten sender aldri `id`, kun
-- user_id, og lener seg på onConflict 'user_id' for å treffe samme rad igjen.
create table if not exists public.profiles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users (id) on delete cascade,
  name       text not null,
  age        integer,
  weight     numeric(5,1),
  height     integer,
  gender     text check (gender in ('male', 'female')),
  goal       text check (goal in ('strength', 'muscle', 'weight_loss', 'endurance', 'general')),
  updated_at timestamptz default now()
);

-- ── exercises (kun egendefinerte øvelser synkes) ──────────────────────────────
-- Sammensatt primærnøkkel fordi klienten gjør upsert med onConflict 'id,user_id'.
-- Merk: is_custom har default false, mens pullExercises filtrerer på
-- is_custom = true. Rader satt inn uten feltet blir derfor usynlige for appen.
-- pushExercises sender alltid true, så det gjelder bare manuelle innsettinger.
create table if not exists public.exercises (
  id                      text not null,
  user_id                 uuid not null references auth.users (id) on delete cascade,
  name                    text not null,
  muscle_group            text not null,
  secondary_muscle_groups text[],
  type                    text not null,
  description             text,
  is_custom               boolean default false,
  personal_best           numeric,
  last_performed          text,
  total_sessions          integer default 0,
  updated_at              timestamptz default now(),
  primary key (id, user_id)
);

-- ── workout_sessions ──────────────────────────────────────────────────────────
-- Øvelsene i en økt lagres som jsonb (samme form som WorkoutExercise[] i types.ts).
-- `date` er text fordi feltet inneholder både «2025-12-21» og hele ISO-strenger.
create table if not exists public.workout_sessions (
  id             text primary key,
  user_id        uuid not null references auth.users (id) on delete cascade,
  name           text not null,
  date           text not null,
  start_time     timestamptz not null,
  end_time       timestamptz,
  status         text not null,
  exercises_json jsonb,
  updated_at     timestamptz default now()
);

-- ── favorite_workouts ─────────────────────────────────────────────────────────
create table if not exists public.favorite_workouts (
  id                 text primary key,
  user_id            uuid not null references auth.users (id) on delete cascade,
  name               text not null,
  description        text,
  focus_areas        text[],
  estimated_duration integer,
  times_used         integer default 0,
  created_date       text not null,
  exercises_json     jsonb,
  updated_at         timestamptz default now()
);

-- ── Indekser (valgfritt tillegg) ──────────────────────────────────────────────
-- Disse finnes IKKE i databasen i dag. Alle oppslag går på user_id, så de blir
-- nyttige når historikken vokser. Med dagens datamengde betyr de ingenting.
create index if not exists exercises_user_id_idx
  on public.exercises (user_id);
create index if not exists workout_sessions_user_id_start_time_idx
  on public.workout_sessions (user_id, start_time desc);
create index if not exists favorite_workouts_user_id_idx
  on public.favorite_workouts (user_id);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Uten dette ville alle innloggede brukere kunne lese hverandres treningsdata.
alter table public.profiles          enable row level security;
alter table public.exercises         enable row level security;
alter table public.workout_sessions  enable row level security;
alter table public.favorite_workouts enable row level security;

-- Én policy per tabell som dekker select/insert/update/delete: du ser og endrer
-- kun dine egne rader. Policyen har ingen egen `with check` – for en FOR ALL-
-- policy bruker Postgres da `using`-uttrykket også ved insert og update, så
-- ingen kan skrive rader på en annen brukers user_id. Uten `to`-ledd gjelder
-- policyen rollen public, men uinnlogget gir auth.uid() null og treffer ingen
-- rader.
drop policy if exists "Users own data" on public.profiles;
create policy "Users own data" on public.profiles
  for all
  using (auth.uid() = user_id);

drop policy if exists "Users own data" on public.exercises;
create policy "Users own data" on public.exercises
  for all
  using (auth.uid() = user_id);

drop policy if exists "Users own data" on public.workout_sessions;
create policy "Users own data" on public.workout_sessions
  for all
  using (auth.uid() = user_id);

drop policy if exists "Users own data" on public.favorite_workouts;
create policy "Users own data" on public.favorite_workouts
  for all
  using (auth.uid() = user_id);
