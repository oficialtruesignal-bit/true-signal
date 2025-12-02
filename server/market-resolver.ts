/**
 * Market Resolver - Resolves betting markets against real match data
 * Supports: Goals (FT/HT/2H), BTTS, 1X2, Double Chance, Corners, Cards, Shots
 */

export interface MatchData {
  homeGoals: number;
  awayGoals: number;
  homeGoalsHT: number;
  awayGoalsHT: number;
  homeCorners: number;
  awayCorners: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeRedCards: number;
  awayRedCards: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homeShotsTotal: number;
  awayShotsTotal: number;
}

export interface MarketResolution {
  result: 'green' | 'red';
  actualValue?: number;
  line?: number;
  marketType: string;
}

export function resolveMarket(market: string, matchData: MatchData, homeTeam?: string, awayTeam?: string): MarketResolution | null {
  const marketLower = market.toLowerCase();
  
  // Calculate totals
  const totalGoals = matchData.homeGoals + matchData.awayGoals;
  const totalGoalsHT = matchData.homeGoalsHT + matchData.awayGoalsHT;
  const goals2H = totalGoals - totalGoalsHT;
  const totalCorners = matchData.homeCorners + matchData.awayCorners;
  const totalYellowCards = matchData.homeYellowCards + matchData.awayYellowCards;
  const totalRedCards = matchData.homeRedCards + matchData.awayRedCards;
  const totalCards = totalYellowCards + totalRedCards;
  const totalShotsOnTarget = matchData.homeShotsOnTarget + matchData.awayShotsOnTarget;
  const totalShots = matchData.homeShotsTotal + matchData.awayShotsTotal;
  
  // Detect market period
  const is2HMarket = /2[ºª]?\s*tempo|second\s*half|2nd\s*half|2h(t)?|\bh2\b/i.test(market);
  const isHTMarket = !is2HMarket && /1[ºª]?\s*tempo|first\s*half|1st\s*half|1h(t)?|\bh1\b|half\s*time|\bht\b/i.test(market);
  const isFTMarket = !isHTMarket && !is2HMarket;
  
  // Detect market category
  const isCornerMarket = /corner|escanteio/i.test(market);
  const isCardMarket = /cart[ãa]o|card/i.test(market);
  const isShotMarket = /chute|shot|finaliza[çc]/i.test(market);
  const isGoalMarket = !isCornerMarket && !isCardMarket && !isShotMarket;
  
  // Extract line from market (e.g., "Over 2.5" -> 2.5)
  const lineMatch = market.match(/(\d+\.?\d*)/);
  const line = lineMatch ? parseFloat(lineMatch[1]) : null;
  
  // ===== GOALS MARKETS =====
  if (isGoalMarket) {
    const relevantGoals = is2HMarket ? goals2H : isHTMarket ? totalGoalsHT : totalGoals;
    
    // Over/Under Goals
    if (/over|mais\s*de|acima/i.test(market) && line !== null) {
      const won = relevantGoals > line;
      return { 
        result: won ? 'green' : 'red', 
        actualValue: relevantGoals, 
        line, 
        marketType: `goals_over_${line}` 
      };
    }
    if (/under|menos\s*de|abaixo/i.test(market) && line !== null) {
      const won = relevantGoals < line;
      return { 
        result: won ? 'green' : 'red', 
        actualValue: relevantGoals, 
        line, 
        marketType: `goals_under_${line}` 
      };
    }
    
    // BTTS (Both Teams To Score)
    if (/btts|ambas?\s*marcam|ambos?\s*marcam|both\s*teams?\s*(to\s*)?score/i.test(market)) {
      const bttsYes = matchData.homeGoals > 0 && matchData.awayGoals > 0;
      const isBttsNo = /n[ãa]o|no/i.test(market);
      const won = isBttsNo ? !bttsYes : bttsYes;
      return { 
        result: won ? 'green' : 'red', 
        marketType: isBttsNo ? 'btts_no' : 'btts_yes' 
      };
    }
    
    // Match Result (1X2)
    if (/1x2|resultado\s*(final)?|match\s*result|winner|vit[óo]ria|vencer|win/i.test(market) ||
        /^[12x]$/i.test(market.trim()) || /[-:]\s*[12x]\s*$/i.test(market)) {
      
      // Home win (1)
      if (/home|casa|[-:]\s*1\s*$|\(1\)|:\s*1\b/i.test(market) || 
          (homeTeam && marketLower.includes(homeTeam.toLowerCase()))) {
        const won = matchData.homeGoals > matchData.awayGoals;
        return { result: won ? 'green' : 'red', marketType: '1x2_home' };
      }
      
      // Away win (2)
      if (/away|fora|[-:]\s*2\s*$|\(2\)|:\s*2\b/i.test(market) ||
          (awayTeam && marketLower.includes(awayTeam.toLowerCase()))) {
        const won = matchData.awayGoals > matchData.homeGoals;
        return { result: won ? 'green' : 'red', marketType: '1x2_away' };
      }
      
      // Draw (X)
      if (/draw|empate|[-:]\s*x\s*$/i.test(market)) {
        const won = matchData.homeGoals === matchData.awayGoals;
        return { result: won ? 'green' : 'red', marketType: '1x2_draw' };
      }
    }
    
    // Double Chance
    if (/dupla\s*chance|double\s*chance/i.test(market)) {
      if (/1x|home\s*or\s*draw|casa\s*ou\s*empate/i.test(market)) {
        const won = matchData.homeGoals >= matchData.awayGoals;
        return { result: won ? 'green' : 'red', marketType: 'dc_1x' };
      }
      if (/x2|draw\s*or\s*away|empate\s*ou\s*fora/i.test(market)) {
        const won = matchData.awayGoals >= matchData.homeGoals;
        return { result: won ? 'green' : 'red', marketType: 'dc_x2' };
      }
      if (/12|home\s*or\s*away/i.test(market)) {
        const won = matchData.homeGoals !== matchData.awayGoals;
        return { result: won ? 'green' : 'red', marketType: 'dc_12' };
      }
    }
    
    // Draw standalone
    if (/^empate$|^draw$/i.test(market.trim())) {
      const won = matchData.homeGoals === matchData.awayGoals;
      return { result: won ? 'green' : 'red', marketType: '1x2_draw' };
    }
  }
  
  // ===== CORNERS MARKETS =====
  if (isCornerMarket && line !== null) {
    if (/over|mais\s*de|acima/i.test(market)) {
      const won = totalCorners > line;
      return { 
        result: won ? 'green' : 'red', 
        actualValue: totalCorners, 
        line, 
        marketType: `corners_over_${line}` 
      };
    }
    if (/under|menos\s*de|abaixo/i.test(market)) {
      const won = totalCorners < line;
      return { 
        result: won ? 'green' : 'red', 
        actualValue: totalCorners, 
        line, 
        marketType: `corners_under_${line}` 
      };
    }
  }
  
  // ===== CARDS MARKETS =====
  if (isCardMarket && line !== null) {
    if (/over|mais\s*de|acima/i.test(market)) {
      const won = totalCards > line;
      return { 
        result: won ? 'green' : 'red', 
        actualValue: totalCards, 
        line, 
        marketType: `cards_over_${line}` 
      };
    }
    if (/under|menos\s*de|abaixo/i.test(market)) {
      const won = totalCards < line;
      return { 
        result: won ? 'green' : 'red', 
        actualValue: totalCards, 
        line, 
        marketType: `cards_under_${line}` 
      };
    }
    
    // Both teams receive card
    if (/ambas?\s*receberem?\s*cart[ãa]o|both\s*teams?\s*receive/i.test(market)) {
      const bothReceived = (matchData.homeYellowCards + matchData.homeRedCards) > 0 && 
                           (matchData.awayYellowCards + matchData.awayRedCards) > 0;
      const isNo = /n[ãa]o|no/i.test(market);
      const won = isNo ? !bothReceived : bothReceived;
      return { result: won ? 'green' : 'red', marketType: isNo ? 'cards_both_no' : 'cards_both_yes' };
    }
  }
  
  // ===== SHOTS MARKETS =====
  if (isShotMarket && line !== null) {
    const relevantShots = /alvo|target/i.test(market) ? totalShotsOnTarget : totalShots;
    
    if (/over|mais\s*de|acima/i.test(market)) {
      const won = relevantShots > line;
      return { 
        result: won ? 'green' : 'red', 
        actualValue: relevantShots, 
        line, 
        marketType: `shots_over_${line}` 
      };
    }
    if (/under|menos\s*de|abaixo/i.test(market)) {
      const won = relevantShots < line;
      return { 
        result: won ? 'green' : 'red', 
        actualValue: relevantShots, 
        line, 
        marketType: `shots_under_${line}` 
      };
    }
  }
  
  // Unknown market - return null for manual review
  console.log(`[Market Resolver] Unknown market format: "${market}"`);
  return null;
}

/**
 * Resolve a combo/multiple bet - ALL legs must win
 */
export function resolveCombo(legs: Array<{ market: string; homeTeam?: string; awayTeam?: string }>, matchDataMap: Map<string, MatchData>): 'green' | 'red' | null {
  let allWon = true;
  let hasUnresolved = false;
  
  for (const leg of legs) {
    const fixtureKey = `${leg.homeTeam}_${leg.awayTeam}`;
    const matchData = matchDataMap.get(fixtureKey);
    
    if (!matchData) {
      hasUnresolved = true;
      continue;
    }
    
    const resolution = resolveMarket(leg.market, matchData, leg.homeTeam, leg.awayTeam);
    
    if (!resolution) {
      hasUnresolved = true;
      continue;
    }
    
    if (resolution.result === 'red') {
      return 'red'; // One loss = entire combo loses
    }
  }
  
  if (hasUnresolved) {
    return null; // Can't determine yet
  }
  
  return allWon ? 'green' : 'red';
}

/**
 * Extract match statistics from API-Football response
 */
export function extractMatchData(fixture: any, statistics: any[]): MatchData {
  const homeStats = statistics?.[0]?.statistics || [];
  const awayStats = statistics?.[1]?.statistics || [];
  
  const getStat = (stats: any[], type: string): number => {
    const stat = stats.find((s: any) => s.type.toLowerCase().includes(type.toLowerCase()));
    if (!stat || stat.value === null) return 0;
    return typeof stat.value === 'string' ? parseInt(stat.value) || 0 : stat.value;
  };
  
  return {
    homeGoals: fixture.goals?.home ?? 0,
    awayGoals: fixture.goals?.away ?? 0,
    homeGoalsHT: fixture.score?.halftime?.home ?? 0,
    awayGoalsHT: fixture.score?.halftime?.away ?? 0,
    homeCorners: getStat(homeStats, 'corner'),
    awayCorners: getStat(awayStats, 'corner'),
    homeYellowCards: getStat(homeStats, 'yellow'),
    awayYellowCards: getStat(awayStats, 'yellow'),
    homeRedCards: getStat(homeStats, 'red'),
    awayRedCards: getStat(awayStats, 'red'),
    homeShotsOnTarget: getStat(homeStats, 'shots on goal'),
    awayShotsOnTarget: getStat(awayStats, 'shots on goal'),
    homeShotsTotal: getStat(homeStats, 'total shots'),
    awayShotsTotal: getStat(awayStats, 'total shots')
  };
}
