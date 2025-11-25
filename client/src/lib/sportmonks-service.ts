import axios from "axios";

const SPORTMONKS_API_KEY = import.meta.env.VITE_SPORTMONKS_API_KEY;
const SPORTMONKS_BASE_URL = "https://soccer.sportmonks.com/api/v2.0";

// Sportmonks Native Types
export interface SportmonksTeam {
  id: number;
  name: string;
  logo_path?: string;
}

export interface SportmonksLeague {
  id: number;
  name: string;
  logo_path?: string;
}

export interface SportmonksFixtureTime {
  status: string;
  starting_at: {
    date_time: string;
    timestamp: number;
  };
  minute: number | null;
}

export interface SportmonksStats {
  team_id: number;
  fixture_id: number;
  shots?: {
    total: number;
    ongoal: number;
    blocked?: number;
    offgoal?: number;
    insidebox: number;
    outsidebox: number;
  };
  passes?: {
    total: number;
    accurate: number;
    percentage: number;
  };
  attacks?: {
    attacks: number;
    dangerous_attacks: number;
  };
  fouls?: number;
  corners?: number;
  offsides?: number;
  possessiontime?: number;
  yellowcards?: number;
  redcards?: number;
  saves?: number;
}

export interface SportmonksFixture {
  id: number;
  league_id: number;
  localteam_id: number;
  visitorteam_id: number;
  time: SportmonksFixtureTime;
  scores: {
    localteam_score: number;
    visitorteam_score: number;
    ht_score?: string;
    ft_score?: string;
  };
  localTeam?: { data: SportmonksTeam };
  visitorTeam?: { data: SportmonksTeam };
  league?: { data: SportmonksLeague };
  stats?: { data: SportmonksStats[] };
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
  team_id: number;
  attacks: number;
  dangerous_attacks: number;
  possession: number;
  shots_total: number;
  shots_on_goal: number;
  shots_insidebox: number;
  corners: number;
  yellowcards: number;
  redcards: number;
  fouls: number;
  passes_total: number;
  passes_accurate: number;
  passes_percentage: number;
  saves: number;
}

// Map Sportmonks fixture to our FootballMatch format
function mapSportmonksToMatch(fixture: SportmonksFixture): FootballMatch {
  const statusMap: Record<string, { long: string; short: string }> = {
    'LIVE': { long: 'In Play', short: 'LIVE' },
    'HT': { long: 'Halftime', short: 'HT' },
    'FT': { long: 'Match Finished', short: 'FT' },
    'NS': { long: 'Not Started', short: 'NS' },
  };

  const status = statusMap[fixture.time.status] || { long: 'Unknown', short: fixture.time.status };

  const htScores = fixture.scores.ht_score?.split('-') || [null, null];

  return {
    fixture: {
      id: fixture.id,
      referee: null,
      timezone: 'UTC',
      date: fixture.time.starting_at.date_time,
      timestamp: fixture.time.starting_at.timestamp,
      periods: { first: null, second: null },
      venue: { id: null, name: '', city: '' },
      status: {
        long: status.long,
        short: status.short,
        elapsed: fixture.time.minute,
      },
    },
    league: {
      id: fixture.league_id,
      name: fixture.league?.data?.name || '',
      country: '',
      logo: fixture.league?.data?.logo_path || '',
      flag: null,
      season: 2024,
      round: '',
    },
    teams: {
      home: {
        id: fixture.localteam_id,
        name: fixture.localTeam?.data?.name || '',
        logo: fixture.localTeam?.data?.logo_path || '',
      },
      away: {
        id: fixture.visitorteam_id,
        name: fixture.visitorTeam?.data?.name || '',
        logo: fixture.visitorTeam?.data?.logo_path || '',
      },
    },
    goals: {
      home: fixture.scores.localteam_score,
      away: fixture.scores.visitorteam_score,
    },
    score: {
      halftime: {
        home: htScores[0] ? parseInt(htScores[0]) : null,
        away: htScores[1] ? parseInt(htScores[1]) : null,
      },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  };
}

// Map Sportmonks stats to our format
function mapSportmonksStats(statsData: SportmonksStats[]): FixtureStatistics[] {
  return statsData.map(stat => ({
    team_id: stat.team_id,
    attacks: stat.attacks?.attacks || 0,
    dangerous_attacks: stat.attacks?.dangerous_attacks || 0,
    possession: stat.possessiontime || 0,
    shots_total: stat.shots?.total || 0,
    shots_on_goal: stat.shots?.ongoal || 0,
    shots_insidebox: stat.shots?.insidebox || 0,
    corners: stat.corners || 0,
    yellowcards: stat.yellowcards || 0,
    redcards: stat.redcards || 0,
    fouls: stat.fouls || 0,
    passes_total: stat.passes?.total || 0,
    passes_accurate: stat.passes?.accurate || 0,
    passes_percentage: stat.passes?.percentage || 0,
    saves: stat.saves || 0,
  }));
}

export const sportmonksService = {
  getLiveFixtures: async (): Promise<FootballMatch[]> => {
    console.log('🔄 [Sportmonks] Buscando partidas ao vivo...');
    
    if (!SPORTMONKS_API_KEY) {
      console.warn('No SPORTMONKS_API_KEY found.');
      return [];
    }

    try {
      const response = await axios.get(`${SPORTMONKS_BASE_URL}/livescores/now`, {
        params: {
          api_token: SPORTMONKS_API_KEY,
          include: 'localTeam,visitorTeam,league,stats',
        },
      });

      const fixtures: SportmonksFixture[] = response.data.data || [];
      console.log(`✅ [Sportmonks] ${fixtures.length} partidas ao vivo encontradas`);

      return fixtures.map(mapSportmonksToMatch);
    } catch (error) {
      console.error('❌ [Sportmonks] Erro ao buscar partidas:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
      }
      return [];
    }
  },

  getFixturesByDate: async (date: string): Promise<FootballMatch[]> => {
    console.log(`🔄 [Sportmonks] Buscando partidas para ${date}...`);
    
    if (!SPORTMONKS_API_KEY) {
      console.warn('No SPORTMONKS_API_KEY found.');
      return [];
    }

    try {
      const response = await axios.get(`${SPORTMONKS_BASE_URL}/fixtures/date/${date}`, {
        params: {
          api_token: SPORTMONKS_API_KEY,
          include: 'localTeam,visitorTeam,league',
        },
      });

      const fixtures: SportmonksFixture[] = response.data.data || [];
      console.log(`✅ [Sportmonks] ${fixtures.length} partidas encontradas para ${date}`);

      return fixtures.map(mapSportmonksToMatch);
    } catch (error) {
      console.error('❌ [Sportmonks] Erro ao buscar partidas por data:', error);
      return [];
    }
  },

  getFixtureStatistics: async (fixtureId: number): Promise<FixtureStatistics[]> => {
    console.log(`🔄 [Sportmonks] Buscando estatísticas para fixture ${fixtureId}...`);
    
    if (!SPORTMONKS_API_KEY) {
      console.warn('No SPORTMONKS_API_KEY found.');
      return [];
    }

    try {
      const response = await axios.get(`${SPORTMONKS_BASE_URL}/fixtures/${fixtureId}`, {
        params: {
          api_token: SPORTMONKS_API_KEY,
          include: 'stats',
        },
      });

      const fixture: SportmonksFixture = response.data.data;
      const statsData = fixture.stats?.data || [];
      
      console.log(`✅ [Sportmonks] Estatísticas recebidas:`, {
        fixture: fixtureId,
        teams: statsData.length,
        stats: statsData.map(s => ({
          team: s.team_id,
          attacks: s.attacks?.attacks,
          dangerous: s.attacks?.dangerous_attacks,
          possession: s.possessiontime,
        })),
      });

      return mapSportmonksStats(statsData);
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
