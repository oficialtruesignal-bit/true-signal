import { FixtureStatistics } from "./football-service";

export interface MappedGameStats {
  xg?: { home: number; away: number };
  attacks?: { home: number; away: number };
  dangerousAttacks?: { home: number; away: number };
  possession?: { home: number; away: number };
  corners?: { home: number; away: number };
  yellowCards?: { home: number; away: number };
  redCards?: { home: number; away: number };
  shotsTotal?: { home: number; away: number };
  shotsOnGoal?: { home: number; away: number };
  keyPasses?: { home: number; away: number };
  saves?: { home: number; away: number };
  passAccuracy?: { home: number; away: number };
}

export function mapFootballStatistics(
  stats: FixtureStatistics[]
): MappedGameStats {
  if (!stats || stats.length < 2) {
    console.warn('⚠️ API-Football Mapper: Dados insuficientes', stats);
    return {};
  }

  const homeStats = stats[0];
  const awayStats = stats[1];

  console.log('📊 [API-Football] Mapeando estatísticas:', {
    home: {
      team_id: homeStats.team_id,
      attacks: homeStats.attacks,
      dangerous_attacks: homeStats.dangerous_attacks,
      possession: homeStats.possession,
    },
    away: {
      team_id: awayStats.team_id,
      attacks: awayStats.attacks,
      dangerous_attacks: awayStats.dangerous_attacks,
      possession: awayStats.possession,
    },
  });

  const mapped: MappedGameStats = {};

  // ⚡ ATAQUES REAIS (não estimados!)
  if (homeStats.attacks > 0 || awayStats.attacks > 0) {
    mapped.attacks = {
      home: homeStats.attacks,
      away: awayStats.attacks,
    };
    console.log('⚡ Ataques (reais):', mapped.attacks);
  }

  // 💥 ATAQUES PERIGOSOS REAIS (não estimados!)
  if (homeStats.dangerous_attacks > 0 || awayStats.dangerous_attacks > 0) {
    mapped.dangerousAttacks = {
      home: homeStats.dangerous_attacks,
      away: awayStats.dangerous_attacks,
    };
    console.log('💥 Ataques Perigosos (reais):', mapped.dangerousAttacks);
  }

  // ⚽ POSSE DE BOLA
  if (homeStats.possession > 0 || awayStats.possession > 0) {
    mapped.possession = {
      home: homeStats.possession,
      away: awayStats.possession,
    };
  }

  // 🚩 ESCANTEIOS
  mapped.corners = {
    home: homeStats.corners,
    away: awayStats.corners,
  };

  // 🟨 CARTÕES AMARELOS
  mapped.yellowCards = {
    home: homeStats.yellowcards,
    away: awayStats.yellowcards,
  };

  // 🟥 CARTÕES VERMELHOS
  mapped.redCards = {
    home: homeStats.redcards,
    away: awayStats.redcards,
  };

  // 🎯 TOTAL DE CHUTES
  if (homeStats.shots_total > 0 || awayStats.shots_total > 0) {
    mapped.shotsTotal = {
      home: homeStats.shots_total,
      away: awayStats.shots_total,
    };
  }

  // 🥅 CHUTES NO GOL
  if (homeStats.shots_on_goal > 0 || awayStats.shots_on_goal > 0) {
    mapped.shotsOnGoal = {
      home: homeStats.shots_on_goal,
      away: awayStats.shots_on_goal,
    };
  }

  // 🔑 PASSES CHAVE (estimativa: passes precisos / 50)
  const homeKeyPasses = Math.floor(homeStats.passes_accurate / 50);
  const awayKeyPasses = Math.floor(awayStats.passes_accurate / 50);
  if (homeKeyPasses > 0 || awayKeyPasses > 0) {
    mapped.keyPasses = {
      home: homeKeyPasses,
      away: awayKeyPasses,
    };
  }

  // 🧤 DEFESAS
  if (homeStats.saves > 0 || awayStats.saves > 0) {
    mapped.saves = {
      home: homeStats.saves,
      away: awayStats.saves,
    };
  }

  // 📈 PRECISÃO DE PASSES
  if (homeStats.passes_percentage > 0 || awayStats.passes_percentage > 0) {
    mapped.passAccuracy = {
      home: Math.round(homeStats.passes_percentage),
      away: Math.round(awayStats.passes_percentage),
    };
  }

  console.log('✅ [API-Football] Estatísticas mapeadas:', mapped);
  return mapped;
}
