import { Signal } from "./mock-data";

export const tipsService = {
  getAll: async (): Promise<Signal[]> => {
    const response = await fetch("/api/tips");
    if (!response.ok) {
      throw new Error("Failed to fetch tips");
    }
    const data = await response.json();
    
    // Map database Tip to frontend Signal
    return data.tips.map((tip: any) => ({
      id: tip.id,
      league: tip.league,
      homeTeam: tip.homeTeam,
      awayTeam: tip.awayTeam,
      market: tip.market,
      odd: parseFloat(tip.odd),
      status: tip.status,
      timestamp: tip.createdAt,
      betLink: tip.betLink,
      isLive: tip.isLive,
    }));
  },

  create: async (tip: Omit<Signal, 'id' | 'timestamp'>): Promise<Signal> => {
    const response = await fetch("/api/tips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        league: tip.league,
        homeTeam: tip.homeTeam,
        awayTeam: tip.awayTeam,
        market: tip.market,
        odd: tip.odd.toString(),
        status: tip.status || "pending",
        betLink: tip.betLink,
        isLive: tip.isLive || false,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create tip");
    }

    const data = await response.json();
    return {
      id: data.tip.id,
      league: data.tip.league,
      homeTeam: data.tip.homeTeam,
      awayTeam: data.tip.awayTeam,
      market: data.tip.market,
      odd: parseFloat(data.tip.odd),
      status: data.tip.status,
      timestamp: data.tip.createdAt,
      betLink: data.tip.betLink,
      isLive: data.tip.isLive,
    };
  },

  updateStatus: async (id: string, status: Signal['status']): Promise<void> => {
    const response = await fetch(`/api/tips/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error("Failed to update tip status");
    }
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/tips/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete tip");
    }
  },
};
