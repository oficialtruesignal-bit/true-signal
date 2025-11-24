import { Signal } from "./mock-data";
import { supabase } from "./supabase";

// Helper to convert Supabase errors to friendly messages
const handleSupabaseError = (error: any, operation: string): never => {
  // RLS policy violation (403)
  if (error.code === '42501' || error.message?.includes('row-level security') || error.message?.includes('policy')) {
    throw new Error(`Apenas administradores podem ${operation} tips.`);
  }
  
  // Generic error
  throw new Error(error.message || `Erro ao ${operation} tip.`);
};

export const tipsService = {
  getAll: async (): Promise<Signal[]> => {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) handleSupabaseError(error, 'carregar');
    
    // Map Supabase tips to frontend Signal format
    return (data || []).map((tip: any) => ({
      id: tip.id,
      league: tip.league || '',
      homeTeam: tip.match_name?.split(' vs ')[0] || '',
      awayTeam: tip.match_name?.split(' vs ')[1] || '',
      market: tip.market,
      odd: parseFloat(tip.odd),
      status: tip.status,
      timestamp: tip.created_at,
      betLink: tip.bet_url,
      isLive: tip.is_live,
    }));
  },

  create: async (tip: Omit<Signal, 'id' | 'timestamp'>): Promise<Signal> => {
    const { data, error } = await supabase
      .from('tips')
      .insert([{
        match_name: `${tip.homeTeam} vs ${tip.awayTeam}`,
        league: tip.league,
        market: tip.market,
        odd: tip.odd,
        status: tip.status || 'pending',
        bet_url: tip.betLink,
        is_live: tip.isLive || false,
      }])
      .select()
      .single();
      
    if (error) handleSupabaseError(error, 'criar');

    return {
      id: data.id,
      league: data.league || '',
      homeTeam: data.match_name?.split(' vs ')[0] || '',
      awayTeam: data.match_name?.split(' vs ')[1] || '',
      market: data.market,
      odd: parseFloat(data.odd),
      status: data.status,
      timestamp: data.created_at,
      betLink: data.bet_url,
      isLive: data.is_live,
    };
  },

  updateStatus: async (id: string, status: Signal['status']): Promise<void> => {
    const { error } = await supabase
      .from('tips')
      .update({ status })
      .eq('id', id);
      
    if (error) handleSupabaseError(error, 'atualizar');
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('tips')
      .delete()
      .eq('id', id);
      
    if (error) handleSupabaseError(error, 'deletar');
  },
};
