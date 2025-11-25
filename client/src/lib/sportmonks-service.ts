import axios from "axios";

const SPORTMONKS_API_KEY = import.meta.env.VITE_SPORTMONKS_API_KEY;
const SPORTMONKS_BASE_URL = "https://api.sportmonks.com/v3/football";

// Sportmonks V3 Native Types
export interface SportmonksV3Participant {
  id: number;
  sport_id: number;
  country_id: number;
  venue_id: number;
  gender: string;
  name: string;
  short_code: string;
  image_path: string;
  founded: number;
  type: string;
  placeholder: boolean;
  last_played_at: string;
}

export interface SportmonksV3League {
  id: number;
  sport_id: number;
  country_id: number;
  name: string;
  active: boolean;
  short_code: string;
  image_path: string;
  type: string;
  sub_type: string;
  last_played_at: string;
  category: number;
  has_jerseys: boolean;
}

export interface SportmonksV3Score {
  id: number;
  fixture_id: number;
  type_id: number;
  participant_id: number;
  score: {
    goals: number;
    participant: string;
  };
  description: string;
  location?: "home" | "away";
}

export interface SportmonksV3Statistic {
  id: number;
  fixture_id: number;
  type_id: number;
  participant_id: number;
  data: {
    value: number;
  };
  location: "home" | "away";
  type?: {
    id: number;
    name: string;
    code: string;
    developer_name: string;
    model_type: string;
    stat_group: string;
  };
}

export interface SportmonksV3Fixture {
  id: number;
  sport_id: number;
  league_id: number;
  season_id: number;
  stage_id: number;
  state_id: number;
  venue_id: number | null;
  name: string;
  starting_at: string;
  result_info: string | null;
  leg: string;
  length: number;
  placeholder: boolean;
  has_odds: boolean;
  starting_at_timestamp: number;
  participants?: SportmonksV3Participant[];
  league?: SportmonksV3League;
  scores?: SportmonksV3Score[];
  statistics?: SportmonksV3Statistic[];
}

// Mapped types for compatibility with existing components
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
  flag: string;
  season: number;
  round: string | null;
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

// Estatísticas mapeadas para GameStats
export interface FixtureStatistics {
  team_id: number;
  attacks: number;
  dangerous_attacks: number;
  possession: number;
  shots_total: number;
  shots_on_goal: number;
  corners: number;
  yellowcards: number;
  redcards: number;
  passes_accurate: number;
  passes_percentage: number;
  saves: number;
}

// Map Sportmonks V3 Fixture to our internal FootballMatch type
function mapV3FixtureToFootballMatch(fixture: SportmonksV3Fixture): FootballMatch {
  const participants = fixture.participants || [];
  
  // Find home and away based on participant order (first is home, second is away)
  // In Sportmonks v3, participants array is ordered [home, away]
  const homeParticipant = participants[0];
  const awayParticipant = participants[1];

  const scores = fixture.scores || [];
  const homeScore = scores.find(s => s.location === "home" && s.description === "CURRENT");
  const awayScore = scores.find(s => s.location === "away" && s.description === "CURRENT");
  const htHomeScore = scores.find(s => s.location === "home" && s.description === "1ST_HALF");
  const htAwayScore = scores.find(s => s.location === "away" && s.description === "1ST_HALF");

  // Map state_id to status
  const stateMap: Record<number, { long: string; short: string }> = {
    1: { long: "Not Started", short: "NS" },
    2: { long: "Live", short: "LIVE" },
    3: { long: "Finished", short: "FT" },
    4: { long: "Halftime", short: "HT" },
    5: { long: "Match Finished", short: "FT" },
  };
  const statusInfo = stateMap[fixture.state_id] || { long: "Unknown", short: "?" };

  return {
    fixture: {
      id: fixture.id,
      referee: null,
      timezone: "UTC",
      date: fixture.starting_at,
      timestamp: fixture.starting_at_timestamp,
      periods: { first: null, second: null },
      venue: {
        id: fixture.venue_id,
        name: "",
        city: "",
      },
      status: {
        long: statusInfo.long,
        short: statusInfo.short,
        elapsed: null,
      },
    },
    league: {
      id: fixture.league?.id || 0,
      name: fixture.league?.name || "",
      country: "",
      logo: fixture.league?.image_path || "",
      flag: "",
      season: fixture.season_id,
      round: null,
    },
    teams: {
      home: {
        id: homeParticipant?.id || 0,
        name: homeParticipant?.name || "Home Team",
        logo: homeParticipant?.image_path || "",
      },
      away: {
        id: awayParticipant?.id || 0,
        name: awayParticipant?.name || "Away Team",
        logo: awayParticipant?.image_path || "",
      },
    },
    goals: {
      home: homeScore?.score?.goals ?? null,
      away: awayScore?.score?.goals ?? null,
    },
    score: {
      halftime: {
        home: htHomeScore?.score?.goals ?? null,
        away: htAwayScore?.score?.goals ?? null,
      },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  };
}

// Map V3 statistics to FixtureStatistics
function mapV3StatisticsToFixtureStats(
  stats: SportmonksV3Statistic[],
  participantId: number
): FixtureStatistics {
  const teamStats = stats.filter(s => s.participant_id === participantId);

  const getStat = (typeId: number): number => {
    const stat = teamStats.find(s => s.type_id === typeId);
    return stat?.data?.value ?? 0;
  };

  return {
    team_id: participantId,
    attacks: getStat(83),  // Type ID for Attacks
    dangerous_attacks: getStat(84),  // Type ID for Dangerous Attacks
    possession: getStat(42),  // Ball Possession %
    shots_total: getStat(85),  // Total Shots
    shots_on_goal: getStat(86),  // Shots On Target
    corners: getStat(89),  // Corners
    yellowcards: getStat(82),  // Yellow Cards
    redcards: getStat(81),  // Red Cards
    passes_accurate: getStat(88),  // Accurate Passes (corrected from 80)
    passes_percentage: getStat(87),  // Pass Accuracy % (corrected from 80)
    saves: getStat(91),  // Goalkeeper Saves
  };
}

export const sportmonksService = {
  async getLiveFixtures(): Promise<FootballMatch[]> {
    try {
      console.log('🔄 [Sportmonks] Buscando partidas ao vivo...');
      
      const response = await axios.get<{ data: SportmonksV3Fixture[] }>(
        `/api/sportmonks/livescores/inplay`
      );

      const fixtures = response.data.data;
      console.log(`✅ [Sportmonks] ${fixtures.length} partidas ao vivo encontradas`);

      return fixtures.map(mapV3FixtureToFootballMatch);
    } catch (error) {
      console.error('❌ [Sportmonks] Erro ao buscar partidas ao vivo:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
      }
      return [];
    }
  },

  async getFixturesByDate(date: string): Promise<FootballMatch[]> {
    try {
      console.log(`🔄 [Sportmonks] Buscando partidas para ${date}...`);
      
      const response = await axios.get<{ data: SportmonksV3Fixture[] }>(
        `/api/sportmonks/fixtures/date/${date}`
      );

      const fixtures = response.data.data;
      console.log(`✅ [Sportmonks] ${fixtures.length} partidas encontradas para ${date}`);

      return fixtures.map(mapV3FixtureToFootballMatch);
    } catch (error) {
      console.error(`❌ [Sportmonks] Erro ao buscar partidas para ${date}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('❌ API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
      }
      return [];
    }
  },

  async getFixtureStatistics(fixtureId: number): Promise<FixtureStatistics[]> {
    try {
      console.log(`📊 [Sportmonks] Buscando estatísticas para fixture ${fixtureId}...`);
      
      const response = await axios.get<{ data: SportmonksV3Fixture }>(
        `/api/sportmonks/fixtures/${fixtureId}`
      );

      const fixture = response.data.data;
      const stats = fixture.statistics || [];
      const participants = fixture.participants || [];

      console.log(`✅ [Sportmonks] ${stats.length} estatísticas encontradas`);

      if (participants.length < 2) {
        console.warn('⚠️ Menos de 2 participantes encontrados');
        return [];
      }

      return [
        mapV3StatisticsToFixtureStats(stats, participants[0].id),
        mapV3StatisticsToFixtureStats(stats, participants[1].id),
      ];
    } catch (error) {
      console.error('❌ [Sportmonks] Erro ao buscar estatísticas:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ API Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          url: error.config?.url,
        });
        
        if (error.response?.status === 401) {
          console.error('❌ Autenticação falhou - verifique a API key');
        } else if (error.response?.status === 403) {
          console.error('❌ Acesso negado - dados não incluídos no seu plano');
        }
      }
      return [];
    }
  },
};
