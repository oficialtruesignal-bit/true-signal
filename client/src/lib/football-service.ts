import axios from "axios";

// API-Football v3 Types
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
  periods: { first: number | null; second: number | null };
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

// Statistics Types
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

// Pre-game Insights (last 5 matches + H2H)
export interface TeamAverages {
  goalsFor: string;
  goalsAgainst: string;
  corners: string; // Can be "-" when stats unavailable
  yellowCards: string; // Can be "-" when stats unavailable
  redCards: string; // Can be "-" when stats unavailable
  matchCount: number;
  statsCount?: number; // Number of matches with detailed stats
}

export interface PregameInsights {
  recentForm: {
    home: { matches: any[]; averages: TeamAverages | null };
    away: { matches: any[]; averages: TeamAverages | null };
  };
  headToHead: {
    matches: any[];
    home: { averages: TeamAverages | null };
    away: { averages: TeamAverages | null };
  };
}

// Team Season Statistics (for pre-game)
export interface TeamSeasonStats {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  league: {
    id: number;
    name: string;
    season: number;
  };
  fixtures: {
    played: { home: number; away: number; total: number };
    wins: { home: number; away: number; total: number };
    draws: { home: number; away: number; total: number };
    loses: { home: number; away: number; total: number };
  };
  goals: {
    for: {
      total: { home: number; away: number; total: number };
      average: { home: string; away: string; total: string };
    };
    against: {
      total: { home: number; away: number; total: number };
      average: { home: string; away: string; total: string };
    };
  };
  cards: {
    yellow: Record<string, { total: number | null; percentage: string | null }>;
    red: Record<string, { total: number | null; percentage: string | null }>;
  };
  form: string;
}

// API-Football Response Types
interface APIFootballResponse<T> {
  response: T;
}

interface APIFootballFixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: { first: number | null; second: number | null };
    venue: {
      id: number | null;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string | null;
  };
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

interface APIFootballStatistic {
  team: Team;
  statistics: Array<{
    type: string;
    value: number | string | null;
  }>;
}

// Helper function to extract stat value
function getStatValue(stats: Array<{type: string; value: number | string | null}>, type: string): number {
  const stat = stats.find(s => s.type === type);
  if (!stat || stat.value === null) return 0;
  
  // Handle percentage values (e.g., "52%")
  if (typeof stat.value === 'string' && stat.value.includes('%')) {
    return parseInt(stat.value.replace('%', ''));
  }
  
  return typeof stat.value === 'number' ? stat.value : parseInt(stat.value) || 0;
}

// Map API-Football statistics to our format
function mapAPIFootballStatistics(apiStats: APIFootballStatistic[]): FixtureStatistics[] {
  if (!apiStats || apiStats.length === 0) return [];

  return apiStats.map(teamStat => ({
    team_id: teamStat.team.id,
    attacks: getStatValue(teamStat.statistics, 'Total attacks'),
    dangerous_attacks: getStatValue(teamStat.statistics, 'Dangerous attacks'),
    possession: getStatValue(teamStat.statistics, 'Ball Possession'),
    shots_total: getStatValue(teamStat.statistics, 'Total Shots'),
    shots_on_goal: getStatValue(teamStat.statistics, 'Shots on Goal'),
    corners: getStatValue(teamStat.statistics, 'Corner Kicks'),
    yellowcards: getStatValue(teamStat.statistics, 'Yellow Cards'),
    redcards: getStatValue(teamStat.statistics, 'Red Cards'),
    passes_accurate: getStatValue(teamStat.statistics, 'Passes accurate'),
    passes_percentage: getStatValue(teamStat.statistics, 'Passes %'),
    saves: getStatValue(teamStat.statistics, 'Goalkeeper Saves'),
  }));
}

// Map API-Football fixture to our internal format
function mapAPIFootballFixture(apiFixture: APIFootballFixture): FootballMatch {
  return {
    fixture: {
      id: apiFixture.fixture.id,
      referee: apiFixture.fixture.referee,
      timezone: apiFixture.fixture.timezone,
      date: apiFixture.fixture.date,
      timestamp: apiFixture.fixture.timestamp,
      periods: apiFixture.fixture.periods,
      venue: apiFixture.fixture.venue,
      status: apiFixture.fixture.status,
    },
    league: apiFixture.league,
    teams: apiFixture.teams,
    goals: apiFixture.goals,
    score: apiFixture.score,
  };
}

// Football Service
export const footballService = {
  async getLiveFixtures(): Promise<FootballMatch[]> {
    try {
      console.log('🔄 [API-Football] Fetching live fixtures...');
      
      const response = await axios.get<APIFootballResponse<APIFootballFixture[]>>(
        '/api/football/fixtures/live'
      );

      const fixtures = response.data.response || [];
      console.log(`✅ [API-Football] ${fixtures.length} live fixtures found`);

      return fixtures.map(mapAPIFootballFixture);
    } catch (error) {
      console.error('❌ [API-Football] Error fetching live fixtures:', error);
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
      console.log(`🔄 [API-Football] Fetching fixtures for ${date}...`);
      
      const response = await axios.get<APIFootballResponse<APIFootballFixture[]>>(
        `/api/football/fixtures/date/${date}`
      );

      const fixtures = response.data.response || [];
      console.log(`✅ [API-Football] ${fixtures.length} fixtures found for ${date}`);

      return fixtures.map(mapAPIFootballFixture);
    } catch (error) {
      console.error(`❌ [API-Football] Error fetching fixtures for ${date}:`, error);
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
      console.log(`📊 [API-Football] Fetching statistics for fixture ${fixtureId}...`);
      
      const response = await axios.get<APIFootballResponse<APIFootballStatistic[]>>(
        `/api/football/fixtures/statistics/${fixtureId}`
      );

      const stats = response.data.response || [];
      console.log(`✅ [API-Football] ${stats.length} team statistics found`);

      return mapAPIFootballStatistics(stats);
    } catch (error) {
      console.error('❌ [API-Football] Error fetching statistics:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          url: error.config?.url,
        });
        
        if (error.response?.status === 401) {
          console.error('❌ Authentication failed - check API key');
        } else if (error.response?.status === 403) {
          console.error('❌ Access denied - check subscription plan');
        } else if (error.response?.status === 429) {
          console.error('❌ Rate limit exceeded - wait before retrying');
        }
      }
      return [];
    }
  },

  async getTeamStatistics(teamId: number, leagueId: number, season: number): Promise<TeamSeasonStats | null> {
    try {
      console.log(`📊 [API-Football] Fetching team statistics for team ${teamId}...`);
      
      const response = await axios.get<APIFootballResponse<TeamSeasonStats>>(
        `/api/football/teams/statistics`,
        { params: { team: teamId, league: leagueId, season } }
      );

      const stats = response.data.response;
      console.log(`✅ [API-Football] Team statistics found`);

      return stats || null;
    } catch (error) {
      console.error('❌ [API-Football] Error fetching team statistics:', error);
      return null;
    }
  },

  async getPregameInsights(homeTeamId: number, awayTeamId: number, leagueId: number, season: number): Promise<PregameInsights | null> {
    try {
      console.log(`📊 [API-Football] Fetching pregame insights for ${homeTeamId} vs ${awayTeamId}...`);
      
      const response = await axios.get<PregameInsights>(
        `/api/football/pregame-insights`,
        { params: { homeTeamId, awayTeamId, league: leagueId, season } }
      );

      console.log(`✅ [API-Football] Pregame insights found`);
      return response.data || null;
    } catch (error) {
      console.error('❌ [API-Football] Error fetching pregame insights:', error);
      return null;
    }
  },
};
