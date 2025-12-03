import axios from 'axios';

const API_FOOTBALL_KEY = process.env.FOOTBALL_API_KEY || process.env.API_FOOTBALL_KEY || '';
const API_BASE = 'https://v3.football.api-sports.io';

if (!API_FOOTBALL_KEY) {
  console.warn('[ELITE ENGINE] ⚠️ No API-Football key found. Set FOOTBALL_API_KEY environment variable.');
}

interface TeamStats {
  teamId: number;
  teamName: string;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  avgGoalsScoredHome: number;
  avgGoalsConcededHome: number;
  avgGoalsScoredAway: number;
  avgGoalsConcededAway: number;
  xG: number;
  xGA: number;
  over15Rate: number;
  over25Rate: number;
  bttsRate: number;
  goalsHTRate: number;
  cleanSheetRate: number;
  failedToScoreRate: number;
  avgCorners: number;
  avgCornersAgainst: number;
  avgCards: number;
  avgCardsAgainst: number;
  avgFouls: number;
  avgShots: number;
  avgShotsOnTarget: number;
  formLast5: string;
  formPoints: number;
  winStreak: number;
  lossStreak: number;
  unbeatenStreak: number;
  noWinStreak: number;
  position: number;
  leagueSize: number;
  matchesPlayed: number;
}

interface RefereeStats {
  refereeId: number;
  refereeName: string;
  avgYellowCards: number;
  avgRedCards: number;
  avgTotalCards: number;
  avgFouls: number;
  gamesOfficiated: number;
  over35CardsRate: number;
  over45CardsRate: number;
}

interface MatchContext {
  isClassico: boolean;
  classicoIntensity: number;
  homeTeamNeedsPoints: boolean;
  awayTeamNeedsPoints: boolean;
  isTopOfTableClash: boolean;
  isRelegationBattle: boolean;
  isTitleDecider: boolean;
  matchImportance: number;
  restDaysHome: number;
  restDaysAway: number;
}

interface PoissonProbabilities {
  homeWin: number;
  draw: number;
  awayWin: number;
  over05: number;
  over15: number;
  over25: number;
  over35: number;
  btts: number;
  htOver05: number;
  exactScores: { score: string; probability: number }[];
}

interface EliteSignal {
  fixtureId: number;
  league: string;
  leagueLogo: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  matchDate: string;
  matchTime: string;
  market: string;
  marketCategory: 'GOALS' | 'CORNERS' | 'CARDS' | 'BTTS' | 'RESULT';
  prediction: string;
  probability: number;
  bookmakerOdd: number;
  fairOdd: number;
  expectedValue: number;
  confidenceScore: number;
  badgeType: 'DIAMOND' | 'GOLD' | 'SILVER';
  reasoning: {
    primary: string;
    homeAnalysis: string;
    awayAnalysis: string;
    h2hInsight: string;
    refereeInsight?: string;
    contextInsight: string;
  };
  patternStrength: number;
  dataPoints: {
    homeForm: string;
    awayForm: string;
    h2hRecord: string;
    homePosition: string;
    awayPosition: string;
    referee?: string;
  };
  rawProbabilities: PoissonProbabilities;
}

interface EliteScanResult {
  scanTimestamp: string;
  totalFixturesScanned: number;
  fixturesAnalyzed: number;
  signalsGenerated: number;
  diamondSignals: number;
  goldSignals: number;
  avgExpectedValue: number;
  opportunities: EliteSignal[];
}

const TOP_LEAGUES = [
  39,   // Premier League
  140,  // La Liga
  135,  // Serie A
  78,   // Bundesliga
  61,   // Ligue 1
  71,   // Brasileirão Série A
  72,   // Brasileirão Série B
  2,    // Champions League
  3,    // Europa League
  848,  // Conference League
  94,   // Primeira Liga (Portugal)
  88,   // Eredivisie
  144,  // Jupiler Pro League
  203,  // Super Lig (Turkey)
  179,  // Scottish Premiership
  128,  // Liga Argentina
  129,  // Copa Argentina
  13,   // Libertadores
  11,   // Copa Sudamericana
  253,  // MLS
  262,  // Liga MX
  307,  // Saudi Pro League
  218,  // Championship (England)
  40,   // Serie B (Italy)
  141,  // La Liga 2 (Spain)
  79,   // 2. Bundesliga
  62,   // Ligue 2 (France)
  235,  // Russian Premier League
  106,  // Ekstraklasa (Poland)
  113,  // Super League (Switzerland)
  103,  // Eliteserien (Norway)
  119,  // Allsvenskan (Sweden)
  169,  // Super League (China)
  292,  // K League 1 (Korea)
  98,   // J1 League (Japan)
  188,  // A-League (Australia)
];

const EXCLUDED_KEYWORDS = [
  'U17', 'U18', 'U19', 'U20', 'U21', 'U23',
  'Sub-17', 'Sub-18', 'Sub-19', 'Sub-20', 'Sub-21', 'Sub-23',
  'Youth', 'Juvenil', 'Reserve', 'Reserva', 'Amateur', 'Amador',
  'Women', 'Feminino', 'W ', ' W', 'Friendly', 'Amistoso'
];

const CLASSICO_PAIRS: Record<number, number[]> = {
  33: [34],     // Man United vs Man City
  34: [33],
  40: [47],     // Liverpool vs Chelsea
  47: [40],
  42: [50],     // Arsenal vs Tottenham
  50: [42],
  529: [530],   // Barcelona vs Real Madrid
  530: [529],
  489: [505],   // AC Milan vs Inter Milan
  505: [489],
  487: [492],   // Lazio vs Roma (Derby della Capitale)
  492: [487],
  157: [165],   // Bayern Munich vs Borussia Dortmund
  165: [157],
  85: [95],     // PSG vs Marseille
  95: [85],
  127: [131],   // Flamengo vs Fluminense
  131: [127],
  121: [126],   // Palmeiras vs Corinthians
  126: [121],
  118: [119],   // São Paulo vs Santos
  119: [118],
  435: [436],   // River Plate vs Boca Juniors
  436: [435],
  211: [212],   // Benfica vs Porto
  212: [211],
  194: [197],   // Ajax vs Feyenoord
  197: [194],
  541: [548],   // Real Madrid vs Atletico Madrid
  548: [541],
};

class ElitePredictionEngine {
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly CACHE_TTL = 6 * 60 * 60 * 1000;

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, expiry: Date.now() + this.CACHE_TTL });
  }

  private async apiRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T | null> {
    const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
    const cached = this.getCached<T>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${API_BASE}${endpoint}`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        params,
        timeout: 15000
      });

      if (response.data?.response) {
        this.setCache(cacheKey, response.data.response);
        return response.data.response;
      }
      return null;
    } catch (error: any) {
      console.error(`[ELITE] API Error ${endpoint}:`, error.message);
      return null;
    }
  }

  private factorial(n: number): number {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  private poissonProbability(lambda: number, k: number): number {
    if (lambda <= 0) return k === 0 ? 1 : 0;
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k);
  }

  private calculatePoissonProbabilities(lambdaHome: number, lambdaAway: number): PoissonProbabilities {
    let homeWin = 0, draw = 0, awayWin = 0;
    let over05 = 0, over15 = 0, over25 = 0, over35 = 0;
    let btts = 0, htOver05 = 0;
    const exactScores: { score: string; probability: number }[] = [];

    for (let h = 0; h <= 8; h++) {
      for (let a = 0; a <= 8; a++) {
        const prob = this.poissonProbability(lambdaHome, h) * this.poissonProbability(lambdaAway, a);
        const totalGoals = h + a;

        if (h > a) homeWin += prob;
        else if (h === a) draw += prob;
        else awayWin += prob;

        if (totalGoals >= 1) over05 += prob;
        if (totalGoals >= 2) over15 += prob;
        if (totalGoals >= 3) over25 += prob;
        if (totalGoals >= 4) over35 += prob;

        if (h > 0 && a > 0) btts += prob;

        if (h <= 5 && a <= 5) {
          exactScores.push({ score: `${h}-${a}`, probability: prob * 100 });
        }
      }
    }

    const lambdaHT = (lambdaHome + lambdaAway) * 0.42;
    htOver05 = 1 - this.poissonProbability(lambdaHT, 0);

    exactScores.sort((a, b) => b.probability - a.probability);

    return {
      homeWin: homeWin * 100,
      draw: draw * 100,
      awayWin: awayWin * 100,
      over05: over05 * 100,
      over15: over15 * 100,
      over25: over25 * 100,
      over35: over35 * 100,
      btts: btts * 100,
      htOver05: htOver05 * 100,
      exactScores: exactScores.slice(0, 10)
    };
  }

  private calculateExpectedValue(probability: number, bookmakerOdd: number): number {
    const fairOdd = 100 / probability;
    const ev = ((probability / 100) * bookmakerOdd - 1) * 100;
    return ev;
  }

  private async fetchFixtures(date: string): Promise<any[]> {
    const fixtures = await this.apiRequest<any[]>('/fixtures', { date, status: 'NS' });
    return fixtures || [];
  }

  private async fetchTeamStatistics(teamId: number, leagueId: number, season: number): Promise<any> {
    return await this.apiRequest('/teams/statistics', { team: teamId, league: leagueId, season });
  }

  private async fetchTeamLastMatches(teamId: number, last: number = 10): Promise<any[]> {
    const matches = await this.apiRequest<any[]>('/fixtures', { team: teamId, last, status: 'FT' });
    return matches || [];
  }

  private async fetchH2H(team1Id: number, team2Id: number, last: number = 10): Promise<any[]> {
    const h2h = await this.apiRequest<any[]>('/fixtures/headtohead', { h2h: `${team1Id}-${team2Id}`, last });
    return h2h || [];
  }

  private async fetchStandings(leagueId: number, season: number): Promise<any[]> {
    const standings = await this.apiRequest<any[]>('/standings', { league: leagueId, season });
    if (standings && standings[0]?.league?.standings) {
      return standings[0].league.standings[0] || [];
    }
    return [];
  }

  private async fetchFixtureStatistics(fixtureId: number): Promise<any[]> {
    const stats = await this.apiRequest<any[]>('/fixtures/statistics', { fixture: fixtureId });
    return stats || [];
  }

  private async fetchOdds(fixtureId: number): Promise<any> {
    const odds = await this.apiRequest<any[]>('/odds', { fixture: fixtureId, bookmaker: 8 }); // Bet365
    return odds?.[0] || null;
  }

  private isLeagueExcluded(leagueName: string): boolean {
    return EXCLUDED_KEYWORDS.some(kw => leagueName.toLowerCase().includes(kw.toLowerCase()));
  }

  private calculateFormPoints(matches: any[], teamId: number): { formString: string; points: number; streak: any } {
    let points = 0;
    let formString = '';
    let winStreak = 0, lossStreak = 0, unbeatenStreak = 0, noWinStreak = 0;
    let currentWin = 0, currentLoss = 0, currentUnbeaten = 0, currentNoWin = 0;

    for (const match of matches.slice(0, 5)) {
      const isHome = match.teams.home.id === teamId;
      const teamGoals = isHome ? match.goals.home : match.goals.away;
      const oppGoals = isHome ? match.goals.away : match.goals.home;

      if (teamGoals > oppGoals) {
        formString += 'W';
        points += 3;
        currentWin++;
        currentUnbeaten++;
        currentLoss = 0;
        currentNoWin = 0;
      } else if (teamGoals === oppGoals) {
        formString += 'D';
        points += 1;
        currentUnbeaten++;
        currentNoWin++;
        currentWin = 0;
        currentLoss = 0;
      } else {
        formString += 'L';
        currentLoss++;
        currentNoWin++;
        currentWin = 0;
        currentUnbeaten = 0;
      }

      winStreak = Math.max(winStreak, currentWin);
      lossStreak = Math.max(lossStreak, currentLoss);
      unbeatenStreak = Math.max(unbeatenStreak, currentUnbeaten);
      noWinStreak = Math.max(noWinStreak, currentNoWin);
    }

    return {
      formString,
      points,
      streak: { winStreak, lossStreak, unbeatenStreak, noWinStreak }
    };
  }

  private async analyzeTeam(teamId: number, matches: any[], leagueId: number, season: number): Promise<TeamStats> {
    const teamName = matches[0]?.teams?.home?.id === teamId 
      ? matches[0]?.teams?.home?.name 
      : matches[0]?.teams?.away?.name || 'Unknown';

    let goalsScored = 0, goalsConceded = 0;
    let goalsScoredHome = 0, goalsConcededHome = 0;
    let goalsScoredAway = 0, goalsConcededAway = 0;
    let over15 = 0, over25 = 0, btts = 0, goalsHT = 0;
    let cleanSheets = 0, failedToScore = 0;
    let corners = 0, cornersAgainst = 0;
    let cards = 0, cardsAgainst = 0;
    let fouls = 0, foulsAgainst = 0;
    let shots = 0, shotsOnTarget = 0;
    let homeGames = 0, awayGames = 0;
    let matchesWithStats = 0;

    const fixtureIds = matches.slice(0, 8).map(m => m.fixture.id);
    const statsPromises = fixtureIds.map(id => this.fetchFixtureStatistics(id));
    const allStats = await Promise.all(statsPromises);

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const isHome = match.teams.home.id === teamId;
      const teamGoals = isHome ? (match.goals.home ?? 0) : (match.goals.away ?? 0);
      const oppGoals = isHome ? (match.goals.away ?? 0) : (match.goals.home ?? 0);
      const htHome = match.score?.halftime?.home ?? 0;
      const htAway = match.score?.halftime?.away ?? 0;
      const totalGoals = teamGoals + oppGoals;

      goalsScored += teamGoals;
      goalsConceded += oppGoals;

      if (isHome) {
        goalsScoredHome += teamGoals;
        goalsConcededHome += oppGoals;
        homeGames++;
      } else {
        goalsScoredAway += teamGoals;
        goalsConcededAway += oppGoals;
        awayGames++;
      }

      if (totalGoals >= 2) over15++;
      if (totalGoals >= 3) over25++;
      if (teamGoals > 0 && oppGoals > 0) btts++;
      if (htHome + htAway > 0) goalsHT++;
      if (oppGoals === 0) cleanSheets++;
      if (teamGoals === 0) failedToScore++;

      if (i < allStats.length && allStats[i] && allStats[i].length >= 2) {
        matchesWithStats++;
        const teamStatsIdx = isHome ? 0 : 1;
        const oppStatsIdx = isHome ? 1 : 0;
        const teamMatchStats = allStats[i][teamStatsIdx]?.statistics || [];
        const oppMatchStats = allStats[i][oppStatsIdx]?.statistics || [];

        const getStat = (stats: any[], name: string): number => {
          const stat = stats.find((s: any) => s.type === name);
          if (!stat || stat.value === null) return 0;
          return typeof stat.value === 'string' ? parseInt(stat.value) || 0 : stat.value || 0;
        };

        corners += getStat(teamMatchStats, 'Corner Kicks');
        cornersAgainst += getStat(oppMatchStats, 'Corner Kicks');
        cards += getStat(teamMatchStats, 'Yellow Cards') + getStat(teamMatchStats, 'Red Cards');
        cardsAgainst += getStat(oppMatchStats, 'Yellow Cards') + getStat(oppMatchStats, 'Red Cards');
        fouls += getStat(teamMatchStats, 'Fouls');
        foulsAgainst += getStat(oppMatchStats, 'Fouls');
        shots += getStat(teamMatchStats, 'Total Shots');
        shotsOnTarget += getStat(teamMatchStats, 'Shots on Goal');
      }
    }

    const n = matches.length || 1;
    const statsN = matchesWithStats || 1;
    const form = this.calculateFormPoints(matches, teamId);

    let position = 0, leagueSize = 0;
    try {
      const standings = await this.fetchStandings(leagueId, season);
      const teamStanding = standings.find((s: any) => s.team?.id === teamId);
      if (teamStanding) {
        position = teamStanding.rank || 0;
        leagueSize = standings.length;
      }
    } catch {}

    const avgGoalsScoredCalc = goalsScored / n;
    const avgGoalsConcededCalc = goalsConceded / n;

    console.log(`[ELITE STATS] ${teamName}: ${cards}/${statsN} cartões (${(cards/statsN).toFixed(1)}/jogo), ${corners}/${statsN} cantos (${(corners/statsN).toFixed(1)}/jogo), ${shots}/${statsN} chutes (${(shots/statsN).toFixed(1)}/jogo)`);

    return {
      teamId,
      teamName,
      avgGoalsScored: avgGoalsScoredCalc,
      avgGoalsConceded: avgGoalsConcededCalc,
      avgGoalsScoredHome: homeGames > 0 ? goalsScoredHome / homeGames : avgGoalsScoredCalc,
      avgGoalsConcededHome: homeGames > 0 ? goalsConcededHome / homeGames : avgGoalsConcededCalc,
      avgGoalsScoredAway: awayGames > 0 ? goalsScoredAway / awayGames : avgGoalsScoredCalc,
      avgGoalsConcededAway: awayGames > 0 ? goalsConcededAway / awayGames : avgGoalsConcededCalc,
      xG: avgGoalsScoredCalc,
      xGA: avgGoalsConcededCalc,
      over15Rate: (over15 / n) * 100,
      over25Rate: (over25 / n) * 100,
      bttsRate: (btts / n) * 100,
      goalsHTRate: (goalsHT / n) * 100,
      cleanSheetRate: (cleanSheets / n) * 100,
      failedToScoreRate: (failedToScore / n) * 100,
      avgCorners: corners / statsN,
      avgCornersAgainst: cornersAgainst / statsN,
      avgCards: cards / statsN,
      avgCardsAgainst: cardsAgainst / statsN,
      avgFouls: fouls / statsN,
      avgShots: shots / statsN,
      avgShotsOnTarget: shotsOnTarget / statsN,
      formLast5: form.formString,
      formPoints: form.points,
      winStreak: form.streak.winStreak,
      lossStreak: form.streak.lossStreak,
      unbeatenStreak: form.streak.unbeatenStreak,
      noWinStreak: form.streak.noWinStreak,
      position,
      leagueSize,
      matchesPlayed: n
    };
  }

  private analyzeMatchContext(
    homeStats: TeamStats,
    awayStats: TeamStats,
    h2hMatches: any[],
    homeTeamId: number,
    awayTeamId: number
  ): MatchContext {
    const isClassico = CLASSICO_PAIRS[homeTeamId]?.includes(awayTeamId) || false;
    
    let classicoIntensity = 0;
    if (isClassico) {
      let h2hCards = 0;
      for (const match of h2hMatches.slice(0, 5)) {
        h2hCards += 4;
      }
      classicoIntensity = Math.min(100, h2hCards * 5);
    }

    const leagueSize = Math.max(homeStats.leagueSize, awayStats.leagueSize) || 20;
    const homeNeedsPoints = homeStats.position >= leagueSize - 4 || 
                           homeStats.position <= 4 || 
                           homeStats.noWinStreak >= 3;
    const awayNeedsPoints = awayStats.position >= leagueSize - 4 || 
                           awayStats.position <= 4 || 
                           awayStats.noWinStreak >= 3;
    
    const isTopOfTableClash = homeStats.position <= 5 && awayStats.position <= 5;
    const isRelegationBattle = homeStats.position >= leagueSize - 4 && awayStats.position >= leagueSize - 4;
    const isTitleDecider = homeStats.position <= 2 && awayStats.position <= 2;

    let matchImportance = 50;
    if (isClassico) matchImportance += 25;
    if (isTopOfTableClash) matchImportance += 20;
    if (isRelegationBattle) matchImportance += 15;
    if (isTitleDecider) matchImportance += 30;
    if (homeNeedsPoints || awayNeedsPoints) matchImportance += 10;
    matchImportance = Math.min(100, matchImportance);

    return {
      isClassico,
      classicoIntensity,
      homeTeamNeedsPoints: homeNeedsPoints,
      awayTeamNeedsPoints: awayNeedsPoints,
      isTopOfTableClash,
      isRelegationBattle,
      isTitleDecider,
      matchImportance,
      restDaysHome: 3,
      restDaysAway: 3
    };
  }

  private analyzeH2H(h2hMatches: any[], homeTeamId: number): {
    homeWins: number;
    awayWins: number;
    draws: number;
    avgGoals: number;
    over25Rate: number;
    bttsRate: number;
    avgCards: number;
    record: string;
  } {
    let homeWins = 0, awayWins = 0, draws = 0;
    let totalGoals = 0, over25 = 0, btts = 0;
    const n = h2hMatches.length || 1;

    for (const match of h2hMatches) {
      const hGoals = match.goals.home ?? 0;
      const aGoals = match.goals.away ?? 0;
      const isHomeInH2H = match.teams.home.id === homeTeamId;

      if (hGoals > aGoals) {
        if (isHomeInH2H) homeWins++; else awayWins++;
      } else if (aGoals > hGoals) {
        if (isHomeInH2H) awayWins++; else homeWins++;
      } else {
        draws++;
      }

      totalGoals += hGoals + aGoals;
      if (hGoals + aGoals >= 3) over25++;
      if (hGoals > 0 && aGoals > 0) btts++;
    }

    return {
      homeWins,
      awayWins,
      draws,
      avgGoals: totalGoals / n,
      over25Rate: (over25 / n) * 100,
      bttsRate: (btts / n) * 100,
      avgCards: 4.2,
      record: `${homeWins}V ${draws}E ${awayWins}D`
    };
  }

  private extractOdds(oddsData: any): Record<string, number> {
    const odds: Record<string, number> = {};
    
    if (!oddsData?.bookmakers?.[0]?.bets) return odds;

    for (const bet of oddsData.bookmakers[0].bets) {
      const betName = bet.name;
      for (const value of bet.values || []) {
        const key = `${betName}_${value.value}`;
        odds[key] = parseFloat(value.odd) || 0;
      }
    }

    return odds;
  }

  private generateSignals(
    fixture: any,
    homeStats: TeamStats,
    awayStats: TeamStats,
    h2hData: ReturnType<typeof this.analyzeH2H>,
    context: MatchContext,
    probabilities: PoissonProbabilities,
    odds: Record<string, number>
  ): EliteSignal[] {
    const signals: EliteSignal[] = [];
    const matchDate = new Date(fixture.fixture.date);

    const homeAdvantage = 1.15;
    const lambdaHome = (homeStats.xG * homeAdvantage + awayStats.xGA) / 2;
    const lambdaAway = (awayStats.xG + homeStats.xGA) / 2 / homeAdvantage;

    const createSignal = (
      market: string,
      category: EliteSignal['marketCategory'],
      prediction: string,
      probability: number,
      oddKey: string,
      reasoning: EliteSignal['reasoning']
    ): EliteSignal | null => {
      let bookmakerOdd = odds[oddKey] || 0;
      
      // Se não tem odd da casa, estima baseado na probabilidade
      if (bookmakerOdd < 1.20) {
        const fairOdd = 100 / probability;
        // Estima odd da casa com margem de 5-8%
        bookmakerOdd = fairOdd * 0.92;
        if (bookmakerOdd < 1.25) bookmakerOdd = 1.25;
        console.log(`[ELITE] Odd estimada para ${oddKey}: ${bookmakerOdd.toFixed(2)} (sem odds reais)`);
      }

      const fairOdd = 100 / probability;
      const ev = this.calculateExpectedValue(probability, bookmakerOdd);
      
      let badge: EliteSignal['badgeType'] = 'SILVER';
      let confidenceScore = probability;
      
      if (ev >= 7 && probability >= 72) {
        badge = 'DIAMOND';
        confidenceScore = Math.min(98, probability + ev * 0.5);
      } else if (ev >= 4 && probability >= 62) {
        badge = 'GOLD';
        confidenceScore = Math.min(94, probability + ev * 0.3);
      } else if (ev >= 2.5 && probability >= 58) {
        confidenceScore = Math.min(88, probability + ev * 0.2);
      }

      if (context.isClassico) confidenceScore = Math.min(99, confidenceScore + 3);
      if (context.matchImportance >= 80) confidenceScore = Math.min(99, confidenceScore + 2);

      const patternStrength = (
        (homeStats.over25Rate >= 60 ? 20 : 0) +
        (awayStats.over25Rate >= 60 ? 20 : 0) +
        (h2hData.over25Rate >= 60 ? 20 : 0) +
        (homeStats.formPoints >= 10 ? 15 : 0) +
        (awayStats.formPoints >= 10 ? 15 : 0) +
        (context.matchImportance >= 70 ? 10 : 0)
      );

      return {
        fixtureId: fixture.fixture.id,
        league: fixture.league.name,
        leagueLogo: fixture.league.logo,
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        homeTeamLogo: fixture.teams.home.logo,
        awayTeamLogo: fixture.teams.away.logo,
        matchDate: matchDate.toLocaleDateString('pt-BR'),
        matchTime: matchDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        market,
        marketCategory: category,
        prediction,
        probability: Math.round(probability * 10) / 10,
        bookmakerOdd,
        fairOdd: Math.round(fairOdd * 100) / 100,
        expectedValue: Math.round(ev * 10) / 10,
        confidenceScore: Math.round(confidenceScore),
        badgeType: badge,
        reasoning,
        patternStrength,
        dataPoints: {
          homeForm: homeStats.formLast5,
          awayForm: awayStats.formLast5,
          h2hRecord: h2hData.record,
          homePosition: `${homeStats.position}º`,
          awayPosition: `${awayStats.position}º`
        },
        rawProbabilities: probabilities
      };
    };

    if (probabilities.over25 >= 55 && homeStats.over25Rate >= 45 && awayStats.over25Rate >= 45) {
      const signal = createSignal(
        'Over 2.5 Gols',
        'GOALS',
        `Mais de 2.5 gols`,
        probabilities.over25,
        'Goals Over/Under_Over 2.5',
        {
          primary: `Modelo Poisson projeta ${probabilities.over25.toFixed(0)}% chance de +2.5 gols (λH=${lambdaHome.toFixed(2)}, λA=${lambdaAway.toFixed(2)})`,
          homeAnalysis: `${homeStats.teamName}: ${homeStats.over25Rate.toFixed(0)}% Over 2.5 nos últimos ${homeStats.matchesPlayed} jogos. xG=${homeStats.xG.toFixed(2)}`,
          awayAnalysis: `${awayStats.teamName}: ${awayStats.over25Rate.toFixed(0)}% Over 2.5 nos últimos ${awayStats.matchesPlayed} jogos. xGA=${awayStats.xGA.toFixed(2)}`,
          h2hInsight: `H2H: ${h2hData.over25Rate.toFixed(0)}% Over 2.5 (${h2hData.record}). Média ${h2hData.avgGoals.toFixed(1)} gols/jogo`,
          contextInsight: context.isClassico 
            ? `🔥 CLÁSSICO! Histórico de jogos abertos e intensos.`
            : context.matchImportance >= 80 
              ? `⚡ Jogo decisivo! Ambos precisam do resultado.`
              : `Condições favoráveis para jogo com gols.`
        }
      );
      if (signal && signal.expectedValue >= 2) signals.push(signal);
    }

    if (probabilities.over15 >= 68 && homeStats.over15Rate >= 60 && awayStats.over15Rate >= 60) {
      const signal = createSignal(
        'Over 1.5 Gols',
        'GOALS',
        `Mais de 1.5 gols`,
        probabilities.over15,
        'Goals Over/Under_Over 1.5',
        {
          primary: `Alta probabilidade: ${probabilities.over15.toFixed(0)}% para +1.5 gols`,
          homeAnalysis: `${homeStats.teamName}: Over 1.5 em ${homeStats.over15Rate.toFixed(0)}% dos jogos`,
          awayAnalysis: `${awayStats.teamName}: Over 1.5 em ${awayStats.over15Rate.toFixed(0)}% dos jogos`,
          h2hInsight: `Confrontos diretos têm média de ${h2hData.avgGoals.toFixed(1)} gols`,
          contextInsight: `Padrão consistente: ambos os times produzem jogos com múltiplos gols.`
        }
      );
      if (signal && signal.expectedValue >= 2) signals.push(signal);
    }

    if (probabilities.htOver05 >= 60 && homeStats.goalsHTRate >= 55 && awayStats.goalsHTRate >= 55) {
      const signal = createSignal(
        'Over 0.5 Gols HT',
        'GOALS',
        `Gol no 1º Tempo`,
        probabilities.htOver05,
        'First Half Goals_Over 0.5',
        {
          primary: `${probabilities.htOver05.toFixed(0)}% probabilidade de gol no 1º tempo`,
          homeAnalysis: `${homeStats.teamName}: gols no HT em ${homeStats.goalsHTRate.toFixed(0)}% dos jogos`,
          awayAnalysis: `${awayStats.teamName}: gols no HT em ${awayStats.goalsHTRate.toFixed(0)}% dos jogos`,
          h2hInsight: `Tendência de abertura rápida nos confrontos`,
          contextInsight: `Perfil ofensivo de ambos favorece início movimentado.`
        }
      );
      if (signal && signal.expectedValue >= 2) signals.push(signal);
    }

    if (probabilities.btts >= 52 && homeStats.bttsRate >= 48 && awayStats.bttsRate >= 48) {
      const homeScoresRate = 100 - homeStats.failedToScoreRate;
      const awayConcedes = 100 - awayStats.cleanSheetRate;
      const awayScoresRate = 100 - awayStats.failedToScoreRate;
      const homeConcedes = 100 - homeStats.cleanSheetRate;

      const combinedBtts = Math.min(homeScoresRate, awayConcedes) * Math.min(awayScoresRate, homeConcedes) / 100;

      if (combinedBtts >= 40) {
        const signal = createSignal(
          'Ambas Marcam',
          'BTTS',
          `BTTS - Sim`,
          probabilities.btts,
          'Both Teams Score_Yes',
          {
            primary: `BTTS Poisson: ${probabilities.btts.toFixed(0)}%. Análise cruzada: ${combinedBtts.toFixed(0)}%`,
            homeAnalysis: `${homeStats.teamName}: marca em ${homeScoresRate.toFixed(0)}% + sofre em ${homeConcedes.toFixed(0)}% dos jogos`,
            awayAnalysis: `${awayStats.teamName}: marca em ${awayScoresRate.toFixed(0)}% + sofre em ${awayConcedes.toFixed(0)}% dos jogos`,
            h2hInsight: `H2H BTTS: ${h2hData.bttsRate.toFixed(0)}%`,
            contextInsight: `Perfil "ataca bem, defende mal" em ambos os lados.`
          }
        );
        if (signal && signal.expectedValue >= 3) signals.push(signal);
      }
    }

    const projectedCorners = homeStats.avgCorners + awayStats.avgCorners;
    console.log(`[ELITE CORNERS] ${homeStats.teamName}: ${homeStats.avgCorners.toFixed(1)} + ${awayStats.teamName}: ${awayStats.avgCorners.toFixed(1)} = ${projectedCorners.toFixed(1)} cantos projetados`);
    
    if (projectedCorners >= 8.5) {
      const cornerLine = Math.floor(projectedCorners - 2);
      const cornerProb = 60 + (projectedCorners - 8) * 4;
      
      const signal = createSignal(
        `Over ${cornerLine}.5 Escanteios`,
        'CORNERS',
        `+${cornerLine}.5 corners`,
        Math.min(82, cornerProb),
        `Corners Over/Under_Over ${cornerLine}.5`,
        {
          primary: `Projeção: ${projectedCorners.toFixed(1)} escanteios no jogo (média últimos 8 jogos)`,
          homeAnalysis: `${homeStats.teamName}: ${homeStats.avgCorners.toFixed(1)} cantos/jogo, ${homeStats.avgShots.toFixed(0)} chutes/jogo`,
          awayAnalysis: `${awayStats.teamName}: ${awayStats.avgCorners.toFixed(1)} cantos/jogo, ${awayStats.avgShots.toFixed(0)} chutes/jogo`,
          h2hInsight: `Soma das médias de cantos indica jogo com muitos escanteios`,
          contextInsight: context.isClassico ? `🔥 Clássico tende a ter mais ataques e cantos.` : `Estilo de jogo ofensivo favorece escanteios.`
        }
      );
      if (signal && signal.expectedValue >= 1.5) signals.push(signal);
    }

    const projectedCards = homeStats.avgCards + awayStats.avgCards;
    console.log(`[ELITE CARDS] ${homeStats.teamName}: ${homeStats.avgCards.toFixed(1)} + ${awayStats.teamName}: ${awayStats.avgCards.toFixed(1)} = ${projectedCards.toFixed(1)} cartões projetados`);
    
    if (projectedCards >= 3.5 || context.isClassico) {
      const cardLine = Math.max(2, Math.floor(projectedCards - 0.5));
      let cardProb = 55 + (projectedCards - 3) * 8;
      if (context.isClassico) cardProb += 12;
      
      const signal = createSignal(
        `Over ${cardLine}.5 Cartões`,
        'CARDS',
        `+${cardLine}.5 cartões`,
        Math.min(85, cardProb),
        `Cards Over/Under_Over ${cardLine}.5`,
        {
          primary: `Projeção: ${projectedCards.toFixed(1)} cartões (dados reais últimos 8 jogos)`,
          homeAnalysis: `${homeStats.teamName}: ${homeStats.avgCards.toFixed(1)} cartões + ${homeStats.avgFouls.toFixed(0)} faltas/jogo`,
          awayAnalysis: `${awayStats.teamName}: ${awayStats.avgCards.toFixed(1)} cartões + ${awayStats.avgFouls.toFixed(0)} faltas/jogo`,
          h2hInsight: context.isClassico ? `🔥 Clássico = jogo quente com muitos cartões` : `Perfil de jogo com faltas frequentes`,
          refereeInsight: `Total projetado baseado em estatísticas reais das partidas`,
          contextInsight: context.isClassico 
            ? `DERBY! Rivalidade histórica = intensidade máxima e cartões.`
            : context.matchImportance >= 80 
              ? `Jogo decisivo tende a ter mais faltas táticas.`
              : `Padrão de jogo favorece cartões.`
        }
      );
      if (signal && signal.expectedValue >= 1.5) signals.push(signal);
    }

    const projectedShots = homeStats.avgShots + awayStats.avgShots;
    const projectedShotsOnTarget = homeStats.avgShotsOnTarget + awayStats.avgShotsOnTarget;
    console.log(`[ELITE SHOTS] ${homeStats.teamName}: ${homeStats.avgShots.toFixed(1)} + ${awayStats.teamName}: ${awayStats.avgShots.toFixed(1)} = ${projectedShots.toFixed(1)} chutes projetados`);
    
    if (projectedShotsOnTarget >= 8) {
      const shotLine = Math.floor(projectedShotsOnTarget - 2);
      const shotProb = 58 + (projectedShotsOnTarget - 8) * 4;
      
      const signal = createSignal(
        `Over ${shotLine}.5 Chutes no Gol`,
        'GOALS',
        `+${shotLine}.5 chutes no alvo`,
        Math.min(80, shotProb),
        `Shots on Target_Over ${shotLine}.5`,
        {
          primary: `Projeção: ${projectedShotsOnTarget.toFixed(1)} chutes no alvo (${projectedShots.toFixed(0)} chutes totais)`,
          homeAnalysis: `${homeStats.teamName}: ${homeStats.avgShotsOnTarget.toFixed(1)} chutes no gol/jogo`,
          awayAnalysis: `${awayStats.teamName}: ${awayStats.avgShotsOnTarget.toFixed(1)} chutes no gol/jogo`,
          h2hInsight: `Volume de chutes indica jogo ofensivo`,
          contextInsight: `Perfil ofensivo de ambos favorece chutes ao gol.`
        }
      );
      if (signal && signal.expectedValue >= 1.5) signals.push(signal);
    }

    return signals.filter(s => s.expectedValue >= 1.5 && s.confidenceScore >= 52);
  }

  async runEliteScan(maxFixtures: number = 80): Promise<EliteScanResult> {
    console.log('[ELITE ENGINE] 🚀 Iniciando varredura ELITE...');
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const [fixturestoday, fixturesTomorrow] = await Promise.all([
      this.fetchFixtures(todayStr),
      this.fetchFixtures(tomorrowStr)
    ]);

    const allFixtures = [...fixturestoday, ...fixturesTomorrow];
    console.log(`[ELITE ENGINE] Total fixtures: ${allFixtures.length}`);

    const validFixtures = allFixtures
      .filter(f => !this.isLeagueExcluded(f.league.name))
      .sort((a, b) => {
        const aTop = TOP_LEAGUES.includes(a.league.id) ? 0 : 1;
        const bTop = TOP_LEAGUES.includes(b.league.id) ? 0 : 1;
        return aTop - bTop;
      })
      .slice(0, maxFixtures);

    console.log(`[ELITE ENGINE] Fixtures válidos (top leagues): ${validFixtures.length}`);

    const opportunities: EliteSignal[] = [];
    let fixturesAnalyzed = 0;

    for (const fixture of validFixtures) {
      try {
        console.log(`[ELITE] Analisando: ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);

        const [homeMatches, awayMatches, h2hMatches, oddsData] = await Promise.all([
          this.fetchTeamLastMatches(fixture.teams.home.id, 10),
          this.fetchTeamLastMatches(fixture.teams.away.id, 10),
          this.fetchH2H(fixture.teams.home.id, fixture.teams.away.id, 10),
          this.fetchOdds(fixture.fixture.id)
        ]);

        if (homeMatches.length < 6 || awayMatches.length < 6) {
          console.log(`[ELITE] Dados insuficientes para análise`);
          continue;
        }

        fixturesAnalyzed++;

        const season = fixture.league.season || new Date().getFullYear();
        const [homeStats, awayStats] = await Promise.all([
          this.analyzeTeam(fixture.teams.home.id, homeMatches, fixture.league.id, season),
          this.analyzeTeam(fixture.teams.away.id, awayMatches, fixture.league.id, season)
        ]);

        const h2hData = this.analyzeH2H(h2hMatches, fixture.teams.home.id);
        const context = this.analyzeMatchContext(
          homeStats, 
          awayStats, 
          h2hMatches,
          fixture.teams.home.id,
          fixture.teams.away.id
        );

        const homeAdvantage = 1.15;
        const lambdaHome = (homeStats.xG * homeAdvantage + awayStats.xGA) / 2;
        const lambdaAway = (awayStats.xG + homeStats.xGA) / 2 / homeAdvantage;
        const probabilities = this.calculatePoissonProbabilities(lambdaHome, lambdaAway);

        const odds = this.extractOdds(oddsData);
        const signals = this.generateSignals(
          fixture,
          homeStats,
          awayStats,
          h2hData,
          context,
          probabilities,
          odds
        );

        opportunities.push(...signals);

      } catch (error: any) {
        console.error(`[ELITE] Erro: ${error.message}`);
      }
    }

    opportunities.sort((a, b) => {
      if (a.badgeType === 'DIAMOND' && b.badgeType !== 'DIAMOND') return -1;
      if (b.badgeType === 'DIAMOND' && a.badgeType !== 'DIAMOND') return 1;
      return b.expectedValue - a.expectedValue;
    });

    const diamondSignals = opportunities.filter(s => s.badgeType === 'DIAMOND').length;
    const goldSignals = opportunities.filter(s => s.badgeType === 'GOLD').length;
    const avgEV = opportunities.length > 0 
      ? opportunities.reduce((sum, s) => sum + s.expectedValue, 0) / opportunities.length 
      : 0;

    const result: EliteScanResult = {
      scanTimestamp: new Date().toISOString(),
      totalFixturesScanned: allFixtures.length,
      fixturesAnalyzed,
      signalsGenerated: opportunities.length,
      diamondSignals,
      goldSignals,
      avgExpectedValue: Math.round(avgEV * 10) / 10,
      opportunities: opportunities.slice(0, 30)
    };

    this.setCache('elite_last_scan', result);
    console.log(`[ELITE ENGINE] ✅ Scan completo: ${opportunities.length} sinais (${diamondSignals} DIAMOND, ${goldSignals} GOLD)`);

    return result;
  }

  async getLastScanResult(): Promise<EliteScanResult | null> {
    return this.getCached<EliteScanResult>('elite_last_scan');
  }
}

export const elitePredictionEngine = new ElitePredictionEngine();
