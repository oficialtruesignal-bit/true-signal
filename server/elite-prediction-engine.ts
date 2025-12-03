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

interface PatternAnalysis {
  over25GoalsRate: number;
  over35GoalsRate: number;
  bttsRate: number;
  over85CornersRate: number;
  over95CornersRate: number;
  over35CardsRate: number;
  over45CardsRate: number;
  over55CardsRate: number;
  matchesAnalyzed: number;
  matchesWithStats: number;
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

interface AnalyzedOpportunity {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  league: string;
  leagueLogo: string;
  matchDate: string;
  matchTime: string;
  market: string;
  probability: number;
  bookmakerOdd: number | null;
  fairOdd: number;
  expectedValue: number | null;
  status: 'APPROVED' | 'REJECTED_NO_ODDS' | 'REJECTED_LOW_EV' | 'REJECTED_LOW_PROB';
  rejectionReason?: string;
  potentialBadge: 'DIAMOND' | 'GOLD' | 'SILVER' | null;
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
  silverSignals: number;
  avgExpectedValue: number;
  opportunities: EliteSignal[];
  analyzedOpportunities: AnalyzedOpportunity[];
}

const TOP_LEAGUES = [
  // TIER 1 - Principais Ligas Europeias
  39,   // Premier League
  140,  // La Liga
  135,  // Serie A
  78,   // Bundesliga
  61,   // Ligue 1
  
  // TIER 1 - Competições Europeias
  2,    // Champions League
  3,    // Europa League
  848,  // Conference League
  
  // TIER 2 - Segundas Divisões Top 5
  218,  // Championship (England)
  141,  // La Liga 2 (Spain)
  136,  // Serie B (Italy)
  79,   // 2. Bundesliga
  62,   // Ligue 2 (France)
  
  // TIER 2 - Ligas Europeias Secundárias
  94,   // Primeira Liga (Portugal)
  88,   // Eredivisie (Netherlands)
  144,  // Jupiler Pro League (Belgium)
  203,  // Super Lig (Turkey)
  179,  // Scottish Premiership
  235,  // Russian Premier League
  106,  // Ekstraklasa (Poland)
  113,  // Super League (Switzerland)
  103,  // Eliteserien (Norway)
  119,  // Allsvenskan (Sweden)
  210,  // Super League (Greece)
  197,  // Super Liga (Serbia)
  207,  // Premijer Liga (Bosnia)
  172,  // HNL (Croatia)
  318,  // Superliga (Denmark)
  185,  // Tipsport Liga (Czech)
  271,  // NB I (Hungary)
  
  // TIER 2 - Américas
  71,   // Brasileirão Série A
  72,   // Brasileirão Série B
  128,  // Liga Argentina
  129,  // Copa Argentina
  13,   // Libertadores
  11,   // Copa Sudamericana
  253,  // MLS
  262,  // Liga MX
  263,  // Liga MX Clausura
  239,  // Primera División (Chile)
  240,  // Primera División (Colombia)
  281,  // Primera División (Peru)
  
  // TIER 3 - Ásia e Oceania
  307,  // Saudi Pro League
  169,  // Super League (China)
  292,  // K League 1 (Korea)
  98,   // J1 League (Japan)
  188,  // A-League (Australia)
  
  // TIER 3 - Copas Nacionais com bom volume
  45,   // FA Cup (England)
  143,  // Copa del Rey (Spain)
  137,  // Coppa Italia
  81,   // DFB Pokal
  66,   // Coupe de France
  73,   // Copa do Brasil
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
    // FALLBACK MULTI-BOOKMAKER: Bet365 → Pinnacle → 1xBet → Unibet → qualquer disponível
    const BOOKMAKER_PRIORITY = [
      { id: 8, name: 'Bet365' },
      { id: 3, name: 'Pinnacle' },
      { id: 29, name: '1xBet' },
      { id: 16, name: 'Unibet' },
      { id: 11, name: 'Betway' },
      { id: 1, name: 'Bwin' },
    ];

    // Primeiro, tentar buscar todas as odds do fixture (sem filtro de bookmaker)
    const cacheKey = `odds_all_${fixtureId}`;
    let allOdds: any[] | null = this.getCached<any[]>(cacheKey);
    
    if (!allOdds) {
      try {
        const response = await axios.get(`${API_BASE}/odds`, {
          headers: { 'x-apisports-key': API_FOOTBALL_KEY },
          params: { fixture: fixtureId },
          timeout: 15000
        });
        
        if (response.data?.response?.[0]?.bookmakers) {
          allOdds = response.data.response[0].bookmakers as any[];
          this.setCache(cacheKey, allOdds);
          console.log(`[ELITE] ✅ Odds carregadas para fixture ${fixtureId}: ${allOdds.length} bookmakers disponíveis`);
        } else {
          console.log(`[ELITE] ⚠️ Nenhuma odds disponível para fixture ${fixtureId}`);
          return null;
        }
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.log(`[ELITE] ⚠️ Rate limit (429) ao buscar odds para fixture ${fixtureId}`);
        } else {
          console.error(`[ELITE] Erro ao buscar odds:`, error.message);
        }
        return null;
      }
    }

    if (!allOdds || allOdds.length === 0) return null;

    // Procurar bookmaker por prioridade
    for (const bk of BOOKMAKER_PRIORITY) {
      const bookmaker = allOdds.find((b: any) => b.id === bk.id);
      if (bookmaker?.bets?.length > 0) {
        console.log(`[ELITE] 📊 Usando odds de ${bk.name} para fixture ${fixtureId}`);
        return { bookmakers: [bookmaker] };
      }
    }

    // Fallback: usar qualquer bookmaker disponível
    const anyBookmaker = allOdds.find((b: any) => b.bets?.length > 0);
    if (anyBookmaker) {
      console.log(`[ELITE] 📊 Usando odds de ${anyBookmaker.name} (fallback) para fixture ${fixtureId}`);
      return { bookmakers: [anyBookmaker] };
    }

    console.log(`[ELITE] ⚠️ Nenhum bookmaker com odds válidas para fixture ${fixtureId}`);
    return null;
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

  private async analyzeTeam(teamId: number, matches: any[], leagueId: number, season: number): Promise<TeamStats & { patterns: PatternAnalysis }> {
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
    
    // NOVA ANÁLISE: Contar padrões por jogo
    let gamesOver25Goals = 0;
    let gamesOver35Goals = 0;
    let gamesBtts = 0;
    let gamesOver85Corners = 0;
    let gamesOver95Corners = 0;
    let gamesOver35Cards = 0;
    let gamesOver45Cards = 0;
    let gamesOver55Cards = 0;

    // Usar apenas últimos 8 jogos para análise
    const recentMatches = matches.slice(0, 8);
    const fixtureIds = recentMatches.map(m => m.fixture.id);
    const statsPromises = fixtureIds.map(id => this.fetchFixtureStatistics(id));
    const allStats = await Promise.all(statsPromises);

    for (let i = 0; i < recentMatches.length; i++) {
      const match = recentMatches[i];
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

      // Contagem de padrões de gols
      if (totalGoals >= 2) over15++;
      if (totalGoals >= 3) { over25++; gamesOver25Goals++; }
      if (totalGoals >= 4) gamesOver35Goals++;
      if (teamGoals > 0 && oppGoals > 0) { btts++; gamesBtts++; }
      if (htHome + htAway > 0) goalsHT++;
      if (oppGoals === 0) cleanSheets++;
      if (teamGoals === 0) failedToScore++;

      // Análise de estatísticas detalhadas do jogo
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

        const matchCorners = getStat(teamMatchStats, 'Corner Kicks') + getStat(oppMatchStats, 'Corner Kicks');
        const matchCards = getStat(teamMatchStats, 'Yellow Cards') + getStat(teamMatchStats, 'Red Cards') +
                          getStat(oppMatchStats, 'Yellow Cards') + getStat(oppMatchStats, 'Red Cards');

        corners += getStat(teamMatchStats, 'Corner Kicks');
        cornersAgainst += getStat(oppMatchStats, 'Corner Kicks');
        cards += getStat(teamMatchStats, 'Yellow Cards') + getStat(teamMatchStats, 'Red Cards');
        cardsAgainst += getStat(oppMatchStats, 'Yellow Cards') + getStat(oppMatchStats, 'Red Cards');
        fouls += getStat(teamMatchStats, 'Fouls');
        foulsAgainst += getStat(oppMatchStats, 'Fouls');
        shots += getStat(teamMatchStats, 'Total Shots');
        shotsOnTarget += getStat(teamMatchStats, 'Shots on Goal');

        // Contagem de padrões no jogo
        if (matchCorners >= 9) gamesOver85Corners++;
        if (matchCorners >= 10) gamesOver95Corners++;
        if (matchCards >= 4) gamesOver35Cards++;
        if (matchCards >= 5) gamesOver45Cards++;
        if (matchCards >= 6) gamesOver55Cards++;
      }
    }

    const n = recentMatches.length || 1;
    const statsN = matchesWithStats || 1;
    const form = this.calculateFormPoints(recentMatches, teamId);

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

    // Calcular taxas de padrões
    const patterns: PatternAnalysis = {
      over25GoalsRate: (gamesOver25Goals / n) * 100,
      over35GoalsRate: (gamesOver35Goals / n) * 100,
      bttsRate: (gamesBtts / n) * 100,
      over85CornersRate: statsN >= 3 ? (gamesOver85Corners / statsN) * 100 : 0,
      over95CornersRate: statsN >= 3 ? (gamesOver95Corners / statsN) * 100 : 0,
      over35CardsRate: statsN >= 3 ? (gamesOver35Cards / statsN) * 100 : 0,
      over45CardsRate: statsN >= 3 ? (gamesOver45Cards / statsN) * 100 : 0,
      over55CardsRate: statsN >= 3 ? (gamesOver55Cards / statsN) * 100 : 0,
      matchesAnalyzed: n,
      matchesWithStats: statsN
    };

    console.log(`[ELITE STATS] ${teamName}: ${n} jogos analisados, ${statsN} com estatísticas completas`);
    console.log(`[ELITE PATTERNS] ${teamName}: Over2.5=${patterns.over25GoalsRate.toFixed(0)}%, BTTS=${patterns.bttsRate.toFixed(0)}%, Over4.5Cards=${patterns.over45CardsRate.toFixed(0)}%, Over8.5Corners=${patterns.over85CornersRate.toFixed(0)}%`);

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
      matchesPlayed: n,
      patterns
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
    totalMatches: number;
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
      record: `${homeWins}V ${draws}E ${awayWins}D`,
      totalMatches: h2hMatches.length
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
    homeStats: TeamStats & { patterns: PatternAnalysis },
    awayStats: TeamStats & { patterns: PatternAnalysis },
    h2hData: ReturnType<typeof this.analyzeH2H>,
    context: MatchContext,
    probabilities: PoissonProbabilities,
    odds: Record<string, number>
  ): { signals: EliteSignal[], analyzed: AnalyzedOpportunity[] } {
    const signals: EliteSignal[] = [];
    const analyzed: AnalyzedOpportunity[] = [];
    const matchDate = new Date(fixture.fixture.date);

    // VALIDAÇÃO: Mínimo de dados para análise confiável
    const MIN_GAMES_REQUIRED = 5;
    const MIN_STATS_REQUIRED = 3;
    
    if (homeStats.matchesPlayed < MIN_GAMES_REQUIRED || awayStats.matchesPlayed < MIN_GAMES_REQUIRED) {
      console.log(`[ELITE] ❌ Dados insuficientes: ${homeStats.teamName} (${homeStats.matchesPlayed}) vs ${awayStats.teamName} (${awayStats.matchesPlayed}) - mínimo ${MIN_GAMES_REQUIRED}`);
      return { signals: [], analyzed: [] };
    }

    const homePatterns = homeStats.patterns;
    const awayPatterns = awayStats.patterns;

    if (homePatterns.matchesWithStats < MIN_STATS_REQUIRED || awayPatterns.matchesWithStats < MIN_STATS_REQUIRED) {
      console.log(`[ELITE] ❌ Estatísticas insuficientes: ${homeStats.teamName} (${homePatterns.matchesWithStats}) vs ${awayStats.teamName} (${awayPatterns.matchesWithStats}) - mínimo ${MIN_STATS_REQUIRED}`);
      return { signals: [], analyzed: [] };
    }

    // Helper para criar oportunidade analisada (rastreamento)
    const trackOpportunity = (
      market: string,
      probability: number,
      bookmakerOdd: number | null,
      ev: number | null,
      status: AnalyzedOpportunity['status'],
      rejectionReason?: string,
      potentialBadge?: 'DIAMOND' | 'GOLD' | 'SILVER' | null
    ) => {
      analyzed.push({
        fixtureId: fixture.fixture.id,
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        homeTeamLogo: fixture.teams.home.logo,
        awayTeamLogo: fixture.teams.away.logo,
        league: fixture.league.name,
        leagueLogo: fixture.league.logo,
        matchDate: matchDate.toLocaleDateString('pt-BR'),
        matchTime: matchDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        market,
        probability: Math.round(probability * 10) / 10,
        bookmakerOdd,
        fairOdd: Math.round((100 / probability) * 100) / 100,
        expectedValue: ev !== null ? Math.round(ev * 10) / 10 : null,
        status,
        rejectionReason,
        potentialBadge: potentialBadge || null
      });
    };

    const createSignal = (
      market: string,
      category: EliteSignal['marketCategory'],
      prediction: string,
      probability: number,
      oddKey: string,
      reasoning: EliteSignal['reasoning'],
      patternStrength: number
    ): EliteSignal | null => {
      const originalOdd = odds[oddKey] || 0;
      let bookmakerOdd = originalOdd;
      const fairOdd = 100 / probability;
      
      // Log detalhado de odds
      if (originalOdd === 0) {
        console.log(`[ELITE] ⚠️ ${market}: Odd não encontrada para key "${oddKey}". Usando fallback.`);
      }
      
      // Fallback quando odds não disponíveis: usar fairOdd com margem da casa
      if (bookmakerOdd < 1.20) {
        bookmakerOdd = fairOdd * 0.95; // 5% margem assumida
        if (bookmakerOdd < 1.35) bookmakerOdd = 1.35;
        console.log(`[ELITE] 📊 ${market}: Fallback odd = ${bookmakerOdd.toFixed(2)} (fairOdd ${fairOdd.toFixed(2)} * 0.95)`);
      }

      const ev = this.calculateExpectedValue(probability, bookmakerOdd);
      
      // Determinar badge potencial antes de rejeitar
      // GATES RELAXADOS: 75→72, 68→66, 62→60 para aumentar conversão mantendo EV≥3%
      let potentialBadge: 'DIAMOND' | 'GOLD' | 'SILVER' | null = null;
      if (ev >= 8 && probability >= 72) potentialBadge = 'DIAMOND';
      else if (ev >= 5 && probability >= 66) potentialBadge = 'GOLD';
      else if (ev >= 3 && probability >= 60) potentialBadge = 'SILVER';
      
      // Log detalhado de EV
      console.log(`[ELITE] 📈 ${market}: Prob=${probability.toFixed(1)}%, Odd=${bookmakerOdd.toFixed(2)}, EV=${ev.toFixed(1)}%, Badge=${potentialBadge || 'NONE'}`);
      
      // EV check
      if (ev < 3) {
        trackOpportunity(market, probability, bookmakerOdd, ev, 'REJECTED_LOW_EV', 
          `EV ${ev.toFixed(1)}% < 3% mínimo`, potentialBadge);
        console.log(`[ELITE] ❌ ${market}: EV ${ev.toFixed(1)}% abaixo do mínimo 3%`);
        return null;
      }
      
      let badge: EliteSignal['badgeType'] = 'SILVER';
      let confidenceScore = probability;
      
      if (ev >= 8 && probability >= 72) {
        badge = 'DIAMOND';
        confidenceScore = Math.min(98, probability + 3);
      } else if (ev >= 5 && probability >= 66) {
        badge = 'GOLD';
        confidenceScore = Math.min(94, probability + 2);
      } else if (ev >= 3 && probability >= 60) {
        confidenceScore = Math.min(88, probability + 1);
      } else {
        trackOpportunity(market, probability, bookmakerOdd, ev, 'REJECTED_LOW_PROB',
          `Prob ${probability.toFixed(1)}% < 60% para SILVER`, potentialBadge);
        console.log(`[ELITE] ❌ ${market}: Prob ${probability.toFixed(1)}% abaixo do mínimo para tier`);
        return null;
      }

      // APROVADO! Rastrear como aprovado
      trackOpportunity(market, probability, bookmakerOdd, ev, 'APPROVED', undefined, badge);
      console.log(`[ELITE] ✅ ${market}: APROVADO como ${badge}! EV=${ev.toFixed(1)}%, Prob=${probability.toFixed(1)}%`);

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
        bookmakerOdd: Math.round(bookmakerOdd * 100) / 100,
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

    // === ANÁLISE BASEADA EM PADRÕES REAIS ===
    // Calibração: probabilidade com shrinkage Bayesiano por tamanho de amostra + H2H ponderado
    
    // Helper: Calibrar probabilidade com shrinkage Bayesiano
    // Fórmula: P_calibrado = (n * P_observado + k * P_prior) / (n + k)
    // Priors por mercado: Goals/BTTS=45%, Cards=50%, Corners=45%, Over1.5=60%
    const calibrateProb = (
      homeRate: number, 
      awayRate: number, 
      priorRate: number, // Prior específico por mercado
      h2hRate: number, 
      h2hGames: number,
      homeSampleSize: number,
      awaySampleSize: number
    ): number => {
      const SHRINKAGE_FACTOR = 5; // k: força do shrinkage
      
      // Shrinkage por time usando prior específico
      const homeShrunk = (homeSampleSize * homeRate + SHRINKAGE_FACTOR * priorRate) / (homeSampleSize + SHRINKAGE_FACTOR);
      const awayShrunk = (awaySampleSize * awayRate + SHRINKAGE_FACTOR * priorRate) / (awaySampleSize + SHRINKAGE_FACTOR);
      
      let baseRate = (homeShrunk + awayShrunk) / 2;
      
      // H2H ponderado por tamanho de amostra (5+ jogos = peso máximo 20%)
      if (h2hGames >= 3 && h2hRate > 0) {
        const h2hWeight = Math.min(0.20, h2hGames * 0.04); // 3 jogos=12%, 5 jogos=20%
        baseRate = baseRate * (1 - h2hWeight) + h2hRate * h2hWeight;
      }
      
      // Cap final conservador
      return Math.min(78, baseRate);
    };
    
    // Contadores de observabilidade por gate
    let gatesFailedGoals = 0;
    let gatesFailedBtts = 0;
    let gatesFailedCards = 0;
    let gatesFailedCorners = 0;
    let gatesFailedOver15 = 0;
    
    // 1. OVER 2.5 GOLS - Threshold flexível: 55%+ cada OU 50%+ com H2H forte
    const combined25Rate = (homePatterns.over25GoalsRate + awayPatterns.over25GoalsRate) / 2;
    const h2hConfirms25 = h2hData.over25Rate >= 55;
    const home25Ok = homePatterns.over25GoalsRate >= 55;
    const away25Ok = awayPatterns.over25GoalsRate >= 55;
    const home25Relaxed = homePatterns.over25GoalsRate >= 45 && h2hConfirms25;
    const away25Relaxed = awayPatterns.over25GoalsRate >= 45 && h2hConfirms25;
    
    if ((home25Ok && away25Ok) || (home25Ok && away25Relaxed) || (away25Ok && home25Relaxed)) {
      const patternProb = calibrateProb(
        homePatterns.over25GoalsRate, 
        awayPatterns.over25GoalsRate, 
        45, // Prior para Goals
        h2hData.over25Rate, 
        h2hData.totalMatches,
        homePatterns.matchesAnalyzed,
        awayPatterns.matchesAnalyzed
      );
      console.log(`[ELITE] ✅ PADRÃO Over 2.5: ${homeStats.teamName} ${homePatterns.over25GoalsRate.toFixed(0)}% + ${awayStats.teamName} ${awayPatterns.over25GoalsRate.toFixed(0)}% (H2H ${h2hData.over25Rate.toFixed(0)}%)`);
      
      const signal = createSignal(
        'Over 2.5 Gols',
        'GOALS',
        `Mais de 2.5 gols`,
        patternProb,
        'Goals Over/Under_Over 2.5',
        {
          primary: `PADRÃO: ${homePatterns.over25GoalsRate.toFixed(0)}% + ${awayPatterns.over25GoalsRate.toFixed(0)}% = ${patternProb.toFixed(0)}% (calibrado)`,
          homeAnalysis: `${homeStats.teamName}: Over 2.5 em ${homePatterns.over25GoalsRate.toFixed(0)}% dos últimos ${homePatterns.matchesAnalyzed} jogos`,
          awayAnalysis: `${awayStats.teamName}: Over 2.5 em ${awayPatterns.over25GoalsRate.toFixed(0)}% dos últimos ${awayPatterns.matchesAnalyzed} jogos`,
          h2hInsight: `H2H: ${h2hData.over25Rate.toFixed(0)}% Over 2.5 (${h2hData.totalMatches} jogos). Média ${h2hData.avgGoals.toFixed(1)} gols`,
          contextInsight: h2hConfirms25 ? `✓ H2H confirma padrão de gols.` : `Padrão consistente em ambos.`
        },
        Math.round(patternProb)
      );
      if (signal) signals.push(signal);
    } else {
      gatesFailedGoals++;
    }

    // 2. BTTS - Threshold flexível: 50%+ cada OU 45%+ com H2H forte
    const combinedBttsRate = (homePatterns.bttsRate + awayPatterns.bttsRate) / 2;
    const h2hConfirmsBtts = h2hData.bttsRate >= 50;
    const homeBttsOk = homePatterns.bttsRate >= 50;
    const awayBttsOk = awayPatterns.bttsRate >= 50;
    const homeBttsRelaxed = homePatterns.bttsRate >= 40 && h2hConfirmsBtts;
    const awayBttsRelaxed = awayPatterns.bttsRate >= 40 && h2hConfirmsBtts;
    
    if ((homeBttsOk && awayBttsOk) || (homeBttsOk && awayBttsRelaxed) || (awayBttsOk && homeBttsRelaxed)) {
      const patternProb = calibrateProb(
        homePatterns.bttsRate, 
        awayPatterns.bttsRate, 
        45, // Prior para BTTS
        h2hData.bttsRate, 
        h2hData.totalMatches,
        homePatterns.matchesAnalyzed,
        awayPatterns.matchesAnalyzed
      );
      console.log(`[ELITE] ✅ PADRÃO BTTS: ${homeStats.teamName} ${homePatterns.bttsRate.toFixed(0)}% + ${awayStats.teamName} ${awayPatterns.bttsRate.toFixed(0)}% (H2H ${h2hData.bttsRate.toFixed(0)}%)`);
      
      const signal = createSignal(
        'Ambas Marcam',
        'BTTS',
        `BTTS - Sim`,
        patternProb,
        'Both Teams Score_Yes',
        {
          primary: `PADRÃO: ${homePatterns.bttsRate.toFixed(0)}% + ${awayPatterns.bttsRate.toFixed(0)}% = ${patternProb.toFixed(0)}% (calibrado)`,
          homeAnalysis: `${homeStats.teamName}: BTTS em ${homePatterns.bttsRate.toFixed(0)}% dos últimos ${homePatterns.matchesAnalyzed} jogos`,
          awayAnalysis: `${awayStats.teamName}: BTTS em ${awayPatterns.bttsRate.toFixed(0)}% dos últimos ${awayPatterns.matchesAnalyzed} jogos`,
          h2hInsight: `H2H BTTS: ${h2hData.bttsRate.toFixed(0)}%`,
          contextInsight: h2hConfirmsBtts ? `✓ H2H confirma padrão BTTS.` : `Ambos marcam e sofrem com frequência.`
        },
        Math.round(patternProb)
      );
      if (signal) signals.push(signal);
    } else {
      gatesFailedBtts++;
    }

    // 3. OVER 4.5 CARTÕES - Com calibração Bayesiana
    const combined45CardsRate = (homePatterns.over45CardsRate + awayPatterns.over45CardsRate) / 2;
    const cards45Threshold = context.isClassico ? 35 : 45;
    
    if (homePatterns.over45CardsRate >= cards45Threshold && awayPatterns.over45CardsRate >= cards45Threshold) {
      let patternProb = calibrateProb(
        homePatterns.over45CardsRate, 
        awayPatterns.over45CardsRate, 
        50, // Prior para cards
        0,
        0,
        homePatterns.matchesWithStats,
        awayPatterns.matchesWithStats
      );
      // Boost para clássicos mas ainda respeitando cap de 78%
      if (context.isClassico) patternProb = Math.min(78, patternProb + 5);
      console.log(`[ELITE] ✅ PADRÃO Over 4.5 Cartões: ${homeStats.teamName} ${homePatterns.over45CardsRate.toFixed(0)}% + ${awayStats.teamName} ${awayPatterns.over45CardsRate.toFixed(0)}% = ${patternProb.toFixed(0)}%`);
      
      const signal = createSignal(
        'Over 4.5 Cartões',
        'CARDS',
        `+4.5 cartões`,
        patternProb,
        'Cards Over/Under_Over 4.5',
        {
          primary: `PADRÃO: ${homePatterns.over45CardsRate.toFixed(0)}% + ${awayPatterns.over45CardsRate.toFixed(0)}% = ${patternProb.toFixed(0)}% (calibrado)`,
          homeAnalysis: `${homeStats.teamName}: Over 4.5 cards em ${homePatterns.over45CardsRate.toFixed(0)}% dos últimos ${homePatterns.matchesWithStats} jogos`,
          awayAnalysis: `${awayStats.teamName}: Over 4.5 cards em ${awayPatterns.over45CardsRate.toFixed(0)}% dos últimos ${awayPatterns.matchesWithStats} jogos`,
          h2hInsight: context.isClassico ? `🔥 CLÁSSICO = intensidade extra` : `Perfil de jogo com faltas`,
          contextInsight: context.isClassico ? `DERBY! Rivalidade eleva cartões.` : `Histórico consistente de cartões.`
        },
        Math.round(patternProb)
      );
      if (signal) signals.push(signal);
    } else {
      gatesFailedCards++;
    }

    // 4. OVER 3.5 CARTÕES - Com calibração (se Over 4.5 não qualificou)
    const combined35CardsRate = (homePatterns.over35CardsRate + awayPatterns.over35CardsRate) / 2;
    if (homePatterns.over35CardsRate >= 55 && awayPatterns.over35CardsRate >= 55 && combined45CardsRate < 45) {
      const patternProb = calibrateProb(
        homePatterns.over35CardsRate, 
        awayPatterns.over35CardsRate, 
        50, // Prior para cards
        0,
        0,
        homePatterns.matchesWithStats,
        awayPatterns.matchesWithStats
      );
      console.log(`[ELITE] ✅ PADRÃO Over 3.5 Cartões: ${homeStats.teamName} ${homePatterns.over35CardsRate.toFixed(0)}% + ${awayStats.teamName} ${awayPatterns.over35CardsRate.toFixed(0)}% = ${patternProb.toFixed(0)}%`);
      
      const signal = createSignal(
        'Over 3.5 Cartões',
        'CARDS',
        `+3.5 cartões`,
        patternProb,
        'Cards Over/Under_Over 3.5',
        {
          primary: `PADRÃO: ${homePatterns.over35CardsRate.toFixed(0)}% + ${awayPatterns.over35CardsRate.toFixed(0)}% = ${patternProb.toFixed(0)}% (calibrado)`,
          homeAnalysis: `${homeStats.teamName}: Over 3.5 cards em ${homePatterns.over35CardsRate.toFixed(0)}% dos jogos`,
          awayAnalysis: `${awayStats.teamName}: Over 3.5 cards em ${awayPatterns.over35CardsRate.toFixed(0)}% dos jogos`,
          h2hInsight: `Padrão consistente de cartões`,
          contextInsight: `Alta frequência de cartões nos jogos destes times.`
        },
        Math.round(patternProb)
      );
      if (signal) signals.push(signal);
    }

    // 5. OVER 8.5 ESCANTEIOS - Com calibração Bayesiana
    const combined85CornersRate = (homePatterns.over85CornersRate + awayPatterns.over85CornersRate) / 2;
    if (homePatterns.over85CornersRate >= 45 && awayPatterns.over85CornersRate >= 45) {
      const patternProb = calibrateProb(
        homePatterns.over85CornersRate, 
        awayPatterns.over85CornersRate, 
        45, // Prior para corners
        0,
        0,
        homePatterns.matchesWithStats,
        awayPatterns.matchesWithStats
      );
      console.log(`[ELITE] ✅ PADRÃO Over 8.5 Cantos: ${homeStats.teamName} ${homePatterns.over85CornersRate.toFixed(0)}% + ${awayStats.teamName} ${awayPatterns.over85CornersRate.toFixed(0)}% = ${patternProb.toFixed(0)}%`);
      
      const signal = createSignal(
        'Over 8.5 Escanteios',
        'CORNERS',
        `+8.5 corners`,
        patternProb,
        'Corners Over/Under_Over 8.5',
        {
          primary: `PADRÃO: ${homePatterns.over85CornersRate.toFixed(0)}% + ${awayPatterns.over85CornersRate.toFixed(0)}% = ${patternProb.toFixed(0)}% (calibrado)`,
          homeAnalysis: `${homeStats.teamName}: Over 8.5 corners em ${homePatterns.over85CornersRate.toFixed(0)}% dos jogos`,
          awayAnalysis: `${awayStats.teamName}: Over 8.5 corners em ${awayPatterns.over85CornersRate.toFixed(0)}% dos jogos`,
          h2hInsight: `Estilo de jogo ofensivo de ambos`,
          contextInsight: `Times que geram muitas finalizações e escanteios.`
        },
        Math.round(patternProb)
      );
      if (signal) signals.push(signal);
    } else {
      gatesFailedCorners++;
    }
    
    // 6. OVER 1.5 GOLS - Mercado mais comum, threshold 70%+ para valor
    if (homeStats.over15Rate >= 70 && awayStats.over15Rate >= 70) {
      const patternProb = calibrateProb(
        homeStats.over15Rate, 
        awayStats.over15Rate, 
        60, // Prior mais alto para Over 1.5
        h2hData.avgGoals >= 2 ? 75 : 0, // H2H confirma se média >= 2 gols
        h2hData.totalMatches,
        homePatterns.matchesAnalyzed,
        awayPatterns.matchesAnalyzed
      );
      console.log(`[ELITE] ✅ PADRÃO Over 1.5: ${homeStats.teamName} ${homeStats.over15Rate.toFixed(0)}% + ${awayStats.teamName} ${awayStats.over15Rate.toFixed(0)}% = ${patternProb.toFixed(0)}%`);
      
      const signal = createSignal(
        'Over 1.5 Gols',
        'GOALS',
        `Mais de 1.5 gols`,
        patternProb,
        'Goals Over/Under_Over 1.5',
        {
          primary: `PADRÃO FORTE: ${homeStats.over15Rate.toFixed(0)}% + ${awayStats.over15Rate.toFixed(0)}% = ${patternProb.toFixed(0)}% (calibrado)`,
          homeAnalysis: `${homeStats.teamName}: Over 1.5 em ${homeStats.over15Rate.toFixed(0)}% dos jogos`,
          awayAnalysis: `${awayStats.teamName}: Over 1.5 em ${awayStats.over15Rate.toFixed(0)}% dos jogos`,
          h2hInsight: `H2H: média ${h2hData.avgGoals.toFixed(1)} gols/jogo`,
          contextInsight: `Ambos os times raramente terminam com menos de 2 gols.`
        },
        Math.round(patternProb)
      );
      if (signal) signals.push(signal);
    } else {
      gatesFailedOver15++;
    }

    // Log de observabilidade
    console.log(`[ELITE] ${fixture.teams.home.name} vs ${fixture.teams.away.name}: ${signals.length} sinais, ${analyzed.length} analisados | Gates falhos: Goals=${gatesFailedGoals}, BTTS=${gatesFailedBtts}, Cards=${gatesFailedCards}, Corners=${gatesFailedCorners}, Over15=${gatesFailedOver15}`);
    return { signals, analyzed };
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
    const allAnalyzedOpportunities: AnalyzedOpportunity[] = [];
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
        const { signals, analyzed } = this.generateSignals(
          fixture,
          homeStats,
          awayStats,
          h2hData,
          context,
          probabilities,
          odds
        );

        opportunities.push(...signals);
        allAnalyzedOpportunities.push(...analyzed);

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
    const silverSignals = opportunities.filter(s => s.badgeType === 'SILVER').length;
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
      silverSignals,
      avgExpectedValue: Math.round(avgEV * 10) / 10,
      opportunities: opportunities.slice(0, 30),
      analyzedOpportunities: allAnalyzedOpportunities
    };

    this.setCache('elite_last_scan', result);
    console.log(`[ELITE ENGINE] ✅ Scan completo: ${opportunities.length} sinais (${diamondSignals} DIAMOND, ${goldSignals} GOLD, ${silverSignals} SILVER) | ${allAnalyzedOpportunities.length} analisados`);

    return result;
  }

  async getLastScanResult(): Promise<EliteScanResult | null> {
    return this.getCached<EliteScanResult>('elite_last_scan');
  }
}

export const elitePredictionEngine = new ElitePredictionEngine();
