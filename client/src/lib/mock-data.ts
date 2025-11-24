import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Signal {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  market: string;
  odd: number;
  status: "pending" | "green" | "red";
  timestamp: string;
  isHot?: boolean;
}

export const MOCK_SIGNALS: Signal[] = [
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
  },
];
