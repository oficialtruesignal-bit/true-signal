import { supabase } from "./supabase";

export interface KPIData {
  greenRate: {
    value: number;
    delta: number;
    positive: boolean;
  };
  roi: {
    value: number;
    delta: number;
    positive: boolean;
  };
  activeTips: {
    value: number;
    isLive: boolean;
  };
}

export const kpiService = {
  getKPIs: async (): Promise<KPIData> => {
    try {
      // Fetch all tips
      const { data: allTips, error } = await supabase
        .from('tips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const tips = allTips || [];

      // Calculate Green Rate
      const finishedTips = tips.filter(t => t.status === 'green' || t.status === 'red');
      const greenTips = tips.filter(t => t.status === 'green');
      const greenRate = finishedTips.length > 0 
        ? (greenTips.length / finishedTips.length) * 100 
        : 0;

      // Calculate Green Rate for last 30 days (for delta)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentTips = tips.filter(t => new Date(t.created_at) > thirtyDaysAgo);
      const recentFinished = recentTips.filter(t => t.status === 'green' || t.status === 'red');
      const recentGreen = recentTips.filter(t => t.status === 'green');
      const previousGreenRate = recentFinished.length > 0
        ? (recentGreen.length / recentFinished.length) * 100
        : greenRate;
      const greenRateDelta = greenRate - previousGreenRate;

      // Calculate ROI (simplified: sum of winning odds minus number of tips)
      const totalInvested = finishedTips.length; // Assume 1 unit per tip
      const totalReturn = greenTips.reduce((sum, tip) => {
        const odd = parseFloat(tip.odd || '0');
        return sum + odd;
      }, 0);
      const roi = totalInvested > 0 
        ? ((totalReturn - totalInvested) / totalInvested) * 100 
        : 0;

      // ROI delta (compare last 30 days vs all time)
      const recentInvested = recentFinished.length;
      const recentReturn = recentGreen.reduce((sum, tip) => {
        const odd = parseFloat(tip.odd || '0');
        return sum + odd;
      }, 0);
      const previousROI = recentInvested > 0
        ? ((recentReturn - recentInvested) / recentInvested) * 100
        : roi;
      const roiDelta = roi - previousROI;

      // Count active tips
      const activeTips = tips.filter(t => t.status === 'pending');
      const hasLiveTips = activeTips.some(t => t.is_live);

      return {
        greenRate: {
          value: Math.round(greenRate * 10) / 10, // Round to 1 decimal
          delta: Math.round(greenRateDelta * 10) / 10,
          positive: greenRateDelta >= 0,
        },
        roi: {
          value: Math.round(roi * 10) / 10,
          delta: Math.round(roiDelta * 10) / 10,
          positive: roiDelta >= 0,
        },
        activeTips: {
          value: activeTips.length,
          isLive: hasLiveTips,
        },
      };
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      // Return default values on error
      return {
        greenRate: { value: 0, delta: 0, positive: true },
        roi: { value: 0, delta: 0, positive: true },
        activeTips: { value: 0, isLive: false },
      };
    }
  },
};
