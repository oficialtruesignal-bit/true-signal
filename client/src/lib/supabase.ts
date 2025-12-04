import { createClient } from '@supabase/supabase-js';

// NO VITE/VERCEL, OBRIGATORIAMENTE USAMOS import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug de Segurança (Para vermos no console se as chaves carregaram)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO CRÍTICO: Chaves do Supabase não encontradas!');
  console.error('Verifique as Environment Variables na Vercel.');
} else {
  console.log('✅ Supabase Client Iniciado');
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);