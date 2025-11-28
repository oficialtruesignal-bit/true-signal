import { Signal } from "./mock-data";
import axios from "axios";

// SECURITY: Get admin credentials from localStorage (set during login)
const getAdminCredentials = (): { email: string | null; userId: string | null } => {
  try {
    const userStr = localStorage.getItem('vantage_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return { email: user.email || null, userId: user.id || null };
    }
  } catch (e) {
    console.error('Error getting admin credentials:', e);
  }
  return { email: null, userId: null };
};

export const tipsService = {
  getAll: async (): Promise<Signal[]> => {
    try {
      const response = await axios.get('/api/tips');
      const tips = response.data.tips || [];
      
      // Map backend tip format to frontend Signal format
      // Supports both Drizzle camelCase and legacy snake_case
      return tips.map((tip: any) => ({
        id: tip.id,
        league: tip.league || '',
        homeTeam: tip.homeTeam || tip.home_team || '',
        awayTeam: tip.awayTeam || tip.away_team || '',
        homeTeamLogo: tip.homeTeamLogo || tip.home_team_logo || undefined,
        awayTeamLogo: tip.awayTeamLogo || tip.away_team_logo || undefined,
        matchTime: tip.matchTime || tip.match_time || undefined,
        market: tip.market,
        odd: Number(tip.odd) || 0,
        status: tip.status,
        timestamp: tip.createdAt || tip.created_at,
        betLink: tip.betLink || tip.bet_link || undefined,
        isLive: tip.isLive !== undefined ? tip.isLive : (tip.is_live || false),
        fixtureId: tip.fixtureId || tip.fixture_id ? String(tip.fixtureId || tip.fixture_id) : undefined,
        imageUrl: tip.imageUrl || tip.image_url || undefined,
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao carregar tips');
    }
  },

  // SECURITY: Requires admin credentials for authorization
  create: async (tip: Omit<Signal, 'id' | 'timestamp'>): Promise<Signal> => {
    try {
      const { email, userId } = getAdminCredentials();
      const response = await axios.post('/api/tips', {
        homeTeam: tip.homeTeam,
        awayTeam: tip.awayTeam,
        homeTeamLogo: tip.homeTeamLogo || null,
        awayTeamLogo: tip.awayTeamLogo || null,
        matchTime: tip.matchTime || null,
        league: tip.league,
        market: tip.market,
        odd: tip.odd.toString(),
        status: tip.status || 'pending',
        betLink: tip.betLink || null,
        isLive: tip.isLive || false,
        fixtureId: tip.fixtureId || null,
        imageUrl: tip.imageUrl || null,
        adminEmail: email, // SECURITY: Send admin email + userId
        adminUserId: userId,
      });
      
      const data = response.data.tip;
      return {
        id: data.id,
        league: data.league || '',
        homeTeam: data.homeTeam || '',
        awayTeam: data.awayTeam || '',
        homeTeamLogo: data.homeTeamLogo || undefined,
        awayTeamLogo: data.awayTeamLogo || undefined,
        matchTime: data.matchTime || undefined,
        market: data.market,
        odd: parseFloat(data.odd),
        status: data.status,
        timestamp: data.createdAt,
        betLink: data.betLink,
        isLive: data.isLive,
        fixtureId: data.fixtureId,
        imageUrl: data.imageUrl || undefined,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao criar tip');
    }
  },

  // SECURITY: Requires admin credentials for authorization
  updateStatus: async (id: string, status: Signal['status']): Promise<void> => {
    try {
      const { email, userId } = getAdminCredentials();
      await axios.patch(`/api/tips/${id}/status`, { 
        status,
        adminEmail: email,
        adminUserId: userId,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao atualizar status');
    }
  },

  // SECURITY: Requires admin credentials for authorization
  delete: async (id: string): Promise<void> => {
    try {
      const { email, userId } = getAdminCredentials();
      await axios.delete(`/api/tips/${id}?adminEmail=${encodeURIComponent(email || '')}&adminUserId=${encodeURIComponent(userId || '')}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao deletar tip');
    }
  },
};
