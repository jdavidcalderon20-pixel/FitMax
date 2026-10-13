-- Entrenamiento Inteligente — esquema de base de datos para sincronización en la nube.
-- Ejecuta esto UNA SOLA VEZ en: tu proyecto Supabase > SQL Editor > New query > Run.

-- Perfil extendido de cada usuario (lo que auth.users no guarda)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nickname text not null default 'Atleta',
  selected_level text not null default 'A' check (selected_level in ('A','B','C')),
  weekly_routine jsonb,
  weekly_start_date bigint,
  weekly_target_weeks integer default 8,
  race_target_weeks integer default 12,
  race_target_date text,
  created_at timestamptz not null default now()
);

-- Registro de carreras (módulo Running)
create table if not exists running_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  run_date date not null,
  distance_km numeric not null,
  duration_min numeric not null,
  run_type text not null check (run_type in ('facil','tempo','series','larga')),
  rpe integer,
  notes text,
  created_at timestamptz not null default now()
);

-- Registro de ejercicios y cargas (módulos Semanal y Rápido)
create table if not exists exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  module text not null check (module in ('quick','weekly')),
  exercise_key text not null,
  weight numeric,
  reps text,
  completed boolean not null default false,
  logged_at timestamptz not null default now()
);

-- Sesiones completadas de Hyrox y OCR
create table if not exists hyroxocr_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  discipline text not null check (discipline in ('hyrox','ocr')),
  level text not null,
  day_index integer not null,
  completed_at timestamptz not null default now()
);

-- Índices de consulta frecuente por usuario
create index if not exists idx_running_logs_user_id on running_logs(user_id);
create index if not exists idx_exercise_logs_user_module on exercise_logs(user_id, module);
create index if not exists idx_hyroxocr_user on hyroxocr_sessions(user_id);

-- Seguridad: cada usuario SOLO puede ver y modificar sus propios datos.
alter table profiles enable row level security;
alter table running_logs enable row level security;
alter table exercise_logs enable row level security;
alter table hyroxocr_sessions enable row level security;

create policy "select_own_profile" on profiles for select using (auth.uid() = id);
create policy "insert_own_profile" on profiles for insert with check (auth.uid() = id);
create policy "update_own_profile" on profiles for update using (auth.uid() = id);

create policy "select_own_running_logs" on running_logs for select using (auth.uid() = user_id);
create policy "insert_own_running_logs" on running_logs for insert with check (auth.uid() = user_id);
create policy "update_own_running_logs" on running_logs for update using (auth.uid() = user_id);
create policy "delete_own_running_logs" on running_logs for delete using (auth.uid() = user_id);

create policy "select_own_exercise_logs" on exercise_logs for select using (auth.uid() = user_id);
create policy "insert_own_exercise_logs" on exercise_logs for insert with check (auth.uid() = user_id);
create policy "update_own_exercise_logs" on exercise_logs for update using (auth.uid() = user_id);
create policy "delete_own_exercise_logs" on exercise_logs for delete using (auth.uid() = user_id);

create policy "select_own_hyroxocr_sessions" on hyroxocr_sessions for select using (auth.uid() = user_id);
create policy "insert_own_hyroxocr_sessions" on hyroxocr_sessions for insert with check (auth.uid() = user_id);
create policy "delete_own_hyroxocr_sessions" on hyroxocr_sessions for delete using (auth.uid() = user_id);

-- Crea automáticamente una fila en "profiles" apenas alguien se registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==========================================
-- FASE B: CUADRILLAS Y RUTINAS COMPARTIDAS
-- ==========================================

create table if not exists public.squads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  motto text default '',
  discipline text not null default 'hybrid',
  creator_id uuid references auth.users(id) on delete set null,
  shared_routine jsonb default null,
  created_at timestamptz default now()
);

alter table public.squads enable row level security;

create table if not exists public.squad_members (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references public.squads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  role text not null default 'member',
  joined_at timestamptz default now(),
  last_checkin_at timestamptz default null,
  last_activity_text text default null,
  streak_days int default 0,
  unique(squad_id, user_id)
);

alter table public.squad_members enable row level security;

create schema if not exists private;

create or replace function private.is_squad_member(squad_id_param uuid, user_id_param uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.squad_members
    where squad_id = squad_id_param
      and user_id = user_id_param
  );
$$;

grant usage on schema private to authenticated;
grant execute on function private.is_squad_member(uuid, uuid) to authenticated;

create table if not exists public.squad_checkins (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references public.squads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  activity_type text not null,
  activity_title text not null,
  details text default '',
  created_at timestamptz default now()
);

alter table public.squad_checkins enable row level security;

-- Políticas de RLS
create policy "squads_select_policy" on public.squads
  for select to authenticated using (true);

create policy "squads_insert_policy" on public.squads
  for insert to authenticated with check (auth.uid() = creator_id);

create policy "squads_update_policy" on public.squads
  for update to authenticated using (auth.uid() = creator_id);

create policy "squads_delete_policy" on public.squads
  for delete to authenticated using (auth.uid() = creator_id);

create policy "squad_members_select_policy" on public.squad_members
  for select to authenticated using (private.is_squad_member(squad_id, auth.uid()));

create policy "squad_members_insert_policy" on public.squad_members
  for insert to authenticated with check (auth.uid() = user_id);

create policy "squad_members_update_policy" on public.squad_members
  for update to authenticated using (auth.uid() = user_id);

create policy "squad_members_delete_policy" on public.squad_members
  for delete to authenticated using (auth.uid() = user_id);

create policy "squad_checkins_select_policy" on public.squad_checkins
  for select to authenticated using (private.is_squad_member(squad_id, auth.uid()));

create policy "squad_checkins_insert_policy" on public.squad_checkins
  for insert to authenticated with check (auth.uid() = user_id and private.is_squad_member(squad_id, auth.uid()));

create index if not exists idx_squads_code on public.squads(code);
create index if not exists idx_squad_members_squad_id on public.squad_members(squad_id);
create index if not exists idx_squad_members_user_id on public.squad_members(user_id);
create index if not exists idx_squad_checkins_squad_id on public.squad_checkins(squad_id, created_at desc);

-- ==========================================
-- FASE C: MURO SOCIAL Y SUBIDA DE FOTOS
-- ==========================================

create table if not exists public.squad_posts (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references public.squads(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  nickname text not null,
  content text not null,
  image_url text default null,
  activity_badge text default null,
  reactions jsonb default '{"fire": 0, "fist": 0, "muscle": 0}'::jsonb,
  created_at timestamptz default now()
);

alter table public.squad_posts enable row level security;

create policy "squad_posts_select_policy" on public.squad_posts
  for select to authenticated using (private.is_squad_member(squad_id, auth.uid()));

create policy "squad_posts_insert_policy" on public.squad_posts
  for insert to authenticated with check (auth.uid() = user_id and private.is_squad_member(squad_id, auth.uid()));

create policy "squad_posts_update_policy" on public.squad_posts
  for update to authenticated using (private.is_squad_member(squad_id, auth.uid()));

create policy "squad_posts_delete_policy" on public.squad_posts
  for delete to authenticated using (auth.uid() = user_id);

create index if not exists idx_squad_posts_squad_id on public.squad_posts(squad_id, created_at desc);

-- Bucket de almacenamiento público para fotos de cuadrilla
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'squad_media',
  'squad_media',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']::text[]
)
on conflict (id) do nothing;

