import axios from 'axios';
import { db } from './db';
import { tips, userBets } from '@shared/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { resolveMarket, extractMatchData, MatchData } from './market-resolver';

const API_BASE_URL = 'https://v3.football.api-sports.io';
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;

interface FixtureResult {
  fixture: {
    id: number;
    status: { short: string; long: string };
  };
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
  };
  statistics?: Array<{
    team: { id: number; name: string };
    statistics: Array<{ type: string; value: number | string | null }>;
  }>;
}

export class ResultChecker {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  async checkPendingTips(): Promise<{ checked: number; updated: number }> {
    if (!FOOTBALL_API_KEY) {
      console.warn('[Result Checker] API key not configured');
      return { checked: 0, updated: 0 };
    }

    console.log('[Result Checker] Starting check for pending tips...');
    
    const now = new Date();
    
    const pendingTips = await db.select()
      .from(tips)
      .where(
        and(
          eq(tips.status, 'pending'),
          isNotNull(tips.fixtureId)
        )
      );

    console.log(`[Result Checker] Found ${pendingTips.length} pending tips with fixtureId`);

    let checked = 0;
    let updated = 0;

    for (const tip of pendingTips) {
      try {
        const result = await this.checkTipResult(tip);
        checked++;
        
        if (result !== null) {
          const profit = result === 'green' 
            ? (parseFloat(String(tip.odd)) - 1) * parseFloat(String(tip.stake || '1'))
            : -parseFloat(String(tip.stake || '1'));
          
          await db.update(tips)
            .set({
              status: result,
              settledAt: new Date(),
              resultProfit: String(profit.toFixed(2)),
              updatedAt: new Date()
            })
            .where(eq(tips.id, tip.id));
          
          console.log(`[Result Checker] Updated tip ${tip.id}: ${result} (profit: ${profit.toFixed(2)}u)`);
          updated++;
        }
      } catch (error) {
        console.error(`[Result Checker] Error checking tip ${tip.id}:`, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`[Result Checker] Finished: ${checked} checked, ${updated} updated`);
    return { checked, updated };
  }

  private async checkTipResult(tip: any): Promise<'green' | 'red' | null> {
    if (!tip.fixtureId) return null;

    try {
      const response = await axios.get(`${API_BASE_URL}/fixtures`, {
        params: { id: tip.fixtureId },
        headers: { 'x-apisports-key': FOOTBALL_API_KEY }
      });

      const fixture = response.data.response?.[0] as FixtureResult | undefined;
      if (!fixture) return null;

      const status = fixture.fixture.status.short;
      if (!['FT', 'AET', 'PEN'].includes(status)) {
        return null;
      }

      const homeGoals = fixture.goals.home ?? 0;
      const awayGoals = fixture.goals.away ?? 0;
      const totalGoals = homeGoals + awayGoals;
      const homeHT = fixture.score.halftime.home ?? 0;
      const awayHT = fixture.score.halftime.away ?? 0;
      const totalGoalsHT = homeHT + awayHT;

      const market = tip.market.toLowerCase();

      const isGoalMarket = market.includes('gol') || market.includes('goal') || 
                           market.includes('ft') || market.includes('full time') ||
                           (!market.includes('corner') && !market.includes('card') && 
                            !market.includes('escanteio') && !market.includes('cartão') &&
                            !market.includes('shot') && !market.includes('chute'));
      
      const is2HTMarket = market.includes('2º tempo') || market.includes('segundo tempo') ||
                          market.includes('second half') || market.includes('2nd half') ||
                          /\b2h(t)?\b/.test(market) || market.includes('h2') ||
                          (market.includes('2') && market.includes('half'));
      
      const isHTMarket = !is2HTMarket && (
                         /\bh(t|alf\s*time)\b/.test(market) || 
                         /\b1h(t)?\b/.test(market) ||
                         market.includes('1º tempo') || 
                         market.includes('primeiro tempo') || 
                         market.includes('first half') ||
                         market.includes('1st half') || 
                         market.includes('h1') ||
                         (market.includes('1') && market.includes('half')));
      
      const goalsSecondHalf = totalGoals - totalGoalsHT;

      const isFTMarket = !isHTMarket && !is2HTMarket;

      if (market.includes('over 0.5') && isGoalMarket && isFTMarket) {
        return totalGoals > 0 ? 'green' : 'red';
      }
      if (market.includes('over 1.5') && isGoalMarket && isFTMarket) {
        return totalGoals > 1 ? 'green' : 'red';
      }
      if (market.includes('over 2.5') && isGoalMarket && isFTMarket) {
        return totalGoals > 2 ? 'green' : 'red';
      }
      if (market.includes('over 3.5') && isGoalMarket && isFTMarket) {
        return totalGoals > 3 ? 'green' : 'red';
      }
      if (market.includes('over 4.5') && isGoalMarket && isFTMarket) {
        return totalGoals > 4 ? 'green' : 'red';
      }

      if (market.includes('under 0.5') && isGoalMarket && isFTMarket) {
        return totalGoals < 1 ? 'green' : 'red';
      }
      if (market.includes('under 1.5') && isGoalMarket && isFTMarket) {
        return totalGoals < 2 ? 'green' : 'red';
      }
      if (market.includes('under 2.5') && isGoalMarket && isFTMarket) {
        return totalGoals < 3 ? 'green' : 'red';
      }
      if (market.includes('under 3.5') && isGoalMarket && isFTMarket) {
        return totalGoals < 4 ? 'green' : 'red';
      }

      if (isHTMarket && isGoalMarket) {
        if (market.includes('over 0.5')) {
          return totalGoalsHT > 0 ? 'green' : 'red';
        }
        if (market.includes('over 1.5')) {
          return totalGoalsHT > 1 ? 'green' : 'red';
        }
        if (market.includes('over 2.5')) {
          return totalGoalsHT > 2 ? 'green' : 'red';
        }
        if (market.includes('under 0.5')) {
          return totalGoalsHT < 1 ? 'green' : 'red';
        }
        if (market.includes('under 1.5')) {
          return totalGoalsHT < 2 ? 'green' : 'red';
        }
        if (market.includes('under 2.5')) {
          return totalGoalsHT < 3 ? 'green' : 'red';
        }
      }

      if (is2HTMarket && isGoalMarket) {
        if (market.includes('over 0.5')) {
          return goalsSecondHalf > 0 ? 'green' : 'red';
        }
        if (market.includes('over 1.5')) {
          return goalsSecondHalf > 1 ? 'green' : 'red';
        }
        if (market.includes('over 2.5')) {
          return goalsSecondHalf > 2 ? 'green' : 'red';
        }
        if (market.includes('under 0.5')) {
          return goalsSecondHalf < 1 ? 'green' : 'red';
        }
        if (market.includes('under 1.5')) {
          return goalsSecondHalf < 2 ? 'green' : 'red';
        }
        if (market.includes('under 2.5')) {
          return goalsSecondHalf < 3 ? 'green' : 'red';
        }
      }

      if (market.includes('btts') || market.includes('ambas marcam') || market.includes('ambos marcam') || market.includes('both teams')) {
        const bttsYes = homeGoals > 0 && awayGoals > 0;
        if (market.includes('não') || market.includes('no')) {
          return !bttsYes ? 'green' : 'red';
        }
        return bttsYes ? 'green' : 'red';
      }

      if (market.includes('vitória') || market.includes('vitoria') || market.includes('vencer') || 
          market.includes('win') || market.includes('home') || market.includes('away')) {
        if (market.includes('casa') || market.includes('home') || market.includes(tip.homeTeam?.toLowerCase() || '')) {
          return homeGoals > awayGoals ? 'green' : 'red';
        }
        if (market.includes('fora') || market.includes('away') || market.includes(tip.awayTeam?.toLowerCase() || '')) {
          return awayGoals > homeGoals ? 'green' : 'red';
        }
      }

      if (market.includes('1x2') || market.includes('resultado') || market.includes('match result') || market.includes('winner')) {
        const selection1Patterns = ['- 1', '(1)', ': 1', 'home win', 'vitória casa', '1 @'];
        const selectionXPatterns = ['- x', '(x)', ': x', '- draw', 'draw', 'empate'];
        const selection2Patterns = ['- 2', '(2)', ': 2', 'away win', 'vitória fora', '2 @'];
        
        if (selection1Patterns.some(p => market.includes(p)) || market.endsWith(' 1')) {
          return homeGoals > awayGoals ? 'green' : 'red';
        }
        if (selectionXPatterns.some(p => market.includes(p)) || market.endsWith(' x')) {
          return homeGoals === awayGoals ? 'green' : 'red';
        }
        if (selection2Patterns.some(p => market.includes(p)) || market.endsWith(' 2')) {
          return awayGoals > homeGoals ? 'green' : 'red';
        }
      }

      if (market.includes('empate') || market.includes('draw')) {
        return homeGoals === awayGoals ? 'green' : 'red';
      }

      if (market.includes('dupla chance') || market.includes('double chance')) {
        if (market.includes('1x') || market.includes('casa ou empate') || market.includes('home or draw')) {
          return homeGoals >= awayGoals ? 'green' : 'red';
        }
        if (market.includes('x2') || market.includes('empate ou fora') || market.includes('draw or away')) {
          return awayGoals >= homeGoals ? 'green' : 'red';
        }
        if (market.includes('12') || market.includes('home or away')) {
          return homeGoals !== awayGoals ? 'green' : 'red';
        }
      }

      console.log(`[Result Checker] Unknown market format: ${tip.market}`);
      return null;

    } catch (error) {
      console.error(`[Result Checker] API error for fixture ${tip.fixtureId}:`, error);
      return null;
    }
  }

  start(intervalMinutes: number = 10): void {
    if (this.isRunning) {
      console.log('[Result Checker] Already running');
      return;
    }

    this.isRunning = true;
    console.log(`[Result Checker] Starting with ${intervalMinutes} minute interval`);

    this.checkPendingTips();

    this.intervalId = setInterval(() => {
      this.checkPendingTips();
    }, intervalMinutes * 60 * 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('[Result Checker] Stopped');
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

export const resultChecker = new ResultChecker();
