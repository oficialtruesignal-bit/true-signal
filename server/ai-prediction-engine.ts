import axios from 'axios';
import { db } from './db';
import { teamMatchStats, aiTickets, aiAnalysisCache } from '@shared/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { validateComboLegs } from './combo-utils';

const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;
const API_BASE_URL = 'https://v3.football.api-sports.io';

interface FixtureData {
  fixture: {
    id: number;
    date: string;
    timestamp: number;
    status: { short: string };
  };
  league: {
    id: number;
    name: string;
    season: number;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
  };
}

interface TeamStats {
  teamId: string;
  teamName: string;
  teamLogo: string;
  leagueId: string;
  leagueName: string;
  season: string;
  matchesAnalyzed: number;
  goalsScored: number;
  goalsConceded: number;
  goalsScoredHome: number;
  goalsConcededHome: number;
  goalsScoredAway: number;
  goalsConcededAway: number;
  over05Pct: number;
  over15Pct: number;
  over25Pct: number;
  over35Pct: number;
  bttsPct: number;
  cleanSheetPct: number;
  failedToScorePct: number;
  goalsFirstHalf: number;
  goalsConcededFirstHalf: number;
  formWins: number;
  formDraws: number;
  formLosses: number;
  formPoints: number;
  avgCorners: number;
  avgCornersHT: number;
  avgCards: number;
  avgCardsHT: number;
  avgShotsOnTarget: number;
  avgShotsOnTargetHT: number;
  avgTotalShots: number;
  avgFouls: number;
  avgOffsides: number;
  cornersOver45Pct: number;
  cornersOver55Pct: number;
  cornersOver65Pct: number;
  cornersOver85Pct: number;
  cardsOver15Pct: number;
  cardsOver25Pct: number;
  cardsOver35Pct: number;
  shotsOnTargetOver25Pct: number;
  shotsOnTargetOver35Pct: number;
  shotsOnTargetOver45Pct: number;
  bothTeamsCardPct: number;
  goalsFirstHalfOver05Pct: number;
  goalsFirstHalfOver15Pct: number;
  sourceFixtureIds: string[];
}

interface FixtureStatistics {
  fixtureId: number;
  homeStats: {
    shotsOnGoal: number;
    shotsOffGoal: number;
    totalShots: number;
    corners: number;
    fouls: number;
    yellowCards: number;
    redCards: number;
    offsides: number;
  };
  awayStats: {
    shotsOnGoal: number;
    shotsOffGoal: number;
    totalShots: number;
    corners: number;
    fouls: number;
    yellowCards: number;
    redCards: number;
    offsides: number;
  };
}

interface PredictionResult {
  market: string;
  predictedOutcome: string;
  probability: number;
  confidence: number;
  suggestedOdd: number;
  suggestedStake: number;
  rationale: string[];
}

class AIPredictionEngine {
  private apiHeaders = { 'x-apisports-key': FOOTBALL_API_KEY };
  
  async getCachedData(cacheKey: string): Promise<any | null> {
    try {
      const cached = await db.select()
        .from(aiAnalysisCache)
        .where(and(
          eq(aiAnalysisCache.cacheKey, cacheKey),
          gte(aiAnalysisCache.expiresAt, new Date())
        ))
        .limit(1);
      
      if (cached.length > 0) {
        return JSON.parse(cached[0].data);
      }
      return null;
    } catch (error) {
      console.error('[AI Engine] Cache read error:', error);
      return null;
    }
  }

  async setCachedData(cacheKey: string, cacheType: string, data: any, hoursToExpire: number = 6): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + hoursToExpire * 60 * 60 * 1000);
      
      await db.insert(aiAnalysisCache)
        .values({
          cacheKey,
          cacheType: cacheType as any,
          data: JSON.stringify(data),
          expiresAt,
        })
        .onConflictDoUpdate({
          target: aiAnalysisCache.cacheKey,
          set: {
            data: JSON.stringify(data),
            expiresAt,
          }
        });
    } catch (error) {
      console.error('[AI Engine] Cache write error:', error);
    }
  }

  // Fetch Bet365 odds for a fixture
  async fetchBet365Odds(fixtureId: number): Promise<Record<string, Record<string, number>> | null> {
    const cacheKey = `bet365_odds_${fixtureId}`;
    const cached = await this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${API_BASE_URL}/odds`, {
        params: {
          fixture: fixtureId,
          bookmaker: 8 // Bet365 ID
        },
        headers: this.apiHeaders
      });

      const oddsData = response.data.response?.[0];
      if (!oddsData) return null;

      const bet365 = oddsData.bookmakers?.find((b: any) => b.id === 8) || oddsData.bookmakers?.[0];
      if (!bet365) return null;

      const markets: Record<string, Record<string, number>> = {};
      bet365.bets?.forEach((bet: any) => {
        const marketName = bet.name;
        const values: Record<string, number> = {};
        bet.values?.forEach((v: any) => {
          values[v.value] = parseFloat(v.odd);
        });
        markets[marketName] = values;
      });

      // Cache for 2 hours (odds change frequently)
      await this.setCachedData(cacheKey, 'odds', markets, 2);
      console.log(`[AI Engine] Fetched Bet365 odds for fixture ${fixtureId}:`);
      console.log(`[AI Engine] Available markets:`, JSON.stringify(markets, null, 2));
      return markets;
    } catch (error) {
      console.error(`[AI Engine] Failed to fetch Bet365 odds for fixture ${fixtureId}:`, error);
      return null;
    }
  }

  // Get Bet365 odd for a specific market (handles dynamic lines like Over X.5)
  getBet365OddForMarket(odds: Record<string, Record<string, number>> | null, market: string, outcome: string): number | null {
    if (!odds) return null;

    // Parse dynamic market names to extract the line and market type
    // Examples: "Over 2.5 Gols FT", "Over 6.5 Escanteios FT", "Over 3.5 Cartões FT"
    
    // Goals markets
    const goalsMatch = market.match(/Over (\d+\.?\d*) Gols (FT|HT|1T)/i);
    if (goalsMatch) {
      const line = goalsMatch[1];
      const period = goalsMatch[2].toUpperCase();
      const bet365Name = period === 'FT' ? 'Goals Over/Under' : 'Goals Over/Under First Half';
      const bet365Market = odds[bet365Name];
      if (bet365Market) {
        return bet365Market[`Over ${line}`] || null;
      }
    }
    
    // BTTS market
    if (market.includes('BTTS') || market.includes('Ambas Marcam')) {
      const bet365Market = odds['Both Teams Score'];
      if (bet365Market) {
        return bet365Market['Yes'] || null;
      }
    }
    
    // Corners markets
    const cornersMatch = market.match(/Over (\d+\.?\d*) Escanteios/i);
    if (cornersMatch) {
      const line = cornersMatch[1];
      const bet365Market = odds['Total Corners'] || odds['Corners Over/Under'];
      if (bet365Market) {
        return bet365Market[`Over ${line}`] || null;
      }
    }
    
    // Cards markets
    const cardsMatch = market.match(/Over (\d+\.?\d*) Cart/i);
    if (cardsMatch) {
      const line = cardsMatch[1];
      const bet365Market = odds['Total Cards'] || odds['Cards Over/Under'];
      if (bet365Market) {
        return bet365Market[`Over ${line}`] || null;
      }
    }
    
    // Shots on target
    const shotsMatch = market.match(/Over (\d+\.?\d*) Chutes/i);
    if (shotsMatch) {
      const line = shotsMatch[1];
      const bet365Market = odds['Shots on Target'] || odds['Total Shots'];
      if (bet365Market) {
        return bet365Market[`Over ${line}`] || null;
      }
    }
    
    // Match result (1X2)
    if (market.includes('Vitória')) {
      const bet365Market = odds['Match Winner'] || odds['1X2'];
      if (bet365Market) {
        if (market.includes('Casa') || outcome.includes('Home')) {
          return bet365Market['Home'] || bet365Market['1'] || null;
        }
        if (market.includes('Fora') || outcome.includes('Away')) {
          return bet365Market['Away'] || bet365Market['2'] || null;
        }
      }
    }
    
    return null;
  }

  async fetchTeamLastMatches(teamId: number, season: number = 2024): Promise<FixtureData[]> {
    const cacheKey = `team_fixtures_${teamId}_${season}`;
    const cached = await this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${API_BASE_URL}/fixtures`, {
        params: {
          team: teamId,
          season,
          last: 10,
          status: 'FT'
        },
        headers: this.apiHeaders
      });

      const fixtures = response.data?.response || [];
      await this.setCachedData(cacheKey, 'team_fixtures', fixtures);
      return fixtures;
    } catch (error: any) {
      console.error(`[AI Engine] Error fetching last matches for team ${teamId}:`, error.message);
      return [];
    }
  }

  async fetchH2H(homeTeamId: number, awayTeamId: number): Promise<FixtureData[]> {
    const cacheKey = `h2h_${homeTeamId}_${awayTeamId}`;
    const cached = await this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${API_BASE_URL}/fixtures/headtohead`, {
        params: {
          h2h: `${homeTeamId}-${awayTeamId}`,
          last: 10
        },
        headers: this.apiHeaders
      });

      const fixtures = response.data?.response || [];
      await this.setCachedData(cacheKey, 'h2h', fixtures);
      return fixtures;
    } catch (error: any) {
      console.error(`[AI Engine] Error fetching H2H for ${homeTeamId} vs ${awayTeamId}:`, error.message);
      return [];
    }
  }

  async fetchFixtureStatistics(fixtureId: number): Promise<FixtureStatistics | null> {
    const cacheKey = `fixture_stats_${fixtureId}`;
    const cached = await this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${API_BASE_URL}/fixtures/statistics`, {
        params: { fixture: fixtureId },
        headers: this.apiHeaders
      });

      const stats = response.data?.response || [];
      if (stats.length < 2) return null;

      const parseStatValue = (statArray: any[], type: string): number => {
        const stat = statArray.find((s: any) => s.type === type);
        if (!stat) return 0;
        const value = stat.value;
        if (value === null || value === undefined) return 0;
        if (typeof value === 'string') {
          return parseInt(value.replace('%', '')) || 0;
        }
        return value;
      };

      const homeTeamStats = stats[0]?.statistics || [];
      const awayTeamStats = stats[1]?.statistics || [];

      const result: FixtureStatistics = {
        fixtureId,
        homeStats: {
          shotsOnGoal: parseStatValue(homeTeamStats, 'Shots on Goal'),
          shotsOffGoal: parseStatValue(homeTeamStats, 'Shots off Goal'),
          totalShots: parseStatValue(homeTeamStats, 'Total Shots'),
          corners: parseStatValue(homeTeamStats, 'Corner Kicks'),
          fouls: parseStatValue(homeTeamStats, 'Fouls'),
          yellowCards: parseStatValue(homeTeamStats, 'Yellow Cards'),
          redCards: parseStatValue(homeTeamStats, 'Red Cards'),
          offsides: parseStatValue(homeTeamStats, 'Offsides')
        },
        awayStats: {
          shotsOnGoal: parseStatValue(awayTeamStats, 'Shots on Goal'),
          shotsOffGoal: parseStatValue(awayTeamStats, 'Shots off Goal'),
          totalShots: parseStatValue(awayTeamStats, 'Total Shots'),
          corners: parseStatValue(awayTeamStats, 'Corner Kicks'),
          fouls: parseStatValue(awayTeamStats, 'Fouls'),
          yellowCards: parseStatValue(awayTeamStats, 'Yellow Cards'),
          redCards: parseStatValue(awayTeamStats, 'Red Cards'),
          offsides: parseStatValue(awayTeamStats, 'Offsides')
        }
      };

      await this.setCachedData(cacheKey, 'fixture_statistics', result);
      return result;
    } catch (error: any) {
      console.error(`[AI Engine] Error fetching statistics for fixture ${fixtureId}:`, error.message);
      return null;
    }
  }

  async fetchMultipleFixtureStatistics(fixtureIds: number[]): Promise<Map<number, FixtureStatistics>> {
    const statsMap = new Map<number, FixtureStatistics>();
    
    for (const fixtureId of fixtureIds) {
      const stats = await this.fetchFixtureStatistics(fixtureId);
      if (stats) {
        statsMap.set(fixtureId, stats);
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return statsMap;
  }

  calculateTeamStats(
    fixtures: FixtureData[], 
    teamId: number,
    fixtureStatsMap?: Map<number, FixtureStatistics>
  ): TeamStats {
    let totalGoalsScored = 0;
    let totalGoalsConceded = 0;
    let homeGoalsScored = 0;
    let homeGoalsConceded = 0;
    let awayGoalsScored = 0;
    let awayGoalsConceded = 0;
    let over05 = 0, over15 = 0, over25 = 0, over35 = 0;
    let bttsCount = 0;
    let cleanSheets = 0;
    let failedToScore = 0;
    let firstHalfGoals = 0;
    let firstHalfConceded = 0;
    let firstHalfOver05 = 0, firstHalfOver15 = 0;
    let wins = 0, draws = 0, losses = 0;
    
    let totalCorners = 0, totalCornersHT = 0;
    let totalCards = 0, totalCardsHT = 0;
    let totalShotsOnTarget = 0, totalShotsOnTargetHT = 0;
    let totalShots = 0;
    let totalFouls = 0, totalOffsides = 0;
    let cornersOver45 = 0, cornersOver55 = 0, cornersOver65 = 0, cornersOver85 = 0;
    let cardsOver15 = 0, cardsOver25 = 0, cardsOver35 = 0;
    let shotsOnTargetOver25 = 0, shotsOnTargetOver35 = 0, shotsOnTargetOver45 = 0;
    let bothTeamsCard = 0;
    let matchesWithStats = 0;
    
    const fixtureIds: string[] = [];
    
    let teamName = '';
    let teamLogo = '';
    let leagueId = '';
    let leagueName = '';
    let season = '';
    let homeGames = 0;
    let awayGames = 0;

    for (const match of fixtures) {
      const isHome = match.teams.home.id === teamId;
      const homeGoals = match.goals.home ?? 0;
      const awayGoals = match.goals.away ?? 0;
      const totalGoals = homeGoals + awayGoals;
      
      if (!teamName) {
        teamName = isHome ? match.teams.home.name : match.teams.away.name;
        teamLogo = isHome ? match.teams.home.logo : match.teams.away.logo;
        leagueId = String(match.league.id);
        leagueName = match.league.name;
        season = String(match.league.season);
      }
      
      fixtureIds.push(String(match.fixture.id));
      
      const scored = isHome ? homeGoals : awayGoals;
      const conceded = isHome ? awayGoals : homeGoals;
      
      totalGoalsScored += scored;
      totalGoalsConceded += conceded;
      
      if (isHome) {
        homeGoalsScored += scored;
        homeGoalsConceded += conceded;
        homeGames++;
      } else {
        awayGoalsScored += scored;
        awayGoalsConceded += conceded;
        awayGames++;
      }
      
      if (totalGoals > 0.5) over05++;
      if (totalGoals > 1.5) over15++;
      if (totalGoals > 2.5) over25++;
      if (totalGoals > 3.5) over35++;
      
      if (homeGoals > 0 && awayGoals > 0) bttsCount++;
      if (conceded === 0) cleanSheets++;
      if (scored === 0) failedToScore++;
      
      const htHome = match.score.halftime?.home ?? 0;
      const htAway = match.score.halftime?.away ?? 0;
      const htTotal = htHome + htAway;
      firstHalfGoals += isHome ? htHome : htAway;
      firstHalfConceded += isHome ? htAway : htHome;
      if (htTotal > 0.5) firstHalfOver05++;
      if (htTotal > 1.5) firstHalfOver15++;
      
      if (scored > conceded) wins++;
      else if (scored === conceded) draws++;
      else losses++;
      
      const fixtureStats = fixtureStatsMap?.get(match.fixture.id);
      if (fixtureStats) {
        matchesWithStats++;
        const teamStatsData = isHome ? fixtureStats.homeStats : fixtureStats.awayStats;
        const opponentStatsData = isHome ? fixtureStats.awayStats : fixtureStats.homeStats;
        
        const teamCorners = teamStatsData.corners;
        const teamCardsCount = teamStatsData.yellowCards + teamStatsData.redCards;
        const teamShotsOnGoal = teamStatsData.shotsOnGoal;
        
        const matchCorners = teamStatsData.corners + opponentStatsData.corners;
        const matchCards = teamCardsCount + opponentStatsData.yellowCards + opponentStatsData.redCards;
        const matchShotsOnTarget = teamShotsOnGoal + opponentStatsData.shotsOnGoal;
        
        totalCorners += teamCorners;
        totalCornersHT += Math.round(teamCorners * 0.45);
        totalCards += teamCardsCount;
        totalCardsHT += Math.round(teamCardsCount * 0.35);
        totalShotsOnTarget += teamShotsOnGoal;
        totalShotsOnTargetHT += Math.round(teamShotsOnGoal * 0.45);
        totalShots += teamStatsData.totalShots;
        totalFouls += teamStatsData.fouls;
        totalOffsides += teamStatsData.offsides;
        
        if (matchCorners > 4.5) cornersOver45++;
        if (matchCorners > 5.5) cornersOver55++;
        if (matchCorners > 6.5) cornersOver65++;
        if (matchCorners > 8.5) cornersOver85++;
        
        if (matchCards > 1.5) cardsOver15++;
        if (matchCards > 2.5) cardsOver25++;
        if (matchCards > 3.5) cardsOver35++;
        
        if (matchShotsOnTarget > 2.5) shotsOnTargetOver25++;
        if (matchShotsOnTarget > 3.5) shotsOnTargetOver35++;
        if (matchShotsOnTarget > 4.5) shotsOnTargetOver45++;
        
        const opponentCards = opponentStatsData.yellowCards + opponentStatsData.redCards;
        if (teamCardsCount > 0 && opponentCards > 0) bothTeamsCard++;
      }
    }
    
    const matchCount = fixtures.length || 1;
    const statsCount = matchesWithStats || 1;
    
    return {
      teamId: String(teamId),
      teamName,
      teamLogo,
      leagueId,
      leagueName,
      season,
      matchesAnalyzed: matchCount,
      goalsScored: Number((totalGoalsScored / matchCount).toFixed(2)),
      goalsConceded: Number((totalGoalsConceded / matchCount).toFixed(2)),
      goalsScoredHome: homeGames ? Number((homeGoalsScored / homeGames).toFixed(2)) : 0,
      goalsConcededHome: homeGames ? Number((homeGoalsConceded / homeGames).toFixed(2)) : 0,
      goalsScoredAway: awayGames ? Number((awayGoalsScored / awayGames).toFixed(2)) : 0,
      goalsConcededAway: awayGames ? Number((awayGoalsConceded / awayGames).toFixed(2)) : 0,
      over05Pct: Number(((over05 / matchCount) * 100).toFixed(1)),
      over15Pct: Number(((over15 / matchCount) * 100).toFixed(1)),
      over25Pct: Number(((over25 / matchCount) * 100).toFixed(1)),
      over35Pct: Number(((over35 / matchCount) * 100).toFixed(1)),
      bttsPct: Number(((bttsCount / matchCount) * 100).toFixed(1)),
      cleanSheetPct: Number(((cleanSheets / matchCount) * 100).toFixed(1)),
      failedToScorePct: Number(((failedToScore / matchCount) * 100).toFixed(1)),
      goalsFirstHalf: Number((firstHalfGoals / matchCount).toFixed(2)),
      goalsConcededFirstHalf: Number((firstHalfConceded / matchCount).toFixed(2)),
      formWins: wins,
      formDraws: draws,
      formLosses: losses,
      formPoints: wins * 3 + draws,
      avgCorners: Number((totalCorners / statsCount).toFixed(2)),
      avgCornersHT: Number((totalCornersHT / statsCount).toFixed(2)),
      avgCards: Number((totalCards / statsCount).toFixed(2)),
      avgCardsHT: Number((totalCardsHT / statsCount).toFixed(2)),
      avgShotsOnTarget: Number((totalShotsOnTarget / statsCount).toFixed(2)),
      avgShotsOnTargetHT: Number((totalShotsOnTargetHT / statsCount).toFixed(2)),
      avgTotalShots: Number((totalShots / statsCount).toFixed(2)),
      avgFouls: Number((totalFouls / statsCount).toFixed(2)),
      avgOffsides: Number((totalOffsides / statsCount).toFixed(2)),
      cornersOver45Pct: Number(((cornersOver45 / statsCount) * 100).toFixed(1)),
      cornersOver55Pct: Number(((cornersOver55 / statsCount) * 100).toFixed(1)),
      cornersOver65Pct: Number(((cornersOver65 / statsCount) * 100).toFixed(1)),
      cornersOver85Pct: Number(((cornersOver85 / statsCount) * 100).toFixed(1)),
      cardsOver15Pct: Number(((cardsOver15 / statsCount) * 100).toFixed(1)),
      cardsOver25Pct: Number(((cardsOver25 / statsCount) * 100).toFixed(1)),
      cardsOver35Pct: Number(((cardsOver35 / statsCount) * 100).toFixed(1)),
      shotsOnTargetOver25Pct: Number(((shotsOnTargetOver25 / statsCount) * 100).toFixed(1)),
      shotsOnTargetOver35Pct: Number(((shotsOnTargetOver35 / statsCount) * 100).toFixed(1)),
      shotsOnTargetOver45Pct: Number(((shotsOnTargetOver45 / statsCount) * 100).toFixed(1)),
      bothTeamsCardPct: Number(((bothTeamsCard / statsCount) * 100).toFixed(1)),
      goalsFirstHalfOver05Pct: Number(((firstHalfOver05 / matchCount) * 100).toFixed(1)),
      goalsFirstHalfOver15Pct: Number(((firstHalfOver15 / matchCount) * 100).toFixed(1)),
      sourceFixtureIds: fixtureIds
    };
  }

  poissonProbability(lambda: number, k: number): number {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k);
  }

  factorial(n: number): number {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }

  calculateGoalProbabilities(homeExpected: number, awayExpected: number): {
    homeWin: number;
    draw: number;
    awayWin: number;
    over05: number;
    over15: number;
    over25: number;
    over35: number;
    btts: number;
  } {
    let homeWin = 0, draw = 0, awayWin = 0;
    let under05 = 0, under15 = 0, under25 = 0, under35 = 0;
    let btts = 0;

    for (let homeGoals = 0; homeGoals <= 10; homeGoals++) {
      for (let awayGoals = 0; awayGoals <= 10; awayGoals++) {
        const prob = this.poissonProbability(homeExpected, homeGoals) * 
                     this.poissonProbability(awayExpected, awayGoals);
        
        const totalGoals = homeGoals + awayGoals;
        
        if (homeGoals > awayGoals) homeWin += prob;
        else if (homeGoals === awayGoals) draw += prob;
        else awayWin += prob;
        
        if (totalGoals < 1) under05 += prob;
        if (totalGoals < 2) under15 += prob;
        if (totalGoals < 3) under25 += prob;
        if (totalGoals < 4) under35 += prob;
        
        if (homeGoals > 0 && awayGoals > 0) btts += prob;
      }
    }

    return {
      homeWin: homeWin * 100,
      draw: draw * 100,
      awayWin: awayWin * 100,
      over05: (1 - under05) * 100,
      over15: (1 - under15) * 100,
      over25: (1 - under25) * 100,
      over35: (1 - under35) * 100,
      btts: btts * 100
    };
  }

  generatePredictions(
    homeStats: TeamStats, 
    awayStats: TeamStats,
    h2hStats: { homeWins: number; draws: number; awayWins: number; avgGoals: number; avgCorners: number; avgCards: number } | null,
    bet365Odds: Record<string, Record<string, number>> | null = null
  ): PredictionResult[] {
    const predictions: PredictionResult[] = [];
    const CONFIDENCE_THRESHOLD = 80;
    const MIN_EV_THRESHOLD = 0; // Só aceitar EV >= 0 (positivo ou neutro)
    const SAFETY_MARGIN_SHOTS = 0.60;
    const SAFETY_MARGIN_CORNERS = 0.55;
    const SAFETY_MARGIN_CARDS = 0.50;
    const SAFETY_MARGIN_GOALS = 0.65;
    
    // Helper para calcular EV real
    const calculateEV = (probability: number, odd: number): number => {
      // EV = (probability * odd) - 1  (em formato decimal: 0.05 = 5%)
      return ((probability / 100) * odd - 1) * 100;
    };
    
    // Helper para obter odd da Bet365 ou calcular a "justa"
    const getOddForMarket = (market: string, outcome: string, fairOdd: number): { odd: number; source: 'bet365' | 'calculated' } => {
      if (bet365Odds) {
        const bet365Odd = this.getBet365OddForMarket(bet365Odds, market, outcome);
        if (bet365Odd && bet365Odd >= 1.10) {
          return { odd: bet365Odd, source: 'bet365' };
        }
      }
      return { odd: fairOdd, source: 'calculated' };
    };
    
    const homeExpectedGoals = (homeStats.goalsScoredHome + awayStats.goalsConcededAway) / 2;
    const awayExpectedGoals = (awayStats.goalsScoredAway + homeStats.goalsConcededHome) / 2;
    const totalExpectedGoals = homeExpectedGoals + awayExpectedGoals;
    
    const poissonProbs = this.calculateGoalProbabilities(homeExpectedGoals, awayExpectedGoals);
    
    const historicalOver25 = (homeStats.over25Pct + awayStats.over25Pct) / 2;
    const historicalBtts = (homeStats.bttsPct + awayStats.bttsPct) / 2;
    
    const combinedOver25 = (poissonProbs.over25 * 0.6) + (historicalOver25 * 0.4);
    const combinedOver15 = (poissonProbs.over15 * 0.6) + ((homeStats.over15Pct + awayStats.over15Pct) / 2 * 0.4);
    const combinedBtts = (poissonProbs.btts * 0.6) + (historicalBtts * 0.4);
    
    let h2hBonus = 0;
    if (h2hStats && h2hStats.avgGoals > 2.5) h2hBonus = 5;

    if (totalExpectedGoals >= 2.5 && combinedOver15 >= CONFIDENCE_THRESHOLD) {
      predictions.push({
        market: 'Over 0.5 Gols FT',
        predictedOutcome: 'Pelo menos 1 gol na partida',
        probability: poissonProbs.over05,
        confidence: Math.min(95, poissonProbs.over05),
        suggestedOdd: 1.05,
        suggestedStake: 3,
        rationale: [
          `Média de gols esperados: ${totalExpectedGoals.toFixed(2)}`,
          `Probabilidade matemática: ${poissonProbs.over05.toFixed(1)}%`,
          `${homeStats.teamName} + ${awayStats.teamName} somam média de ${(homeStats.goalsScored + awayStats.goalsScored).toFixed(2)} gols`
        ]
      });
    }
    
    if (combinedOver15 >= CONFIDENCE_THRESHOLD) {
      const fairOdd = Number((100 / combinedOver15).toFixed(2));
      const oddInfo = getOddForMarket('Over 1.5 Gols FT', 'Over 1.5', fairOdd);
      const ev = calculateEV(combinedOver15, oddInfo.odd);
      
      if (ev >= MIN_EV_THRESHOLD) {
        predictions.push({
          market: 'Over 1.5 Gols FT',
          predictedOutcome: 'Pelo menos 2 gols na partida',
          probability: combinedOver15,
          confidence: Math.min(95, combinedOver15),
          suggestedOdd: oddInfo.odd,
          suggestedStake: 2,
          rationale: [
            `Média de gols esperados: ${totalExpectedGoals.toFixed(2)}`,
            `${homeStats.teamName} Over 1.5: ${homeStats.over15Pct}%`,
            `${awayStats.teamName} Over 1.5: ${awayStats.over15Pct}%`,
            `Probabilidade: ${combinedOver15.toFixed(1)}%`,
            oddInfo.source === 'bet365' ? `Odd Bet365: ${oddInfo.odd} | EV: ${ev > 0 ? '+' : ''}${ev.toFixed(1)}%` : `Odd calculada: ${oddInfo.odd}`
          ]
        });
      }
    }
    
    if (combinedOver25 + h2hBonus >= CONFIDENCE_THRESHOLD) {
      const fairOdd = Number((100 / combinedOver25).toFixed(2));
      const oddInfo = getOddForMarket('Over 2.5 Gols FT', 'Over 2.5', fairOdd);
      const ev = calculateEV(combinedOver25, oddInfo.odd);
      
      if (ev >= MIN_EV_THRESHOLD) {
        predictions.push({
          market: 'Over 2.5 Gols FT',
          predictedOutcome: 'Pelo menos 3 gols na partida',
          probability: combinedOver25,
          confidence: Math.min(95, combinedOver25 + h2hBonus),
          suggestedOdd: oddInfo.odd,
          suggestedStake: 2,
          rationale: [
            `Média de gols esperados: ${totalExpectedGoals.toFixed(2)}`,
            `${homeStats.teamName} marca ${homeStats.goalsScoredHome.toFixed(2)} gols em casa`,
            `${awayStats.teamName} sofre ${awayStats.goalsConcededAway.toFixed(2)} gols fora`,
            `Histórico Over 2.5: ${historicalOver25.toFixed(1)}%`,
            h2hBonus > 0 ? `H2H: média de ${h2hStats?.avgGoals.toFixed(2)} gols` : '',
            oddInfo.source === 'bet365' ? `Odd Bet365: ${oddInfo.odd} | EV: ${ev > 0 ? '+' : ''}${ev.toFixed(1)}%` : `Odd calculada: ${oddInfo.odd}`
          ].filter(Boolean)
        });
      }
    }
    
    const htGoalsProbability = (homeStats.goalsFirstHalfOver05Pct + awayStats.goalsFirstHalfOver05Pct) / 2;
    if (htGoalsProbability >= CONFIDENCE_THRESHOLD) {
      const fairOdd = Number((100 / htGoalsProbability).toFixed(2));
      const oddInfo = getOddForMarket('Over 0.5 Gols 1T', 'Over 0.5', fairOdd);
      const ev = calculateEV(htGoalsProbability, oddInfo.odd);
      
      if (ev >= MIN_EV_THRESHOLD) {
        predictions.push({
          market: 'Over 0.5 Gols HT',
          predictedOutcome: 'Pelo menos 1 gol no 1º tempo',
          probability: htGoalsProbability,
          confidence: Math.min(95, htGoalsProbability),
          suggestedOdd: oddInfo.odd,
          suggestedStake: 2,
          rationale: [
            `${homeStats.teamName} gols 1ºT: ${homeStats.goalsFirstHalf.toFixed(2)} média`,
            `${awayStats.teamName} gols 1ºT: ${awayStats.goalsFirstHalf.toFixed(2)} média`,
            `Probabilidade: ${htGoalsProbability.toFixed(1)}%`,
            oddInfo.source === 'bet365' ? `Odd Bet365: ${oddInfo.odd} | EV: ${ev > 0 ? '+' : ''}${ev.toFixed(1)}%` : `Odd calculada: ${oddInfo.odd}`
          ]
        });
      }
    }
    
    if (combinedBtts >= CONFIDENCE_THRESHOLD) {
      const fairOdd = Number((100 / combinedBtts).toFixed(2));
      const oddInfo = getOddForMarket('Ambas Marcam', 'Yes', fairOdd);
      const ev = calculateEV(combinedBtts, oddInfo.odd);
      
      if (ev >= MIN_EV_THRESHOLD) {
        predictions.push({
          market: 'Ambas Marcam FT',
          predictedOutcome: 'Sim - Ambos times marcam',
          probability: combinedBtts,
          confidence: Math.min(95, combinedBtts),
          suggestedOdd: oddInfo.odd,
          suggestedStake: 2,
          rationale: [
            `${homeStats.teamName} BTTS: ${homeStats.bttsPct}%`,
            `${awayStats.teamName} BTTS: ${awayStats.bttsPct}%`,
            `Probabilidade Poisson BTTS: ${poissonProbs.btts.toFixed(1)}%`,
            `${homeStats.teamName} falha em marcar: ${homeStats.failedToScorePct}%`,
            oddInfo.source === 'bet365' ? `Odd Bet365: ${oddInfo.odd} | EV: ${ev > 0 ? '+' : ''}${ev.toFixed(1)}%` : `Odd calculada: ${oddInfo.odd}`
          ]
        });
      }
    }

    const avgShotsOnTarget = homeStats.avgShotsOnTarget + awayStats.avgShotsOnTarget;
    if (avgShotsOnTarget >= 6) {
      const safeLine = Math.floor(avgShotsOnTarget * SAFETY_MARGIN_SHOTS) + 0.5;
      const historicalPct = (homeStats.shotsOnTargetOver35Pct + awayStats.shotsOnTargetOver35Pct) / 2;
      const marketName = `Over ${safeLine} Chutes ao Gol FT`;
      
      if (historicalPct >= CONFIDENCE_THRESHOLD && safeLine >= 3.5) {
        const fairOdd = Number((100 / historicalPct).toFixed(2));
        const oddInfo = getOddForMarket(marketName, `Over ${safeLine}`, fairOdd);
        const ev = calculateEV(historicalPct, oddInfo.odd);
        
        if (ev >= MIN_EV_THRESHOLD) {
          predictions.push({
            market: marketName,
            predictedOutcome: `Pelo menos ${Math.ceil(safeLine)} chutes ao gol`,
            probability: historicalPct,
            confidence: Math.min(95, historicalPct),
            suggestedOdd: oddInfo.odd,
            suggestedStake: 2,
            rationale: [
              `Média de chutes ao gol: ${avgShotsOnTarget.toFixed(1)}`,
              `${homeStats.teamName}: ${homeStats.avgShotsOnTarget.toFixed(1)} chutes/jogo`,
              `${awayStats.teamName}: ${awayStats.avgShotsOnTarget.toFixed(1)} chutes/jogo`,
              `Linha segura (-40%): ${safeLine}`,
              oddInfo.source === 'bet365' ? `Odd Bet365: ${oddInfo.odd} | EV: ${ev > 0 ? '+' : ''}${ev.toFixed(1)}%` : `Odd calculada: ${oddInfo.odd}`
            ]
          });
        }
      }
    }

    const avgCorners = homeStats.avgCorners + awayStats.avgCorners;
    if (avgCorners >= 8) {
      const safeLine = Math.floor(avgCorners * SAFETY_MARGIN_CORNERS) + 0.5;
      const historicalPct = (homeStats.cornersOver55Pct + awayStats.cornersOver55Pct) / 2;
      const marketName = `Over ${safeLine} Escanteios FT`;
      
      if (historicalPct >= CONFIDENCE_THRESHOLD && safeLine >= 4.5) {
        const fairOdd = Number((100 / historicalPct).toFixed(2));
        const oddInfo = getOddForMarket(marketName, `Over ${safeLine}`, fairOdd);
        const ev = calculateEV(historicalPct, oddInfo.odd);
        
        if (ev >= MIN_EV_THRESHOLD) {
          predictions.push({
            market: marketName,
            predictedOutcome: `Pelo menos ${Math.ceil(safeLine)} escanteios`,
            probability: historicalPct,
            confidence: Math.min(95, historicalPct),
            suggestedOdd: oddInfo.odd,
            suggestedStake: 2,
            rationale: [
              `Média de escanteios: ${avgCorners.toFixed(1)}`,
              `${homeStats.teamName}: ${homeStats.avgCorners.toFixed(1)} escanteios/jogo`,
              `${awayStats.teamName}: ${awayStats.avgCorners.toFixed(1)} escanteios/jogo`,
              `Linha segura (-45%): ${safeLine}`,
              oddInfo.source === 'bet365' ? `Odd Bet365: ${oddInfo.odd} | EV: ${ev > 0 ? '+' : ''}${ev.toFixed(1)}%` : `Odd calculada: ${oddInfo.odd}`
            ]
          });
        }
      }
      
      const safeLineHT = Math.floor((avgCorners * 0.45) * SAFETY_MARGIN_CORNERS) + 0.5;
      const marketNameHT = `Over ${safeLineHT} Escanteios HT`;
      const htPct = historicalPct * 0.9;
      if (safeLineHT >= 2.5 && historicalPct >= CONFIDENCE_THRESHOLD) {
        const fairOdd = Number((100 / htPct).toFixed(2));
        const oddInfo = getOddForMarket(marketNameHT, `Over ${safeLineHT}`, fairOdd);
        const ev = calculateEV(htPct, oddInfo.odd);
        
        if (ev >= MIN_EV_THRESHOLD) {
          predictions.push({
            market: marketNameHT,
            predictedOutcome: `Pelo menos ${Math.ceil(safeLineHT)} escanteios no 1º tempo`,
            probability: htPct,
            confidence: Math.min(92, htPct),
            suggestedOdd: oddInfo.odd,
            suggestedStake: 1.5,
            rationale: [
              `Média de escanteios 1ºT estimada: ${(avgCorners * 0.45).toFixed(1)}`,
              `Linha segura HT (-45%): ${safeLineHT}`,
              oddInfo.source === 'bet365' ? `Odd Bet365: ${oddInfo.odd} | EV: ${ev > 0 ? '+' : ''}${ev.toFixed(1)}%` : `Odd calculada: ${oddInfo.odd}`
            ]
          });
        }
      }
    }

    const avgCards = homeStats.avgCards + awayStats.avgCards;
    if (avgCards >= 3) {
      const safeCardLine = Math.max(1.5, Math.floor(avgCards * SAFETY_MARGIN_CARDS) - 0.5 + 0.5);
      const historicalPct = (homeStats.cardsOver15Pct + awayStats.cardsOver15Pct) / 2;
      const marketName = `Over ${safeCardLine} Cartões FT`;
      
      if (historicalPct >= CONFIDENCE_THRESHOLD && safeCardLine >= 1.5) {
        const fairOdd = Number((100 / historicalPct).toFixed(2));
        const oddInfo = getOddForMarket(marketName, `Over ${safeCardLine}`, fairOdd);
        const ev = calculateEV(historicalPct, oddInfo.odd);
        
        if (ev >= MIN_EV_THRESHOLD) {
          predictions.push({
            market: marketName,
            predictedOutcome: `Pelo menos ${Math.ceil(safeCardLine)} cartões`,
            probability: historicalPct,
            confidence: Math.min(95, historicalPct),
            suggestedOdd: oddInfo.odd,
            suggestedStake: 2,
            rationale: [
              `Média de cartões: ${avgCards.toFixed(1)}`,
              `${homeStats.teamName}: ${homeStats.avgCards.toFixed(1)} cartões/jogo`,
              `${awayStats.teamName}: ${awayStats.avgCards.toFixed(1)} cartões/jogo`,
              `Linha segura (-50%): ${safeCardLine}`,
              oddInfo.source === 'bet365' ? `Odd Bet365: ${oddInfo.odd} | EV: ${ev > 0 ? '+' : ''}${ev.toFixed(1)}%` : `Odd calculada: ${oddInfo.odd}`
            ]
          });
        }
      }
      
      const bothTeamsCardPct = (homeStats.bothTeamsCardPct + awayStats.bothTeamsCardPct) / 2;
      if (bothTeamsCardPct >= CONFIDENCE_THRESHOLD) {
        const fairOdd = Number((100 / bothTeamsCardPct).toFixed(2));
        const oddInfo = getOddForMarket('Ambas Recebem Cartão FT', 'Yes', fairOdd);
        const ev = calculateEV(bothTeamsCardPct, oddInfo.odd);
        
        if (ev >= MIN_EV_THRESHOLD) {
          predictions.push({
            market: 'Ambas Recebem Cartão FT',
            predictedOutcome: 'Sim - Ambos times recebem cartão',
            probability: bothTeamsCardPct,
            confidence: Math.min(95, bothTeamsCardPct),
            suggestedOdd: oddInfo.odd,
            suggestedStake: 2,
            rationale: [
              `${homeStats.teamName} recebe cartão: ${homeStats.bothTeamsCardPct}% dos jogos`,
              `${awayStats.teamName} recebe cartão: ${awayStats.bothTeamsCardPct}% dos jogos`,
              oddInfo.source === 'bet365' ? `Odd Bet365: ${oddInfo.odd} | EV: ${ev > 0 ? '+' : ''}${ev.toFixed(1)}%` : `Odd calculada: ${oddInfo.odd}`
            ]
          });
        }
      }
    }
    
    if (poissonProbs.homeWin >= 60 && homeStats.formPoints >= 10) {
      const formBonus = (homeStats.formPoints - 9) * 2;
      const confidence = Math.min(95, poissonProbs.homeWin + formBonus);
      const fairOdd = Number((100 / poissonProbs.homeWin).toFixed(2));
      const oddInfo = getOddForMarket(`Vitória ${homeStats.teamName}`, 'Home', fairOdd);
      const ev = calculateEV(poissonProbs.homeWin, oddInfo.odd);
      
      if (confidence >= CONFIDENCE_THRESHOLD && ev >= MIN_EV_THRESHOLD) {
        predictions.push({
          market: 'Resultado Final',
          predictedOutcome: `Vitória ${homeStats.teamName}`,
          probability: poissonProbs.homeWin,
          confidence: confidence,
          suggestedOdd: oddInfo.odd,
          suggestedStake: 2,
          rationale: [
            `${homeStats.teamName} forma: ${homeStats.formWins}V ${homeStats.formDraws}E ${homeStats.formLosses}D`,
            `Probabilidade Poisson: ${poissonProbs.homeWin.toFixed(1)}%`,
            `Média gols casa: ${homeStats.goalsScoredHome.toFixed(2)}`,
            `${awayStats.teamName} sofre ${awayStats.goalsConcededAway.toFixed(2)} gols fora`
          ]
        });
      }
    }
    
    if (poissonProbs.awayWin >= 50 && awayStats.formPoints >= 11) {
      const formBonus = (awayStats.formPoints - 9) * 2;
      const confidence = Math.min(95, poissonProbs.awayWin + formBonus);
      const fairOdd = Number((100 / poissonProbs.awayWin).toFixed(2));
      const oddInfo = getOddForMarket(`Vitória ${awayStats.teamName}`, 'Away', fairOdd);
      const ev = calculateEV(poissonProbs.awayWin, oddInfo.odd);
      
      if (confidence >= CONFIDENCE_THRESHOLD && ev >= MIN_EV_THRESHOLD) {
        predictions.push({
          market: 'Resultado Final',
          predictedOutcome: `Vitória ${awayStats.teamName}`,
          probability: poissonProbs.awayWin,
          confidence: confidence,
          suggestedOdd: oddInfo.odd,
          suggestedStake: 1.5,
          rationale: [
            `${awayStats.teamName} forma: ${awayStats.formWins}V ${awayStats.formDraws}E ${awayStats.formLosses}D`,
            `Probabilidade vitória fora: ${poissonProbs.awayWin.toFixed(1)}%`,
            `${awayStats.teamName} marca ${awayStats.goalsScoredAway.toFixed(2)} gols fora`,
            oddInfo.source === 'bet365' ? `Odd Bet365: ${oddInfo.odd} | EV: ${ev > 0 ? '+' : ''}${ev.toFixed(1)}%` : `Odd calculada: ${oddInfo.odd}`
          ]
        });
      }
    }
    
    return predictions.filter(p => p.confidence >= CONFIDENCE_THRESHOLD);
  }

  async analyzeFixture(fixture: FixtureData): Promise<PredictionResult[]> {
    console.log(`[AI Engine] Analyzing fixture: ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
    
    const homeTeamId = fixture.teams.home.id;
    const awayTeamId = fixture.teams.away.id;
    
    const [homeMatches, awayMatches, h2hMatches, bet365Odds] = await Promise.all([
      this.fetchTeamLastMatches(homeTeamId, fixture.league.season),
      this.fetchTeamLastMatches(awayTeamId, fixture.league.season),
      this.fetchH2H(homeTeamId, awayTeamId),
      this.fetchBet365Odds(fixture.fixture.id)
    ]);
    
    if (bet365Odds) {
      console.log(`[AI Engine] Found Bet365 odds for fixture ${fixture.fixture.id}`);
    }
    
    if (homeMatches.length < 5 || awayMatches.length < 5) {
      console.log(`[AI Engine] Insufficient data for analysis (home: ${homeMatches.length}, away: ${awayMatches.length})`);
      return [];
    }
    
    const allFixtureIds = [
      ...homeMatches.map(m => m.fixture.id),
      ...awayMatches.map(m => m.fixture.id),
      ...h2hMatches.map(m => m.fixture.id)
    ];
    const uniqueFixtureIds = Array.from(new Set(allFixtureIds));
    
    console.log(`[AI Engine] Fetching detailed statistics for ${uniqueFixtureIds.length} fixtures...`);
    const fixtureStatsMap = await this.fetchMultipleFixtureStatistics(uniqueFixtureIds);
    console.log(`[AI Engine] Got statistics for ${fixtureStatsMap.size} fixtures`);
    
    const homeStats = this.calculateTeamStats(homeMatches, homeTeamId, fixtureStatsMap);
    const awayStats = this.calculateTeamStats(awayMatches, awayTeamId, fixtureStatsMap);
    
    let h2hAnalysis = null;
    if (h2hMatches.length >= 3) {
      let homeWins = 0, draws = 0, awayWins = 0, totalGoals = 0;
      let totalCorners = 0, totalCards = 0;
      
      for (const match of h2hMatches) {
        const homeGoals = match.goals.home ?? 0;
        const awayGoals = match.goals.away ?? 0;
        totalGoals += homeGoals + awayGoals;
        
        const matchStats = fixtureStatsMap.get(match.fixture.id);
        if (matchStats) {
          totalCorners += matchStats.homeStats.corners + matchStats.awayStats.corners;
          totalCards += matchStats.homeStats.yellowCards + matchStats.homeStats.redCards + 
                        matchStats.awayStats.yellowCards + matchStats.awayStats.redCards;
        }
        
        if (match.teams.home.id === homeTeamId) {
          if (homeGoals > awayGoals) homeWins++;
          else if (homeGoals === awayGoals) draws++;
          else awayWins++;
        } else {
          if (awayGoals > homeGoals) homeWins++;
          else if (homeGoals === awayGoals) draws++;
          else awayWins++;
        }
      }
      
      h2hAnalysis = {
        homeWins,
        draws,
        awayWins,
        avgGoals: totalGoals / h2hMatches.length,
        avgCorners: totalCorners / h2hMatches.length,
        avgCards: totalCards / h2hMatches.length
      };
    }
    
    await Promise.all([
      db.insert(teamMatchStats)
        .values({
          ...homeStats,
          matchesAnalyzed: String(homeStats.matchesAnalyzed),
          goalsScored: String(homeStats.goalsScored),
          goalsConceded: String(homeStats.goalsConceded),
          goalsScoredHome: String(homeStats.goalsScoredHome),
          goalsConcededHome: String(homeStats.goalsConcededHome),
          goalsScoredAway: String(homeStats.goalsScoredAway),
          goalsConcededAway: String(homeStats.goalsConcededAway),
          over05Pct: String(homeStats.over05Pct),
          over15Pct: String(homeStats.over15Pct),
          over25Pct: String(homeStats.over25Pct),
          over35Pct: String(homeStats.over35Pct),
          bttsPct: String(homeStats.bttsPct),
          cleanSheetPct: String(homeStats.cleanSheetPct),
          failedToScorePct: String(homeStats.failedToScorePct),
          goalsFirstHalf: String(homeStats.goalsFirstHalf),
          goalsConcededFirstHalf: String(homeStats.goalsConcededFirstHalf),
          formWins: String(homeStats.formWins),
          formDraws: String(homeStats.formDraws),
          formLosses: String(homeStats.formLosses),
          formPoints: String(homeStats.formPoints),
          avgCorners: String(homeStats.avgCorners),
          avgCards: String(homeStats.avgCards),
          sourceFixtureIds: JSON.stringify(homeStats.sourceFixtureIds)
        })
        .onConflictDoNothing(),
      db.insert(teamMatchStats)
        .values({
          ...awayStats,
          matchesAnalyzed: String(awayStats.matchesAnalyzed),
          goalsScored: String(awayStats.goalsScored),
          goalsConceded: String(awayStats.goalsConceded),
          goalsScoredHome: String(awayStats.goalsScoredHome),
          goalsConcededHome: String(awayStats.goalsConcededHome),
          goalsScoredAway: String(awayStats.goalsScoredAway),
          goalsConcededAway: String(awayStats.goalsConcededAway),
          over05Pct: String(awayStats.over05Pct),
          over15Pct: String(awayStats.over15Pct),
          over25Pct: String(awayStats.over25Pct),
          over35Pct: String(awayStats.over35Pct),
          bttsPct: String(awayStats.bttsPct),
          cleanSheetPct: String(awayStats.cleanSheetPct),
          failedToScorePct: String(awayStats.failedToScorePct),
          goalsFirstHalf: String(awayStats.goalsFirstHalf),
          goalsConcededFirstHalf: String(awayStats.goalsConcededFirstHalf),
          formWins: String(awayStats.formWins),
          formDraws: String(awayStats.formDraws),
          formLosses: String(awayStats.formLosses),
          formPoints: String(awayStats.formPoints),
          avgCorners: String(awayStats.avgCorners),
          avgCards: String(awayStats.avgCards),
          sourceFixtureIds: JSON.stringify(awayStats.sourceFixtureIds)
        })
        .onConflictDoNothing()
    ]);
    
    const predictions = this.generatePredictions(homeStats, awayStats, h2hAnalysis, bet365Odds);
    
    // Filtrar previsões com alta confiança (>= 85%)
    const highConfPredictions = predictions.filter(p => p.confidence >= 85 && p.suggestedOdd >= 1.40);
    
    // Se tiver 2+ linhas de alta confiança, criar bilhete combinado do mesmo jogo
    if (highConfPredictions.length >= 2) {
      // Ordenar por confiança e pegar até 4 linhas
      highConfPredictions.sort((a, b) => b.confidence - a.confidence);
      const legsForCombo = highConfPredictions.slice(0, 4);
      
      // Calcular odd total e probabilidade combinada
      const totalOdd = legsForCombo.reduce((acc, p) => acc * p.suggestedOdd, 1);
      const avgConfidence = legsForCombo.reduce((acc, p) => acc + p.confidence, 0) / legsForCombo.length;
      
      // Calcular probabilidade combinada real (multiplicar probabilidades em decimal, depois converter para %)
      // Exemplo: 90% * 88% * 85% = 0.90 * 0.88 * 0.85 = 0.6732 = 67.32%
      const combinedProbability = legsForCombo.reduce((acc, p) => acc * (p.probability / 100), 1) * 100;
      
      // Criar legs com detalhes de cada linha
      const legs = legsForCombo.map(p => ({
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        homeTeamLogo: fixture.teams.home.logo,
        awayTeamLogo: fixture.teams.away.logo,
        league: fixture.league.name,
        fixtureId: String(fixture.fixture.id),
        market: p.market,
        outcome: p.predictedOutcome,
        odd: p.suggestedOdd,
        probability: p.probability,
        confidence: p.confidence,
        rationale: p.rationale,
        time: new Date(fixture.fixture.timestamp * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }));
      
      const comboDescription = legs.map(l => `${l.market} (${l.probability.toFixed(0)}%)`).join(' + ');
      
      // Inserir bilhete combinado
      await db.insert(aiTickets).values({
        fixtureId: String(fixture.fixture.id),
        league: fixture.league.name,
        leagueId: String(fixture.league.id),
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        homeTeamId: String(homeTeamId),
        awayTeamId: String(awayTeamId),
        homeTeamLogo: fixture.teams.home.logo,
        awayTeamLogo: fixture.teams.away.logo,
        matchTime: new Date(fixture.fixture.timestamp * 1000),
        market: `Combo ${legs.length} Linhas`,
        predictedOutcome: comboDescription,
        suggestedOdd: String(totalOdd.toFixed(2)),
        suggestedStake: '2.0',
        isCombo: true,
        legs: JSON.stringify(legs),
        totalOdd: String(totalOdd.toFixed(2)),
        confidence: String(avgConfidence.toFixed(0)),
        probability: String(combinedProbability.toFixed(1)),
        expectedValue: String(((combinedProbability / 100) * totalOdd - 1) * 100),
        analysisRationale: JSON.stringify(legsForCombo.flatMap(p => p.rationale)),
        homeTeamStats: JSON.stringify(homeStats),
        awayTeamStats: JSON.stringify(awayStats),
        h2hAnalysis: h2hAnalysis ? JSON.stringify(h2hAnalysis) : null,
        formScore: String(avgConfidence),
        status: 'draft'
      });
      
      console.log(`[AI Engine] Created COMBO ${legs.length} legs (odd ${totalOdd.toFixed(2)}, prob ${combinedProbability.toFixed(1)}%): ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
      console.log(`[AI Engine] Legs: ${legs.map(l => `${l.market} @${l.odd} (${l.probability.toFixed(0)}%)`).join(' | ')}`);
    }
    
    // Criar entradas simples APENAS para previsões de alta confiança que NÃO estão no combo
    // Isso evita duplicação e garante que só mostramos o melhor conteúdo
    const usedInCombo = new Set(highConfPredictions.slice(0, 4).map(p => `${p.market}_${p.predictedOutcome}`));
    
    for (const prediction of predictions) {
      // Só criar simples se:
      // 1. Não tem combo para este jogo (< 2 previsões de alta confiança)
      // 2. OU é uma previsão de confiança muito alta (>= 90%) que não está no combo
      const isInCombo = usedInCombo.has(`${prediction.market}_${prediction.predictedOutcome}`);
      const shouldCreateSingle = (
        (highConfPredictions.length < 2 && prediction.confidence >= 85 && prediction.suggestedOdd >= 1.40) ||
        (prediction.confidence >= 90 && prediction.suggestedOdd >= 1.40 && !isInCombo)
      );
      
      if (shouldCreateSingle) {
        await db.insert(aiTickets)
          .values({
            fixtureId: String(fixture.fixture.id),
            league: fixture.league.name,
            leagueId: String(fixture.league.id),
            homeTeam: fixture.teams.home.name,
            awayTeam: fixture.teams.away.name,
            homeTeamId: String(homeTeamId),
            awayTeamId: String(awayTeamId),
            homeTeamLogo: fixture.teams.home.logo,
            awayTeamLogo: fixture.teams.away.logo,
            matchTime: new Date(fixture.fixture.timestamp * 1000),
            market: prediction.market,
            predictedOutcome: prediction.predictedOutcome,
            suggestedOdd: String(prediction.suggestedOdd),
            suggestedStake: String(prediction.suggestedStake),
            confidence: String(prediction.confidence),
            probability: String(prediction.probability),
            expectedValue: String(((prediction.probability / 100) * prediction.suggestedOdd - 1) * 100),
            analysisRationale: JSON.stringify(prediction.rationale),
            homeTeamStats: JSON.stringify(homeStats),
            awayTeamStats: JSON.stringify(awayStats),
            h2hAnalysis: h2hAnalysis ? JSON.stringify(h2hAnalysis) : null,
            formScore: String(((homeStats.formPoints + awayStats.formPoints) / 30) * 100),
            goalTrendScore: String(((homeStats.goalsScored + awayStats.goalsScored) / 4) * 100),
            h2hScore: h2hAnalysis ? String(50) : null,
            status: 'draft'
          });
      }
    }
    
    const combosCreated = highConfPredictions.length >= 2 ? 1 : 0;
    console.log(`[AI Engine] Generated ${predictions.length} predictions (${combosCreated} combos) for ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
    return predictions;
  }

  async analyzeUpcomingFixtures(date: string): Promise<{ analyzed: number; predictions: number }> {
    console.log(`[AI Engine] Starting analysis for fixtures on ${date}`);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/fixtures`, {
        params: { date, status: 'NS' },
        headers: this.apiHeaders
      });
      
      const fixtures: FixtureData[] = response.data?.response || [];
      console.log(`[AI Engine] Found ${fixtures.length} upcoming fixtures`);
      
      const majorLeagues = [39, 140, 78, 135, 61, 71, 94, 88, 253, 2, 3, 848];
      const filteredFixtures = fixtures.filter(f => majorLeagues.includes(f.league.id));
      
      console.log(`[AI Engine] Analyzing ${filteredFixtures.length} major league fixtures`);
      
      // FILET MIGNON: Limitar a 15 jogos de alta qualidade
      const MAX_FIXTURES = 15;
      let totalPredictions = 0;
      
      for (const fixture of filteredFixtures.slice(0, MAX_FIXTURES)) {
        try {
          const predictions = await this.analyzeFixture(fixture);
          totalPredictions += predictions.length;
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error: any) {
          console.error(`[AI Engine] Error analyzing fixture ${fixture.fixture.id}:`, error.message);
        }
      }
      
      return {
        analyzed: filteredFixtures.length,
        predictions: totalPredictions
      };
    } catch (error: any) {
      console.error('[AI Engine] Error fetching fixtures:', error.message);
      return { analyzed: 0, predictions: 0 };
    }
  }

  async getDraftTickets(): Promise<any[]> {
    return db.select()
      .from(aiTickets)
      .where(eq(aiTickets.status, 'draft'))
      .orderBy(desc(aiTickets.confidence));
  }

  /**
   * Gera bilhetes combinados (combos) com odd mínima de 1.50
   * Agrupa previsões de alta confiança em combos de 2-3 seleções
   */
  async generateComboPredictions(predictions: Array<{
    fixtureId: string;
    league: string;
    homeTeam: string;
    awayTeam: string;
    homeTeamLogo: string;
    awayTeamLogo: string;
    matchTime: Date;
    market: string;
    predictedOutcome: string;
    suggestedOdd: number;
    confidence: number;
    probability: number;
    rationale: string[];
    homeStats: any;
    awayStats: any;
  }>): Promise<number> {
    const MIN_TOTAL_ODD = 1.50;
    const MIN_INDIVIDUAL_ODD = 1.40; // Filtrar apenas odds premium (filet mignon)
    const MIN_CONFIDENCE = 85; // Apenas alta confiança (85%+)
    const MAX_LEGS = 3;
    
    // Filtrar previsões PREMIUM (confiança >= 85%, odd >= 1.45) - FILET MIGNON ONLY
    const validPredictions = predictions.filter(p => 
      p.confidence >= MIN_CONFIDENCE && 
      p.suggestedOdd >= MIN_INDIVIDUAL_ODD
    );
    
    console.log(`[AI Combos] ${validPredictions.length} previsões válidas de ${predictions.length} total`);
    
    if (validPredictions.length === 0) return 0;
    
    // Ordenar por confiança (maior primeiro)
    validPredictions.sort((a, b) => b.confidence - a.confidence);
    
    let combosCreated = 0;
    const usedPredictions = new Set<string>();
    
    // Estratégia 1: Combos do mesmo jogo (diferentes mercados)
    const byFixture = new Map<string, typeof validPredictions>();
    for (const pred of validPredictions) {
      const key = pred.fixtureId;
      if (!byFixture.has(key)) byFixture.set(key, []);
      byFixture.get(key)!.push(pred);
    }
    
    for (const [fixtureId, fixturePreds] of Array.from(byFixture.entries())) {
      if (fixturePreds.length >= 2) {
        // Pegar 2-3 mercados do mesmo jogo
        const legsForCombo = fixturePreds.slice(0, MAX_LEGS);
        const totalOdd = legsForCombo.reduce((acc: number, p: any) => acc * p.suggestedOdd, 1);
        
        if (totalOdd >= MIN_TOTAL_ODD) {
          // Criar legs com market e outcome separados corretamente
          const legs = legsForCombo.map((p: any) => ({
            homeTeam: p.homeTeam,
            awayTeam: p.awayTeam,
            homeTeamLogo: p.homeTeamLogo,
            awayTeamLogo: p.awayTeamLogo,
            league: p.league,
            fixtureId: p.fixtureId,
            market: p.market, // Nome do mercado (Over 1.5, BTTS, etc)
            outcome: p.predictedOutcome, // Resultado predito (Sim, Não, etc)
            odd: p.suggestedOdd,
            time: new Date(p.matchTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }));
          
          // Validar combo usando função centralizada
          const validation = validateComboLegs(legs);
          if (!validation.valid) {
            console.warn(`[AI Combos] Combo inválido: ${validation.error}`);
            continue;
          }
          
          // Calcular confiança média
          const avgConfidence = legsForCombo.reduce((acc: number, p: any) => acc + p.confidence, 0) / legsForCombo.length;
          const avgProbability = legsForCombo.reduce((acc: number, p: any) => acc + p.probability, 0) / legsForCombo.length;
          
          // Formatar descrição do combo
          const comboDescription = legs.map((l: any) => `${l.market}`).join(' + ');
          
          // Criar combo - IMPORTANTE: suggestedOdd = totalOdd para combos
          await db.insert(aiTickets).values({
            fixtureId: legsForCombo[0].fixtureId,
            league: 'Múltipla',
            homeTeam: legsForCombo[0].homeTeam,
            awayTeam: legsForCombo[0].awayTeam,
            homeTeamId: legsForCombo[0].fixtureId.split('_')[0] || '0',
            awayTeamId: legsForCombo[0].fixtureId.split('_')[1] || '0',
            homeTeamLogo: legsForCombo[0].homeTeamLogo,
            awayTeamLogo: legsForCombo[0].awayTeamLogo,
            matchTime: new Date(legsForCombo[0].matchTime),
            market: `Combo ${legs.length} Seleções`,
            predictedOutcome: comboDescription,
            suggestedOdd: String(totalOdd.toFixed(2)), // TOTAL ODD, não individual
            suggestedStake: '1.0',
            isCombo: true,
            legs: JSON.stringify(legs),
            totalOdd: String(totalOdd.toFixed(2)),
            confidence: String(avgConfidence.toFixed(0)),
            probability: String(avgProbability.toFixed(0)),
            expectedValue: String(((avgProbability / 100) * totalOdd - 1) * 100),
            analysisRationale: JSON.stringify(legsForCombo.flatMap((p: any) => p.rationale)),
            homeTeamStats: JSON.stringify(legsForCombo[0].homeStats),
            awayTeamStats: JSON.stringify(legsForCombo[0].awayStats),
            formScore: String(avgConfidence),
            status: 'draft'
          });
          
          legsForCombo.forEach((p: any) => usedPredictions.add(`${p.fixtureId}_${p.market}`));
          combosCreated++;
          console.log(`[AI Combos] Criado combo ${legs.length} legs (odd ${totalOdd.toFixed(2)}): ${legsForCombo[0].homeTeam} vs ${legsForCombo[0].awayTeam}`);
        }
      }
    }
    
    // Estratégia 2: Combos de jogos diferentes (mesma liga ou tier similar)
    const remainingPreds = validPredictions.filter(p => 
      !usedPredictions.has(`${p.fixtureId}_${p.market}`)
    );
    
    // Agrupar por data/horário similar (±2 horas)
    for (let i = 0; i < remainingPreds.length; i++) {
      const pred1 = remainingPreds[i];
      if (usedPredictions.has(`${pred1.fixtureId}_${pred1.market}`)) continue;
      
      const candidates: typeof remainingPreds = [pred1];
      
      for (let j = i + 1; j < remainingPreds.length && candidates.length < MAX_LEGS; j++) {
        const pred2 = remainingPreds[j];
        if (usedPredictions.has(`${pred2.fixtureId}_${pred2.market}`)) continue;
        if (pred2.fixtureId === pred1.fixtureId) continue; // Diferentes jogos
        
        // Verificar horário similar (±3 horas)
        const timeDiff = Math.abs(new Date(pred2.matchTime).getTime() - new Date(pred1.matchTime).getTime());
        if (timeDiff <= 3 * 60 * 60 * 1000) {
          candidates.push(pred2);
        }
      }
      
      if (candidates.length >= 2) {
        const totalOdd = candidates.reduce((acc: number, p: any) => acc * p.suggestedOdd, 1);
        
        if (totalOdd >= MIN_TOTAL_ODD) {
          // Criar legs com market e outcome separados corretamente
          const legs = candidates.map((p: any) => ({
            homeTeam: p.homeTeam,
            awayTeam: p.awayTeam,
            homeTeamLogo: p.homeTeamLogo,
            awayTeamLogo: p.awayTeamLogo,
            league: p.league,
            fixtureId: p.fixtureId,
            market: p.market, // Nome do mercado
            outcome: p.predictedOutcome, // Resultado predito
            odd: p.suggestedOdd,
            time: new Date(p.matchTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }));
          
          // Validar combo usando função centralizada
          const validation = validateComboLegs(legs);
          if (!validation.valid) {
            console.warn(`[AI Combos] Combo multi-jogo inválido: ${validation.error}`);
            continue;
          }
          
          const avgConfidence = candidates.reduce((acc: number, p: any) => acc + p.confidence, 0) / candidates.length;
          const avgProbability = candidates.reduce((acc: number, p: any) => acc + p.probability, 0) / candidates.length;
          
          // Formatar descrição do combo
          const comboDescription = legs.map((l: any) => `${l.homeTeam.substring(0,3).toUpperCase()} ${l.market}`).join(' + ');
          
          await db.insert(aiTickets).values({
            fixtureId: candidates[0].fixtureId,
            league: 'Múltipla',
            homeTeam: candidates[0].homeTeam,
            awayTeam: candidates[0].awayTeam,
            homeTeamId: candidates[0].fixtureId.split('_')[0] || '0',
            awayTeamId: candidates[0].fixtureId.split('_')[1] || '0',
            homeTeamLogo: candidates[0].homeTeamLogo,
            awayTeamLogo: candidates[0].awayTeamLogo,
            matchTime: new Date(candidates[0].matchTime),
            market: `Múltipla ${legs.length} Jogos`,
            predictedOutcome: comboDescription,
            suggestedOdd: String(totalOdd.toFixed(2)), // TOTAL ODD, não individual
            suggestedStake: '1.0',
            isCombo: true,
            legs: JSON.stringify(legs),
            totalOdd: String(totalOdd.toFixed(2)),
            confidence: String(avgConfidence.toFixed(0)),
            probability: String(avgProbability.toFixed(0)),
            expectedValue: String(((avgProbability / 100) * totalOdd - 1) * 100),
            analysisRationale: JSON.stringify(candidates.flatMap((p: any) => p.rationale)),
            homeTeamStats: JSON.stringify(candidates[0].homeStats),
            awayTeamStats: JSON.stringify(candidates[0].awayStats),
            formScore: String(avgConfidence),
            status: 'draft'
          });
          
          candidates.forEach((p: any) => usedPredictions.add(`${p.fixtureId}_${p.market}`));
          combosCreated++;
          console.log(`[AI Combos] Criado múltipla ${legs.length} jogos (odd ${totalOdd.toFixed(2)})`);
        }
      }
    }
    
    console.log(`[AI Combos] Total de ${combosCreated} combos criados`);
    return combosCreated;
  }

  async approveTicket(ticketId: string, reviewerId: string, notes?: string): Promise<void> {
    await db.update(aiTickets)
      .set({
        status: 'approved',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: notes,
        updatedAt: new Date()
      })
      .where(eq(aiTickets.id, ticketId));
  }

  async rejectTicket(ticketId: string, reviewerId: string, notes?: string): Promise<void> {
    await db.update(aiTickets)
      .set({
        status: 'rejected',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: notes,
        updatedAt: new Date()
      })
      .where(eq(aiTickets.id, ticketId));
  }

  // ==========================================
  // SELETOR TOP 6-8 JOGOS DO DIA
  // ==========================================
  
  // Ligas prioritárias com maior liquidez e dados confiáveis
  private readonly TOP_LEAGUES = [
    { id: 39, name: 'Premier League', tier: 1 },
    { id: 140, name: 'La Liga', tier: 1 },
    { id: 135, name: 'Serie A', tier: 1 },
    { id: 78, name: 'Bundesliga', tier: 1 },
    { id: 61, name: 'Ligue 1', tier: 1 },
    { id: 2, name: 'Champions League', tier: 1 },
    { id: 3, name: 'Europa League', tier: 1 },
    { id: 71, name: 'Brasileirão', tier: 2 },
    { id: 94, name: 'Primeira Liga', tier: 2 },
    { id: 88, name: 'Eredivisie', tier: 2 },
    { id: 128, name: 'Argentina', tier: 2 },
    { id: 13, name: 'Libertadores', tier: 2 },
    { id: 40, name: 'Championship', tier: 3 },
    { id: 203, name: 'Süper Lig', tier: 3 },
    { id: 307, name: 'Saudi Pro League', tier: 3 },
  ];

  // Ligas a excluir (baixa qualidade de dados ou liquidez)
  private readonly EXCLUDED_PATTERNS = [
    'U19', 'U20', 'U21', 'U23', 'Youth', 'Junior', 'Reserve',
    'Friendly', 'Amistoso', 'Women', 'Feminino'
  ];

  private isLeagueExcluded(leagueName: string): boolean {
    const upper = leagueName.toUpperCase();
    return this.EXCLUDED_PATTERNS.some(p => upper.includes(p.toUpperCase()));
  }

  private getLeagueTier(leagueId: number): number {
    const league = this.TOP_LEAGUES.find(l => l.id === leagueId);
    return league?.tier || 4;
  }

  /**
   * Calcula a importância de um jogo baseado em contexto
   * Fatores: fase da competição, distância na tabela, sequência de resultados
   */
  private async calculateMatchImportance(
    fixture: FixtureData,
    homeStats: TeamStats,
    awayStats: TeamStats
  ): Promise<{ score: number; factors: string[] }> {
    let score = 50; // Base
    const factors: string[] = [];

    // 1. Liga tier (maior tier = mais importante)
    const tier = this.getLeagueTier(fixture.league.id);
    const tierBonus = (5 - tier) * 10; // Tier 1 = +40, Tier 2 = +30, etc.
    score += tierBonus;
    if (tier === 1) factors.push('Liga de elite (Tier 1)');

    // 2. Forma recente dos times (times em boa forma = jogo mais interessante)
    const homeForm = (homeStats.formPoints / 15) * 100; // Max 15 pontos em 5 jogos
    const awayForm = (awayStats.formPoints / 15) * 100;
    const avgForm = (homeForm + awayForm) / 2;
    
    if (avgForm >= 60) {
      score += 15;
      factors.push('Ambos times em boa forma');
    } else if (avgForm >= 40) {
      score += 5;
    }

    // 3. Potencial ofensivo (times que marcam = jogos melhores para apostas)
    const homeGoalsPer90 = homeStats.goalsScored / Math.max(1, homeStats.matchesAnalyzed);
    const awayGoalsPer90 = awayStats.goalsScored / Math.max(1, awayStats.matchesAnalyzed);
    
    if (homeGoalsPer90 >= 1.5 && awayGoalsPer90 >= 1.5) {
      score += 20;
      factors.push('Ambos times muito ofensivos');
    } else if (homeGoalsPer90 >= 1.2 || awayGoalsPer90 >= 1.2) {
      score += 10;
      factors.push('Pelo menos um time ofensivo');
    }

    // 4. Taxa de BTTS alta (indica jogos abertos)
    const avgBTTS = (homeStats.bttsPct + awayStats.bttsPct) / 2;
    if (avgBTTS >= 55) {
      score += 15;
      factors.push(`Alta taxa BTTS (${avgBTTS.toFixed(0)}%)`);
    }

    // 5. Histórico de Over 2.5
    const avgOver25 = (homeStats.over25Pct + awayStats.over25Pct) / 2;
    if (avgOver25 >= 55) {
      score += 10;
      factors.push(`Tendência Over 2.5 (${avgOver25.toFixed(0)}%)`);
    }

    // 6. Penalização por times defensivos demais
    const homeCleanSheet = homeStats.cleanSheetPct;
    const awayCleanSheet = awayStats.cleanSheetPct;
    if (homeCleanSheet >= 50 && awayCleanSheet >= 50) {
      score -= 15;
      factors.push('Ambos times muito defensivos (risco)');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      factors
    };
  }

  /**
   * Score composto para ranquear jogos
   * 40% forma/motivação + 30% estatística + 20% mercado + 10% risco
   */
  private calculateCompositeScore(
    homeStats: TeamStats,
    awayStats: TeamStats,
    importanceScore: number,
    leagueTier: number
  ): { score: number; breakdown: Record<string, number> } {
    // 1. FORMA/MOTIVAÇÃO (40%)
    const homeForm = (homeStats.formPoints / 15) * 100;
    const awayForm = (awayStats.formPoints / 15) * 100;
    const formScore = ((homeForm + awayForm) / 2 + importanceScore) / 2;

    // 2. ESTATÍSTICA (30%) - Previsibilidade dos padrões
    const homeOver25 = homeStats.over25Pct;
    const awayOver25 = awayStats.over25Pct;
    const homeBTTS = homeStats.bttsPct;
    const awayBTTS = awayStats.bttsPct;
    
    // Quanto mais extremo (alto ou baixo), mais previsível
    const goalsPredict = Math.abs(50 - (homeOver25 + awayOver25) / 2) * 2;
    const bttsPredict = Math.abs(50 - (homeBTTS + awayBTTS) / 2) * 2;
    const statsScore = (goalsPredict + bttsPredict) / 2;

    // 3. MERCADO (20%) - Liga tier afeta liquidez
    const marketScore = (5 - leagueTier) * 25; // Tier 1 = 100, Tier 4 = 25

    // 4. RISCO (10%) - Menor variância é melhor
    const homeVariance = Math.abs(homeStats.goalsScored - homeStats.goalsConceded) / Math.max(1, homeStats.matchesAnalyzed);
    const awayVariance = Math.abs(awayStats.goalsScored - awayStats.goalsConceded) / Math.max(1, awayStats.matchesAnalyzed);
    const riskScore = 100 - (homeVariance + awayVariance) * 20;

    // Compor score final
    const compositeScore = 
      (formScore * 0.40) +
      (statsScore * 0.30) +
      (marketScore * 0.20) +
      (Math.max(0, riskScore) * 0.10);

    return {
      score: Math.min(100, Math.max(0, compositeScore)),
      breakdown: {
        form: formScore,
        stats: statsScore,
        market: marketScore,
        risk: riskScore
      }
    };
  }

  /**
   * Seleciona os TOP 6-8 melhores jogos do dia
   * Baseado em score composto >= 0.78 (78%)
   */
  async selectTopMatchesOfDay(date: string, maxMatches: number = 8): Promise<{
    matches: Array<{
      fixture: FixtureData;
      compositeScore: number;
      importanceScore: number;
      breakdown: Record<string, number>;
      factors: string[];
      tier: string;
    }>;
    totalAnalyzed: number;
  }> {
    console.log(`[AI Selector] Selecionando top ${maxMatches} jogos para ${date}...`);

    try {
      const response = await axios.get(`${API_BASE_URL}/fixtures`, {
        params: { date, status: 'NS' },
        headers: this.apiHeaders
      });

      const allFixtures: FixtureData[] = response.data?.response || [];
      console.log(`[AI Selector] ${allFixtures.length} jogos encontrados`);

      // Filtrar ligas ruins
      const cleanFixtures = allFixtures.filter(f => 
        !this.isLeagueExcluded(f.league.name)
      );
      console.log(`[AI Selector] ${cleanFixtures.length} após filtro de qualidade`);

      // Priorizar ligas top
      const topLeagueIds = this.TOP_LEAGUES.map(l => l.id);
      const prioritizedFixtures = cleanFixtures.filter(f => 
        topLeagueIds.includes(f.league.id)
      );
      console.log(`[AI Selector] ${prioritizedFixtures.length} de ligas prioritárias`);

      // Analisar cada jogo
      const scoredMatches: Array<{
        fixture: FixtureData;
        compositeScore: number;
        importanceScore: number;
        breakdown: Record<string, number>;
        factors: string[];
        tier: string;
      }> = [];

      for (const fixture of prioritizedFixtures.slice(0, 50)) { // Limitar análise
        try {
          const [homeMatches, awayMatches] = await Promise.all([
            this.fetchTeamLastMatches(fixture.teams.home.id, fixture.league.season),
            this.fetchTeamLastMatches(fixture.teams.away.id, fixture.league.season)
          ]);

          if (homeMatches.length < 5 || awayMatches.length < 5) {
            continue; // Pular jogos sem dados suficientes
          }

          const allFixtureIds = Array.from(new Set([
            ...homeMatches.map(m => m.fixture.id),
            ...awayMatches.map(m => m.fixture.id)
          ]));
          
          const statsMap = await this.fetchMultipleFixtureStatistics(allFixtureIds);
          
          const homeStats = this.calculateTeamStats(homeMatches, fixture.teams.home.id, statsMap);
          const awayStats = this.calculateTeamStats(awayMatches, fixture.teams.away.id, statsMap);

          const importance = await this.calculateMatchImportance(fixture, homeStats, awayStats);
          const leagueTier = this.getLeagueTier(fixture.league.id);
          const composite = this.calculateCompositeScore(homeStats, awayStats, importance.score, leagueTier);

          // Determinar tier de confiança
          let tier = 'LOW';
          if (composite.score >= 85) tier = 'PRIME';
          else if (composite.score >= 80) tier = 'CORE';
          else if (composite.score >= 75) tier = 'WATCH';

          scoredMatches.push({
            fixture,
            compositeScore: composite.score,
            importanceScore: importance.score,
            breakdown: composite.breakdown,
            factors: importance.factors,
            tier
          });

          await new Promise(r => setTimeout(r, 500)); // Rate limiting
        } catch (err: any) {
          console.error(`[AI Selector] Erro analisando ${fixture.teams.home.name}:`, err.message);
        }
      }

      // Ordenar por score composto e pegar os top N
      const topMatches = scoredMatches
        .sort((a, b) => b.compositeScore - a.compositeScore)
        .filter(m => m.compositeScore >= 75) // Mínimo 75% de score
        .slice(0, maxMatches);

      console.log(`[AI Selector] ${topMatches.length} jogos selecionados com score >= 75%`);

      return {
        matches: topMatches,
        totalAnalyzed: scoredMatches.length
      };
    } catch (error: any) {
      console.error('[AI Selector] Erro:', error.message);
      return { matches: [], totalAnalyzed: 0 };
    }
  }
}

export const aiPredictionEngine = new AIPredictionEngine();
