import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tipsService } from '@/lib/tips-service';

export interface Signal {
  id: string;
  matchName: string;
  league: string;
  leagueShort: string;
  market: string;
  odd: number;
  status: 'pending' | 'processing' | 'green' | 'red';
  timestamp: Date;
  units: number;
  time: string;
}

export interface CRMStats {
  assertivity: number;
  totalUnits: number;
  roi: number;
  currentStreak: { wins: number; losses: number };
  unitsHistory: { time: string; units: number }[];
  activityDays: { date: string; count: number; intensity: number }[];
  activeSignals: Signal[];
  recentSignals: Signal[];
  systemStatus: {
    scanning: boolean;
    gamesAnalyzed: number;
    lastSync: Date;
  };
}

const INITIAL_UNITS = 100;
const WIN_UNITS = 0.95;
const LOSS_UNITS = 1;
const WIN_LOSS_RATIO = 20;

const LEAGUES = [
  { name: 'Premier League', short: 'ENG' },
  { name: 'La Liga', short: 'ESP' },
  { name: 'Serie A', short: 'ITA' },
  { name: 'Bundesliga', short: 'GER' },
  { name: 'Ligue 1', short: 'FRA' },
  { name: 'Champions League', short: 'UCL' },
  { name: 'Brasileirão', short: 'BRA' },
];

const TEAMS = {
  'ENG': ['Man City', 'Arsenal', 'Liverpool', 'Chelsea', 'Spurs', 'Man Utd'],
  'ESP': ['Real Madrid', 'Barcelona', 'Atletico', 'Sevilla', 'Betis', 'Valencia'],
  'ITA': ['Inter', 'Milan', 'Juventus', 'Napoli', 'Roma', 'Lazio'],
  'GER': ['Bayern', 'Dortmund', 'RB Leipzig', 'Leverkusen', 'Frankfurt', 'Union'],
  'FRA': ['PSG', 'Marseille', 'Monaco', 'Lyon', 'Lille', 'Nice'],
  'UCL': ['Barcelona', 'Real Madrid', 'Bayern', 'Man City', 'PSG', 'Liverpool'],
  'BRA': ['Flamengo', 'Palmeiras', 'São Paulo', 'Corinthians', 'Atletico-MG', 'Inter'],
};

const MARKETS = ['O0.5 HT', 'O1.5 FT', 'BTTS', 'Home Win', 'DNB', 'O2.5 FT', 'AH -0.5'];

function generateMatch(short: string): string {
  const teams = TEAMS[short as keyof typeof TEAMS] || TEAMS['ENG'];
  const home = teams[Math.floor(Math.random() * teams.length)];
  let away = teams[Math.floor(Math.random() * teams.length)];
  while (away === home) away = teams[Math.floor(Math.random() * teams.length)];
  return `${home} vs ${away}`;
}

function generateSignals(count: number): Signal[] {
  const signals: Signal[] = [];
  const now = new Date();
  
  // Generate in newest-first order (most recent at index 0)
  for (let i = 0; i < count; i++) {
    const signalIndex = count - i;
    const isRed = signalIndex % (WIN_LOSS_RATIO + 1) === 0 && signalIndex > 1;
    const status = i < 4 ? 'pending' : isRed ? 'red' : 'green';
    const units = isRed ? -LOSS_UNITS : WIN_UNITS;
    
    const league = LEAGUES[Math.floor(Math.random() * LEAGUES.length)];
    const market = MARKETS[Math.floor(Math.random() * MARKETS.length)];
    const odd = (1.5 + Math.random() * 1.5).toFixed(2);
    const timestamp = new Date(now.getTime() - i * 20 * 60 * 1000);
    
    signals.push({
      id: `sig-${signalIndex}`,
      matchName: generateMatch(league.short),
      league: league.name,
      leagueShort: league.short,
      market,
      odd: parseFloat(odd),
      status,
      timestamp,
      units,
      time: timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });
  }
  
  return signals;
}

export function useCRMDashboardData(): CRMStats {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [totalUnits, setTotalUnits] = useState(INITIAL_UNITS);
  
  const { data: realTips = [] } = useQuery({
    queryKey: ['tips'],
    queryFn: tipsService.getAll,
  });

  useEffect(() => {
    const historical = generateSignals(120);
    setSignals(historical);
    const accumulatedUnits = historical.reduce((sum, sig) => sum + sig.units, 0);
    setTotalUnits(INITIAL_UNITS + accumulatedUnits);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSignals((prev) => {
        const newIndex = prev.length + 121;
        const isRed = newIndex % (WIN_LOSS_RATIO + 1) === 0;
        const status = isRed ? 'red' : 'green';
        const units = isRed ? -LOSS_UNITS : WIN_UNITS;
        
        const league = LEAGUES[Math.floor(Math.random() * LEAGUES.length)];
        const market = MARKETS[Math.floor(Math.random() * MARKETS.length)];
        const odd = (1.5 + Math.random() * 1.5).toFixed(2);
        const timestamp = new Date();
        
        const newSignal: Signal = {
          id: `sig-${newIndex}`,
          matchName: generateMatch(league.short),
          league: league.name,
          leagueShort: league.short,
          market,
          odd: parseFloat(odd),
          status,
          timestamp,
          units,
          time: timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
        
        setTotalUnits((prev) => prev + units);
        // Add new signal at the beginning (newest-first)
        return [newSignal, ...prev];
      });
    }, 45000);
    
    return () => clearInterval(interval);
  }, []);

  // VALORES FIXOS DE BASELINE - só mudam com sinais reais do admin
  const BASELINE_ASSERTIVITY = 86.2;
  const BASELINE_ROI = 106.2;
  
  // Calcula métricas APENAS dos sinais reais do banco (criados pelo admin)
  const finishedRealTips = realTips.filter(tip => tip.status === 'green' || tip.status === 'red');
  
  let assertivity = BASELINE_ASSERTIVITY;
  let roi = BASELINE_ROI;
  let wins = 2;
  let losses = 0;
  
  if (finishedRealTips.length > 0) {
    // Calcula assertividade real dos sinais do banco
    const greenRealCount = finishedRealTips.filter(t => t.status === 'green').length;
    assertivity = (greenRealCount / finishedRealTips.length) * 100;
    
    // Calcula ROI real: (lucro total - perda total) / investimento * 100
    const greenTips = finishedRealTips.filter(t => t.status === 'green');
    const redTips = finishedRealTips.filter(t => t.status === 'red');
    const totalProfit = greenTips.reduce((sum, tip) => sum + (tip.odd - 1), 0);
    const totalLoss = redTips.length;
    const totalInvested = finishedRealTips.length;
    roi = ((totalProfit - totalLoss) / totalInvested) * 100;
    
    // Calcula sequência real: últimos sinais ordenados
    const sortedRealTips = [...finishedRealTips].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    wins = 0;
    losses = 0;
    
    for (const tip of sortedRealTips) {
      if (tip.status === 'green') {
        if (losses === 0) wins++;
        else break;
      } else if (tip.status === 'red') {
        if (wins === 0) losses++;
        else break;
      }
    }
  }

  // Units history (last 72 signals, oldest to newest for chart)
  // Calculate base units from all signals BEFORE the last 72
  const historySignals = signals.slice(0, 72).reverse();
  const baseUnitsFromOlderSignals = signals.length > 72
    ? signals.slice(72).reduce((sum, s) => sum + s.units, 0)
    : 0;
  
  const unitsHistory = historySignals.map((sig, idx) => {
    const cumulativeFromWindow = historySignals.slice(0, idx + 1).reduce((sum, s) => sum + s.units, 0);
    return {
      time: sig.time,
      units: INITIAL_UNITS + baseUnitsFromOlderSignals + cumulativeFromWindow,
    };
  });

  // Activity heatmap (last 90 days)
  const activityDays: { date: string; count: number; intensity: number }[] = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const daySignals = signals.filter(s => s.timestamp.toISOString().split('T')[0] === dateStr);
    const greenSignals = daySignals.filter(s => s.status === 'green').length;
    activityDays.push({
      date: dateStr,
      count: greenSignals,
      intensity: greenSignals === 0 ? 0 : greenSignals <= 2 ? 1 : greenSignals <= 4 ? 2 : greenSignals <= 6 ? 3 : 4,
    });
  }

  // Active signals (newest signals with pending/processing status)
  const activeSignals = signals.filter(s => s.status === 'pending' || s.status === 'processing');

  // Recent signals (newest 30)
  const recentSignals = signals.slice(0, 30);

  return {
    assertivity,
    totalUnits,
    roi,
    currentStreak: { wins, losses },
    unitsHistory,
    activityDays,
    activeSignals,
    recentSignals,
    systemStatus: {
      scanning: true,
      gamesAnalyzed: 1402 + Math.floor(Math.random() * 100),
      lastSync: new Date(),
    },
  };
}
