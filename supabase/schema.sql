-- ============================================================
-- RunPas — Supabase Schema
-- Executa això a: Supabase Dashboard → SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- race_categories
-- ------------------------------------------------------------
create table public.race_categories (
  id          serial primary key,
  slug        text not null unique,   -- '5k', '10k', 'mitja', 'maro', 'trail', 'ultra'
  name        text not null,          -- '5K', '10K', 'Mitja Marató', 'Marató', 'Trail', 'Ultra'
  min_km      numeric,
  max_km      numeric
);

insert into public.race_categories (slug, name, min_km, max_km) values
  ('5k',    '5K',           4.5,   5.5),
  ('10k',   '10K',          9.0,  11.0),
  ('mitja', 'Mitja Marató', 20.0,  22.5),
  ('maro',  'Marató',       41.0,  43.5),
  ('trail', 'Trail',        null,  null),
  ('ultra', 'Ultra',        null,  null);

-- ------------------------------------------------------------
-- profiles  (extends auth.users 1-to-1)
-- ------------------------------------------------------------
create table public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  username              text unique,
  avatar_url            text,
  strava_id             bigint unique,
  strava_access_token   text,          -- store encrypted in prod
  strava_refresh_token  text,
  strava_token_expires  timestamptz,
  total_km              numeric default 0,
  total_races           int     default 0,
  created_at            timestamptz default now()
);

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- races
-- ------------------------------------------------------------
create table public.races (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  category_id         int  references public.race_categories(id),
  name                text,                        -- nom de la cursa
  distance_km         numeric not null,
  time_seconds        int    not null,             -- temps total en segons
  elevation_m         numeric,                     -- desnivell positiu (m)
  pace_per_km         numeric generated always as  -- segons/km calculat
                        (time_seconds / nullif(distance_km, 0)) stored,
  gpx_url             text,                        -- Supabase Storage URL
  strava_activity_id  bigint unique,
  race_date           date not null default current_date,
  notes               text,
  created_at          timestamptz default now()
);

-- Actualitza totals al profile quan s'insereix/elimina una cursa
create or replace function public.update_profile_totals()
returns trigger language plpgsql security definer as $$
begin
  update public.profiles
  set
    total_km    = (select coalesce(sum(distance_km), 0) from public.races where user_id = coalesce(new.user_id, old.user_id)),
    total_races = (select count(*)                      from public.races where user_id = coalesce(new.user_id, old.user_id))
  where id = coalesce(new.user_id, old.user_id);
  return coalesce(new, old);
end;
$$;

create trigger on_race_change
  after insert or delete on public.races
  for each row execute procedure public.update_profile_totals();

-- ------------------------------------------------------------
-- leaderboard  (vista: millor temps per usuari i categoria)
-- ------------------------------------------------------------
create or replace view public.leaderboard as
select
  row_number() over (partition by r.category_id order by r.time_seconds asc) as rank,
  p.id          as user_id,
  p.username,
  p.avatar_url,
  c.slug        as category_slug,
  c.name        as category_name,
  r.distance_km,
  r.time_seconds,
  r.pace_per_km,
  r.race_date,
  r.id          as race_id
from public.races r
join public.profiles       p on p.id = r.user_id
join public.race_categories c on c.id = r.category_id
where r.time_seconds = (
  -- millor temps d'aquest usuari en aquesta categoria
  select min(r2.time_seconds)
  from public.races r2
  where r2.user_id = r.user_id
    and r2.category_id = r.category_id
);

-- ------------------------------------------------------------
-- Row Level Security (RLS)
-- ------------------------------------------------------------

-- profiles
alter table public.profiles enable row level security;

create policy "Profiles visibles per tothom"
  on public.profiles for select using (true);

create policy "Usuari edita el seu propi perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- races
alter table public.races enable row level security;

create policy "Curses visibles per tothom"
  on public.races for select using (true);

create policy "Usuari insereix les seves curses"
  on public.races for insert
  with check (auth.uid() = user_id);

create policy "Usuari edita les seves curses"
  on public.races for update
  using (auth.uid() = user_id);

create policy "Usuari elimina les seves curses"
  on public.races for delete
  using (auth.uid() = user_id);

-- race_categories (read-only públic)
alter table public.race_categories enable row level security;

create policy "Categories visibles per tothom"
  on public.race_categories for select using (true);

-- ------------------------------------------------------------
-- Storage bucket per GPX i avatars
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public) values
  ('gpx',     'gpx',     false),
  ('avatars', 'avatars', true)
on conflict do nothing;

-- GPX: només el propietari pot pujar/llegir
create policy "GPX upload propi"
  on storage.objects for insert
  with check (bucket_id = 'gpx' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "GPX lectura propi"
  on storage.objects for select
  using (bucket_id = 'gpx' and auth.uid()::text = (storage.foldername(name))[1]);

-- Avatars: públics
create policy "Avatars públics"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Avatar upload propi"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
