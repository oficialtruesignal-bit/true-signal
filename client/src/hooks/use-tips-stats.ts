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
}

async function fetchTipsStats(): Promise<TipsStats> {
  const response = await fetch('/api/tips/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch tips stats');
  }
  const data = await response.json();
  return data;
}

export function useTipsStats() {
  return useQuery({
    queryKey: ['tips-stats'],
    queryFn: fetchTipsStats,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}
