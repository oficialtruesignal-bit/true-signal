import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tipsService } from '@/lib/tips-service';
import { apiRequest } from '@/lib/queryClient';

export interface SimulatedTip {
  id: string;
  matchName: string;
  league: string;
  market: string;
  odd: number;
  status: 'green' | 'red' | 'pending';
  timestamp: Date;
  profit: number;
}

export interface MonthlyStats {
  month: number;
  year: number;
  totalTips: number;
  greenTips: number;
  redTips: number;
  pendingTips: number;
  settledTips: number;
  assertivity: number;
  totalProfit: number;
  roi: number;
  avgOddGreen: number;
  currentStreak: { wins: number; losses: number; type: 'win' | 'loss' | 'none' };
  lastUpdated: string;
}

export interface DailyStats {
  date: string;
  green: number;
  red: number;
  profit: number;
}

export interface DashboardStats {
  balance: number;
  winRate: number;
  totalTips: number;
  currentStreak: number;
  profitHistory: { time: string; profit: number }[];
  recentTips: SimulatedTip[];
  monthlyStats: MonthlyStats | null;
  dailyStats: DailyStats[];
  isLoading: boolean;
}

const INITIAL_BALANCE = 1000;
const WIN_PROFIT = 50;
const LOSS_AMOUNT = 100;
const TIP_INTERVAL_MINUTES = 20;
const WIN_LOSS_RATIO = 20; // 20 wins per 1 loss

// Leagues for simulation variety
const LEAGUES = [
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Ligue 1',
  'Champions League',
  'Brasileirão',
  'Copa Libertadores',
];

// Teams pool for realistic match names
const TEAMS = {
  'Premier League': ['Manchester City', 'Arsenal', 'Liverpool', 'Chelsea', 'Tottenham', 'Manchester United'],
  'La Liga': ['Real Madrid', 'Barcelona', 'Atlético Madrid', 'Sevilla', 'Real Betis', 'Valencia'],
  'Serie A': ['Inter Milan', 'AC Milan', 'Juventus', 'Napoli', 'Roma', 'Lazio'],
  'Bundesliga': ['Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Leverkusen', 'Frankfurt', 'Union Berlin'],
  'Ligue 1': ['PSG', 'Marseille', 'Monaco', 'Lyon', 'Lille', 'Nice'],
  'Champions League': ['Barcelona', 'Real Madrid', 'Bayern Munich', 'Manchester City', 'PSG', 'Liverpool'],
  'Brasileirão': ['Flamengo', 'Palmeiras', 'São Paulo', 'Corinthians', 'Atlético-MG', 'Internacional'],
  'Copa Libertadores': ['Flamengo', 'River Plate', 'Boca Juniors', 'Palmeiras', 'Peñarol', 'Nacional'],
};

const MARKETS = [
  'Over 0.5 HT',
  'Over 1.5 FT',
  'BTTS Yes',
  'Home Win',
  'Draw No Bet',
  'Over 2.5 FT',
  'Asian Handicap -0.5',
];

function generateRandomMatch(league: string): string {
  const teams = TEAMS[league as keyof typeof TEAMS] || TEAMS['Premier League'];
  const home = teams[Math.floor(Math.random() * teams.length)];
  let away = teams[Math.floor(Math.random() * teams.length)];
  while (away === home) {
    away = teams[Math.floor(Math.random() * teams.length)];
  }
  return `${home} vs ${away}`;
}

function generateHistoricalTips(count: number): SimulatedTip[] {
  const tips: SimulatedTip[] = [];
  let balance = INITIAL_BALANCE;
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const isRed = (count - i) % (WIN_LOSS_RATIO + 1) === 0 && i > 0; // Every 21st tip is RED
    const status = isRed ? 'red' : 'green';
    const profit = isRed ? -LOSS_AMOUNT : WIN_PROFIT;
    balance += profit;
    
    const league = LEAGUES[Math.floor(Math.random() * LEAGUES.length)];
    const market = MARKETS[Math.floor(Math.random() * MARKETS.length)];
    const odd = (1.5 + Math.random() * 1.5).toFixed(2);
    
    const timestamp = new Date(now.getTime() - i * TIP_INTERVAL_MINUTES * 60 * 1000);
    
    tips.push({
      id: `sim-${count - i}`,
      matchName: generateRandomMatch(league),
      league,
      market,
      odd: parseFloat(odd),
      status,
      timestamp,
      profit,
    });
  }
  
  return tips.reverse();
}

export function useDashboardData(): DashboardStats {
  const [simulatedTips, setSimulatedTips] = useState<SimulatedTip[]>([]);
  const [currentBalance, setCurrentBalance] = useState(INITIAL_BALANCE);
  
  // Fetch real tips from API
  const { data: realTips = [] } = useQuery({
    queryKey: ['tips'],
    queryFn: tipsService.getAll,
  });

  // Fetch real monthly stats from API
  const { data: monthlyStats, isLoading: isLoadingMonthly } = useQuery<MonthlyStats>({
    queryKey: ['tips-stats'],
    queryFn: async () => {
      const response = await fetch('/api/tips/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch daily stats for chart
  const { data: dailyStats = [], isLoading: isLoadingDaily } = useQuery<DailyStats[]>({
    queryKey: ['tips-stats-daily'],
    queryFn: async () => {
      const response = await fetch('/api/tips/stats/daily?days=30');
      if (!response.ok) throw new Error('Failed to fetch daily stats');
      return response.json();
    },
    refetchInterval: 60000,
  });

  // Initialize simulation only if no real data
  useEffect(() => {
    if (realTips.length === 0) {
      const historical = generateHistoricalTips(100);
      setSimulatedTips(historical);
      const totalProfit = historical.reduce((sum, tip) => sum + tip.profit, 0);
      setCurrentBalance(INITIAL_BALANCE + totalProfit);
    }
  }, [realTips.length]);

  // Add new simulated tip every 30 seconds (only if no real data)
  useEffect(() => {
    if (realTips.length > 0) return;
    
    const interval = setInterval(() => {
      setSimulatedTips((prev) => {
        const newTipIndex = prev.length + 1;
        const isRed = newTipIndex % (WIN_LOSS_RATIO + 1) === 0;
        const status = isRed ? 'red' : 'green';
        const profit = isRed ? -LOSS_AMOUNT : WIN_PROFIT;
        
        const league = LEAGUES[Math.floor(Math.random() * LEAGUES.length)];
        const market = MARKETS[Math.floor(Math.random() * MARKETS.length)];
        const odd = (1.5 + Math.random() * 1.5).toFixed(2);
        
        const newTip: SimulatedTip = {
          id: `sim-${newTipIndex}`,
          matchName: generateRandomMatch(league),
          league,
          market,
          odd: parseFloat(odd),
          status,
          timestamp: new Date(),
          profit,
        };
        
        setCurrentBalance((prevBalance) => prevBalance + profit);
        
        return [...prev, newTip];
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [realTips.length]);

  // Use REAL stats if available, otherwise fallback to simulation
  const hasRealData = monthlyStats && monthlyStats.settledTips > 0;
  
  const winRate = hasRealData 
    ? monthlyStats.assertivity 
    : simulatedTips.length > 0 
      ? (simulatedTips.filter((t) => t.status === 'green').length / simulatedTips.length) * 100 
      : 0;
  
  const totalTips = hasRealData 
    ? monthlyStats.totalTips 
    : simulatedTips.length;
  
  // Current streak from real data or simulation
  let currentStreak = 0;
  if (hasRealData) {
    currentStreak = monthlyStats.currentStreak.type === 'win' 
      ? monthlyStats.currentStreak.wins 
      : 0;
  } else {
    for (let i = simulatedTips.length - 1; i >= 0; i--) {
      if (simulatedTips[i].status === 'green') {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Profit history: use daily stats if available, otherwise simulation
  let profitHistory: { time: string; profit: number }[] = [];
  
  if (dailyStats.length > 0) {
    let cumulativeProfit = INITIAL_BALANCE;
    profitHistory = dailyStats.map((day) => {
      cumulativeProfit += day.profit;
      return {
        time: new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        profit: cumulativeProfit,
      };
    });
  } else {
    const historyStartIndex = Math.max(0, simulatedTips.length - 72);
    profitHistory = simulatedTips.slice(historyStartIndex).map((tip, index) => {
      const absoluteIndex = historyStartIndex + index;
      const cumulativeProfit = simulatedTips
        .slice(0, absoluteIndex + 1)
        .reduce((sum, t) => sum + t.profit, 0);
      
      return {
        time: tip.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        profit: INITIAL_BALANCE + cumulativeProfit,
      };
    });
  }

  // Balance: use real profit if available
  const balance = hasRealData 
    ? INITIAL_BALANCE + monthlyStats.totalProfit 
    : currentBalance;

  // Recent tips: prioritize real tips
  const recentTips: SimulatedTip[] = [
    ...realTips.map((tip) => ({
      id: tip.id,
      matchName: `${tip.homeTeam} vs ${tip.awayTeam}`,
      league: tip.league,
      market: tip.market,
      odd: tip.odd,
      status: tip.status as 'green' | 'red' | 'pending',
      timestamp: new Date(tip.timestamp || new Date()),
      profit: tip.status === 'green' ? WIN_PROFIT : tip.status === 'red' ? -LOSS_AMOUNT : 0,
    })),
    ...simulatedTips.slice(-20).reverse(),
  ];

  return {
    balance,
    winRate,
    totalTips,
    currentStreak,
    profitHistory,
    recentTips: recentTips.slice(0, 30),
    monthlyStats: monthlyStats || null,
    dailyStats,
    isLoading: isLoadingMonthly || isLoadingDaily,
  };
}
