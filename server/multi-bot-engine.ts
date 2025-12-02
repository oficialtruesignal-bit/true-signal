import { db } from "./db";
import { botStrategies, botSignals, botPerformanceStats, tips, livePressureSnapshots } from "@shared/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

// =====================================================
// MULTI-BOT STRATEGY DEFINITIONS
// =====================================================

export interface BotStrategyConfig {
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: "pre_live" | "live_ht" | "live_ft" | "live_late" | "special";
  minMinute: number | null;
  maxMinute: number | null;
  minPressure: number;
  minConfidence: number;
  parameters: Record<string, any>;
}

// Default bot strategies - PROMPT MESTRE CONDITIONS
export const DEFAULT_BOT_STRATEGIES: BotStrategyConfig[] = [
  // --- 1. CARDS SPECIALIST (2º Tempo) ---
  {
    code: "cards_specialist",
    name: "🟨 Cards Specialist",
    description: "Jogo quente! Detecta alta probabilidade de mais cartões ou expulsão no 2º tempo.",
    icon: "CreditCard",
    color: "#eab308",
    type: "live_ft",
    minMinute: 60,
    maxMinute: 90,
    minPressure: 45,
    minConfidence: 68,
    parameters: {
      minYellowCards: 4, // Jogo já está pegado (4+ amarelos)
      scoreDiffMax: 1, // Jogo disputado (Empate ou diferença de 1 gol)
      foulsMin: 20, // Muitas faltas
      preferredMarkets: ["Over 4.5 Cards", "Over 5.5 Cards", "Cartão Vermelho"]
    }
  },

  // --- 2. CORNER PRO BOT (Inteligência Avançada) ---
  // Baseado em análise de dados profissionais: Premier League 10.5 corners/game, 
  // Bundesliga 9.9, últimos 10 minutos = 1.5x mais corners
  {
    code: "corners_master",
    name: "🚩 Corner PRO Bot",
    description: "Algoritmo profissional: Last 10min Value, 1H Over, Handicap Analysis",
    icon: "Flag",
    color: "#06b6d4",
    type: "live_ft",
    minMinute: 15,
    maxMinute: 90,
    minPressure: 40,
    minConfidence: 68,
    parameters: {
      // Estratégia 1: Last 10 Minutes Value Bet
      last10MinEnabled: true,
      last10MinWindow: [80, 90],
      last10MinTrailingTeamBonus: 1.5, // 1.5x mais corners quando perdendo
      // Estratégia 2: First Half Over Exploitation
      firstHalfEnabled: true,
      firstHalfWindow: [15, 45],
      highCornerLeagues: ["Premier League", "Bundesliga", "Eredivisie", "Scottish Premiership"],
      leagueCornerAverages: {
        "Premier League": 10.5,
        "Bundesliga": 9.9,
        "Serie A": 9.5,
        "La Liga": 9.3,
        "Ligue 1": 9.2,
        "Brasileirão": 9.0,
        "Eredivisie": 10.2,
        "Scottish Premiership": 10.8
      },
      // Estratégia 3: Live Under After High 1H
      underAfterHigh1HEnabled: true,
      high1HThreshold: 7, // Se 1H tem 7+ corners
      // Estratégia 4: Team Corner Handicap
      dominantTeamEnabled: true,
      dominantTeamCornersMin: 7.0, // Média de corners/jogo
      // Limiares de qualidade
      minCurrentCorners: 3,
      minCornersRate: 0.10, // corners/minuto mínimo
      minDangerousAttacks: 25,
      minShotsTotal: 6,
      // Projeção e mercados
      projectionBoostFinal10: 1.5, // Boost de 50% nos últimos 10 min
      preferredMarkets: ["Over 8.5 Corners", "Over 9.5 Corners", "Over 10.5 Corners", "Corner Handicap -1.5"]
    }
  },

  // --- 3. FATOR CASA (2º Tempo) ---
  {
    code: "home_favorite",
    name: "🏠 Fator Casa",
    description: "O dono da casa acordou! Pressão pelo resultado.",
    icon: "Home",
    color: "#33b864",
    type: "live_ft",
    minMinute: 45,
    maxMinute: 80,
    minPressure: 72,
    minConfidence: 75,
    parameters: {
      homeTeamLosingOrDraw: true, // Casa empatando ou perdendo
      homePossessionMin: 60, // Casa dominando a posse
      homeAttacksAdvantage: 20, // Casa tem 20+ ataques perigosos que o rival
      preferredMarkets: ["Over 0.5 FT", "Gol Casa", "Over 1.5 FT"]
    }
  },

  // --- 4. GOL NO 1º TEMPO (HT) ---
  {
    code: "ht_scorer",
    name: "🥅 Gol no 1º Tempo",
    description: "0x0 Mentiroso! O gol está maduro para sair no HT.",
    icon: "Target",
    color: "#8b5cf6",
    type: "live_ht",
    minMinute: 15,
    maxMinute: 38, // Janela de ouro do HT
    minPressure: 70,
    minConfidence: 75,
    parameters: {
      requireZeroZero: true, // Tem que estar 0x0
      minShotsTotal: 6, // Jogo movimentado
      preferredMarkets: ["Over 0.5 HT", "Gol HT"]
    }
  },

  // --- 5. PÓS CARTÃO VERMELHO (Especial) ---
  {
    code: "post_red_card",
    name: "🚨 Pós Cartão Vermelho",
    description: "Expulsão detectada! Aproveite a desorganização tática.",
    icon: "AlertTriangle",
    color: "#ef4444",
    type: "special",
    minMinute: null,
    maxMinute: null,
    minPressure: 65,
    minConfidence: 72,
    parameters: {
      hasRedCard: true, // Alguém foi expulso
      minTimeSinceRed: 5, // 5 minutos depois da expulsão (mercado ajustou)
      requireScoreDraw: true, // Jogo empatado
      timeRemainingMin: 15,
      preferredMarkets: ["Over 0.5 FT", "Próximo Gol", "Gol Time 11 jogadores"]
    }
  },

  // --- 6. PRESSÃO FINAL 75-90 ---
  {
    code: "late_pressure",
    name: "🔥 Pressão Final 75-90",
    description: "Blitz Final! O gol vai sair nos acréscimos.",
    icon: "Clock",
    color: "#f59e0b",
    type: "live_late",
    minMinute: 75,
    maxMinute: 90,
    minPressure: 78,
    minConfidence: 80,
    parameters: {
      scoreDiffMax: 1, // Jogo aberto
      attacksLast10Min: 15, // Blitz nos últimos 10 min
      urgencyFactor: true, // Time perdendo = mais urgência
      preferredMarkets: ["Over 0.5 FT", "Próximo Gol", "Gol Acréscimos"]
    }
  },

  // --- 7. BTTS HUNTER (Ambas Marcam) ---
  {
    code: "btts_hunter",
    name: "⚽⚽ BTTS Hunter",
    description: "O empate vem aí! Tendência forte de Ambas Marcam.",
    icon: "Crosshair",
    color: "#ec4899",
    type: "live_ft",
    minMinute: 55,
    maxMinute: 80,
    minPressure: 60,
    minConfidence: 72,
    parameters: {
      goalsTotal: 1, // Jogo está 1x0 ou 0x1
      losingTeamShotsOnTarget: 3, // Time que tá perdendo tá chutando
      preferredMarkets: ["BTTS Sim", "Over 1.5 FT", "Empate"]
    }
  },

  // --- 8. VISITANTE FAVORITO ---
  {
    code: "away_dominant",
    name: "✈️ Visitante Favorito",
    description: "Favorito perdendo fora de casa. Oportunidade de valor.",
    icon: "Plane",
    color: "#3b82f6",
    type: "live_ft",
    minMinute: 45,
    maxMinute: 80,
    minPressure: 75,
    minConfidence: 78,
    parameters: {
      awayOddPreLive: 1.80, // Era favorito antes do jogo
      awayLosingOrDraw: true, // Está perdendo ou empatando
      preferredMarkets: ["Gol Fora", "Over 0.5 FT", "Vitória Fora"]
    }
  }
];

// =====================================================
// MULTI-BOT ENGINE CLASS
// =====================================================

export class MultiBotEngine {
  private strategies: Map<string, BotStrategyConfig> = new Map();
  private isRunning: boolean = false;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor() {
    DEFAULT_BOT_STRATEGIES.forEach(s => this.strategies.set(s.code, s));
  }

  // Initialize strategies in database
  async initializeStrategies(): Promise<void> {
    console.log("[Multi-Bot] Initializing bot strategies...");
    
    for (const strategy of DEFAULT_BOT_STRATEGIES) {
      const existing = await db.select()
        .from(botStrategies)
        .where(eq(botStrategies.strategyCode, strategy.code))
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(botStrategies).values({
          strategyCode: strategy.code,
          strategyName: strategy.name,
          strategyDescription: strategy.description,
          strategyIcon: strategy.icon,
          strategyColor: strategy.color,
          strategyType: strategy.type,
          minMinute: strategy.minMinute ? String(strategy.minMinute) : null,
          maxMinute: strategy.maxMinute ? String(strategy.maxMinute) : null,
          minPressureThreshold: strategy.minPressure ? String(strategy.minPressure) : null,
          minConfidenceThreshold: String(strategy.minConfidence),
          parameters: JSON.stringify(strategy.parameters),
          isActive: true
        });
        console.log(`[Multi-Bot] Created strategy: ${strategy.name}`);
      }
    }
    
    console.log("[Multi-Bot] Strategies initialized");
  }

  // Get all strategies
  async getStrategies(): Promise<any[]> {
    return await db.select().from(botStrategies).orderBy(botStrategies.strategyName);
  }

  // Get signals for a strategy
  async getSignals(strategyCode?: string, status?: string, limit: number = 50): Promise<any[]> {
    let query = db.select().from(botSignals).orderBy(desc(botSignals.createdAt)).limit(limit);
    
    // Filters are applied in the where clause building
    const conditions: any[] = [];
    
    if (strategyCode) {
      conditions.push(eq(botSignals.strategyCode, strategyCode));
    }
    
    if (status) {
      conditions.push(eq(botSignals.signalStatus, status as any));
    }
    
    if (conditions.length > 0) {
      return await db.select()
        .from(botSignals)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(desc(botSignals.createdAt))
        .limit(limit);
    }
    
    return await db.select()
      .from(botSignals)
      .orderBy(desc(botSignals.createdAt))
      .limit(limit);
  }

  // Get performance stats for all bots
  async getPerformanceStats(periodType: string = "all_time"): Promise<any[]> {
    return await db.select()
      .from(botPerformanceStats)
      .where(eq(botPerformanceStats.periodType, periodType as any))
      .orderBy(desc(botPerformanceStats.hitRate));
  }

  // Get detailed stats for a single bot
  async getBotDetailedStats(strategyCode: string): Promise<any> {
    const strategy = await db.select()
      .from(botStrategies)
      .where(eq(botStrategies.strategyCode, strategyCode))
      .limit(1);
    
    if (strategy.length === 0) return null;
    
    const signals = await db.select()
      .from(botSignals)
      .where(eq(botSignals.strategyCode, strategyCode))
      .orderBy(desc(botSignals.createdAt))
      .limit(100);
    
    const stats = await db.select()
      .from(botPerformanceStats)
      .where(eq(botPerformanceStats.strategyCode, strategyCode));
    
    // Calculate stats from signals
    const totalSignals = signals.length;
    const hits = signals.filter(s => s.signalStatus === "hit").length;
    const misses = signals.filter(s => s.signalStatus === "miss").length;
    const pending = signals.filter(s => s.signalStatus === "pending").length;
    
    const hitRate = totalSignals > 0 ? ((hits / (hits + misses)) * 100) : 0;
    
    // Calculate profit (assuming 1 unit per bet)
    let totalProfit = 0;
    signals.forEach(s => {
      if (s.signalStatus === "hit" && s.suggestedOdd) {
        totalProfit += Number(s.suggestedOdd) - 1;
      } else if (s.signalStatus === "miss") {
        totalProfit -= 1;
      }
    });
    
    // Calculate streaks
    let currentStreak = 0;
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let tempWinStreak = 0;
    let tempLossStreak = 0;
    
    for (const signal of signals.filter(s => s.signalStatus !== "pending")) {
      if (signal.signalStatus === "hit") {
        tempWinStreak++;
        tempLossStreak = 0;
        longestWinStreak = Math.max(longestWinStreak, tempWinStreak);
      } else if (signal.signalStatus === "miss") {
        tempLossStreak++;
        tempWinStreak = 0;
        longestLossStreak = Math.max(longestLossStreak, tempLossStreak);
      }
    }
    
    // Current streak
    for (const signal of signals.filter(s => s.signalStatus !== "pending")) {
      if (signal.signalStatus === "hit") {
        if (currentStreak >= 0) currentStreak++;
        else break;
      } else if (signal.signalStatus === "miss") {
        if (currentStreak <= 0) currentStreak--;
        else break;
      }
    }
    
    return {
      strategy: strategy[0],
      signals: signals.slice(0, 20), // Last 20 signals
      stats: {
        totalSignals,
        hits,
        misses,
        pending,
        hitRate: hitRate.toFixed(1),
        totalProfit: totalProfit.toFixed(2),
        currentStreak,
        longestWinStreak,
        longestLossStreak
      },
      periodStats: stats
    };
  }

  // Analyze live matches with all active bots
  async analyzeWithBots(liveMatches: any[]): Promise<any[]> {
    const activeStrategies = await db.select()
      .from(botStrategies)
      .where(eq(botStrategies.isActive, true));
    
    const signals: any[] = [];
    
    for (const match of liveMatches) {
      for (const strategy of activeStrategies) {
        const signal = await this.analyzeMatchWithStrategy(match, strategy);
        if (signal) {
          signals.push(signal);
        }
      }
    }
    
    return signals;
  }

  // Analyze a single match with a specific strategy - PROMPT MESTRE CONDITIONS
  private async analyzeMatchWithStrategy(match: any, strategy: any): Promise<any | null> {
    const params = JSON.parse(strategy.parameters || "{}");
    const minute = Number(match.matchMinute || match.elapsed || 0);
    
    // Check timing constraints (skip for special strategies like red card)
    if (strategy.strategyCode !== "post_red_card") {
      if (strategy.minMinute && minute < Number(strategy.minMinute)) return null;
      if (strategy.maxMinute && minute > Number(strategy.maxMinute)) return null;
    }
    
    // Extract all match data
    const homePressure = Number(match.homePressureIndex || match.home_pressure || 50);
    const awayPressure = Number(match.awayPressureIndex || match.away_pressure || 50);
    const homePossession = Number(match.homePossession || match.home_possession || 50);
    const awayPossession = Number(match.awayPossession || match.away_possession || 50);
    const homeShotsOnTarget = Number(match.homeShotsOnTarget || match.home_shots_on_target || 0);
    const awayShotsOnTarget = Number(match.awayShotsOnTarget || match.away_shots_on_target || 0);
    const homeScore = Number(match.homeScore || match.home_score || 0);
    const awayScore = Number(match.awayScore || match.away_score || 0);
    const homeCorners = Number(match.homeCorners || match.home_corners || 0);
    const awayCorners = Number(match.awayCorners || match.away_corners || 0);
    const homeCards = Number(match.homeCards || match.home_cards || 0);
    const awayCards = Number(match.awayCards || match.away_cards || 0);
    const homeFouls = Number(match.homeFouls || match.home_fouls || 0);
    const awayFouls = Number(match.awayFouls || match.away_fouls || 0);
    const homeDangerousAttacks = Number(match.homeDangerousAttacks || match.home_dangerous_attacks || 0);
    const awayDangerousAttacks = Number(match.awayDangerousAttacks || match.away_dangerous_attacks || 0);
    const homeAttacks = Number(match.homeAttacks || match.home_attacks || 0);
    const awayAttacks = Number(match.awayAttacks || match.away_attacks || 0);
    const hasRedCard = Boolean(match.hasRedCard || match.has_red_card || (match.events && match.events.some((e: any) => e.type === 'red_card')));
    const redCardMinute = Number(match.redCardMinute || match.red_card_minute || 0);
    
    const scoreDiff = Math.abs(homeScore - awayScore);
    const totalGoals = homeScore + awayScore;
    const totalShots = homeShotsOnTarget + awayShotsOnTarget;
    const totalCards = homeCards + awayCards;
    const totalFouls = homeFouls + awayFouls;
    const totalCorners = homeCorners + awayCorners;
    const totalAttacks = homeAttacks + awayAttacks;
    
    let confidence = 0;
    let probability = 0;
    let market = "";
    let outcome = "";
    let analysisData: any = {};
    
    switch (strategy.strategyCode) {
      // --- 1. CARDS SPECIALIST (2º Tempo) ---
      case "cards_specialist": {
        const meetsYellowCards = totalCards >= params.minYellowCards;
        const meetsScoreDiff = scoreDiff <= params.scoreDiffMax;
        const meetsFouls = totalFouls >= params.foulsMin;
        
        if (meetsYellowCards && meetsScoreDiff && meetsFouls) {
          const cardsRate = minute > 0 ? totalCards / minute : 0;
          const projectedCards = totalCards + (90 - minute) * cardsRate;
          confidence = Math.min(92, 55 + totalCards * 5 + (totalFouls / 5));
          probability = Math.min(85, confidence * 0.92);
          market = projectedCards >= 6 ? "Over 5.5 Cards" : "Over 4.5 Cards";
          outcome = "Sim";
          analysisData = {
            trigger: "🟨 Jogo quente! Alta tendência de cartões",
            totalCards,
            totalFouls,
            scoreDiff,
            projectedCards: projectedCards.toFixed(1),
            message: params.preferredMarkets[0]
          };
        }
        break;
      }

      // --- 2. CORNER PRO BOT (Inteligência Avançada) ---
      case "corners_master": {
        const cornersRate = minute > 0 ? totalCorners / minute : 0;
        const matchStatus = match.matchStatus || match.status || "";
        const isFirstHalf = matchStatus === "1H" || matchStatus === "HT" || minute <= 45;
        const isSecondHalf = minute > 45;
        const isLast10Min = minute >= 80;
        const league = match.league || match.leagueName || "";
        
        // Get league average corners
        const leagueAverages: Record<string, number> = params.leagueCornerAverages || {};
        const leagueAvg = leagueAverages[league] || 9.5;
        const expectedCornersPerMin = leagueAvg / 90;
        
        // Check if team is trailing (more aggressive for corners)
        const isHomeTrailing = homeScore < awayScore;
        const isAwayTrailing = awayScore < homeScore;
        const hasTrailingTeam = isHomeTrailing || isAwayTrailing;
        
        // Dangerous attacks indicator
        const totalDangerousAttacks = homeDangerousAttacks + awayDangerousAttacks;
        
        let strategyTriggered = "";
        let projectedCorners = 0;
        let confidenceBonus = 0;
        
        // ═══════════════════════════════════════════════════════════════
        // ESTRATÉGIA 1: LAST 10 MINUTES VALUE BET (80-90 min)
        // Times perdendo atacam intensamente, corners 1.5x mais frequentes
        // ═══════════════════════════════════════════════════════════════
        if (isLast10Min && params.last10MinEnabled && hasTrailingTeam) {
          const trailingTeamAttacks = isHomeTrailing ? homeDangerousAttacks : awayDangerousAttacks;
          const last10MinBoost = params.last10MinTrailingTeamBonus || 1.5;
          
          // Projeção com boost dos últimos 10 min
          const boostedRate = cornersRate * last10MinBoost;
          projectedCorners = totalCorners + (90 - minute) * boostedRate;
          
          if (trailingTeamAttacks >= 20 && totalCorners >= 5) {
            strategyTriggered = "LAST_10_MIN_VALUE";
            confidenceBonus = 15; // Boost alto para últimos 10 min
            confidence = Math.min(92, 60 + confidenceBonus + (projectedCorners - 8) * 3);
          }
        }
        
        // ═══════════════════════════════════════════════════════════════
        // ESTRATÉGIA 2: FIRST HALF OVER EXPLOITATION (15-45 min)
        // Ligas de alto corner produzem mais no 1º tempo
        // ═══════════════════════════════════════════════════════════════
        if (!strategyTriggered && isFirstHalf && params.firstHalfEnabled && minute >= 15 && minute <= 45) {
          const highCornerLeagues = params.highCornerLeagues || [];
          const isHighCornerLeague = highCornerLeagues.some((l: string) => 
            league.toLowerCase().includes(l.toLowerCase())
          );
          
          if (isHighCornerLeague || cornersRate >= expectedCornersPerMin * 1.2) {
            // 1º tempo geralmente tem mais corners que bookmakers preveem
            projectedCorners = totalCorners + (45 - minute) * cornersRate * 1.15;
            const expectedHalfCorners = (leagueAvg / 2) + 0.5; // Ligas altas têm mais no 1H
            
            if (projectedCorners >= expectedHalfCorners && totalCorners >= 2) {
              strategyTriggered = "1H_OVER_EXPLOITATION";
              confidenceBonus = isHighCornerLeague ? 12 : 8;
              confidence = Math.min(88, 55 + confidenceBonus + (projectedCorners - 4) * 4);
            }
          }
        }
        
        // ═══════════════════════════════════════════════════════════════
        // ESTRATÉGIA 3: LIVE PRESSURE STANDARD (50-85 min)
        // Pressão constante gera corners naturalmente
        // ═══════════════════════════════════════════════════════════════
        if (!strategyTriggered && isSecondHalf && minute >= 50 && minute <= 85) {
          const minRate = params.minCornersRate || 0.10;
          const minDangerous = params.minDangerousAttacks || 25;
          const minShots = params.minShotsTotal || 6;
          
          if (cornersRate >= minRate && totalDangerousAttacks >= minDangerous && totalShots >= minShots) {
            projectedCorners = totalCorners + (90 - minute) * cornersRate * 1.2;
            strategyTriggered = "LIVE_PRESSURE";
            confidenceBonus = 10;
            confidence = Math.min(88, 55 + confidenceBonus + (projectedCorners - 8) * 3 + (totalDangerousAttacks / 10));
          }
        }
        
        // ═══════════════════════════════════════════════════════════════
        // ESTRATÉGIA 4: DOMINANT TEAM HANDICAP
        // Times dominantes (City, Liverpool) excedem 8-10 corners
        // ═══════════════════════════════════════════════════════════════
        if (!strategyTriggered && minute >= 30) {
          const homeDominance = homeDangerousAttacks - awayDangerousAttacks;
          const awayDominance = awayDangerousAttacks - homeDangerousAttacks;
          const dominantTeamAdvantage = Math.max(homeDominance, awayDominance);
          
          if (dominantTeamAdvantage >= 15 && cornersRate >= 0.08) {
            const dominantTeamCorners = homeDominance > awayDominance ? homeCorners : awayCorners;
            projectedCorners = totalCorners + (90 - minute) * cornersRate * 1.25;
            
            if (dominantTeamCorners >= 3) {
              strategyTriggered = "DOMINANT_TEAM";
              confidenceBonus = 8;
              confidence = Math.min(85, 50 + confidenceBonus + dominantTeamAdvantage * 0.5 + dominantTeamCorners * 3);
            }
          }
        }
        
        // Determinar mercado baseado na projeção
        if (strategyTriggered && confidence >= Number(strategy.minConfidenceThreshold)) {
          probability = Math.min(88, confidence * 0.92);
          
          // Escolher mercado baseado em projeção e minuto
          if (isFirstHalf) {
            market = projectedCorners >= 5 ? "Over 4.5 Corners HT" : "Over 3.5 Corners HT";
          } else if (projectedCorners >= 11) {
            market = "Over 10.5 Corners";
          } else if (projectedCorners >= 10) {
            market = "Over 9.5 Corners";
          } else {
            market = "Over 8.5 Corners";
          }
          
          outcome = "Sim";
          analysisData = {
            trigger: `🚩 Corner PRO: ${strategyTriggered}`,
            strategy: strategyTriggered,
            totalCorners,
            cornersRate: cornersRate.toFixed(3),
            projectedCorners: projectedCorners.toFixed(1),
            leagueAverage: leagueAvg,
            minute,
            isLast10Min,
            hasTrailingTeam,
            totalDangerousAttacks,
            confidenceBonus,
            message: strategyTriggered === "LAST_10_MIN_VALUE" 
              ? "🔥 Últimos 10min - 1.5x mais corners!" 
              : strategyTriggered === "1H_OVER_EXPLOITATION"
              ? "📊 Liga de alto corner - 1H Over Value"
              : strategyTriggered === "DOMINANT_TEAM"
              ? "💪 Time dominante - Handicap favorável"
              : "📈 Pressão constante gerando corners"
          };
        }
        break;
      }

      // --- 3. FATOR CASA (2º Tempo) ---
      case "home_favorite": {
        const homeLosingOrDraw = homeScore <= awayScore;
        const homePossessionOk = homePossession >= params.homePossessionMin;
        const homeAttacksAdvantage = homeDangerousAttacks - awayDangerousAttacks;
        
        if (homeLosingOrDraw && homePossessionOk && homeAttacksAdvantage >= params.homeAttacksAdvantage) {
          confidence = Math.min(93, 55 + (homePossession - 50) * 0.8 + homeAttacksAdvantage * 0.5);
          probability = Math.min(88, confidence * 0.92);
          market = totalGoals === 0 ? "Over 0.5 FT" : "Gol Casa";
          outcome = "Sim";
          analysisData = {
            trigger: "🏠 O dono da casa acordou!",
            homePossession,
            homeAttacksAdvantage,
            homeScore,
            awayScore,
            message: "Pressão pelo resultado"
          };
        }
        break;
      }

      // --- 4. GOL NO 1º TEMPO (HT) ---
      case "ht_scorer": {
        const matchStatus = match.matchStatus || match.status || "";
        const isFirstHalf = matchStatus === "1H" || minute < 46;
        const isZeroZero = homeScore === 0 && awayScore === 0;
        const hasEnoughShots = totalShots >= params.minShotsTotal;
        
        if (isFirstHalf && isZeroZero && hasEnoughShots) {
          confidence = Math.min(90, 55 + totalShots * 4 + Math.max(homePressure, awayPressure) * 0.3);
          probability = Math.min(85, confidence * 0.9);
          market = "Over 0.5 HT";
          outcome = "Sim";
          analysisData = {
            trigger: "🥅 0x0 Mentiroso!",
            totalShots,
            minute,
            homePressure,
            awayPressure,
            message: "O gol está maduro para sair no HT"
          };
        }
        break;
      }

      // --- 5. PÓS CARTÃO VERMELHO (Especial) ---
      case "post_red_card": {
        const timeSinceRed = minute - redCardMinute;
        const isDraw = homeScore === awayScore;
        const timeRemaining = 90 - minute;
        
        if (hasRedCard && 
            timeSinceRed >= params.minTimeSinceRed && 
            isDraw && 
            timeRemaining >= params.timeRemainingMin) {
          confidence = Math.min(88, 60 + timeSinceRed * 1.5 + timeRemaining * 0.3);
          probability = Math.min(82, confidence * 0.88);
          market = "Over 0.5 FT";
          outcome = "Sim";
          analysisData = {
            trigger: "🚨 Expulsão detectada!",
            timeSinceRed,
            timeRemaining,
            isDraw,
            message: "Aproveite a desorganização tática"
          };
        }
        break;
      }

      // --- 6. PRESSÃO FINAL 75-90 ---
      case "late_pressure": {
        const maxPressure = Math.max(homePressure, awayPressure);
        const pressingTeam = homePressure > awayPressure ? "home" : "away";
        const isLosingTeam = (pressingTeam === "home" && homeScore < awayScore) ||
                            (pressingTeam === "away" && awayScore < homeScore);
        const isGameOpen = scoreDiff <= params.scoreDiffMax;
        
        if (maxPressure >= Number(strategy.minPressureThreshold) && isGameOpen) {
          confidence = Math.min(95, 60 + (maxPressure - 70) * 0.8);
          if (isLosingTeam) confidence += 10; // Urgency bonus
          probability = Math.min(90, confidence * 0.92);
          market = "Over 0.5 FT";
          outcome = "Sim";
          analysisData = {
            trigger: "🔥 Blitz Final!",
            pressingTeam,
            maxPressure,
            isLosingTeam,
            minute,
            message: "O gol vai sair nos acréscimos"
          };
        }
        break;
      }

      // --- 7. BTTS HUNTER (Ambas Marcam) ---
      case "btts_hunter": {
        const is1x0or0x1 = totalGoals === 1 && scoreDiff === 1;
        const losingTeamShotsOnTarget = homeScore < awayScore ? homeShotsOnTarget : awayShotsOnTarget;
        
        if (is1x0or0x1 && losingTeamShotsOnTarget >= params.losingTeamShotsOnTarget) {
          confidence = Math.min(88, 55 + losingTeamShotsOnTarget * 6 + totalShots * 2);
          probability = Math.min(82, confidence * 0.88);
          market = "BTTS Sim";
          outcome = "Sim";
          analysisData = {
            trigger: "⚽⚽ O empate vem aí!",
            homeScore,
            awayScore,
            losingTeamShotsOnTarget,
            totalShots,
            message: "Tendência forte de Ambas Marcam"
          };
        }
        break;
      }

      // --- 8. VISITANTE FAVORITO ---
      case "away_dominant": {
        const awayLosingOrDraw = awayScore <= homeScore;
        const awayOddPreLive = Number(match.awayOdd || match.away_odd || 2.0);
        const wasFavorite = awayOddPreLive <= params.awayOddPreLive;
        
        if (awayLosingOrDraw && wasFavorite && awayPressure >= Number(strategy.minPressureThreshold)) {
          confidence = Math.min(90, 55 + (awayPressure - 60) * 0.8 + awayShotsOnTarget * 4);
          probability = Math.min(85, confidence * 0.9);
          market = totalGoals === 0 ? "Gol Fora" : "Over 0.5 FT";
          outcome = "Sim";
          analysisData = {
            trigger: "✈️ Favorito perdendo fora de casa",
            awayOddPreLive,
            awayPressure,
            awayScore,
            homeScore,
            message: "Oportunidade de valor"
          };
        }
        break;
      }
    }
    
    // Check minimum confidence
    if (confidence < Number(strategy.minConfidenceThreshold)) return null;
    if (!market) return null;
    
    // Check if signal already exists for this match + strategy
    const existing = await db.select()
      .from(botSignals)
      .where(and(
        eq(botSignals.fixtureId, String(match.fixtureId || match.fixture_id)),
        eq(botSignals.strategyCode, strategy.strategyCode),
        eq(botSignals.signalStatus, "pending")
      ))
      .limit(1);
    
    if (existing.length > 0) return null;
    
    // Determine signal type
    const signalTypeValue: "goal_ht" | "goal_ft" | "over_15" | "over_25" | "btts" | "corners" | "cards" | "goal_now" = 
      market.includes("Corner") ? "corners" : 
      market.includes("Card") ? "cards" :
      market.includes("BTTS") ? "btts" :
      market.includes("HT") ? "goal_ht" : "goal_ft";
    
    // Create signal
    const signal = {
      strategyId: strategy.id,
      strategyCode: strategy.strategyCode,
      fixtureId: String(match.fixtureId || match.fixture_id),
      league: match.league || match.leagueName || "Unknown",
      leagueId: match.leagueId,
      homeTeam: match.homeTeam || match.home_team,
      awayTeam: match.awayTeam || match.away_team,
      homeTeamLogo: match.homeTeamLogo || match.home_team_logo,
      awayTeamLogo: match.awayTeamLogo || match.away_team_logo,
      signalType: signalTypeValue,
      market,
      predictedOutcome: outcome,
      signalMinute: String(minute),
      scoreWhenGenerated: `${homeScore}-${awayScore}`,
      matchStatus: match.matchStatus || match.status || "LIVE",
      pressureIndex: String(Math.max(homePressure, awayPressure).toFixed(1)),
      confidenceScore: String(confidence.toFixed(1)),
      probabilityScore: String(probability.toFixed(1)),
      analysisData: JSON.stringify(analysisData),
      suggestedOdd: match.suggestedOdd || "1.60",
      signalStatus: "pending" as const,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min expiry
    };
    
    // Save to database
    await db.insert(botSignals).values(signal as any);
    
    console.log(`[Multi-Bot] ${strategy.strategyName} signal: ${match.homeTeam} vs ${match.awayTeam} - ${market}`);
    
    return {
      ...signal,
      strategyName: strategy.strategyName,
      strategyColor: strategy.strategyColor,
      strategyIcon: strategy.strategyIcon
    };
  }

  // Update signal outcome
  async updateSignalOutcome(signalId: string, status: "hit" | "miss" | "void", finalScore: string): Promise<void> {
    await db.update(botSignals)
      .set({
        signalStatus: status,
        finalScore,
        resolvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(botSignals.id, signalId));
    
    // Update performance stats
    const signal = await db.select().from(botSignals).where(eq(botSignals.id, signalId)).limit(1);
    if (signal.length > 0) {
      await this.updatePerformanceStats(signal[0].strategyCode);
    }
  }

  // Update performance stats for a strategy
  async updatePerformanceStats(strategyCode: string): Promise<void> {
    const strategy = await db.select()
      .from(botStrategies)
      .where(eq(botStrategies.strategyCode, strategyCode))
      .limit(1);
    
    if (strategy.length === 0) return;
    
    const signals = await db.select()
      .from(botSignals)
      .where(eq(botSignals.strategyCode, strategyCode));
    
    const totalSignals = signals.length;
    const hits = signals.filter(s => s.signalStatus === "hit").length;
    const misses = signals.filter(s => s.signalStatus === "miss").length;
    const voids = signals.filter(s => s.signalStatus === "void").length;
    const pending = signals.filter(s => s.signalStatus === "pending").length;
    
    const resolved = hits + misses;
    const hitRate = resolved > 0 ? (hits / resolved) * 100 : 0;
    
    // Calculate profit/loss
    let totalProfit = 0;
    let totalLoss = 0;
    let avgOdd = 0;
    let avgConfidence = 0;
    
    signals.forEach(s => {
      avgOdd += Number(s.suggestedOdd || 1.5);
      avgConfidence += Number(s.confidenceScore || 0);
      
      if (s.signalStatus === "hit") {
        totalProfit += Number(s.suggestedOdd || 1.5) - 1;
      } else if (s.signalStatus === "miss") {
        totalLoss += 1;
      }
    });
    
    avgOdd = totalSignals > 0 ? avgOdd / totalSignals : 0;
    avgConfidence = totalSignals > 0 ? avgConfidence / totalSignals : 0;
    const netProfit = totalProfit - totalLoss;
    const roi = totalSignals > 0 ? (netProfit / totalSignals) * 100 : 0;
    
    // Upsert all_time stats
    const existingStats = await db.select()
      .from(botPerformanceStats)
      .where(and(
        eq(botPerformanceStats.strategyCode, strategyCode),
        eq(botPerformanceStats.periodType, "all_time")
      ))
      .limit(1);
    
    const statsData = {
      strategyId: strategy[0].id,
      strategyCode,
      periodType: "all_time" as const,
      periodDate: "all",
      totalSignals: String(totalSignals),
      hitCount: String(hits),
      missCount: String(misses),
      voidCount: String(voids),
      pendingCount: String(pending),
      hitRate: String(hitRate.toFixed(2)),
      roi: String(roi.toFixed(2)),
      avgConfidence: String(avgConfidence.toFixed(2)),
      avgOdd: String(avgOdd.toFixed(2)),
      totalProfit: String(totalProfit.toFixed(2)),
      totalLoss: String(totalLoss.toFixed(2)),
      netProfit: String(netProfit.toFixed(2)),
      updatedAt: new Date()
    };
    
    if (existingStats.length > 0) {
      await db.update(botPerformanceStats)
        .set(statsData)
        .where(eq(botPerformanceStats.id, existingStats[0].id));
    } else {
      await db.insert(botPerformanceStats).values(statsData);
    }
  }

  // Toggle strategy active status
  async toggleStrategy(strategyCode: string, isActive: boolean): Promise<void> {
    await db.update(botStrategies)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(botStrategies.strategyCode, strategyCode));
  }

  // Publish a signal as a tip
  async publishSignal(signalId: string, createdBy: string): Promise<string> {
    const signal = await db.select()
      .from(botSignals)
      .where(eq(botSignals.id, signalId))
      .limit(1);
    
    if (signal.length === 0) throw new Error("Signal not found");
    
    const s = signal[0];
    
    // Create tip from signal
    const result = await db.insert(tips).values({
      fixtureId: s.fixtureId,
      league: s.league,
      homeTeam: s.homeTeam,
      awayTeam: s.awayTeam,
      homeTeamLogo: s.homeTeamLogo,
      awayTeamLogo: s.awayTeamLogo,
      matchTime: new Date().toISOString(),
      market: s.market,
      odd: s.suggestedOdd || "1.50",
      stake: s.suggestedStake || "1.0",
      status: "pending",
      isLive: true,
      isCombo: false,
      createdBy
    }).returning({ id: tips.id });
    
    // Update signal as published
    await db.update(botSignals)
      .set({
        isPublished: true,
        publishedTipId: result[0].id,
        updatedAt: new Date()
      })
      .where(eq(botSignals.id, signalId));
    
    return result[0].id;
  }
}

// Singleton instance
export const multiBotEngine = new MultiBotEngine();
