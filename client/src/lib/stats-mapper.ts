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

export function mapFixtureStatistics(
  apiStats: FixtureStatistics[]
): MappedGameStats {
  if (!apiStats || apiStats.length < 2) {
    console.warn('Stats Mapper: Dados insuficientes', apiStats);
    return {};
  }

  const homeStats = apiStats[0].statistics;
  const awayStats = apiStats[1].statistics;
  
  console.log('📊 Stats Mapper - Dados da API:', {
    home: apiStats[0].team.name,
    away: apiStats[1].team.name,
    homeStats: homeStats.map(s => `${s.type}: ${s.value}`),
    awayStats: awayStats.map(s => `${s.type}: ${s.value}`)
  });

  const getStat = (stats: any[], type: string): number | null => {
    const stat = stats.find((s) => s.type === type);
    if (!stat || stat.value === null) return null;
    
    // Handle percentage strings
    if (typeof stat.value === "string" && stat.value.includes("%")) {
      return parseInt(stat.value.replace("%", ""));
    }
    
    return typeof stat.value === "number" ? stat.value : parseInt(stat.value);
  };

  const mapped: MappedGameStats = {};

  // xG (Expected Goals) - API may not provide this
  const homeXg = getStat(homeStats, "expected_goals");
  const awayXg = getStat(awayStats, "expected_goals");
  if (homeXg !== null && awayXg !== null) {
    mapped.xg = { home: homeXg, away: awayXg };
  }

  // Attacks - try real field first, fallback to Total Shots
  let homeAttacks = getStat(homeStats, "Attacks");
  let awayAttacks = getStat(awayStats, "Attacks");
  if (homeAttacks === null || awayAttacks === null) {
    homeAttacks = getStat(homeStats, "Total Shots") || 0;
    awayAttacks = getStat(awayStats, "Total Shots") || 0;
  }
  if ((homeAttacks !== null && homeAttacks > 0) || (awayAttacks !== null && awayAttacks > 0)) {
    mapped.attacks = { home: homeAttacks || 0, away: awayAttacks || 0 };
  }

  // Dangerous Attacks - try real field first, fallback to Shots inside box
  let homeDangerous = getStat(homeStats, "Dangerous Attacks");
  let awayDangerous = getStat(awayStats, "Dangerous Attacks");
  if (homeDangerous === null || awayDangerous === null) {
    // Try both variations of the field name
    homeDangerous = getStat(homeStats, "Shots inside box") || getStat(homeStats, "Shots insidebox") || 0;
    awayDangerous = getStat(awayStats, "Shots inside box") || getStat(awayStats, "Shots insidebox") || 0;
  }
  if ((homeDangerous !== null && homeDangerous > 0) || (awayDangerous !== null && awayDangerous > 0)) {
    mapped.dangerousAttacks = { home: homeDangerous || 0, away: awayDangerous || 0 };
  }

  // Possession
  const homePoss = getStat(homeStats, "Ball Possession");
  const awayPoss = getStat(awayStats, "Ball Possession");
  if (homePoss !== null && awayPoss !== null) {
    mapped.possession = { home: homePoss, away: awayPoss };
  }

  // Corners
  const homeCorners = getStat(homeStats, "Corner Kicks") || 0;
  const awayCorners = getStat(awayStats, "Corner Kicks") || 0;
  mapped.corners = { home: homeCorners, away: awayCorners };

  // Yellow Cards
  const homeYellow = getStat(homeStats, "Yellow Cards") || 0;
  const awayYellow = getStat(awayStats, "Yellow Cards") || 0;
  mapped.yellowCards = { home: homeYellow, away: awayYellow };

  // Red Cards
  const homeRed = getStat(homeStats, "Red Cards") || 0;
  const awayRed = getStat(awayStats, "Red Cards") || 0;
  mapped.redCards = { home: homeRed, away: awayRed };

  // Total Shots
  const homeTotal = getStat(homeStats, "Total Shots") || 0;
  const awayTotal = getStat(awayStats, "Total Shots") || 0;
  if (homeTotal > 0 || awayTotal > 0) {
    mapped.shotsTotal = { home: homeTotal, away: awayTotal };
  }

  // Shots on Goal
  const homeOnGoal = getStat(homeStats, "Shots on Goal") || 0;
  const awayOnGoal = getStat(awayStats, "Shots on Goal") || 0;
  if (homeOnGoal > 0 || awayOnGoal > 0) {
    mapped.shotsOnGoal = { home: homeOnGoal, away: awayOnGoal };
  }

  // Key Passes - try real field first, fallback to passes/50 proxy
  let homeKeyPasses = getStat(homeStats, "Key Passes");
  let awayKeyPasses = getStat(awayStats, "Key Passes");
  if (homeKeyPasses === null || awayKeyPasses === null) {
    const homeAccuratePasses = getStat(homeStats, "Passes accurate") || 0;
    const awayAccuratePasses = getStat(awayStats, "Passes accurate") || 0;
    homeKeyPasses = Math.floor(homeAccuratePasses / 50);
    awayKeyPasses = Math.floor(awayAccuratePasses / 50);
  }
  if ((homeKeyPasses !== null && homeKeyPasses > 0) || (awayKeyPasses !== null && awayKeyPasses > 0)) {
    mapped.keyPasses = { home: homeKeyPasses || 0, away: awayKeyPasses || 0 };
  }

  // Goalkeeper Saves
  const homeSaves = getStat(homeStats, "Goalkeeper Saves") || 0;
  const awaySaves = getStat(awayStats, "Goalkeeper Saves") || 0;
  if (homeSaves > 0 || awaySaves > 0) {
    mapped.saves = { home: homeSaves, away: awaySaves };
  }

  // Pass Accuracy
  const homeAccuracy = getStat(homeStats, "Passes %");
  const awayAccuracy = getStat(awayStats, "Passes %");
  if (homeAccuracy !== null && awayAccuracy !== null) {
    mapped.passAccuracy = { home: homeAccuracy, away: awayAccuracy };
  }

  return mapped;
}
