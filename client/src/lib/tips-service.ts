import { Signal } from "./mock-data";
import axios from "axios";

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
        market: tip.market,
        odd: Number(tip.odd) || 0,
        status: tip.status,
        timestamp: tip.createdAt || tip.created_at,
        betLink: tip.betLink || tip.bet_link || undefined,
        isLive: tip.isLive !== undefined ? tip.isLive : (tip.is_live || false),
        fixtureId: tip.fixtureId || tip.fixture_id ? String(tip.fixtureId || tip.fixture_id) : undefined,
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao carregar tips');
    }
  },

  create: async (tip: Omit<Signal, 'id' | 'timestamp'>): Promise<Signal> => {
    try {
      const response = await axios.post('/api/tips', {
        homeTeam: tip.homeTeam,
        awayTeam: tip.awayTeam,
        homeTeamLogo: tip.homeTeamLogo || null,
        awayTeamLogo: tip.awayTeamLogo || null,
        league: tip.league,
        market: tip.market,
        odd: tip.odd.toString(), // Convert to string for Drizzle decimal schema
        status: tip.status || 'pending',
        betLink: tip.betLink || null,
        isLive: tip.isLive || false,
        fixtureId: tip.fixtureId || null,
      });
      
      const data = response.data.tip;
      return {
        id: data.id,
        league: data.league || '',
        homeTeam: data.homeTeam || '',
        awayTeam: data.awayTeam || '',
        homeTeamLogo: data.homeTeamLogo || undefined,
        awayTeamLogo: data.awayTeamLogo || undefined,
        market: data.market,
        odd: parseFloat(data.odd),
        status: data.status,
        timestamp: data.createdAt,
        betLink: data.betLink,
        isLive: data.isLive,
        fixtureId: data.fixtureId,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao criar tip');
    }
  },

  updateStatus: async (id: string, status: Signal['status']): Promise<void> => {
    try {
      await axios.patch(`/api/tips/${id}/status`, { status });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao atualizar status');
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/tips/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao deletar tip');
    }
  },
};
