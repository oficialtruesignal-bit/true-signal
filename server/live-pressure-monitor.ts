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

const PRESSURE_WEIGHTS = {
  shotsOnTarget: 3.0,
  dangerousAttacks: 2.5,
  corners: 1.5,
  possession: 0.8,
  attacks: 0.5,
  shotsTotal: 1.0,
};

const MAJOR_LEAGUES = [
  39,   // Premier League
  140,  // La Liga
  135,  // Serie A
  78,   // Bundesliga
  61,   // Ligue 1
  71,   // Brasileirão Série A
  2,    // Champions League
  3,    // Europa League
  848,  // Conference League
  94,   // Primeira Liga (Portugal)
  88,   // Eredivisie
  144,  // Jupiler Pro League
];

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

      console.log(`[LIVE MONITOR] Processing ${liveFixtures.length} live fixtures...`);

      const priorityFixtures = liveFixtures.filter(f => 
        MAJOR_LEAGUES.includes(f.league.id)
      );

      const fixturesToProcess = priorityFixtures.length > 0 
        ? priorityFixtures.slice(0, 20) 
        : liveFixtures.slice(0, 10);

      for (const fixture of fixturesToProcess) {
        await this.processFixture(fixture);
        await this.delay(200);
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

  private calculatePressure(stats: LiveStatistics, matchMinute: number): PressureCalculation {
    const normalizedMinute = Math.max(1, matchMinute);
    const timeMultiplier = matchMinute > 75 ? 1.3 : matchMinute > 60 ? 1.15 : 1;
    
    const shotsPerMinute = stats.shotsOnTarget / normalizedMinute * 90;
    const cornersPerMinute = stats.corners / normalizedMinute * 90;
    const attacksPerMinute = stats.dangerousAttacks / normalizedMinute * 90;
    
    let rawPressure = 
      (shotsPerMinute * PRESSURE_WEIGHTS.shotsOnTarget) +
      (attacksPerMinute * PRESSURE_WEIGHTS.dangerousAttacks) +
      (cornersPerMinute * PRESSURE_WEIGHTS.corners) +
      ((stats.possession - 50) * PRESSURE_WEIGHTS.possession) +
      (stats.shotsTotal / normalizedMinute * 90 * PRESSURE_WEIGHTS.shotsTotal);

    rawPressure *= timeMultiplier;
    
    const maxRawPressure = 50;
    const pressureIndex = Math.min(100, Math.max(0, (rawPressure / maxRawPressure) * 100));
    
    const baseGoalProb = 0.025;
    const pressureMultiplier = 1 + (pressureIndex / 100) * 2;
    const minuteGoalProb = baseGoalProb * pressureMultiplier;
    const goalProbability5Min = (1 - Math.pow(1 - minuteGoalProb, 5)) * 100;
    
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

    const homePressure = this.calculatePressure(homeStats, matchMinute);
    const awayPressure = this.calculatePressure(awayStats, matchMinute);

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
    const settings = this.defaultSettings;
    const fixtureId = fixture.fixture.id.toString();

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

    const shouldAlertHome = 
      homePressure.pressureIndex >= settings.pressureAlertThreshold ||
      homePressure.pressureDelta >= settings.pressureSurgeThreshold ||
      homePressure.goalProbability >= settings.goalProbabilityAlertThreshold;

    const shouldAlertAway = 
      awayPressure.pressureIndex >= settings.pressureAlertThreshold ||
      awayPressure.pressureDelta >= settings.pressureSurgeThreshold ||
      awayPressure.goalProbability >= settings.goalProbabilityAlertThreshold;

    if (shouldAlertHome) {
      await this.createAlert(snapshot, fixture, 'home', homePressure);
    }

    if (shouldAlertAway) {
      await this.createAlert(snapshot, fixture, 'away', awayPressure);
    }
  }

  private async createAlert(
    snapshot: any,
    fixture: LiveFixture,
    side: 'home' | 'away',
    pressure: PressureCalculation
  ) {
    const teamName = side === 'home' ? fixture.teams.home.name : fixture.teams.away.name;
    const matchMinute = fixture.fixture.status.elapsed || 0;
    const score = `${fixture.goals.home || 0}-${fixture.goals.away || 0}`;

    let alertType: 'home_pressure' | 'away_pressure' | 'imminent_goal' | 'pressure_surge' = 
      side === 'home' ? 'home_pressure' : 'away_pressure';
    
    if (pressure.goalProbability >= 75) {
      alertType = 'imminent_goal';
    } else if (pressure.pressureDelta >= 25) {
      alertType = 'pressure_surge';
    }

    const alertTitle = `🔥 ${teamName} pressionando!`;
    const alertMessage = `${fixture.teams.home.name} ${score} ${fixture.teams.away.name} (${matchMinute}')\n` +
      `Pressão: ${pressure.pressureIndex.toFixed(0)}% | Prob. Gol: ${pressure.goalProbability.toFixed(0)}%`;

    const alert: InsertLiveAlert = {
      fixtureId: fixture.fixture.id.toString(),
      snapshotId: snapshot.id,
      alertType,
      teamSide: side,
      pressureIndex: pressure.pressureIndex.toString(),
      goalProbability: pressure.goalProbability.toString(),
      alertTitle,
      alertMessage,
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

    return insertedAlert;
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
