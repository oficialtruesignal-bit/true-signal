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

// Default bot strategies
export const DEFAULT_BOT_STRATEGIES: BotStrategyConfig[] = [
  {
    code: "home_favorite",
    name: "🏠 Fator Casa",
    description: "Identifica times mandantes dominantes com alta pressão em casa. Foco em Over 0.5/1.5 quando o time da casa pressiona.",
    icon: "Home",
    color: "#33b864",
    type: "live_ft",
    minMinute: 45,
    maxMinute: 90,
    minPressure: 72,
    minConfidence: 75,
    parameters: {
      minPossession: 58, // Casa deve ter > 58% posse
      minShotsOnTarget: 4, // Mínimo 4 chutes no gol
      minDangerousAttacks: 45, // Mínimo 45 ataques perigosos
      minPressureSustained: 3, // 3 snapshots consecutivos
      preferredMarkets: ["Over 0.5 FT", "Over 1.5 FT", "Gol Casa"]
    }
  },
  {
    code: "away_dominant",
    name: "✈️ Visitante Favorito",
    description: "Detecta visitantes dominando a partida. Útil quando o favorito joga fora e está pressionando.",
    icon: "Plane",
    color: "#3b82f6",
    type: "live_ft",
    minMinute: 50,
    maxMinute: 85,
    minPressure: 75,
    minConfidence: 78,
    parameters: {
      minPossession: 55, // Visitante > 55% posse
      minShotsOnTarget: 5,
      minDangerousAttacks: 40,
      awayPressureRatio: 1.4, // Pressão fora 40% maior que casa
      preferredMarkets: ["Over 0.5 FT", "Over 1.5 FT", "Gol Fora"]
    }
  },
  {
    code: "late_pressure",
    name: "⏰ Pressão Final 75-90",
    description: "Sinais nos últimos 15 minutos quando há pressão extrema de um time. Alta conversão histórica.",
    icon: "Clock",
    color: "#f59e0b",
    type: "live_late",
    minMinute: 75,
    maxMinute: 90,
    minPressure: 78,
    minConfidence: 80,
    parameters: {
      minPressureSurge: 20, // Aumento de 20% na pressão
      requireScoreDifferential: false, // Funciona em qualquer placar
      minShotsLast15: 4, // Mínimo 4 chutes nos últimos 15 min
      urgencyFactor: true, // Time perdendo = mais urgência
      preferredMarkets: ["Over 0.5 FT", "Próximo Gol"]
    }
  },
  {
    code: "post_red_card",
    name: "🟥 Pós Cartão Vermelho",
    description: "Oportunidades após expulsões. Time com 11 vs 10 tende a dominar e criar chances.",
    icon: "AlertTriangle",
    color: "#ef4444",
    type: "special",
    minMinute: null,
    maxMinute: null,
    minPressure: 65,
    minConfidence: 72,
    parameters: {
      waitMinutesAfterRed: 5, // Esperar 5 min após vermelho
      advantageTeamMinPossession: 60,
      advantageTeamMinShots: 3,
      timeRemainingMin: 15, // Pelo menos 15 min restantes
      preferredMarkets: ["Over 0.5 FT", "Gol Time com Vantagem"]
    }
  },
  {
    code: "ht_scorer",
    name: "🥅 Gol no 1º Tempo",
    description: "Identifica jogos com alta probabilidade de gol antes do intervalo baseado em pressão inicial.",
    icon: "Target",
    color: "#8b5cf6",
    type: "live_ht",
    minMinute: 15,
    maxMinute: 45,
    minPressure: 70,
    minConfidence: 75,
    parameters: {
      minCombinedShots: 8, // Total de chutes dos 2 times
      minPossessionSwing: false, // Não precisa de swing
      checkForm: true, // Verificar forma dos times
      minOver05Historical: 75, // Times com histórico de gol
      preferredMarkets: ["Over 0.5 HT", "Gol HT"]
    }
  },
  {
    code: "btts_hunter",
    name: "⚽⚽ BTTS Hunter",
    description: "Busca jogos onde ambos os times marcaram ou têm alta probabilidade de marcar.",
    icon: "Crosshair",
    color: "#ec4899",
    type: "live_ft",
    minMinute: 55,
    maxMinute: 85,
    minPressure: 60,
    minConfidence: 72,
    parameters: {
      minBTTSHistorical: 65, // Histórico > 65%
      bothTeamsMinShots: 2, // Ambos com pelo menos 2 chutes
      oneTeamAlreadyScored: true, // Pelo menos 1 já marcou
      requireBalancedPressure: true, // Pressão equilibrada
      preferredMarkets: ["BTTS Sim", "Over 1.5 FT"]
    }
  },
  {
    code: "corners_master",
    name: "🚩 Corners Master",
    description: "Especialista em escanteios. Analisa padrão de jogo e pressão para prever corners.",
    icon: "Flag",
    color: "#06b6d4",
    type: "live_ft",
    minMinute: 50,
    maxMinute: 85,
    minPressure: 55,
    minConfidence: 70,
    parameters: {
      minCurrentCorners: 4, // Já deve ter 4+ corners
      cornersPerMinuteRate: 0.12, // Taxa de corners/min
      minDangerousAttacks: 30,
      preferCornersMarkets: true,
      preferredMarkets: ["Over 8.5 Corners", "Over 9.5 Corners", "Próximo Corner"]
    }
  },
  {
    code: "cards_specialist",
    name: "🃏 Cards Specialist",
    description: "Prevê cartões baseado no ritmo do jogo, faltas e estilo do árbitro.",
    icon: "CreditCard",
    color: "#eab308",
    type: "live_ft",
    minMinute: 30,
    maxMinute: 80,
    minPressure: 45,
    minConfidence: 68,
    parameters: {
      minCurrentCards: 2, // Já deve ter 2+ cartões
      cardsPerMinuteRate: 0.08,
      highIntensityMatch: true, // Jogo intenso
      foulsRatio: 0.4, // Razão faltas/posse
      preferredMarkets: ["Over 3.5 Cards", "Over 4.5 Cards"]
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

  // Analyze a single match with a specific strategy
  private async analyzeMatchWithStrategy(match: any, strategy: any): Promise<any | null> {
    const params = JSON.parse(strategy.parameters || "{}");
    const minute = Number(match.matchMinute || match.elapsed || 0);
    
    // Check timing constraints
    if (strategy.minMinute && minute < Number(strategy.minMinute)) return null;
    if (strategy.maxMinute && minute > Number(strategy.maxMinute)) return null;
    
    // Get pressure metrics from match data
    const homePressure = Number(match.homePressureIndex || match.home_pressure || 50);
    const awayPressure = Number(match.awayPressureIndex || match.away_pressure || 50);
    const homePossession = Number(match.homePossession || match.home_possession || 50);
    const awayPossession = Number(match.awayPossession || match.away_possession || 50);
    const homeShotsOnTarget = Number(match.homeShotsOnTarget || match.home_shots_on_target || 0);
    const awayShotsOnTarget = Number(match.awayShotsOnTarget || match.away_shots_on_target || 0);
    const homeScore = Number(match.homeScore || match.home_score || 0);
    const awayScore = Number(match.awayScore || match.away_score || 0);
    
    let confidence = 0;
    let probability = 0;
    let market = "";
    let outcome = "";
    let analysisData: any = {};
    
    switch (strategy.strategyCode) {
      case "home_favorite":
        if (homePressure >= Number(strategy.minPressureThreshold) && 
            homePossession >= params.minPossession &&
            homeShotsOnTarget >= params.minShotsOnTarget) {
          confidence = Math.min(95, 50 + (homePressure - 60) * 0.8 + (homePossession - 50) * 0.5);
          probability = Math.min(90, confidence * 0.95);
          market = params.preferredMarkets[0];
          outcome = "Sim";
          analysisData = {
            trigger: "Pressão casa dominante",
            homePressure,
            homePossession,
            homeShotsOnTarget
          };
        }
        break;
        
      case "away_dominant":
        if (awayPressure >= Number(strategy.minPressureThreshold) &&
            awayPossession >= params.minPossession &&
            awayShotsOnTarget >= params.minShotsOnTarget) {
          confidence = Math.min(95, 50 + (awayPressure - 60) * 0.8 + (awayPossession - 50) * 0.5);
          probability = Math.min(90, confidence * 0.95);
          market = params.preferredMarkets[0];
          outcome = "Sim";
          analysisData = {
            trigger: "Visitante dominando",
            awayPressure,
            awayPossession,
            awayShotsOnTarget
          };
        }
        break;
        
      case "late_pressure":
        const maxPressure = Math.max(homePressure, awayPressure);
        const pressingTeam = homePressure > awayPressure ? "home" : "away";
        const isLosingTeam = (pressingTeam === "home" && homeScore < awayScore) ||
                            (pressingTeam === "away" && awayScore < homeScore);
        
        if (maxPressure >= Number(strategy.minPressureThreshold)) {
          confidence = Math.min(95, 55 + (maxPressure - 70) * 0.7);
          if (isLosingTeam) confidence += 8; // Urgency bonus
          probability = Math.min(88, confidence * 0.9);
          market = "Over 0.5 FT";
          outcome = "Sim";
          analysisData = {
            trigger: "Pressão final intensa",
            pressingTeam,
            maxPressure,
            isLosingTeam,
            minute
          };
        }
        break;
        
      case "ht_scorer":
        const combinedShots = homeShotsOnTarget + awayShotsOnTarget;
        const matchStatus = match.matchStatus || match.status || "";
        
        if ((matchStatus === "1H" || minute < 46) &&
            combinedShots >= params.minCombinedShots &&
            Math.max(homePressure, awayPressure) >= Number(strategy.minPressureThreshold)) {
          confidence = Math.min(92, 50 + combinedShots * 3 + (Math.max(homePressure, awayPressure) - 60) * 0.5);
          probability = Math.min(85, confidence * 0.92);
          market = "Over 0.5 HT";
          outcome = "Sim";
          analysisData = {
            trigger: "Alta atividade 1º tempo",
            combinedShots,
            minute,
            maxPressure: Math.max(homePressure, awayPressure)
          };
        }
        break;
        
      case "btts_hunter":
        const hasGoal = homeScore > 0 || awayScore > 0;
        const bothHaveShots = homeShotsOnTarget >= params.bothTeamsMinShots && 
                             awayShotsOnTarget >= params.bothTeamsMinShots;
        
        if (hasGoal && bothHaveShots) {
          confidence = Math.min(90, 55 + (homeShotsOnTarget + awayShotsOnTarget) * 2);
          if (homeScore > 0 && awayScore === 0) confidence += 5; // One team already scored
          if (awayScore > 0 && homeScore === 0) confidence += 5;
          probability = Math.min(82, confidence * 0.88);
          market = "BTTS Sim";
          outcome = "Sim";
          analysisData = {
            trigger: "Ambos times atacando",
            homeScore,
            awayScore,
            homeShotsOnTarget,
            awayShotsOnTarget
          };
        }
        break;
        
      case "corners_master":
        const totalCorners = Number(match.homeCorners || 0) + Number(match.awayCorners || 0);
        const cornersRate = minute > 0 ? totalCorners / minute : 0;
        
        if (totalCorners >= params.minCurrentCorners && cornersRate >= params.cornersPerMinuteRate) {
          const projectedCorners = totalCorners + (90 - minute) * cornersRate;
          confidence = Math.min(88, 50 + (projectedCorners - 8) * 4);
          probability = Math.min(80, confidence * 0.85);
          market = projectedCorners >= 10 ? "Over 9.5 Corners" : "Over 8.5 Corners";
          outcome = "Sim";
          analysisData = {
            trigger: "Alta taxa de corners",
            totalCorners,
            cornersRate: cornersRate.toFixed(3),
            projectedCorners: projectedCorners.toFixed(1)
          };
        }
        break;
        
      case "cards_specialist":
        const totalCards = Number(match.homeCards || 0) + Number(match.awayCards || 0);
        const cardsRate = minute > 0 ? totalCards / minute : 0;
        
        if (totalCards >= params.minCurrentCards && cardsRate >= params.cardsPerMinuteRate) {
          const projectedCards = totalCards + (90 - minute) * cardsRate;
          confidence = Math.min(85, 50 + (projectedCards - 4) * 5);
          probability = Math.min(75, confidence * 0.82);
          market = projectedCards >= 5 ? "Over 4.5 Cards" : "Over 3.5 Cards";
          outcome = "Sim";
          analysisData = {
            trigger: "Jogo intenso - cartões",
            totalCards,
            cardsRate: cardsRate.toFixed(3),
            projectedCards: projectedCards.toFixed(1)
          };
        }
        break;
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
