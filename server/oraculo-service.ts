import axios from 'axios';
import { db } from './db';
import { aiAnalysisCache } from '@shared/schema';
import { eq, gte, and, desc } from 'drizzle-orm';

const API_BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY || '';

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
    country: string;
    season: number;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
  };
}

interface TeamMatchStats {
  goalsScored: number;
  goalsConceded: number;
  goalsHT: number;
  goalsConcededHT: number;
  corners: number;
  cornersAgainst: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  shotsOnTarget: number;
  shotsTotal: number;
  dangerousAttacks: number;
}

interface OraculoSignal {
  fixtureId: number;
  league: string;
  leagueCountry: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  matchDate: string;
  matchTime: string;
  marketRecommendation: string;
  confidenceScore: number;
  badgeType: 'DIAMOND' | 'GOLD';
  reasoning: {
    pattern: string;
    statsHome: string;
    statsAway: string;
    aiInsight: string;
  };
  dominanceIndex: {
    home: number;
    away: number;
  };
  rawData: {
    homeRecurrence: number;
    awayRecurrence: number;
    h2hRecurrence: number;
    sampleSize: number;
  };
}

interface OraculoScanResult {
  scanTimestamp: string;
  totalFixturesScanned: number;
  fixturesAnalyzed: number;
  signalsGenerated: number;
  opportunities: OraculoSignal[];
}

class OraculoService {
  private apiHeaders = {
    'x-apisports-key': API_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io'
  };

  private readonly EXCLUDED_PATTERNS = [
    'U17', 'U19', 'U20', 'U21', 'U23', 'Youth', 'Junior', 'Reserve',
    'Friendly', 'Amistoso', 'Women', 'Feminino', 'Amateur', 'Oberliga'
  ];

  private readonly TOP_LEAGUES = [
    39, 140, 135, 78, 61, 2, 3, 848, 71, 72, 94, 88, 128, 13, 11, 144, 179,
    40, 203, 307, 235, 253, 262, 169, 119, 113, 103
  ];

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
      console.error('[ORÁCULO] Cache write error:', error);
    }
  }

  private isLeagueExcluded(leagueName: string): boolean {
    const upper = leagueName.toUpperCase();
    return this.EXCLUDED_PATTERNS.some(p => upper.includes(p.toUpperCase()));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchFixturesForDate(date: string): Promise<FixtureData[]> {
    const cacheKey = `oraculo_fixtures_${date}`;
    const cached = await this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${API_BASE_URL}/fixtures`, {
        params: { date, status: 'NS' },
        headers: this.apiHeaders
      });

      const fixtures = response.data?.response || [];
      await this.setCachedData(cacheKey, 'oraculo_fixtures', fixtures, 2);
      return fixtures;
    } catch (error: any) {
      console.error('[ORÁCULO] Error fetching fixtures:', error.message);
      return [];
    }
  }

  async fetchTeamLastMatches(teamId: number, last: number = 10): Promise<FixtureData[]> {
    const cacheKey = `oraculo_team_${teamId}_last${last}`;
    const cached = await this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      await this.delay(200);
      const response = await axios.get(`${API_BASE_URL}/fixtures`, {
        params: { team: teamId, last, status: 'FT' },
        headers: this.apiHeaders
      });

      const fixtures = response.data?.response || [];
      await this.setCachedData(cacheKey, 'team_fixtures', fixtures, 6);
      return fixtures;
    } catch (error: any) {
      console.error(`[ORÁCULO] Error fetching team ${teamId} matches:`, error.message);
      return [];
    }
  }

  async fetchH2H(team1Id: number, team2Id: number, last: number = 5): Promise<FixtureData[]> {
    const cacheKey = `oraculo_h2h_${team1Id}_${team2Id}`;
    const cached = await this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      await this.delay(200);
      const response = await axios.get(`${API_BASE_URL}/fixtures/headtohead`, {
        params: { h2h: `${team1Id}-${team2Id}`, last },
        headers: this.apiHeaders
      });

      const fixtures = response.data?.response || [];
      await this.setCachedData(cacheKey, 'h2h', fixtures, 24);
      return fixtures;
    } catch (error: any) {
      console.error(`[ORÁCULO] Error fetching H2H:`, error.message);
      return [];
    }
  }

  async fetchFixtureStatistics(fixtureId: number): Promise<any | null> {
    const cacheKey = `oraculo_stats_${fixtureId}`;
    const cached = await this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      await this.delay(150);
      const response = await axios.get(`${API_BASE_URL}/fixtures/statistics`, {
        params: { fixture: fixtureId },
        headers: this.apiHeaders
      });

      const stats = response.data?.response || [];
      if (stats.length >= 2) {
        await this.setCachedData(cacheKey, 'fixture_stats', stats, 24);
        return stats;
      }
      return null;
    } catch (error: any) {
      return null;
    }
  }

  private parseStatValue(statArray: any[], type: string): number {
    const stat = statArray.find((s: any) => s.type === type);
    if (!stat) return 0;
    const value = stat.value;
    if (value === null || value === undefined) return 0;
    if (typeof value === 'string') {
      return parseInt(value.replace('%', '')) || 0;
    }
    return value;
  }

  private analyzeTeamPattern(
    matches: FixtureData[],
    teamId: number,
    statsMap: Map<number, any>
  ): {
    goalsHTRate: number;
    over15Rate: number;
    over25Rate: number;
    bttsRate: number;
    avgCorners: number;
    avgCornersAgainst: number;
    avgFouls: number;
    avgCards: number;
    avgShots: number;
    dominanceIndex: number;
    lateGoalsRate: number;
  } {
    let goalsHT = 0, over15 = 0, over25 = 0, btts = 0, lateGoals = 0;
    let totalCorners = 0, totalCornersAgainst = 0, totalFouls = 0, totalCards = 0, totalShots = 0;
    let matchesWithStats = 0;
    let shotsOnTarget = 0, goalsConceded = 0;

    for (const match of matches) {
      const isHome = match.teams.home.id === teamId;
      const homeGoals = match.goals.home ?? 0;
      const awayGoals = match.goals.away ?? 0;
      const totalGoals = homeGoals + awayGoals;
      const scored = isHome ? homeGoals : awayGoals;
      const conceded = isHome ? awayGoals : homeGoals;

      const htHome = match.score?.halftime?.home ?? 0;
      const htAway = match.score?.halftime?.away ?? 0;
      const htTotal = htHome + htAway;

      if (htTotal > 0) goalsHT++;
      if (totalGoals > 1.5) over15++;
      if (totalGoals > 2.5) over25++;
      if (homeGoals > 0 && awayGoals > 0) btts++;
      
      goalsConceded += conceded;

      const stats = statsMap.get(match.fixture.id);
      if (stats && stats.length >= 2) {
        const teamStats = isHome ? stats[0]?.statistics : stats[1]?.statistics;
        const oppStats = isHome ? stats[1]?.statistics : stats[0]?.statistics;
        
        if (teamStats) {
          matchesWithStats++;
          totalCorners += this.parseStatValue(teamStats, 'Corner Kicks');
          totalFouls += this.parseStatValue(teamStats, 'Fouls');
          totalCards += this.parseStatValue(teamStats, 'Yellow Cards') + this.parseStatValue(teamStats, 'Red Cards');
          totalShots += this.parseStatValue(teamStats, 'Total Shots');
          shotsOnTarget += this.parseStatValue(teamStats, 'Shots on Goal');
        }
        if (oppStats) {
          totalCornersAgainst += this.parseStatValue(oppStats, 'Corner Kicks');
        }
      }
    }

    const n = matches.length || 1;
    const nStats = matchesWithStats || 1;
    const avgShotsOnTarget = shotsOnTarget / nStats;
    const avgCorners = totalCorners / nStats;
    const avgGoalsConceded = goalsConceded / n;

    const dominanceIndex = avgGoalsConceded > 0 
      ? (avgShotsOnTarget + avgCorners) / avgGoalsConceded 
      : (avgShotsOnTarget + avgCorners);

    return {
      goalsHTRate: (goalsHT / n) * 100,
      over15Rate: (over15 / n) * 100,
      over25Rate: (over25 / n) * 100,
      bttsRate: (btts / n) * 100,
      avgCorners: totalCorners / nStats,
      avgCornersAgainst: totalCornersAgainst / nStats,
      avgFouls: totalFouls / nStats,
      avgCards: totalCards / nStats,
      avgShots: totalShots / nStats,
      dominanceIndex,
      lateGoalsRate: (lateGoals / n) * 100,
    };
  }

  private calculateConfidenceScore(
    homeRecurrence: number,
    awayRecurrence: number,
    h2hRecurrence: number
  ): number {
    return (homeRecurrence * 0.4) + (awayRecurrence * 0.4) + (h2hRecurrence * 0.2);
  }

  private detectPatterns(
    homeStats: ReturnType<typeof this.analyzeTeamPattern>,
    awayStats: ReturnType<typeof this.analyzeTeamPattern>,
    h2hMatches: FixtureData[]
  ): { market: string; score: number; reasoning: OraculoSignal['reasoning'] }[] {
    const patterns: { market: string; score: number; reasoning: OraculoSignal['reasoning'] }[] = [];

    let h2hGoalsHT = 0, h2hOver15 = 0, h2hOver25 = 0, h2hBtts = 0;
    for (const match of h2hMatches) {
      const htHome = match.score?.halftime?.home ?? 0;
      const htAway = match.score?.halftime?.away ?? 0;
      const homeGoals = match.goals.home ?? 0;
      const awayGoals = match.goals.away ?? 0;
      const totalGoals = homeGoals + awayGoals;
      
      if (htHome + htAway > 0) h2hGoalsHT++;
      if (totalGoals > 1.5) h2hOver15++;
      if (totalGoals > 2.5) h2hOver25++;
      if (homeGoals > 0 && awayGoals > 0) h2hBtts++;
    }
    const h2hN = Math.max(h2hMatches.length, 1);
    const h2hGoalsHTRate = (h2hGoalsHT / h2hN) * 100;
    const h2hOver15Rate = (h2hOver15 / h2hN) * 100;
    const h2hOver25Rate = (h2hOver25 / h2hN) * 100;
    const h2hBttsRate = (h2hBtts / h2hN) * 100;

    const goalsHTScore = this.calculateConfidenceScore(homeStats.goalsHTRate, awayStats.goalsHTRate, h2hGoalsHTRate);
    if (goalsHTScore >= 75 && homeStats.goalsHTRate >= 70 && awayStats.goalsHTRate >= 70) {
      patterns.push({
        market: 'Over 0.5 Gols HT (1º Tempo)',
        score: Math.round(goalsHTScore),
        reasoning: {
          pattern: `Padrão detectado: Gols no 1º tempo em ${goalsHTScore.toFixed(0)}% das amostras combinadas.`,
          statsHome: `Mandante tem gols no HT em ${homeStats.goalsHTRate.toFixed(0)}% dos últimos 10 jogos.`,
          statsAway: `Visitante tem gols no HT em ${awayStats.goalsHTRate.toFixed(0)}% dos últimos 10 jogos.`,
          aiInsight: `Alta probabilidade de jogo aberto desde o início. Ambas equipes com tendência ofensiva precoce.`
        }
      });
    }

    const over15Score = this.calculateConfidenceScore(homeStats.over15Rate, awayStats.over15Rate, h2hOver15Rate);
    if (over15Score >= 75 && homeStats.over15Rate >= 70 && awayStats.over15Rate >= 70) {
      patterns.push({
        market: 'Over 1.5 Gols FT',
        score: Math.round(over15Score),
        reasoning: {
          pattern: `Padrão detectado: +1.5 gols em ${over15Score.toFixed(0)}% das amostras (${Math.round((homeStats.over15Rate + awayStats.over15Rate) / 2)}% média times).`,
          statsHome: `Mandante tem Over 1.5 em ${homeStats.over15Rate.toFixed(0)}% dos jogos recentes.`,
          statsAway: `Visitante tem Over 1.5 em ${awayStats.over15Rate.toFixed(0)}% dos jogos recentes.`,
          aiInsight: `Tendência clara de jogos com pelo menos 2 gols totais.`
        }
      });
    }

    const over25Score = this.calculateConfidenceScore(homeStats.over25Rate, awayStats.over25Rate, h2hOver25Rate);
    if (over25Score >= 75 && homeStats.over25Rate >= 60 && awayStats.over25Rate >= 60) {
      patterns.push({
        market: 'Over 2.5 Gols FT',
        score: Math.round(over25Score),
        reasoning: {
          pattern: `Padrão detectado: +2.5 gols em ${over25Score.toFixed(0)}% das amostras combinadas.`,
          statsHome: `Mandante tem Over 2.5 em ${homeStats.over25Rate.toFixed(0)}% dos jogos.`,
          statsAway: `Visitante tem Over 2.5 em ${awayStats.over25Rate.toFixed(0)}% dos jogos.`,
          aiInsight: `Perfil ofensivo de ambas equipes indica jogo com muitos gols.`
        }
      });
    }

    const bttsScore = this.calculateConfidenceScore(homeStats.bttsRate, awayStats.bttsRate, h2hBttsRate);
    if (bttsScore >= 75 && homeStats.bttsRate >= 60 && awayStats.bttsRate >= 60) {
      patterns.push({
        market: 'Ambas Marcam (BTTS)',
        score: Math.round(bttsScore),
        reasoning: {
          pattern: `Padrão detectado: BTTS em ${bttsScore.toFixed(0)}% das amostras.`,
          statsHome: `Mandante: BTTS em ${homeStats.bttsRate.toFixed(0)}% dos jogos (ataque efetivo + defesa vazada).`,
          statsAway: `Visitante: BTTS em ${awayStats.bttsRate.toFixed(0)}% dos jogos.`,
          aiInsight: `Perfil de "Defesa Vazada" e "Ataque Efetivo" em ambos os times.`
        }
      });
    }

    const avgCornersProjected = homeStats.avgCorners + awayStats.avgCornersAgainst;
    const minCornersThreshold = 9.5;
    if (avgCornersProjected >= minCornersThreshold && homeStats.avgCorners >= 4.5) {
      const cornersRecurrence = Math.min(90, 70 + (avgCornersProjected - minCornersThreshold) * 4);
      const cornersScore = this.calculateConfidenceScore(cornersRecurrence, cornersRecurrence, cornersRecurrence);
      if (cornersScore >= 75) {
        const suggestedLine = Math.floor(avgCornersProjected - 1.5);
        patterns.push({
          market: `Over ${suggestedLine}.5 Escanteios`,
          score: Math.round(cornersScore),
          reasoning: {
            pattern: `Média projetada de ${avgCornersProjected.toFixed(1)} escanteios no jogo (linha sugerida: ${suggestedLine}.5).`,
            statsHome: `Mandante produz ${homeStats.avgCorners.toFixed(1)} cantos/jogo e ${homeStats.avgShots.toFixed(1)} chutes/jogo.`,
            statsAway: `Visitante cede ${awayStats.avgCornersAgainst.toFixed(1)} cantos/jogo.`,
            aiInsight: `Pressão ofensiva do mandante + defesa recuada do visitante = alto volume de cantos.`
          }
        });
      }
    }

    const avgFoulsTotal = homeStats.avgFouls + awayStats.avgFouls;
    const avgCardsTotal = homeStats.avgCards + awayStats.avgCards;
    if (avgFoulsTotal >= 24 && avgCardsTotal >= 3.5) {
      const cardsRecurrence = Math.min(90, 70 + (avgCardsTotal - 3.5) * 5);
      const cardsScore = this.calculateConfidenceScore(cardsRecurrence, cardsRecurrence, cardsRecurrence);
      if (cardsScore >= 75) {
        const suggestedLine = Math.floor(avgCardsTotal);
        patterns.push({
          market: `Over ${suggestedLine}.5 Cartões`,
          score: Math.round(cardsScore),
          reasoning: {
            pattern: `Média de ${avgCardsTotal.toFixed(1)} cartões combinados nos jogos recentes.`,
            statsHome: `Mandante: ${homeStats.avgFouls.toFixed(1)} faltas e ${homeStats.avgCards.toFixed(1)} cartões/jogo.`,
            statsAway: `Visitante: ${awayStats.avgFouls.toFixed(1)} faltas e ${awayStats.avgCards.toFixed(1)} cartões/jogo.`,
            aiInsight: `Jogo com alto nível de agressividade previsto (${avgFoulsTotal.toFixed(0)} faltas média combinada).`
          }
        });
      }
    }

    return patterns;
  }

  async runDeepScan(maxFixtures: number = 50): Promise<OraculoScanResult> {
    console.log('[ORÁCULO] Iniciando Deep Scan...');
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const [fixturesToday, fixturesTomorrow] = await Promise.all([
      this.fetchFixturesForDate(todayStr),
      this.fetchFixturesForDate(tomorrowStr)
    ]);

    const allFixtures = [...fixturesToday, ...fixturesTomorrow];
    console.log(`[ORÁCULO] ${allFixtures.length} jogos encontrados nas próximas 24h`);

    const validFixtures = allFixtures
      .filter(f => !this.isLeagueExcluded(f.league.name))
      .filter(f => this.TOP_LEAGUES.includes(f.league.id) || !f.league.name.includes('Cup'))
      .slice(0, maxFixtures);

    console.log(`[ORÁCULO] ${validFixtures.length} jogos válidos após filtragem`);

    const opportunities: OraculoSignal[] = [];
    let fixturesAnalyzed = 0;

    for (const fixture of validFixtures) {
      try {
        console.log(`[ORÁCULO] Analisando: ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);

        const [homeMatches, awayMatches, h2hMatches] = await Promise.all([
          this.fetchTeamLastMatches(fixture.teams.home.id, 10),
          this.fetchTeamLastMatches(fixture.teams.away.id, 10),
          this.fetchH2H(fixture.teams.home.id, fixture.teams.away.id, 5)
        ]);

        if (homeMatches.length < 8 || awayMatches.length < 8) {
          console.log(`[ORÁCULO] Dados insuficientes (home: ${homeMatches.length}, away: ${awayMatches.length})`);
          continue;
        }

        fixturesAnalyzed++;

        const allMatchIds = [
          ...homeMatches.map(m => m.fixture.id),
          ...awayMatches.map(m => m.fixture.id),
          ...h2hMatches.map(m => m.fixture.id)
        ];
        const uniqueIds = Array.from(new Set(allMatchIds));

        const statsMap = new Map<number, any>();
        for (const id of uniqueIds.slice(0, 20)) {
          const stats = await this.fetchFixtureStatistics(id);
          if (stats) statsMap.set(id, stats);
        }

        const homeStats = this.analyzeTeamPattern(homeMatches, fixture.teams.home.id, statsMap);
        const awayStats = this.analyzeTeamPattern(awayMatches, fixture.teams.away.id, statsMap);

        const patterns = this.detectPatterns(homeStats, awayStats, h2hMatches) as any[];

        for (const pattern of patterns) {
          const matchDate = new Date(fixture.fixture.date);
          
          opportunities.push({
            fixtureId: fixture.fixture.id,
            league: fixture.league.name,
            leagueCountry: fixture.league.country,
            homeTeam: fixture.teams.home.name,
            awayTeam: fixture.teams.away.name,
            homeTeamLogo: fixture.teams.home.logo,
            awayTeamLogo: fixture.teams.away.logo,
            matchDate: matchDate.toLocaleDateString('pt-BR'),
            matchTime: matchDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            marketRecommendation: pattern.market,
            confidenceScore: pattern.score,
            badgeType: pattern.score >= 85 ? 'DIAMOND' : 'GOLD',
            reasoning: pattern.reasoning,
            dominanceIndex: {
              home: Math.round(homeStats.dominanceIndex * 10) / 10,
              away: Math.round(awayStats.dominanceIndex * 10) / 10
            },
            rawData: {
              homeRecurrence: Math.round(homeStats.over15Rate),
              awayRecurrence: Math.round(awayStats.over15Rate),
              h2hRecurrence: h2hMatches.length > 0 ? 80 : 0,
              sampleSize: homeMatches.length + awayMatches.length
            }
          });
        }

      } catch (error: any) {
        console.error(`[ORÁCULO] Erro ao analisar ${fixture.teams.home.name} vs ${fixture.teams.away.name}:`, error.message);
      }
    }

    opportunities.sort((a, b) => b.confidenceScore - a.confidenceScore);

    const result: OraculoScanResult = {
      scanTimestamp: new Date().toISOString(),
      totalFixturesScanned: allFixtures.length,
      fixturesAnalyzed,
      signalsGenerated: opportunities.length,
      opportunities: opportunities.slice(0, 20)
    };

    await this.setCachedData('oraculo_last_scan', 'oraculo_result', result, 4);

    console.log(`[ORÁCULO] Scan concluído: ${opportunities.length} oportunidades encontradas`);
    return result;
  }

  async getLastScanResult(): Promise<OraculoScanResult | null> {
    return await this.getCachedData('oraculo_last_scan');
  }
}

export const oraculoService = new OraculoService();
