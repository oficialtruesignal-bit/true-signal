import axios from "axios";

const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

export interface Team {
  id: number;
  name: string;
  logo: string;
}

export interface Goals {
  home: number | null;
  away: number | null;
}

export interface FixtureStatus {
  long: string;
  short: string;
  elapsed: number | null;
}

export interface Fixture {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  periods: {
    first: number | null;
    second: number | null;
  };
  venue: {
    id: number | null;
    name: string;
    city: string;
  };
  status: FixtureStatus;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
  season: number;
  round: string;
}

export interface FootballMatch {
  fixture: Fixture;
  league: League;
  teams: {
    home: Team;
    away: Team;
  };
  goals: Goals;
  score: {
    halftime: Goals;
    fulltime: Goals;
    extratime: Goals;
    penalty: Goals;
  };
}

export interface FixtureStatistics {
  team: Team;
  statistics: Array<{
    type: string;
    value: number | string | null;
  }>;
}

// MOCK DATA FOR FALLBACK
const MOCK_LIVE_MATCHES: FootballMatch[] = [
  {
    fixture: { id: 1, referee: null, timezone: "UTC", date: new Date().toISOString(), timestamp: Date.now(), periods: { first: null, second: null }, venue: { id: null, name: "Stadium", city: "City" }, status: { long: "Second Half", short: "2H", elapsed: 75 } },
    league: { id: 39, name: "Premier League", country: "England", logo: "https://media.api-sports.io/football/leagues/39.png", flag: null, season: 2024, round: "Regular Season" },
    teams: { home: { id: 1, name: "Man United", logo: "https://media.api-sports.io/football/teams/33.png" }, away: { id: 2, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" } },
    goals: { home: 1, away: 2 },
    score: { halftime: { home: 0, away: 1 }, fulltime: { home: null, away: null }, extratime: { home: null, away: null }, penalty: { home: null, away: null } }
  },
  {
    fixture: { id: 2, referee: null, timezone: "UTC", date: new Date().toISOString(), timestamp: Date.now(), periods: { first: null, second: null }, venue: { id: null, name: "Stadium", city: "City" }, status: { long: "First Half", short: "1H", elapsed: 32 } },
    league: { id: 140, name: "La Liga", country: "Spain", logo: "https://media.api-sports.io/football/leagues/140.png", flag: null, season: 2024, round: "Regular Season" },
    teams: { home: { id: 3, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" }, away: { id: 4, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" } },
    goals: { home: 0, away: 0 },
    score: { halftime: { home: null, away: null }, fulltime: { home: null, away: null }, extratime: { home: null, away: null }, penalty: { home: null, away: null } }
  }
];

export const footballService = {
  getLiveFixtures: async (): Promise<FootballMatch[]> => {
    if (!API_KEY) {
      console.warn("No VITE_FOOTBALL_API_KEY found. Using Mock Data.");
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_LIVE_MATCHES), 500));
    }

    try {
      const response = await axios.get(`${BASE_URL}/fixtures`, {
        params: { live: "all" },
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      });
      return response.data.response;
    } catch (error) {
      console.error("Error fetching live fixtures:", error);
      return MOCK_LIVE_MATCHES;
    }
  },

  getFixturesByDate: async (date: string): Promise<FootballMatch[]> => {
    if (!API_KEY) {
       console.warn("No VITE_FOOTBALL_API_KEY found. Using Mock Data.");
       // Return slightly modified mock data for "Upcoming"
       return new Promise((resolve) => setTimeout(() => resolve(MOCK_LIVE_MATCHES.map(m => ({
         ...m, 
         fixture: { ...m.fixture, status: { long: "Not Started", short: "NS", elapsed: null } },
         goals: { home: null, away: null }
       }))), 500));
    }

    try {
      const response = await axios.get(`${BASE_URL}/fixtures`, {
        params: { date },
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      });
      return response.data.response;
    } catch (error) {
      console.error("Error fetching fixtures by date:", error);
      return [];
    }
  },

  getFixtureStatistics: async (fixtureId: number): Promise<FixtureStatistics[]> => {
    if (!API_KEY) {
      console.warn("No VITE_FOOTBALL_API_KEY found. Using Mock Statistics.");
      // Return mock statistics for development
      return new Promise((resolve) => setTimeout(() => resolve([
        {
          team: { id: 1, name: "Home Team", logo: "" },
          statistics: [
            { type: "Shots on Goal", value: 5 },
            { type: "Shots off Goal", value: 3 },
            { type: "Total Shots", value: 8 },
            { type: "Blocked Shots", value: 2 },
            { type: "Shots insidebox", value: 6 },
            { type: "Shots outsidebox", value: 2 },
            { type: "Fouls", value: 12 },
            { type: "Corner Kicks", value: 4 },
            { type: "Offsides", value: 2 },
            { type: "Ball Possession", value: "52%" },
            { type: "Yellow Cards", value: 2 },
            { type: "Red Cards", value: 0 },
            { type: "Goalkeeper Saves", value: 3 },
            { type: "Total passes", value: 420 },
            { type: "Passes accurate", value: 350 },
            { type: "Passes %", value: "83%" },
          ],
        },
        {
          team: { id: 2, name: "Away Team", logo: "" },
          statistics: [
            { type: "Shots on Goal", value: 3 },
            { type: "Shots off Goal", value: 5 },
            { type: "Total Shots", value: 8 },
            { type: "Blocked Shots", value: 1 },
            { type: "Shots insidebox", value: 4 },
            { type: "Shots outsidebox", value: 4 },
            { type: "Fouls", value: 15 },
            { type: "Corner Kicks", value: 6 },
            { type: "Offsides", value: 3 },
            { type: "Ball Possession", value: "48%" },
            { type: "Yellow Cards", value: 3 },
            { type: "Red Cards", value: 0 },
            { type: "Goalkeeper Saves", value: 5 },
            { type: "Total passes", value: 380 },
            { type: "Passes accurate", value: 310 },
            { type: "Passes %", value: "82%" },
          ],
        },
      ]), 500));
    }

    try {
      const response = await axios.get(`${BASE_URL}/fixtures/statistics`, {
        params: { fixture: fixtureId },
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      });
      return response.data.response;
    } catch (error) {
      console.error("Error fetching fixture statistics:", error);
      return [];
    }
  },
};
