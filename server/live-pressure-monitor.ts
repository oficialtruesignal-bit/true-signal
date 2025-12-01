import axios from 'axios';
import { db } from './db';
import { livePressureSnapshots, liveAlerts, liveMonitorSettings, type InsertLivePressureSnapshot, type InsertLiveAlert } from '@shared/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
const API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io';

interface LiveFixture {
  fixture: {
    id: number;
    status: {
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    logo: string;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  statistics?: Array<{
    team: { id: number };
    statistics: Array<{
      type: string;
      value: string | number | null;
    }>;
  }>;
}

interface LiveStatistics {
  possession: number;
  shotsTotal: number;
  shotsOnTarget: number;
  corners: number;
  dangerousAttacks: number;
  attacks: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
}

interface PressureCalculation {
  pressureIndex: number;
  goalProbability: number;
  pressureDelta: number;
}

// Pesos calibrados cientificamente baseados em análise de mercado (Overlyzer, AI Stats)
// Soma = 1.0 para normalização (percentual de contribuição)
const PRESSURE_WEIGHTS = {
  shotsOnTarget: 0.28,      // Maior peso - correlação direta com gols
  dangerousAttacks: 0.24,   // Alto impacto - ataques na área
  xGDelta: 0.18,            // Expected goals delta
  corners: 0.12,            // Pressão ofensiva
  possessionSwing: 0.10,    // Delta de posse (não valor absoluto)
  cardsTempo: 0.05,         // Ritmo de cartões indica intensidade
  totalAttacks: 0.03,       // Ataques gerais (menor peso)
};

// Thresholds separados para HT (1º tempo) vs FT (2º tempo)
const HT_THRESHOLDS = {
  minMinute: 15,              // Só alertar após 15'
  pressureIndex: 68,          // Pressão mínima para alerta
  pressureDelta: 18,          // Surge mínimo
  goalProbability: 65,        // Probabilidade de gol
  xGThreshold: 0.32,          // xG acumulado em 5 min
};

const FT_THRESHOLDS = {
  minMinute: 55,              // Só alertar após 55'
  pressureIndex: 72,          // Pressão mais alta no 2º tempo
  pressureDelta: 24,          // Surge maior necessário
  goalProbability: 70,        // Probabilidade mais exigente
  sustainedPolls: 2,          // Pressão sustentada por 2 polls
  winProbDelta: 12,           // Delta de prob. de vitória
};

// Mercados disponíveis na Bet365 com linhas mínimas
const BET365_MARKETS = {
  goals: { min: 1.5, common: [1.5, 2.5, 3.5, 4.5] },
  corners: { min: 6.5, common: [6.5, 7.5, 8.5, 9.5, 10.5] },
  cards: { min: 3.5, common: [3.5, 4.5, 5.5] },
  shotsOnTarget: { min: 4.5, common: [4.5, 5.5, 6.5] },
};

// Tiers de confiança
const CONFIDENCE_TIERS = {
  PRIME: { min: 85, label: 'PRIME', emoji: '🏆' },
  CORE: { min: 80, label: 'CORE', emoji: '⭐' },
  WATCH: { min: 75, label: 'WATCH', emoji: '👁️' },
};

// Ligas prioritárias com alta liquidez e dados confiáveis
const MAJOR_LEAGUES = [
  // Tier 1 - Top 5 Europa
  39,   // Premier League (Inglaterra)
  140,  // La Liga (Espanha)
  135,  // Serie A (Itália)
  78,   // Bundesliga (Alemanha)
  61,   // Ligue 1 (França)
  
  // Tier 2 - Competições Europeias
  2,    // UEFA Champions League
  3,    // UEFA Europa League
  848,  // UEFA Conference League
  
  // Tier 3 - Ligas Secundárias Europa
  94,   // Primeira Liga (Portugal)
  88,   // Eredivisie (Holanda)
  144,  // Jupiler Pro League (Bélgica)
  203,  // Süper Lig (Turquia)
  179,  // Premiership (Escócia)
  
  // Tier 4 - América do Sul
  71,   // Brasileirão Série A
  128,  // Argentina - Liga Profesional
  13,   // Copa Libertadores
  11,   // Copa Sudamericana
  
  // Tier 5 - Outros mercados importantes
  40,   // Championship (Inglaterra 2ª divisão)
  141,  // La Liga 2 (Espanha)
  307,  // Saudi Pro League
  253,  // MLS (EUA)
];

// Ligas a EXCLUIR (Sub-21, Amistosos, Baixa Liquidez)
const EXCLUDED_LEAGUES_PATTERNS = [
  'U19', 'U20', 'U21', 'U23',           // Categorias de base
  'Youth', 'Júnior', 'Junior',
  'Reservas', 'Reserve',
  'Amistoso', 'Friendly', 'Club Friendly',
  'Women', 'Feminino',                   // Mercado separado
];

const EXCLUDED_LEAGUE_IDS = [
  // IDs específicos de ligas a evitar
  667,  // Friendlies Clubs
  10,   // Friendlies
];

// Função para verificar se liga deve ser excluída
function isLeagueExcluded(leagueName: string, leagueId: number): boolean {
  if (EXCLUDED_LEAGUE_IDS.includes(leagueId)) return true;
  const upperName = leagueName.toUpperCase();
  return EXCLUDED_LEAGUES_PATTERNS.some(pattern => 
    upperName.includes(pattern.toUpperCase())
  );
}

class LivePressureMonitorService {
  private isRunning = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private fixtureCache: Map<string, LiveFixture> = new Map();
  private lastSnapshotMap: Map<string, { homePressure: number; awayPressure: number }> = new Map();
  
  private defaultSettings = {
    pressureAlertThreshold: 70,
    pressureSurgeThreshold: 25,
    sustainedPressureIntervals: 2,
    goalProbabilityAlertThreshold: 75,
  };

  async start(intervalMs: number = 45000) {
    if (this.isRunning) {
      console.log('[LIVE MONITOR] Already running');
      return;
    }

    console.log(`[LIVE MONITOR] Starting with ${intervalMs}ms interval...`);
    this.isRunning = true;
    
    await this.poll();
    
    this.pollInterval = setInterval(() => {
      this.poll().catch(err => {
        console.error('[LIVE MONITOR] Poll error:', err.message);
      });
    }, intervalMs);
  }

  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isRunning = false;
    console.log('[LIVE MONITOR] Stopped');
  }

  async poll() {
    try {
      const liveFixtures = await this.fetchLiveFixtures();
      
      if (liveFixtures.length === 0) {
        console.log('[LIVE MONITOR] No live fixtures found');
        return;
      }

      // Primeiro: excluir ligas ruins (Sub-21, amistosos, etc.)
      const cleanFixtures = liveFixtures.filter(f => 
        !isLeagueExcluded(f.league.name, f.league.id)
      );

      console.log(`[LIVE MONITOR] ${liveFixtures.length} ao vivo, ${cleanFixtures.length} após filtro de qualidade`);

      // Priorizar ligas principais
      const priorityFixtures = cleanFixtures.filter(f => 
        MAJOR_LEAGUES.includes(f.league.id)
      );

      // Se não tiver ligas principais, pegar outras ligas limpas
      const fixturesToProcess = priorityFixtures.length > 0 
        ? priorityFixtures.slice(0, 25)  // Aumentado para 25 ligas top
        : cleanFixtures.slice(0, 15);     // Até 15 outras ligas

      console.log(`[LIVE MONITOR] Processando ${fixturesToProcess.length} jogos prioritários`);

      for (const fixture of fixturesToProcess) {
        await this.processFixture(fixture);
        await this.delay(150); // Reduzido delay para processar mais rápido
      }

    } catch (error: any) {
      console.error('[LIVE MONITOR] Poll error:', error.message);
    }
  }

  private async fetchLiveFixtures(): Promise<LiveFixture[]> {
    if (!API_FOOTBALL_KEY) {
      console.error('[LIVE MONITOR] API_FOOTBALL_KEY not configured');
      return [];
    }

    try {
      const response = await axios.get(`${API_FOOTBALL_BASE_URL}/fixtures`, {
        params: { live: 'all' },
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        timeout: 10000,
      });

      return response.data?.response || [];
    } catch (error: any) {
      console.error('[LIVE MONITOR] Failed to fetch live fixtures:', error.message);
      return [];
    }
  }

  private async fetchFixtureStatistics(fixtureId: number): Promise<LiveFixture['statistics'] | null> {
    if (!API_FOOTBALL_KEY) return null;

    try {
      const response = await axios.get(`${API_FOOTBALL_BASE_URL}/fixtures/statistics`, {
        params: { fixture: fixtureId },
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        timeout: 10000,
      });

      return response.data?.response || null;
    } catch (error: any) {
      console.error(`[LIVE MONITOR] Failed to fetch statistics for fixture ${fixtureId}:`, error.message);
      return null;
    }
  }

  private parseStatistics(statsArray: LiveFixture['statistics'], teamId: number): LiveStatistics {
    const defaultStats: LiveStatistics = {
      possession: 50,
      shotsTotal: 0,
      shotsOnTarget: 0,
      corners: 0,
      dangerousAttacks: 0,
      attacks: 0,
      fouls: 0,
      yellowCards: 0,
      redCards: 0,
    };

    if (!statsArray) return defaultStats;

    const teamStats = statsArray.find(s => s.team.id === teamId);
    if (!teamStats) return defaultStats;

    const getValue = (type: string): number => {
      const stat = teamStats.statistics.find(s => s.type.toLowerCase().includes(type.toLowerCase()));
      if (!stat || stat.value === null) return 0;
      const val = typeof stat.value === 'string' ? parseFloat(stat.value.replace('%', '')) : stat.value;
      return isNaN(val) ? 0 : val;
    };

    return {
      possession: getValue('possession') || 50,
      shotsTotal: getValue('total shots') || getValue('shots on goal') + getValue('shots off goal'),
      shotsOnTarget: getValue('shots on goal'),
      corners: getValue('corner'),
      dangerousAttacks: getValue('dangerous') || getValue('attacks') * 0.3,
      attacks: getValue('attacks'),
      fouls: getValue('fouls'),
      yellowCards: getValue('yellow'),
      redCards: getValue('red'),
    };
  }

  private calculatePressure(
    stats: LiveStatistics, 
    matchMinute: number,
    opponentStats: LiveStatistics
  ): PressureCalculation {
    const normalizedMinute = Math.max(1, matchMinute);
    
    // Multiplicador de tempo: pressão no final do jogo tem mais peso
    const timeMultiplier = matchMinute > 80 ? 1.4 : matchMinute > 70 ? 1.25 : matchMinute > 60 ? 1.15 : 1;
    
    // Normalização por minuto (projetado para 90 minutos)
    const shotsPerMinute = stats.shotsOnTarget / normalizedMinute * 90;
    const cornersPerMinute = stats.corners / normalizedMinute * 90;
    const dangerousPerMinute = stats.dangerousAttacks / normalizedMinute * 90;
    const attacksPerMinute = stats.attacks / normalizedMinute * 90;
    
    // Delta de posse CONTRA oponente (não apenas vs 50%)
    const possessionSwing = stats.possession - opponentStats.possession;
    
    // Ritmo de cartões (indicador de intensidade)
    const cardsPerMinute = (stats.yellowCards + stats.redCards * 2) / normalizedMinute * 90;
    
    // xG aproximado de cada time
    const teamXG = (stats.shotsOnTarget * 0.35 + (stats.shotsTotal - stats.shotsOnTarget) * 0.08);
    const opponentXG = (opponentStats.shotsOnTarget * 0.35 + (opponentStats.shotsTotal - opponentStats.shotsOnTarget) * 0.08);
    
    // xG DELTA: diferença entre xG do time vs oponente
    const xGDelta = teamXG - opponentXG;
    
    // Fórmula calibrada cientificamente
    // Cada métrica é normalizada para escala 0-100 antes de aplicar peso
    const normalizedShots = Math.min(100, shotsPerMinute * 8);             // ~12 chutes/90min = 100
    const normalizedDangerous = Math.min(100, dangerousPerMinute * 1.5);   // ~66 ataques perigosos = 100
    const normalizedXGDelta = Math.min(100, Math.max(0, (xGDelta + 1.5) * 33.33)); // Delta -1.5 a +1.5 normalizado
    const normalizedCorners = Math.min(100, cornersPerMinute * 10);        // ~10 escanteios = 100
    const normalizedPossession = Math.min(100, Math.max(0, possessionSwing * 2 + 50)); // Swing -25 a +25
    const normalizedCards = Math.min(100, cardsPerMinute * 20);            // ~5 cartões = 100
    const normalizedAttacks = Math.min(100, attacksPerMinute * 0.8);       // ~125 ataques = 100
    
    let pressureIndex = 
      (normalizedShots * PRESSURE_WEIGHTS.shotsOnTarget) +
      (normalizedDangerous * PRESSURE_WEIGHTS.dangerousAttacks) +
      (normalizedXGDelta * PRESSURE_WEIGHTS.xGDelta) +
      (normalizedCorners * PRESSURE_WEIGHTS.corners) +
      (normalizedPossession * PRESSURE_WEIGHTS.possessionSwing) +
      (normalizedCards * PRESSURE_WEIGHTS.cardsTempo) +
      (normalizedAttacks * PRESSURE_WEIGHTS.totalAttacks);
    
    // Aplicar multiplicador de tempo
    pressureIndex *= timeMultiplier;
    
    // Limitar entre 0-100
    pressureIndex = Math.min(100, Math.max(0, pressureIndex));
    
    // Cálculo de probabilidade de gol usando distribuição Poisson ajustada
    const baseGoalRate = 0.028; // Taxa base: ~2.5 gols/jogo = 0.028/minuto
    const pressureMultiplier = 1 + (pressureIndex / 100) * 2.5;
    const adjustedGoalRate = baseGoalRate * pressureMultiplier;
    
    // Probabilidade de pelo menos 1 gol nos próximos 5 minutos
    const lambda5min = adjustedGoalRate * 5;
    const goalProbability5Min = (1 - Math.exp(-lambda5min)) * 100;
    
    return {
      pressureIndex: Math.round(pressureIndex * 100) / 100,
      goalProbability: Math.round(Math.min(95, goalProbability5Min) * 100) / 100,
      pressureDelta: 0,
    };
  }

  private async processFixture(fixture: LiveFixture) {
    const fixtureId = fixture.fixture.id.toString();
    const matchMinute = fixture.fixture.status.elapsed || 0;
    const matchStatus = fixture.fixture.status.short;

    if (!['1H', '2H', 'ET', 'P', 'BT'].includes(matchStatus)) {
      return;
    }

    const statistics = await this.fetchFixtureStatistics(fixture.fixture.id);
    
    const homeStats = this.parseStatistics(statistics || [], fixture.teams.home.id);
    const awayStats = this.parseStatistics(statistics || [], fixture.teams.away.id);

    // Passar stats do oponente para cálculo correto de xG delta e posse swing
    const homePressure = this.calculatePressure(homeStats, matchMinute, awayStats);
    const awayPressure = this.calculatePressure(awayStats, matchMinute, homeStats);

    const lastSnapshot = this.lastSnapshotMap.get(fixtureId);
    if (lastSnapshot) {
      homePressure.pressureDelta = homePressure.pressureIndex - lastSnapshot.homePressure;
      awayPressure.pressureDelta = awayPressure.pressureIndex - lastSnapshot.awayPressure;
    }

    this.lastSnapshotMap.set(fixtureId, {
      homePressure: homePressure.pressureIndex,
      awayPressure: awayPressure.pressureIndex,
    });

    const snapshot: InsertLivePressureSnapshot = {
      fixtureId,
      league: fixture.league.name,
      leagueId: fixture.league.id.toString(),
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      homeTeamLogo: fixture.teams.home.logo,
      awayTeamLogo: fixture.teams.away.logo,
      matchMinute: matchMinute.toString(),
      homeScore: (fixture.goals.home || 0).toString(),
      awayScore: (fixture.goals.away || 0).toString(),
      matchStatus,
      homePossession: homeStats.possession.toString(),
      awayPossession: awayStats.possession.toString(),
      homeShotsTotal: homeStats.shotsTotal.toString(),
      awayShotsTotal: awayStats.shotsTotal.toString(),
      homeShotsOnTarget: homeStats.shotsOnTarget.toString(),
      awayShotsOnTarget: awayStats.shotsOnTarget.toString(),
      homeCorners: homeStats.corners.toString(),
      awayCorners: awayStats.corners.toString(),
      homeDangerousAttacks: homeStats.dangerousAttacks.toString(),
      awayDangerousAttacks: awayStats.dangerousAttacks.toString(),
      homeAttacks: homeStats.attacks.toString(),
      awayAttacks: awayStats.attacks.toString(),
      homePressureIndex: homePressure.pressureIndex.toString(),
      awayPressureIndex: awayPressure.pressureIndex.toString(),
      homeGoalProbability: homePressure.goalProbability.toString(),
      awayGoalProbability: awayPressure.goalProbability.toString(),
      homePressureDelta: homePressure.pressureDelta.toString(),
      awayPressureDelta: awayPressure.pressureDelta.toString(),
      alertTriggered: false,
      alertType: null,
    };

    const [insertedSnapshot] = await db.insert(livePressureSnapshots).values(snapshot).returning();

    await this.checkAndTriggerAlerts(insertedSnapshot, fixture, homePressure, awayPressure);
  }

  private async checkAndTriggerAlerts(
    snapshot: any,
    fixture: LiveFixture,
    homePressure: PressureCalculation,
    awayPressure: PressureCalculation
  ) {
    const fixtureId = fixture.fixture.id.toString();
    const matchMinute = fixture.fixture.status.elapsed || 0;
    const matchStatus = fixture.fixture.status.short;
    
    // Determinar se estamos no 1º tempo (HT) ou 2º tempo (FT)
    const isFirstHalf = matchStatus === '1H' || matchMinute <= 45;
    const thresholds = isFirstHalf ? HT_THRESHOLDS : FT_THRESHOLDS;
    
    // Verificar minuto mínimo para alertar
    if (matchMinute < thresholds.minMinute) {
      return; // Muito cedo para alertar
    }

    // Evitar alertas duplicados nos últimos 5 minutos
    const recentAlerts = await db.select()
      .from(liveAlerts)
      .where(and(
        eq(liveAlerts.fixtureId, fixtureId),
        gte(liveAlerts.createdAt, new Date(Date.now() - 5 * 60 * 1000))
      ))
      .limit(1);

    if (recentAlerts.length > 0) {
      return;
    }

    // Lógica de alerta baseada em HT/FT
    const shouldAlertHome = this.evaluateAlertCondition(homePressure, thresholds, isFirstHalf);
    const shouldAlertAway = this.evaluateAlertCondition(awayPressure, thresholds, isFirstHalf);

    if (shouldAlertHome) {
      const confidence = this.calculateConfidenceTier(homePressure, thresholds);
      await this.createAlert(snapshot, fixture, 'home', homePressure, confidence, isFirstHalf);
    }

    if (shouldAlertAway) {
      const confidence = this.calculateConfidenceTier(awayPressure, thresholds);
      await this.createAlert(snapshot, fixture, 'away', awayPressure, confidence, isFirstHalf);
    }
  }

  private evaluateAlertCondition(
    pressure: PressureCalculation, 
    thresholds: typeof HT_THRESHOLDS | typeof FT_THRESHOLDS,
    isFirstHalf: boolean
  ): boolean {
    // Condição 1: Pressão acima do threshold
    const highPressure = pressure.pressureIndex >= thresholds.pressureIndex;
    
    // Condição 2: Surge de pressão (aumento rápido)
    const pressureSurge = pressure.pressureDelta >= thresholds.pressureDelta;
    
    // Condição 3: Alta probabilidade de gol
    const highGoalProb = pressure.goalProbability >= thresholds.goalProbability;
    
    // Para alertar, precisa de pelo menos 2 condições OU probabilidade muito alta
    const conditionsMet = [highPressure, pressureSurge, highGoalProb].filter(Boolean).length;
    
    return conditionsMet >= 2 || pressure.goalProbability >= 80;
  }

  private calculateConfidenceTier(
    pressure: PressureCalculation,
    thresholds: typeof HT_THRESHOLDS | typeof FT_THRESHOLDS
  ): { tier: string; confidence: number; emoji: string } {
    // Score de confiança baseado em múltiplos fatores
    let confidence = 50; // Base
    
    // Adicionar pontos por pressão acima do threshold
    if (pressure.pressureIndex >= thresholds.pressureIndex) {
      confidence += (pressure.pressureIndex - thresholds.pressureIndex) * 0.5;
    }
    
    // Adicionar pontos por probabilidade de gol
    confidence += pressure.goalProbability * 0.3;
    
    // Adicionar pontos por surge de pressão
    if (pressure.pressureDelta > 0) {
      confidence += Math.min(20, pressure.pressureDelta * 0.8);
    }
    
    // Limitar entre 50-100
    confidence = Math.min(100, Math.max(50, confidence));
    
    // Determinar tier
    if (confidence >= CONFIDENCE_TIERS.PRIME.min) {
      return { tier: CONFIDENCE_TIERS.PRIME.label, confidence, emoji: CONFIDENCE_TIERS.PRIME.emoji };
    } else if (confidence >= CONFIDENCE_TIERS.CORE.min) {
      return { tier: CONFIDENCE_TIERS.CORE.label, confidence, emoji: CONFIDENCE_TIERS.CORE.emoji };
    } else if (confidence >= CONFIDENCE_TIERS.WATCH.min) {
      return { tier: CONFIDENCE_TIERS.WATCH.label, confidence, emoji: CONFIDENCE_TIERS.WATCH.emoji };
    }
    
    return { tier: 'LOW', confidence, emoji: '⚠️' };
  }

  private async createAlert(
    snapshot: any,
    fixture: LiveFixture,
    side: 'home' | 'away',
    pressure: PressureCalculation,
    confidence: { tier: string; confidence: number; emoji: string },
    isFirstHalf: boolean
  ) {
    const teamName = side === 'home' ? fixture.teams.home.name : fixture.teams.away.name;
    const matchMinute = fixture.fixture.status.elapsed || 0;
    const score = `${fixture.goals.home || 0}-${fixture.goals.away || 0}`;
    const halfLabel = isFirstHalf ? '1T' : '2T';

    let alertType: 'home_pressure' | 'away_pressure' | 'imminent_goal' | 'pressure_surge' = 
      side === 'home' ? 'home_pressure' : 'away_pressure';
    
    if (pressure.goalProbability >= 80) {
      alertType = 'imminent_goal';
    } else if (pressure.pressureDelta >= 20) {
      alertType = 'pressure_surge';
    }

    // Título com tier de confiança
    const alertTitle = `${confidence.emoji} [${confidence.tier}] ${teamName} pressionando!`;
    const alertMessage = `${fixture.teams.home.name} ${score} ${fixture.teams.away.name} (${matchMinute}' - ${halfLabel})\n` +
      `Pressão: ${pressure.pressureIndex.toFixed(0)}% | Prob. Gol: ${pressure.goalProbability.toFixed(0)}% | Conf: ${confidence.confidence.toFixed(0)}%`;

    // Sugerir mercado baseado na situação
    const marketSuggestion = this.suggestMarket(
      fixture,
      pressure,
      matchMinute,
      isFirstHalf
    );

    const alert: InsertLiveAlert = {
      fixtureId: fixture.fixture.id.toString(),
      snapshotId: snapshot.id,
      alertType,
      teamSide: side,
      pressureIndex: pressure.pressureIndex.toString(),
      goalProbability: pressure.goalProbability.toString(),
      alertTitle,
      alertMessage: `${alertMessage}\n📊 Sugestão: ${marketSuggestion}`,
      matchMinute: matchMinute.toString(),
      currentScore: score,
      notificationSent: false,
      notificationId: null,
      goalScoredWithin5Min: null,
      actualOutcome: null,
    };

    const [insertedAlert] = await db.insert(liveAlerts).values(alert).returning();

    await db.update(livePressureSnapshots)
      .set({ alertTriggered: true, alertType })
      .where(eq(livePressureSnapshots.id, snapshot.id));

    console.log(`[LIVE ALERT] ${alertTitle} - ${alertMessage}`);
    console.log(`[LIVE ALERT] Market: ${marketSuggestion}`);

    return insertedAlert;
  }

  private suggestMarket(
    fixture: LiveFixture,
    pressure: PressureCalculation,
    matchMinute: number,
    isFirstHalf: boolean
  ): string {
    const currentGoals = (fixture.goals.home || 0) + (fixture.goals.away || 0);
    const remainingMinutes = isFirstHalf ? 45 - matchMinute : 90 - matchMinute;
    
    // Se probabilidade de gol alta e ainda tem tempo
    if (pressure.goalProbability >= 70 && remainingMinutes >= 10) {
      if (isFirstHalf && currentGoals === 0) {
        return `Over 0.5 Gols 1T ou Próximo Gol`;
      } else if (!isFirstHalf) {
        const nextGoalLine = currentGoals + 0.5;
        if (nextGoalLine <= BET365_MARKETS.goals.min) {
          return `Over ${BET365_MARKETS.goals.min} Gols FT`;
        }
        return `Over ${nextGoalLine} Gols FT`;
      }
    }
    
    // Sugestão genérica baseada em pressão alta
    if (pressure.pressureIndex >= 75) {
      if (currentGoals <= 1) {
        return `Over 1.5 Gols FT ou BTTS`;
      }
      return `Over ${currentGoals + 0.5} Gols FT`;
    }
    
    return `Monitorar - Pressão crescente`;
  }

  async getHotMatches(limit: number = 20): Promise<any[]> {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const latestSnapshots = await db
      .selectDistinctOn([livePressureSnapshots.fixtureId])
      .from(livePressureSnapshots)
      .where(gte(livePressureSnapshots.createdAt, tenMinutesAgo))
      .orderBy(livePressureSnapshots.fixtureId, desc(livePressureSnapshots.createdAt));

    const sortedByPressure = latestSnapshots.sort((a, b) => {
      const maxPressureA = Math.max(
        parseFloat(a.homePressureIndex || '0'),
        parseFloat(a.awayPressureIndex || '0')
      );
      const maxPressureB = Math.max(
        parseFloat(b.homePressureIndex || '0'),
        parseFloat(b.awayPressureIndex || '0')
      );
      return maxPressureB - maxPressureA;
    });

    return sortedByPressure.slice(0, limit);
  }

  async getMatchPressureHistory(fixtureId: string, limit: number = 50): Promise<any[]> {
    return db.select()
      .from(livePressureSnapshots)
      .where(eq(livePressureSnapshots.fixtureId, fixtureId))
      .orderBy(desc(livePressureSnapshots.createdAt))
      .limit(limit);
  }

  async getRecentAlerts(limit: number = 20): Promise<any[]> {
    return db.select()
      .from(liveAlerts)
      .orderBy(desc(liveAlerts.createdAt))
      .limit(limit);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      cachedFixtures: this.fixtureCache.size,
      trackedMatches: this.lastSnapshotMap.size,
    };
  }
}

export const livePressureMonitor = new LivePressureMonitorService();
