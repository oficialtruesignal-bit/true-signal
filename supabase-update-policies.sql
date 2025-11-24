-- ============================================
-- TIPSTER HUB - Atualizar Políticas RLS
-- Execute APENAS ESTE SQL para atualizar as políticas
-- ============================================

-- 1. REMOVER TODAS as políticas antigas de tips
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'tips' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.tips';
    END LOOP;
END $$;

-- 2. CRIAR novas políticas (apenas admins podem criar/editar/deletar)

-- Tips: Qualquer pessoa pode LER as tips (público)
create policy "Public tips are viewable by everyone" on public.tips
  for select using (true);

-- Tips: APENAS ADMINS podem CRIAR tips
create policy "Only admins can insert tips" on public.tips
  for insert with check (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'admin'
    )
  );

-- Tips: APENAS ADMINS podem ATUALIZAR tips
create policy "Only admins can update tips" on public.tips
  for update using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'admin'
    )
  );

-- Tips: APENAS ADMINS podem DELETAR tips
create policy "Only admins can delete tips" on public.tips
  for delete using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'admin'
    )
  );
