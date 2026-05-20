
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fact checks
create table public.fact_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  input_type text not null check (input_type in ('text','url','image')),
  input_content text not null,
  category text,
  verdict text not null check (verdict in ('BENAR','MENYESATKAN','HOAKS','FITNAH','UJARAN KEBENCIAN','TIDAK TERVERIFIKASI')),
  confidence integer not null check (confidence between 0 and 100),
  summary text,
  reasoning jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  literacy_tips jsonb not null default '[]'::jsonb,
  category_detected text,
  created_at timestamptz not null default now()
);
alter table public.fact_checks enable row level security;

create policy "fc_select_own" on public.fact_checks for select using (auth.uid() = user_id);
create policy "fc_insert_own" on public.fact_checks for insert with check (auth.uid() = user_id);
create policy "fc_delete_own" on public.fact_checks for delete using (auth.uid() = user_id);

create index fact_checks_user_created_idx on public.fact_checks (user_id, created_at desc);
