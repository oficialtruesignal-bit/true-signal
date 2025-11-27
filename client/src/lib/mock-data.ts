import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BetLeg {
  homeTeam: string;
  awayTeam: string;
  league: string;
  market: string;
  odd: number;
  time: string;
}

export interface Signal {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string; // URL of home team logo
  awayTeamLogo?: string; // URL of away team logo
  market: string;
  odd: number;
  status: "pending" | "green" | "red";
  timestamp: string;
  isHot?: boolean;
  betLink?: string;
  isLive?: boolean;
  legs?: BetLeg[]; // Multiple selections for combo bets
  fixtureId?: string; // ID from API-Football to fetch official data
  imageUrl?: string; // URL of uploaded bet slip image
}

export interface LiveGame {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: "live" | "ht" | "ft";
}

export const MOCK_SIGNALS: Signal[] = [
  // Multi-leg bet (Combo)
  {
    id: "1",
    league: "Múltipla Premier League",
    homeTeam: "Arsenal",
    awayTeam: "Liverpool",
    market: "Over 2.5 Goals",
    odd: 10.04, // Total odd (1.85 x 2.20 x 2.45)
    status: "pending",
    timestamp: new Date().toISOString(),
    isHot: true,
    betLink: "https://bet365.com",
    isLive: false,
    fixtureId: "1386749", // ID real da API-Football (Championship 25/11/2025 19:45 UTC)
    legs: [
      {
        homeTeam: "Arsenal",
        awayTeam: "Liverpool",
        league: "Premier League",
        market: "Mais de 2.5 gols",
        odd: 1.85,
        time: "18:30"
      },
      {
        homeTeam: "Manchester City",
        awayTeam: "Chelsea",
        league: "Premier League",
        market: "Ambas Marcam",
        odd: 2.20,
        time: "19:00"
      },
      {
        homeTeam: "Tottenham",
        awayTeam: "Man United",
        league: "Premier League",
        market: "Vitória Casa",
        odd: 2.45,
        time: "20:45"
      }
    ]
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
    fixtureId: "1386754", // ID real da API-Football (Championship 25/11/2025 19:45 UTC)
  },
  {
    id: "3",
    league: "Serie A",
    homeTeam: "Juventus",
    awayTeam: "AC Milan",
    market: "Home Win",
    odd: 2.10,
    status: "red",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    betLink: "https://bet365.com",
    isLive: false,
  },
  {
    id: "4",
    league: "NBA",
    homeTeam: "Lakers",
    awayTeam: "Warriors",
    market: "LeBron James Over 25.5 Pts",
    odd: 1.90,
    status: "pending",
    timestamp: new Date().toISOString(),
    betLink: "https://bet365.com",
    isLive: true,
  },
  {
    id: "5",
    league: "Champions League",
    homeTeam: "Man City",
    awayTeam: "Bayern",
    market: "Over 3.5 Goals",
    odd: 2.45,
    status: "pending",
    timestamp: new Date().toISOString(),
    betLink: "https://bet365.com",
    isLive: false,
  },
];

export const MOCK_LIVE_GAMES: LiveGame[] = [
  {
    id: "1",
    league: "Premier League",
    homeTeam: "Man City",
    awayTeam: "Arsenal",
    homeScore: 1,
    awayScore: 1,
    minute: 65,
    status: "live",
  },
  {
    id: "2",
    league: "La Liga",
    homeTeam: "Real Betis",
    awayTeam: "Sevilla",
    homeScore: 0,
    awayScore: 2,
    minute: 32,
    status: "live",
  },
  {
    id: "3",
    league: "Bundesliga",
    homeTeam: "Dortmund",
    awayTeam: "RB Leipzig",
    homeScore: 2,
    awayScore: 2,
    minute: 45,
    status: "ht",
  },
  {
    id: "4",
    league: "Serie A",
    homeTeam: "Inter",
    awayTeam: "Napoli",
    homeScore: 1,
    awayScore: 0,
    minute: 88,
    status: "live",
  },
];
