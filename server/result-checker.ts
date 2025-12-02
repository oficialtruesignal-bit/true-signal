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
          const tipOdd = parseFloat(String(tip.totalOdd || tip.odd || 1));
          const stake = parseFloat(String(tip.stake || '1'));
          const profit = result === 'green' 
            ? (tipOdd - 1) * stake
            : -stake;
          
          // Update tip status
          await db.update(tips)
            .set({
              status: result,
              settledAt: new Date(),
              resultProfit: String(profit.toFixed(2)),
              updatedAt: new Date()
            })
            .where(eq(tips.id, tip.id));
          
          console.log(`[Result Checker] Updated tip ${tip.id}: ${result} (profit: ${profit.toFixed(2)}u)`);
          
          // Sync user bets with canonical result
          await this.syncUserBetsWithResult(tip.id, result, tipOdd);
          
          updated++;
        }
      } catch (error) {
        console.error(`[Result Checker] Error checking tip ${tip.id}:`, error);
      }
      
      // Rate limiting: 500ms between API calls
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`[Result Checker] Finished: ${checked} checked, ${updated} updated`);
    return { checked, updated };
  }

  /**
   * Sync all user bets for a tip with the canonical result
   */
  private async syncUserBetsWithResult(tipId: string, result: 'green' | 'red', tipOdd: number): Promise<void> {
    try {
      // Get all user bets for this tip
      const bets = await db.select()
        .from(userBets)
        .where(eq(userBets.tipId, tipId));
      
      if (bets.length === 0) return;
      
      console.log(`[Result Checker] Syncing ${bets.length} user bets for tip ${tipId}`);
      
      for (const bet of bets) {
        const stakeUsed = parseFloat(bet.stakeUsed || '1');
        const oddAtEntry = parseFloat(bet.oddAtEntry || String(tipOdd));
        const profit = result === 'green' 
          ? (oddAtEntry - 1) * stakeUsed
          : -stakeUsed;
        
        await db.update(userBets)
          .set({
            result,
            resultMarkedAt: new Date(),
            profit: String(profit.toFixed(2))
          })
          .where(eq(userBets.id, bet.id));
      }
      
      console.log(`[Result Checker] Synced ${bets.length} user bets to ${result}`);
    } catch (error) {
      console.error(`[Result Checker] Error syncing user bets for tip ${tipId}:`, error);
    }
  }

  private async checkTipResult(tip: any): Promise<'green' | 'red' | null> {
    if (!tip.fixtureId) return null;

    try {
      // Fetch fixture data with statistics
      const [fixtureResponse, statsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/fixtures`, {
          params: { id: tip.fixtureId },
          headers: { 'x-apisports-key': FOOTBALL_API_KEY }
        }),
        axios.get(`${API_BASE_URL}/fixtures/statistics`, {
          params: { fixture: tip.fixtureId },
          headers: { 'x-apisports-key': FOOTBALL_API_KEY }
        })
      ]);

      const fixture = fixtureResponse.data.response?.[0] as FixtureResult | undefined;
      if (!fixture) return null;

      const status = fixture.fixture.status.short;
      
      // Only settle finished matches
      if (!['FT', 'AET', 'PEN'].includes(status)) {
        return null;
      }

      // Extract match data including statistics
      const statistics = statsResponse.data.response || [];
      const matchData = extractMatchData(fixture, statistics);
      
      // Check if it's a combo/multi-leg bet
      if (tip.isCombo && tip.legs) {
        return this.resolveComboTip(tip, tip.fixtureId);
      }
      
      // Single bet - use market resolver
      const resolution = resolveMarket(tip.market, matchData, tip.homeTeam, tip.awayTeam);
      
      if (resolution) {
        console.log(`[Result Checker] Market "${tip.market}" resolved: ${resolution.result} (actual: ${resolution.actualValue ?? 'N/A'})`);
        return resolution.result;
      }
      
      console.log(`[Result Checker] Could not resolve market: ${tip.market}`);
      return null;

    } catch (error) {
      console.error(`[Result Checker] API error for fixture ${tip.fixtureId}:`, error);
      return null;
    }
  }

  /**
   * Resolve a combo/multi-leg bet
   * ALL legs must win for the combo to win
   * Each leg fetches its own fixture data to ensure correct resolution
   */
  private async resolveComboTip(tip: any, primaryFixtureId: string): Promise<'green' | 'red' | null> {
    try {
      let legs: any[];
      try {
        legs = typeof tip.legs === 'string' ? JSON.parse(tip.legs) : tip.legs;
      } catch {
        return null;
      }
      
      if (!Array.isArray(legs) || legs.length === 0) return null;
      
      console.log(`[Result Checker] Resolving combo with ${legs.length} legs`);
      
      // Build a map of fixtureId -> matchData for all unique fixtures
      const fixtureIds = new Set<string>();
      for (const leg of legs) {
        if (leg.fixtureId) {
          fixtureIds.add(String(leg.fixtureId));
        }
      }
      // Add primary fixture if exists
      if (primaryFixtureId) {
        fixtureIds.add(String(primaryFixtureId));
      }
      
      // Fetch all fixture data in parallel
      const matchDataMap = new Map<string, MatchData>();
      const fetchPromises = Array.from(fixtureIds).map(async (fixtureId) => {
        const data = await this.fetchFixtureMatchData(fixtureId);
        if (data) {
          matchDataMap.set(fixtureId, data.matchData);
          return { fixtureId, finished: data.finished };
        }
        return { fixtureId, finished: false };
      });
      
      const results = await Promise.all(fetchPromises);
      
      // Check if all fixtures are finished
      const allFinished = results.every(r => r.finished);
      if (!allFinished) {
        console.log('[Result Checker] Some fixtures in combo not finished yet');
        return null;
      }
      
      // Now resolve each leg using its specific fixture data
      for (const leg of legs) {
        // Each leg MUST have its own fixtureId - do not fallback to primary
        if (!leg.fixtureId) {
          console.log(`[Result Checker] Leg missing fixtureId: ${leg.homeTeam} vs ${leg.awayTeam} - cannot settle`);
          return null; // Cannot settle combo with missing fixture binding
        }
        
        const legFixtureId = String(leg.fixtureId);
        const matchData = matchDataMap.get(legFixtureId);
        
        if (!matchData) {
          console.log(`[Result Checker] No match data for leg fixture ${legFixtureId}`);
          return null;
        }
        
        const resolution = resolveMarket(leg.market, matchData, leg.homeTeam, leg.awayTeam);
        
        if (!resolution) {
          console.log(`[Result Checker] Could not resolve leg market: ${leg.market}`);
          return null;
        }
        
        if (resolution.result === 'red') {
          console.log(`[Result Checker] Leg lost: ${leg.homeTeam} vs ${leg.awayTeam} - ${leg.market}`);
          return 'red'; // One loss = entire combo loses
        }
        
        console.log(`[Result Checker] Leg won: ${leg.homeTeam} vs ${leg.awayTeam} - ${leg.market}`);
      }
      
      console.log('[Result Checker] All legs won - combo GREEN!');
      return 'green';
      
    } catch (error) {
      console.error('[Result Checker] Error resolving combo:', error);
      return null;
    }
  }
  
  /**
   * Fetch match data for a specific fixture
   */
  private async fetchFixtureMatchData(fixtureId: string): Promise<{ matchData: MatchData; finished: boolean } | null> {
    try {
      const [fixtureResponse, statsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/fixtures`, {
          params: { id: fixtureId },
          headers: { 'x-apisports-key': FOOTBALL_API_KEY }
        }),
        axios.get(`${API_BASE_URL}/fixtures/statistics`, {
          params: { fixture: fixtureId },
          headers: { 'x-apisports-key': FOOTBALL_API_KEY }
        })
      ]);

      const fixture = fixtureResponse.data.response?.[0];
      if (!fixture) return null;

      const status = fixture.fixture.status.short;
      const finished = ['FT', 'AET', 'PEN'].includes(status);
      
      const statistics = statsResponse.data.response || [];
      const matchData = extractMatchData(fixture, statistics);
      
      return { matchData, finished };
      
    } catch (error) {
      console.error(`[Result Checker] Error fetching fixture ${fixtureId}:`, error);
      return null;
    }
  }

  /**
   * Check result for a single leg in a combo
   */
  private async checkLegResult(leg: any): Promise<'green' | 'red' | null> {
    if (!leg.fixtureId) return null;
    
    try {
      const [fixtureResponse, statsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/fixtures`, {
          params: { id: leg.fixtureId },
          headers: { 'x-apisports-key': FOOTBALL_API_KEY }
        }),
        axios.get(`${API_BASE_URL}/fixtures/statistics`, {
          params: { fixture: leg.fixtureId },
          headers: { 'x-apisports-key': FOOTBALL_API_KEY }
        })
      ]);

      const fixture = fixtureResponse.data.response?.[0];
      if (!fixture) return null;

      const status = fixture.fixture.status.short;
      if (!['FT', 'AET', 'PEN'].includes(status)) {
        return null;
      }

      const statistics = statsResponse.data.response || [];
      const matchData = extractMatchData(fixture, statistics);
      
      const resolution = resolveMarket(leg.market, matchData, leg.homeTeam, leg.awayTeam);
      return resolution?.result ?? null;
      
    } catch (error) {
      console.error(`[Result Checker] Error checking leg fixture ${leg.fixtureId}:`, error);
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

    // Run immediately on start
    this.checkPendingTips();

    // Then run at interval
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
