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
  avgCards: number;
  sourceFixtureIds: string[];
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

  calculateTeamStats(fixtures: FixtureData[], teamId: number): TeamStats {
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
    let wins = 0, draws = 0, losses = 0;
    let corners = 0, cards = 0;
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
      firstHalfGoals += isHome ? htHome : htAway;
      firstHalfConceded += isHome ? htAway : htHome;
      
      if (scored > conceded) wins++;
      else if (scored === conceded) draws++;
      else losses++;
    }
    
    const matchCount = fixtures.length || 1;
    
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
      avgCorners: 0,
      avgCards: 0,
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
    h2hStats: { homeWins: number; draws: number; awayWins: number; avgGoals: number } | null
  ): PredictionResult[] {
    const predictions: PredictionResult[] = [];
    
    const homeExpectedGoals = (homeStats.goalsScoredHome + awayStats.goalsConcededAway) / 2;
    const awayExpectedGoals = (awayStats.goalsScoredAway + homeStats.goalsConcededHome) / 2;
    
    const poissonProbs = this.calculateGoalProbabilities(homeExpectedGoals, awayExpectedGoals);
    
    const historicalOver25 = (homeStats.over25Pct + awayStats.over25Pct) / 2;
    const historicalBtts = (homeStats.bttsPct + awayStats.bttsPct) / 2;
    
    const combinedOver25 = (poissonProbs.over25 * 0.6) + (historicalOver25 * 0.4);
    const combinedBtts = (poissonProbs.btts * 0.6) + (historicalBtts * 0.4);
    
    let h2hBonus = 0;
    if (h2hStats && h2hStats.avgGoals > 2.5) h2hBonus = 5;
    
    if (combinedOver25 + h2hBonus >= 65) {
      const confidence = Math.min(95, combinedOver25 + h2hBonus);
      const suggestedOdd = 100 / combinedOver25;
      
      predictions.push({
        market: 'Over 2.5 Gols',
        predictedOutcome: 'Sim',
        probability: combinedOver25,
        confidence: confidence,
        suggestedOdd: Number(suggestedOdd.toFixed(2)),
        suggestedStake: confidence >= 80 ? 2 : 1,
        rationale: [
          `Média de gols esperados: ${(homeExpectedGoals + awayExpectedGoals).toFixed(2)}`,
          `${homeStats.teamName} marca em média ${homeStats.goalsScoredHome.toFixed(2)} gols em casa`,
          `${awayStats.teamName} sofre em média ${awayStats.goalsConcededAway.toFixed(2)} gols fora`,
          `Histórico Over 2.5: ${historicalOver25.toFixed(1)}%`,
          h2hBonus > 0 ? `H2H favorece Over (média ${h2hStats?.avgGoals.toFixed(2)} gols)` : ''
        ].filter(Boolean)
      });
    }
    
    if (combinedOver25 + h2hBonus < 40) {
      const under25Prob = 100 - combinedOver25;
      const confidence = Math.min(95, under25Prob);
      
      predictions.push({
        market: 'Under 2.5 Gols',
        predictedOutcome: 'Sim',
        probability: under25Prob,
        confidence: confidence,
        suggestedOdd: Number((100 / under25Prob).toFixed(2)),
        suggestedStake: confidence >= 80 ? 2 : 1,
        rationale: [
          `Média de gols esperados: ${(homeExpectedGoals + awayExpectedGoals).toFixed(2)}`,
          `${homeStats.teamName} marca apenas ${homeStats.goalsScored.toFixed(2)} gols/jogo`,
          `${awayStats.teamName} marca apenas ${awayStats.goalsScored.toFixed(2)} gols/jogo`,
          `Histórico Under 2.5: ${(100 - historicalOver25).toFixed(1)}%`
        ]
      });
    }
    
    if (combinedBtts >= 65) {
      const confidence = Math.min(95, combinedBtts);
      
      predictions.push({
        market: 'Ambas Marcam',
        predictedOutcome: 'Sim',
        probability: combinedBtts,
        confidence: confidence,
        suggestedOdd: Number((100 / combinedBtts).toFixed(2)),
        suggestedStake: confidence >= 80 ? 2 : 1,
        rationale: [
          `${homeStats.teamName} BTTS: ${homeStats.bttsPct}%`,
          `${awayStats.teamName} BTTS: ${awayStats.bttsPct}%`,
          `Probabilidade Poisson BTTS: ${poissonProbs.btts.toFixed(1)}%`,
          `${homeStats.teamName} falha em marcar apenas ${homeStats.failedToScorePct}% dos jogos`
        ]
      });
    }
    
    if (poissonProbs.homeWin >= 55 && homeStats.formPoints >= 9) {
      const formBonus = (homeStats.formPoints - 9) * 2;
      const confidence = Math.min(95, poissonProbs.homeWin + formBonus);
      
      predictions.push({
        market: 'Resultado Final',
        predictedOutcome: `Vitória ${homeStats.teamName}`,
        probability: poissonProbs.homeWin,
        confidence: confidence,
        suggestedOdd: Number((100 / poissonProbs.homeWin).toFixed(2)),
        suggestedStake: confidence >= 80 ? 2 : 1.5,
        rationale: [
          `${homeStats.teamName} está em ótima forma: ${homeStats.formWins}V ${homeStats.formDraws}E ${homeStats.formLosses}D`,
          `Probabilidade Poisson de vitória: ${poissonProbs.homeWin.toFixed(1)}%`,
          `Média de gols em casa: ${homeStats.goalsScoredHome.toFixed(2)}`,
          `${awayStats.teamName} sofre ${awayStats.goalsConcededAway.toFixed(2)} gols/jogo fora`
        ]
      });
    }
    
    if (poissonProbs.awayWin >= 45 && awayStats.formPoints >= 10) {
      const formBonus = (awayStats.formPoints - 9) * 2;
      const confidence = Math.min(95, poissonProbs.awayWin + formBonus);
      
      predictions.push({
        market: 'Resultado Final',
        predictedOutcome: `Vitória ${awayStats.teamName}`,
        probability: poissonProbs.awayWin,
        confidence: confidence,
        suggestedOdd: Number((100 / poissonProbs.awayWin).toFixed(2)),
        suggestedStake: confidence >= 75 ? 1.5 : 1,
        rationale: [
          `${awayStats.teamName} está em excelente forma: ${awayStats.formWins}V ${awayStats.formDraws}E ${awayStats.formLosses}D`,
          `Probabilidade de vitória fora: ${poissonProbs.awayWin.toFixed(1)}%`,
          `${awayStats.teamName} marca ${awayStats.goalsScoredAway.toFixed(2)} gols/jogo fora`,
          `${homeStats.teamName} sofre ${homeStats.goalsConcededHome.toFixed(2)} gols/jogo em casa`
        ]
      });
    }
    
    return predictions.filter(p => p.confidence >= 70);
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
    
    const homeStats = this.calculateTeamStats(homeMatches, homeTeamId);
    const awayStats = this.calculateTeamStats(awayMatches, awayTeamId);
    
    let h2hAnalysis = null;
    if (h2hMatches.length >= 3) {
      let homeWins = 0, draws = 0, awayWins = 0, totalGoals = 0;
      for (const match of h2hMatches) {
        const homeGoals = match.goals.home ?? 0;
        const awayGoals = match.goals.away ?? 0;
        totalGoals += homeGoals + awayGoals;
        
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
        avgGoals: totalGoals / h2hMatches.length
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
