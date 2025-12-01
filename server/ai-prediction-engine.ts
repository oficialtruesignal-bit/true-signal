import axios from 'axios';
import { db } from './db';
import { teamMatchStats, aiTickets, aiAnalysisCache } from '@shared/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

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
    h2hStats: { homeWins: number; draws: number; awayWins: number; avgGoals: number; avgCorners: number; avgCards: number } | null
  ): PredictionResult[] {
    const predictions: PredictionResult[] = [];
    const CONFIDENCE_THRESHOLD = 80;
    const SAFETY_MARGIN_SHOTS = 0.60;
    const SAFETY_MARGIN_CORNERS = 0.55;
    const SAFETY_MARGIN_CARDS = 0.50;
    const SAFETY_MARGIN_GOALS = 0.65;
    
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
      predictions.push({
        market: 'Over 1.5 Gols FT',
        predictedOutcome: 'Pelo menos 2 gols na partida',
        probability: combinedOver15,
        confidence: Math.min(95, combinedOver15),
        suggestedOdd: Number((100 / combinedOver15).toFixed(2)),
        suggestedStake: 2,
        rationale: [
          `Média de gols esperados: ${totalExpectedGoals.toFixed(2)}`,
          `${homeStats.teamName} Over 1.5: ${homeStats.over15Pct}%`,
          `${awayStats.teamName} Over 1.5: ${awayStats.over15Pct}%`,
          `Probabilidade combinada: ${combinedOver15.toFixed(1)}%`
        ]
      });
    }
    
    if (combinedOver25 + h2hBonus >= CONFIDENCE_THRESHOLD) {
      predictions.push({
        market: 'Over 2.5 Gols FT',
        predictedOutcome: 'Pelo menos 3 gols na partida',
        probability: combinedOver25,
        confidence: Math.min(95, combinedOver25 + h2hBonus),
        suggestedOdd: Number((100 / combinedOver25).toFixed(2)),
        suggestedStake: 2,
        rationale: [
          `Média de gols esperados: ${totalExpectedGoals.toFixed(2)}`,
          `${homeStats.teamName} marca ${homeStats.goalsScoredHome.toFixed(2)} gols em casa`,
          `${awayStats.teamName} sofre ${awayStats.goalsConcededAway.toFixed(2)} gols fora`,
          `Histórico Over 2.5: ${historicalOver25.toFixed(1)}%`,
          h2hBonus > 0 ? `H2H: média de ${h2hStats?.avgGoals.toFixed(2)} gols` : ''
        ].filter(Boolean)
      });
    }
    
    const htGoalsProbability = (homeStats.goalsFirstHalfOver05Pct + awayStats.goalsFirstHalfOver05Pct) / 2;
    if (htGoalsProbability >= CONFIDENCE_THRESHOLD) {
      predictions.push({
        market: 'Over 0.5 Gols HT',
        predictedOutcome: 'Pelo menos 1 gol no 1º tempo',
        probability: htGoalsProbability,
        confidence: Math.min(95, htGoalsProbability),
        suggestedOdd: Number((100 / htGoalsProbability).toFixed(2)),
        suggestedStake: 2,
        rationale: [
          `${homeStats.teamName} gols 1ºT: ${homeStats.goalsFirstHalf.toFixed(2)} média`,
          `${awayStats.teamName} gols 1ºT: ${awayStats.goalsFirstHalf.toFixed(2)} média`,
          `Histórico Over 0.5 HT: ${htGoalsProbability.toFixed(1)}%`
        ]
      });
    }
    
    if (combinedBtts >= CONFIDENCE_THRESHOLD) {
      predictions.push({
        market: 'Ambas Marcam FT',
        predictedOutcome: 'Sim - Ambos times marcam',
        probability: combinedBtts,
        confidence: Math.min(95, combinedBtts),
        suggestedOdd: Number((100 / combinedBtts).toFixed(2)),
        suggestedStake: 2,
        rationale: [
          `${homeStats.teamName} BTTS: ${homeStats.bttsPct}%`,
          `${awayStats.teamName} BTTS: ${awayStats.bttsPct}%`,
          `Probabilidade Poisson BTTS: ${poissonProbs.btts.toFixed(1)}%`,
          `${homeStats.teamName} falha em marcar: ${homeStats.failedToScorePct}%`
        ]
      });
    }

    const avgShotsOnTarget = homeStats.avgShotsOnTarget + awayStats.avgShotsOnTarget;
    if (avgShotsOnTarget >= 6) {
      const safeLine = Math.floor(avgShotsOnTarget * SAFETY_MARGIN_SHOTS) + 0.5;
      const historicalPct = (homeStats.shotsOnTargetOver35Pct + awayStats.shotsOnTargetOver35Pct) / 2;
      
      if (historicalPct >= CONFIDENCE_THRESHOLD && safeLine >= 3.5) {
        predictions.push({
          market: `Over ${safeLine} Chutes ao Gol FT`,
          predictedOutcome: `Pelo menos ${Math.ceil(safeLine)} chutes ao gol`,
          probability: historicalPct,
          confidence: Math.min(95, historicalPct),
          suggestedOdd: Number((100 / historicalPct).toFixed(2)),
          suggestedStake: 2,
          rationale: [
            `Média de chutes ao gol: ${avgShotsOnTarget.toFixed(1)}`,
            `${homeStats.teamName}: ${homeStats.avgShotsOnTarget.toFixed(1)} chutes/jogo`,
            `${awayStats.teamName}: ${awayStats.avgShotsOnTarget.toFixed(1)} chutes/jogo`,
            `Linha segura (-40%): ${safeLine}`,
            `Histórico Over 3.5: ${historicalPct.toFixed(1)}%`
          ]
        });
      }
    }

    const avgCorners = homeStats.avgCorners + awayStats.avgCorners;
    if (avgCorners >= 8) {
      const safeLine = Math.floor(avgCorners * SAFETY_MARGIN_CORNERS) + 0.5;
      const historicalPct = (homeStats.cornersOver55Pct + awayStats.cornersOver55Pct) / 2;
      
      if (historicalPct >= CONFIDENCE_THRESHOLD && safeLine >= 4.5) {
        predictions.push({
          market: `Over ${safeLine} Escanteios FT`,
          predictedOutcome: `Pelo menos ${Math.ceil(safeLine)} escanteios`,
          probability: historicalPct,
          confidence: Math.min(95, historicalPct),
          suggestedOdd: Number((100 / historicalPct).toFixed(2)),
          suggestedStake: 2,
          rationale: [
            `Média de escanteios: ${avgCorners.toFixed(1)}`,
            `${homeStats.teamName}: ${homeStats.avgCorners.toFixed(1)} escanteios/jogo`,
            `${awayStats.teamName}: ${awayStats.avgCorners.toFixed(1)} escanteios/jogo`,
            `Linha segura (-45%): ${safeLine}`,
            `Histórico Over 5.5: ${historicalPct.toFixed(1)}%`
          ]
        });
      }
      
      const safeLineHT = Math.floor((avgCorners * 0.45) * SAFETY_MARGIN_CORNERS) + 0.5;
      if (safeLineHT >= 2.5 && historicalPct >= CONFIDENCE_THRESHOLD) {
        predictions.push({
          market: `Over ${safeLineHT} Escanteios HT`,
          predictedOutcome: `Pelo menos ${Math.ceil(safeLineHT)} escanteios no 1º tempo`,
          probability: historicalPct * 0.9,
          confidence: Math.min(92, historicalPct * 0.9),
          suggestedOdd: Number((100 / (historicalPct * 0.9)).toFixed(2)),
          suggestedStake: 1.5,
          rationale: [
            `Média de escanteios 1ºT estimada: ${(avgCorners * 0.45).toFixed(1)}`,
            `Linha segura HT (-45%): ${safeLineHT}`,
            `Baseado na média FT de ${avgCorners.toFixed(1)} escanteios`
          ]
        });
      }
    }

    const avgCards = homeStats.avgCards + awayStats.avgCards;
    if (avgCards >= 3) {
      const safeCardLine = Math.max(1.5, Math.floor(avgCards * SAFETY_MARGIN_CARDS) - 0.5 + 0.5);
      const historicalPct = (homeStats.cardsOver15Pct + awayStats.cardsOver15Pct) / 2;
      
      if (historicalPct >= CONFIDENCE_THRESHOLD && safeCardLine >= 1.5) {
        predictions.push({
          market: `Over ${safeCardLine} Cartões FT`,
          predictedOutcome: `Pelo menos ${Math.ceil(safeCardLine)} cartões`,
          probability: historicalPct,
          confidence: Math.min(95, historicalPct),
          suggestedOdd: Number((100 / historicalPct).toFixed(2)),
          suggestedStake: 2,
          rationale: [
            `Média de cartões: ${avgCards.toFixed(1)}`,
            `${homeStats.teamName}: ${homeStats.avgCards.toFixed(1)} cartões/jogo`,
            `${awayStats.teamName}: ${awayStats.avgCards.toFixed(1)} cartões/jogo`,
            `Linha segura (-50%): ${safeCardLine}`,
            `Histórico Over 1.5: ${historicalPct.toFixed(1)}%`
          ]
        });
      }
      
      const bothTeamsCardPct = (homeStats.bothTeamsCardPct + awayStats.bothTeamsCardPct) / 2;
      if (bothTeamsCardPct >= CONFIDENCE_THRESHOLD) {
        predictions.push({
          market: 'Ambas Recebem Cartão FT',
          predictedOutcome: 'Sim - Ambos times recebem cartão',
          probability: bothTeamsCardPct,
          confidence: Math.min(95, bothTeamsCardPct),
          suggestedOdd: Number((100 / bothTeamsCardPct).toFixed(2)),
          suggestedStake: 2,
          rationale: [
            `${homeStats.teamName} recebe cartão: ${homeStats.bothTeamsCardPct}% dos jogos`,
            `${awayStats.teamName} recebe cartão: ${awayStats.bothTeamsCardPct}% dos jogos`,
            `Probabilidade combinada: ${bothTeamsCardPct.toFixed(1)}%`
          ]
        });
      }
    }
    
    if (poissonProbs.homeWin >= 60 && homeStats.formPoints >= 10) {
      const formBonus = (homeStats.formPoints - 9) * 2;
      const confidence = Math.min(95, poissonProbs.homeWin + formBonus);
      
      if (confidence >= CONFIDENCE_THRESHOLD) {
        predictions.push({
          market: 'Resultado Final',
          predictedOutcome: `Vitória ${homeStats.teamName}`,
          probability: poissonProbs.homeWin,
          confidence: confidence,
          suggestedOdd: Number((100 / poissonProbs.homeWin).toFixed(2)),
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
      
      if (confidence >= CONFIDENCE_THRESHOLD) {
        predictions.push({
          market: 'Resultado Final',
          predictedOutcome: `Vitória ${awayStats.teamName}`,
          probability: poissonProbs.awayWin,
          confidence: confidence,
          suggestedOdd: Number((100 / poissonProbs.awayWin).toFixed(2)),
          suggestedStake: 1.5,
          rationale: [
            `${awayStats.teamName} forma: ${awayStats.formWins}V ${awayStats.formDraws}E ${awayStats.formLosses}D`,
            `Probabilidade vitória fora: ${poissonProbs.awayWin.toFixed(1)}%`,
            `${awayStats.teamName} marca ${awayStats.goalsScoredAway.toFixed(2)} gols fora`,
            `${homeStats.teamName} sofre ${homeStats.goalsConcededHome.toFixed(2)} gols em casa`
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
    
    const [homeMatches, awayMatches, h2hMatches] = await Promise.all([
      this.fetchTeamLastMatches(homeTeamId, fixture.league.season),
      this.fetchTeamLastMatches(awayTeamId, fixture.league.season),
      this.fetchH2H(homeTeamId, awayTeamId)
    ]);
    
    if (homeMatches.length < 5 || awayMatches.length < 5) {
      console.log(`[AI Engine] Insufficient data for analysis (home: ${homeMatches.length}, away: ${awayMatches.length})`);
      return [];
    }
    
    const allFixtureIds = [
      ...homeMatches.map(m => m.fixture.id),
      ...awayMatches.map(m => m.fixture.id),
      ...h2hMatches.map(m => m.fixture.id)
    ];
    const uniqueFixtureIds = [...new Set(allFixtureIds)];
    
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
    
    const predictions = this.generatePredictions(homeStats, awayStats, h2hAnalysis);
    
    for (const prediction of predictions) {
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
    
    console.log(`[AI Engine] Generated ${predictions.length} predictions for ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
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
      
      let totalPredictions = 0;
      
      for (const fixture of filteredFixtures.slice(0, 20)) {
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
}

export const aiPredictionEngine = new AIPredictionEngine();
