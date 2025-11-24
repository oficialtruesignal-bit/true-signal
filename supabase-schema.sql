-- ============================================
-- TIPSTER HUB - Supabase Database Schema
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Tabela de Perfis (Vinculada ao Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  first_name text,
  role text default 'user' check (role in ('admin', 'user')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Tips (Apostas)
create table if not exists public.tips (
  id uuid default gen_random_uuid() primary key,
  match_name text not null,
  league text,
  market text not null,
  odd numeric not null,
  status text default 'pending' check (status in ('pending', 'green', 'red')),
  bet_url text,
  is_live boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Habilitar Row Level Security (Segurança)
alter table public.profiles enable row level security;
alter table public.tips enable row level security;

-- 4. Políticas de Acesso (Policies)

-- Perfis: Todo mundo pode ver seu próprio perfil
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- Perfis: Usuário pode atualizar seu próprio perfil
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Tips: Qualquer pessoa pode LER as tips (público)
drop policy if exists "Public tips are viewable by everyone" on public.tips;
create policy "Public tips are viewable by everyone" on public.tips
  for select using (true);

-- Tips: Usuários autenticados podem CRIAR tips
drop policy if exists "Authenticated users can insert tips" on public.tips;
create policy "Authenticated users can insert tips" on public.tips
  for insert with check (auth.role() = 'authenticated');

-- Tips: Usuários autenticados podem ATUALIZAR tips
drop policy if exists "Authenticated users can update tips" on public.tips;
create policy "Authenticated users can update tips" on public.tips
  for update using (auth.role() = 'authenticated');

-- 5. Trigger para criar perfil automático ao cadastrar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name)
  values (new.id, new.email, new.raw_user_meta_data->>'first_name');
  return new;
end;
$$ language plpgsql security definer;

-- Remove trigger antigo se existir
drop trigger if exists on_auth_user_created on auth.users;

-- Cria o trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Criar usuário admin padrão
-- IMPORTANTE: Execute isso DEPOIS de criar sua conta no Supabase Auth
-- Substitua 'SEU_UUID_AQUI' pelo UUID do seu usuário admin
-- Para encontrar: SELECT id FROM auth.users WHERE email = 'admin@tipster.com';

-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'admin@tipster.com';
