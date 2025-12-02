import { useQuery } from '@tanstack/react-query';

interface TipsStats {
  greens: number;
  reds: number;
  pending: number;
  totalEntries: number;
  totalResolved: number;
  assertivity: number;
  averageOdd: number;
  growthPercentage: number;
  profitUnits: number;
  monthName: string;
  monthTotalTips: number;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

async function fetchTipsStats(): Promise<TipsStats> {
  const response = await fetch('/api/tips/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch tips stats');
  }
  const data = await response.json();
  
  const currentMonth = new Date().getMonth();
  const monthName = MONTH_NAMES[currentMonth];
  
  return {
    greens: data.greenTips || 0,
    reds: data.redTips || 0,
    pending: data.pendingTips || 0,
    totalEntries: data.totalTips || 0,
    totalResolved: data.settledTips || 0,
    assertivity: data.assertivity || 0,
    averageOdd: data.avgOddGreen || 0,
    growthPercentage: data.roi || 0,
    profitUnits: data.totalProfit || 0,
    monthName,
    monthTotalTips: data.totalTips || 0,
  };
}

export function useTipsStats() {
  return useQuery({
    queryKey: ['tips-stats'],
    queryFn: fetchTipsStats,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}
