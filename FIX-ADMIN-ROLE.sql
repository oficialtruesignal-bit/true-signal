-- ============================================
-- FIX: Criar perfil admin manualmente
-- Execute este SQL no Supabase SQL Editor em:
-- https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/sql
-- ============================================

-- Passo 1: Verificar o ID do usuário no Supabase Auth
SELECT id, email, raw_user_meta_data->>'first_name' as first_name
FROM auth.users 
WHERE email = 'kwillianferreira@gmail.com';

-- Passo 2: Criar o perfil manualmente (substitua o UUID pelo ID do passo 1)
INSERT INTO public.profiles (id, email, first_name, role)
VALUES (
  'ae2bd6b3-001e-4a7a-92cf-3acbd0e7c6f2', -- Use o ID do passo 1
  'kwillianferreira@gmail.com',
  'Admin',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Passo 3: Verificar se o perfil foi criado corretamente
SELECT id, email, first_name, role, created_at
FROM public.profiles
WHERE email = 'kwillianferreira@gmail.com';

-- ============================================
-- PRONTO! Agora faça logout e login novamente no app
-- ============================================
