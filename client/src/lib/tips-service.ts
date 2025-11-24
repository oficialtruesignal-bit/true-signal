import { Signal } from "./mock-data";
import { supabase, isSupabaseConfigured } from "./supabase";

// In-memory store for development without Supabase keys
let MOCK_STORE: Signal[] = [
  {
    id: "1",
    league: "Premier League",
    homeTeam: "Arsenal",
    awayTeam: "Liverpool",
    market: "Over 2.5 Goals",
    odd: 1.85,
    status: "pending",
    timestamp: new Date().toISOString(),
    isHot: true,
    betLink: "https://bet365.com",
    isLive: false,
  },
  {
    id: "2",
    league: "La Liga",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    market: "Both Teams to Score",
    odd: 1.65,
    status: "green",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    betLink: "https://bet365.com",
    isLive: false,
  }
];

export const tipsService = {
  getAll: async (): Promise<Signal[]> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('tips')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
    
    // Fallback
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_STORE]), 300));
  },

  create: async (tip: Omit<Signal, 'id' | 'timestamp'>): Promise<Signal> => {
    const newTip = {
      ...tip,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('tips')
        .insert([newTip])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    }

    // Fallback
    MOCK_STORE = [newTip as Signal, ...MOCK_STORE];
    return new Promise((resolve) => setTimeout(() => resolve(newTip as Signal), 300));
  },

  updateStatus: async (id: string, status: Signal['status']): Promise<void> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('tips')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      return;
    }

    // Fallback
    MOCK_STORE = MOCK_STORE.map(t => t.id === id ? { ...t, status } : t);
    return new Promise((resolve) => setTimeout(() => resolve(), 300));
  }
};
