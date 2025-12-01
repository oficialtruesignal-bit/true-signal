export interface ComboLeg {
  homeTeam: string;
  awayTeam: string;
  league: string;
  market: string;
  outcome: string;
  odd: number;
  time?: string;
  fixtureId?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
}

export interface ComboMetadata {
  fixtureId: null;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: null;
  awayTeamLogo: null;
  matchTime: string;
  market: string;
  odd: string;
  totalOdd: string;
  isCombo: true;
  legs: string;
}

const MIN_COMBO_LEGS = 2;
const MIN_TOTAL_ODD = 1.50;

export function validateComboLegs(legs: any[]): { valid: boolean; error?: string } {
  if (!legs || !Array.isArray(legs)) {
    return { valid: false, error: "Legs deve ser um array" };
  }
  
  if (legs.length < MIN_COMBO_LEGS) {
    return { valid: false, error: `Combo deve ter no mínimo ${MIN_COMBO_LEGS} seleções` };
  }
  
  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    if (!leg.homeTeam || !leg.awayTeam || !leg.market || !leg.odd) {
      return { valid: false, error: `Leg ${i + 1} tem campos obrigatórios faltando` };
    }
    if (typeof leg.odd !== 'number' || leg.odd <= 1) {
      return { valid: false, error: `Leg ${i + 1} tem odd inválida` };
    }
  }
  
  const totalOdd = legs.reduce((acc, leg) => acc * (leg.odd || 1), 1);
  if (totalOdd < MIN_TOTAL_ODD) {
    return { valid: false, error: `Odd total ${totalOdd.toFixed(2)} é menor que o mínimo ${MIN_TOTAL_ODD}` };
  }
  
  return { valid: true };
}

export function deriveComboMetadata(legs: ComboLeg[], formattedTime: string): ComboMetadata | null {
  const validation = validateComboLegs(legs);
  if (!validation.valid) {
    console.warn('[Combo Utils] Validation failed:', validation.error);
    return null;
  }
  
  const totalOdd = legs.reduce((acc, leg) => acc * (leg.odd || 1), 1);
  
  const uniqueLeagues = Array.from(new Set(legs.map(l => l.league).filter(Boolean))).slice(0, 3);
  const comboLeague = uniqueLeagues.length <= 2 
    ? uniqueLeagues.join(' • ') 
    : `${uniqueLeagues[0]} +${legs.length - 1}`;
  
  return {
    fixtureId: null,
    league: comboLeague || 'Múltipla',
    homeTeam: `Múltipla ${legs.length} Jogos`,
    awayTeam: `Odd Total: ${totalOdd.toFixed(2)}`,
    homeTeamLogo: null,
    awayTeamLogo: null,
    matchTime: formattedTime,
    market: `Combo ${legs.length} Seleções`,
    odd: String(totalOdd.toFixed(2)),
    totalOdd: String(totalOdd.toFixed(2)),
    isCombo: true,
    legs: JSON.stringify(legs),
  };
}

export function parseLegs(legsData: any): ComboLeg[] {
  if (!legsData) return [];
  if (Array.isArray(legsData)) return legsData;
  if (typeof legsData === 'string') {
    try {
      const parsed = JSON.parse(legsData);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function normalizeTipForResponse(tip: any): any {
  const parsedLegs = parseLegs(tip.legs);
  
  const isCombo = tip.isCombo ?? (parsedLegs.length > 1);
  const totalOdd = tip.totalOdd 
    ? parseFloat(String(tip.totalOdd)) 
    : (parsedLegs.length > 0 
        ? parsedLegs.reduce((acc, leg) => acc * (leg.odd || 1), 1) 
        : parseFloat(String(tip.odd)));
  
  return {
    ...tip,
    legs: parsedLegs,
    isCombo,
    totalOdd,
  };
}
