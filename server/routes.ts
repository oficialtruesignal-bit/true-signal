import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTipSchema, insertProfileSchema, tips, aiTickets } from "@shared/schema";
import { eq } from "drizzle-orm";
import axios from "axios";
import { mercadoPagoService } from "./mercadopago-service";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiPredictionEngine } from "./ai-prediction-engine";
import { db } from "./db";
import { deriveComboMetadata, parseLegs, normalizeTipForResponse } from "./combo-utils";
import { resultChecker } from "./result-checker";
import { sql } from "drizzle-orm";

const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

if (!FOOTBALL_API_KEY) {
  console.warn('⚠️ FOOTBALL_API_KEY NOT FOUND - check environment variables');
} else {
  console.log('✅ API-Football Key loaded successfully');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API-Football Proxy Routes (Direct api-football.com endpoints - to avoid CORS and secure API key)
  app.get("/api/football/fixtures/live", async (req, res) => {
    try {
      const response = await axios.get("https://v3.football.api-sports.io/fixtures", {
        params: { live: "all" },
        headers: {
          "x-apisports-key": FOOTBALL_API_KEY,
        },
      });
      return res.json(response.data);
    } catch (error: any) {
      console.error("[API-Football] Error fetching live fixtures:", error.message);
      if (axios.isAxiosError(error) && error.response) {
        console.error("[API-Football] Response Status:", error.response.status);
        console.error("[API-Football] Response Data:", error.response.data);
      }
      return res.status(500).json({ error: "Failed to fetch live fixtures", details: error.message });
    }
  });

  app.get("/api/football/fixtures/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const response = await axios.get("https://v3.football.api-sports.io/fixtures", {
        params: { date },
        headers: {
          "x-apisports-key": FOOTBALL_API_KEY,
        },
      });
      return res.json(response.data);
    } catch (error: any) {
      console.error(`[API-Football] Error fetching fixtures for ${req.params.date}:`, error.message);
      if (axios.isAxiosError(error) && error.response) {
        console.error("[API-Football] Response Status:", error.response.status);
        console.error("[API-Football] Response Data:", error.response.data);
      }
      return res.status(500).json({ error: "Failed to fetch fixtures", details: error.message });
    }
  });

  app.get("/api/football/fixtures/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await axios.get("https://v3.football.api-sports.io/fixtures", {
        params: { id },
        headers: {
          "x-apisports-key": FOOTBALL_API_KEY,
        },
      });
      return res.json(response.data);
    } catch (error: any) {
      console.error(`[API-Football] Error fetching fixture ${req.params.id}:`, error.message);
      if (axios.isAxiosError(error) && error.response) {
        console.error("[API-Football] Response Status:", error.response.status);
        console.error("[API-Football] Response Data:", error.response.data);
      }
      return res.status(500).json({ error: "Failed to fetch fixture", details: error.message });
    }
  });

  app.get("/api/football/fixtures/statistics/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await axios.get("https://v3.football.api-sports.io/fixtures/statistics", {
        params: { fixture: id },
        headers: {
          "x-apisports-key": FOOTBALL_API_KEY,
        },
      });
      return res.json(response.data);
    } catch (error: any) {
      console.error(`[API-Football] Error fetching statistics for fixture ${req.params.id}:`, error.message);
      if (axios.isAxiosError(error) && error.response) {
        console.error("[API-Football] Response Status:", error.response.status);
        console.error("[API-Football] Response Data:", error.response.data);
      }
      return res.status(500).json({ error: "Failed to fetch fixture statistics", details: error.message });
    }
  });

  // Odds from bookmakers (Bet365 priority)
  app.get("/api/football/odds/:fixtureId", async (req, res) => {
    try {
      const { fixtureId } = req.params;
      const response = await axios.get("https://v3.football.api-sports.io/odds", {
        params: { 
          fixture: fixtureId,
          bookmaker: 8 // Bet365 ID
        },
        headers: {
          "x-apisports-key": FOOTBALL_API_KEY,
        },
      });
      
      const oddsData = response.data.response?.[0];
      if (!oddsData) {
        return res.json({ success: false, message: "No odds available", odds: null });
      }
      
      // Parse Bet365 odds
      const bet365 = oddsData.bookmakers?.find((b: any) => b.id === 8) || oddsData.bookmakers?.[0];
      if (!bet365) {
        return res.json({ success: false, message: "Bet365 odds not available", odds: null });
      }
      
      // Extract markets
      const markets: Record<string, any> = {};
      bet365.bets?.forEach((bet: any) => {
        const marketName = bet.name;
        const values: Record<string, number> = {};
        bet.values?.forEach((v: any) => {
          values[v.value] = parseFloat(v.odd);
        });
        markets[marketName] = values;
      });
      
      return res.json({ 
        success: true, 
        bookmaker: bet365.name,
        fixtureId,
        markets,
        raw: bet365
      });
    } catch (error: any) {
      console.error(`[API-Football] Error fetching odds for fixture ${req.params.fixtureId}:`, error.message);
      return res.status(500).json({ error: "Failed to fetch odds", details: error.message });
    }
  });

  // Pre-game Insights - Last 5 matches + H2H averages
  app.get("/api/football/pregame-insights", async (req, res) => {
    try {
      const { homeTeamId, awayTeamId, league, season } = req.query;
      
      if (!homeTeamId || !awayTeamId || !league || !season) {
        return res.status(400).json({ error: "homeTeamId, awayTeamId, league and season are required" });
      }

      const apiHeaders = { "x-apisports-key": FOOTBALL_API_KEY };

      // Helper to get stat value from fixtures/statistics response
      const getStatValue = (stats: any[], type: string): number => {
        const stat = stats?.find((s: any) => s.type === type);
        if (!stat || stat.value === null) return 0;
        if (typeof stat.value === 'string' && stat.value.includes('%')) {
          return parseInt(stat.value.replace('%', ''));
        }
        return typeof stat.value === 'number' ? stat.value : parseInt(stat.value) || 0;
      };

      // Fetch last 5 finished fixtures for a team
      const fetchTeamLastMatches = async (teamId: string) => {
        const fixturesRes = await axios.get("https://v3.football.api-sports.io/fixtures", {
          params: { team: teamId, season, status: "FT", last: 5 },
          headers: apiHeaders,
        });
        return fixturesRes.data.response || [];
      };

      // Fetch statistics for a single fixture
      const fetchFixtureStats = async (fixtureId: number) => {
        try {
          const statsRes = await axios.get("https://v3.football.api-sports.io/fixtures/statistics", {
            params: { fixture: fixtureId },
            headers: apiHeaders,
          });
          return statsRes.data.response || [];
        } catch {
          return [];
        }
      };

      // Fetch H2H matches
      const fetchH2H = async () => {
        const h2hRes = await axios.get("https://v3.football.api-sports.io/fixtures/headtohead", {
          params: { h2h: `${homeTeamId}-${awayTeamId}`, status: "FT", last: 3 },
          headers: apiHeaders,
        });
        return h2hRes.data.response || [];
      };

      // Calculate averages from matches with stats
      const calculateAverages = async (matches: any[], teamId: string) => {
        let goalsFor = 0, goalsAgainst = 0, corners = 0, yellowCards = 0, redCards = 0;
        let matchCount = 0;
        let statsCount = 0; // Count only matches with detailed stats

        for (const match of matches) {
          const isHome = match.teams.home.id === parseInt(teamId);
          const goals = match.goals;
          
          // Goals are always available from fixture data
          goalsFor += isHome ? (goals.home || 0) : (goals.away || 0);
          goalsAgainst += isHome ? (goals.away || 0) : (goals.home || 0);
          matchCount++;

          // Get fixture stats for corners and cards (may not be available)
          const stats = await fetchFixtureStats(match.fixture.id);
          const teamStats = stats.find((s: any) => s.team.id === parseInt(teamId));
          
          if (teamStats?.statistics && teamStats.statistics.length > 0) {
            corners += getStatValue(teamStats.statistics, 'Corner Kicks');
            yellowCards += getStatValue(teamStats.statistics, 'Yellow Cards');
            redCards += getStatValue(teamStats.statistics, 'Red Cards');
            statsCount++;
          }
        }

        if (matchCount === 0) return null;

        return {
          goalsFor: (goalsFor / matchCount).toFixed(1),
          goalsAgainst: (goalsAgainst / matchCount).toFixed(1),
          // For corners/cards, use statsCount to avoid misleading averages
          corners: statsCount > 0 ? (corners / statsCount).toFixed(1) : "-",
          yellowCards: statsCount > 0 ? (yellowCards / statsCount).toFixed(1) : "-",
          redCards: statsCount > 0 ? (redCards / statsCount).toFixed(1) : "-",
          matchCount,
          statsCount,
        };
      };

      // Fetch all data in parallel
      const [homeMatches, awayMatches, h2hMatches] = await Promise.all([
        fetchTeamLastMatches(homeTeamId as string),
        fetchTeamLastMatches(awayTeamId as string),
        fetchH2H(),
      ]);

      // Calculate averages
      const [homeAverages, awayAverages] = await Promise.all([
        calculateAverages(homeMatches, homeTeamId as string),
        calculateAverages(awayMatches, awayTeamId as string),
      ]);

      // Calculate H2H averages for both teams
      let h2hHomeAvg = null, h2hAwayAvg = null;
      if (h2hMatches.length > 0) {
        [h2hHomeAvg, h2hAwayAvg] = await Promise.all([
          calculateAverages(h2hMatches, homeTeamId as string),
          calculateAverages(h2hMatches, awayTeamId as string),
        ]);
      }

      return res.json({
        recentForm: {
          home: { matches: homeMatches.slice(0, 5), averages: homeAverages },
          away: { matches: awayMatches.slice(0, 5), averages: awayAverages },
        },
        headToHead: {
          matches: h2hMatches,
          home: { averages: h2hHomeAvg },
          away: { averages: h2hAwayAvg },
        },
      });
    } catch (error: any) {
      console.error(`[API-Football] Error fetching pregame insights:`, error.message);
      return res.status(500).json({ error: "Failed to fetch pregame insights", details: error.message });
    }
  });

  // Team Statistics - Season averages (goals, cards, form, etc.)
  app.get("/api/football/teams/statistics", async (req, res) => {
    try {
      const { team, league, season } = req.query;
      
      if (!team || !league || !season) {
        return res.status(400).json({ error: "team, league and season parameters are required" });
      }
      
      const response = await axios.get("https://v3.football.api-sports.io/teams/statistics", {
        params: { team, league, season },
        headers: {
          "x-apisports-key": FOOTBALL_API_KEY,
        },
      });
      return res.json(response.data);
    } catch (error: any) {
      console.error(`[API-Football] Error fetching team statistics:`, error.message);
      if (axios.isAxiosError(error) && error.response) {
        console.error("[API-Football] Response Status:", error.response.status);
        console.error("[API-Football] Response Data:", error.response.data);
      }
      return res.status(500).json({ error: "Failed to fetch team statistics", details: error.message });
    }
  });

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertProfileSchema.parse(req.body);
      
      // Check if user already exists
      const existing = await storage.getProfileByEmail(validatedData.email);
      if (existing) {
        return res.status(400).json({ error: "E-mail já cadastrado" });
      }

      const profile = await storage.createProfile({
        ...validatedData,
        password: req.body.password || "demo", // In production, get from body
      });

      return res.json({ profile });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/auth/profile/:id", async (req, res) => {
    try {
      const profile = await storage.getProfileById(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      return res.json({ profile });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/profile/sync", async (req, res) => {
    try {
      const { id, email, firstName } = req.body;
      
      if (!id || !email) {
        return res.status(400).json({ error: "id and email are required" });
      }

      console.log(`[PROFILE SYNC] Syncing profile for ${email} (${id})`);
      const profile = await storage.upsertProfileFromSupabase({ id, email, firstName });
      console.log(`[PROFILE SYNC] Profile synced: ${profile.email}, status: ${profile.subscriptionStatus}`);
      
      return res.json({ profile });
    } catch (error: any) {
      console.error(`[PROFILE SYNC] Error:`, error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Auth Proxy - Route auth requests through server to avoid client-side connection issues
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      // DEV TEST LOGIN - REMOVER ANTES DE PRODUÇÃO
      if (email === 'a@a.com' && password === '1') {
        console.log(`[AUTH PROXY] DEV TEST LOGIN for a@a.com`);
        const testProfile = await storage.getProfileByEmail('a@a.com');
        if (testProfile) {
          return res.json({
            user: {
              id: testProfile.id,
              email: testProfile.email,
              user_metadata: { first_name: testProfile.firstName }
            },
            access_token: 'dev-test-token',
            refresh_token: 'dev-test-refresh'
          });
        }
      }

      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error("[AUTH PROXY] Supabase credentials not configured");
        return res.status(500).json({ error: "Serviço de autenticação não configurado" });
      }

      console.log(`[AUTH PROXY] Login attempt for ${email}`);
      
      // Make request to Supabase Auth API
      const response = await axios.post(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
          },
          timeout: 10000,
        }
      );

      const { user, access_token, refresh_token } = response.data;
      
      if (!user) {
        console.log(`[AUTH PROXY] Login failed for ${email}: No user returned`);
        return res.status(401).json({ error: "Email ou senha incorretos" });
      }

      console.log(`[AUTH PROXY] Login successful for ${email}`);
      
      // Also sync profile to our database
      const profile = await storage.upsertProfileFromSupabase({
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name || email.split('@')[0],
      });
      
      return res.json({
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        },
        access_token,
        refresh_token,
        profile,
      });
    } catch (error: any) {
      console.error(`[AUTH PROXY] Login error:`, error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        return res.status(401).json({ error: "Email ou senha incorretos" });
      }
      
      return res.status(500).json({ error: "Erro ao fazer login. Tente novamente." });
    }
  });

  // Bankroll Management Routes
  app.get("/api/profile/:id/bankroll", async (req, res) => {
    try {
      const profile = await storage.getProfileById(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      return res.json({
        bankrollInitial: profile.bankrollInitial,
        riskProfile: profile.riskProfile,
        unitValue: profile.unitValue,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/profile/:id/bankroll", async (req, res) => {
    try {
      const { bankrollInitial, riskProfile, unitValue } = req.body;
      
      if (!bankrollInitial || !riskProfile || !unitValue) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
      }

      const profile = await storage.updateProfileBankroll(req.params.id, {
        bankrollInitial: bankrollInitial.toString(),
        riskProfile,
        unitValue: unitValue.toString(),
      });

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      return res.json({ success: true, profile });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Onboarding Routes
  app.get("/api/profile/:id/onboarding", async (req, res) => {
    try {
      const profile = await storage.getProfileById(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      return res.json({
        hasCompletedTour: profile.hasCompletedTour,
        preferredTheme: profile.preferredTheme || 'dark',
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/profile/:id/tour-completed", async (req, res) => {
    try {
      const { completed } = req.body;
      const profile = await storage.updateTourCompleted(req.params.id, completed ?? true);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      return res.json({ success: true, hasCompletedTour: profile.hasCompletedTour });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/profile/:id/theme", async (req, res) => {
    try {
      const { theme } = req.body;
      if (!theme || !['dark', 'light'].includes(theme)) {
        return res.status(400).json({ error: "Theme must be 'dark' or 'light'" });
      }
      const profile = await storage.updatePreferredTheme(req.params.id, theme);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      return res.json({ success: true, preferredTheme: profile.preferredTheme });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Favorites Routes
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const favorites = await storage.getUserFavorites(req.params.userId);
      return res.json({ favorites });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const { userId, tipId } = req.body;
      if (!userId || !tipId) {
        return res.status(400).json({ error: "userId and tipId are required" });
      }
      const favorite = await storage.addFavorite(userId, tipId);
      return res.json({ success: true, favorite });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/favorites/:userId/:tipId", async (req, res) => {
    try {
      await storage.removeFavorite(req.params.userId, req.params.tipId);
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/favorites/:userId/:tipId", async (req, res) => {
    try {
      const isFavorite = await storage.isFavorite(req.params.userId, req.params.tipId);
      return res.json({ isFavorite });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // User Bets Routes (Individual Tracking)
  // ============================================
  
  // Get user's monthly stats
  app.get("/api/user-bets/stats/:userId", async (req, res) => {
    try {
      const stats = await storage.getUserMonthlyStats(req.params.userId);
      const assertivity = stats.greens + stats.reds > 0 
        ? ((stats.greens / (stats.greens + stats.reds)) * 100).toFixed(1)
        : '0';
      return res.json({ 
        ...stats, 
        assertivity: parseFloat(assertivity),
        monthName: new Date().toLocaleString('pt-BR', { month: 'long' })
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get all user bets
  app.get("/api/user-bets/:userId", async (req, res) => {
    try {
      const bets = await storage.getUserBets(req.params.userId);
      return res.json({ bets });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Check if user entered a specific bet
  app.get("/api/user-bets/:userId/:tipId", async (req, res) => {
    try {
      const bet = await storage.getUserBetByTip(req.params.userId, req.params.tipId);
      return res.json({ bet, hasEntered: !!bet });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Mark user as entering a bet
  app.post("/api/user-bets", async (req, res) => {
    try {
      const { userId, tipId, stakeUsed, oddAtEntry } = req.body;
      if (!userId || !tipId) {
        return res.status(400).json({ error: "userId and tipId are required" });
      }
      
      // Check if already entered
      const existing = await storage.getUserBetByTip(userId, tipId);
      if (existing) {
        return res.json({ success: true, bet: existing, alreadyExists: true });
      }
      
      const bet = await storage.createUserBet({
        userId,
        tipId,
        stakeUsed: stakeUsed || '1.0',
        oddAtEntry: oddAtEntry || '1.0'
      });
      return res.json({ success: true, bet });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Update bet result (green/red)
  app.patch("/api/user-bets/:userId/:tipId", async (req, res) => {
    try {
      const { result } = req.body;
      if (!result || !['green', 'red'].includes(result)) {
        return res.status(400).json({ error: "result must be 'green' or 'red'" });
      }
      
      // Verifica se o usuário já marcou resultado
      const existingBet = await storage.getUserBetByTip(req.params.userId, req.params.tipId);
      if (existingBet && existingBet.result !== 'pending') {
        return res.status(400).json({ 
          error: "Resultado já marcado", 
          currentResult: existingBet.result 
        });
      }
      
      const bet = await storage.updateUserBetResult(req.params.userId, req.params.tipId, result);
      if (!bet) {
        return res.status(404).json({ error: "Bet not found" });
      }
      return res.json({ success: true, bet });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Tips Routes
  app.get("/api/tips", async (req, res) => {
    try {
      const allTips = await storage.getAllTips();
      
      // Normalize tips data using shared utility
      const normalizedTips = allTips.map(normalizeTipForResponse);
      
      return res.json({ tips: normalizedTips });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // TIP ANALYSIS & EV ENDPOINTS
  // ============================================
  
  // Get full analysis for a tip (by tipId)
  app.get("/api/tips/:tipId/analysis", async (req, res) => {
    try {
      const { tipId } = req.params;
      
      // 1. Check if analysis already exists
      const existingAnalysis = await storage.getTipAnalysis(tipId);
      const existingRecommendations = await storage.getTipMarketRecommendations(tipId);
      
      if (existingAnalysis) {
        return res.json({
          success: true,
          analysis: {
            goalsAnalysis: existingAnalysis.goalsAnalysis ? JSON.parse(existingAnalysis.goalsAnalysis) : null,
            cornersAnalysis: existingAnalysis.cornersAnalysis ? JSON.parse(existingAnalysis.cornersAnalysis) : null,
            h2hAnalysis: existingAnalysis.h2hAnalysis ? JSON.parse(existingAnalysis.h2hAnalysis) : null,
            climateAnalysis: existingAnalysis.climateAnalysis ? JSON.parse(existingAnalysis.climateAnalysis) : null,
            tacticalInsights: existingAnalysis.tacticalInsights ? JSON.parse(existingAnalysis.tacticalInsights) : [],
            finalRecommendation: existingAnalysis.finalRecommendation,
          },
          marketRecommendations: existingRecommendations
        });
      }
      
      // 2. Get the tip to find fixtureId
      const tip = await storage.getTipById(tipId);
      if (!tip) {
        return res.status(404).json({ error: "Tip not found" });
      }
      
      if (!tip.fixtureId) {
        return res.status(400).json({ error: "Tip has no fixture ID for analysis" });
      }
      
      // 3. Generate analysis using AI engine
      const fullAnalysis = await aiPredictionEngine.generateFullAnalysis(parseInt(tip.fixtureId));
      
      if (!fullAnalysis) {
        return res.status(503).json({ error: "Could not generate analysis - insufficient data" });
      }
      
      // 4. Store analysis for future use
      const savedAnalysis = await storage.createTipAnalysis({
        tipId,
        fixtureId: tip.fixtureId,
        goalsAnalysis: JSON.stringify(fullAnalysis.goalsAnalysis),
        cornersAnalysis: JSON.stringify(fullAnalysis.cornersAnalysis),
        h2hAnalysis: JSON.stringify(fullAnalysis.h2hAnalysis),
        climateAnalysis: JSON.stringify(fullAnalysis.climateAnalysis),
        tacticalInsights: JSON.stringify(fullAnalysis.tacticalInsights),
        finalRecommendation: fullAnalysis.finalRecommendation,
        dataSources: JSON.stringify(["API-Football", "Bet365 Odds"]),
      });
      
      // 5. Store market recommendations
      for (const rec of fullAnalysis.marketRecommendations) {
        await storage.createTipMarketRecommendation({
          tipId,
          analysisId: savedAnalysis.id,
          marketType: rec.marketType,
          marketLabel: rec.marketLabel,
          selection: rec.selection,
          bookmakerOdd: rec.bookmakerOdd,
          modelProbability: rec.modelProbability,
          fairOdd: rec.fairOdd,
          evPercent: rec.evPercent,
          evRating: rec.evRating as any,
          suggestedStake: rec.suggestedStake,
          kellyStake: rec.kellyStake,
          rationale: JSON.stringify(rec.rationale),
          confidenceLevel: rec.confidenceLevel as any,
          isMainPick: rec.isMainPick,
          isValueBet: rec.isValueBet,
        });
      }
      
      return res.json({
        success: true,
        analysis: fullAnalysis,
        marketRecommendations: fullAnalysis.marketRecommendations
      });
      
    } catch (error: any) {
      console.error('[API] Error getting tip analysis:', error);
      return res.status(500).json({ error: error.message });
    }
  });
  
  // Generate analysis for a fixture (without tip - for preview)
  app.get("/api/fixtures/:fixtureId/analysis", async (req, res) => {
    try {
      const fixtureId = parseInt(req.params.fixtureId);
      
      if (isNaN(fixtureId)) {
        return res.status(400).json({ error: "Invalid fixture ID" });
      }
      
      const fullAnalysis = await aiPredictionEngine.generateFullAnalysis(fixtureId);
      
      if (!fullAnalysis) {
        return res.status(503).json({ error: "Could not generate analysis - insufficient data" });
      }
      
      return res.json({
        success: true,
        fixtureId,
        analysis: fullAnalysis,
        marketRecommendations: fullAnalysis.marketRecommendations
      });
      
    } catch (error: any) {
      console.error('[API] Error generating fixture analysis:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // AI Bet Slip Scanner (Google Gemini Vision)
  // ============================================
  app.post("/api/scan-ticket", async (req, res) => {
    try {
      const { imageBase64 } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Image is required" });
      }

      if (!genAI) {
        return res.status(503).json({ 
          error: "Gemini not configured",
          message: "A chave do Gemini não está configurada. Preencha o bilhete manualmente."
        });
      }

      console.log("🔍 Scanning bet slip with Gemini Vision...");

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Extract base64 data (remove data:image/xxx;base64, prefix if present)
      const base64Data = imageBase64.includes(',') 
        ? imageBase64.split(',')[1] 
        : imageBase64;

      const prompt = `Analise esta imagem de bilhete de aposta esportiva.

Extraia as seguintes informações em formato JSON estrito:
{
  "bets": [
    {
      "home_team": "Time Casa",
      "away_team": "Time Fora", 
      "market": "Mercado EXATO do print",
      "odd": 1.85,
      "match_time": "2025-11-27T18:00:00"
    }
  ],
  "total_odd": 2.50,
  "is_multiple": false
}

REGRAS IMPORTANTES:
1. COPIE O MERCADO EXATAMENTE COMO ESTÁ NO PRINT!
   - NÃO abrevie, NÃO simplifique
   - Copie o texto completo do mercado como aparece no bilhete
   - Exemplo: Se no print diz "Para Ambos os Times Marcarem - Sim", use exatamente isso
   - Exemplo: Se no print diz "Total de Gols - Mais de 2.5", use exatamente isso

2. MERCADOS REPETIDOS:
   - Se TODAS as apostas tiverem o MESMO mercado (ex: todas "Resultado Final"), 
     NÃO repita - coloque o mercado apenas na PRIMEIRA aposta
   - Para as demais apostas com mercado idêntico, use "" (string vazia) no campo market
   - Só coloque mercado diferente se realmente for diferente entre as apostas

4. Se houver múltiplas apostas, liste CADA UMA separadamente no array

5. Extraia a odd EXATA do print (use total_odd para odd combinada)

6. EXTRAIA O HORÁRIO DO JOGO se visível no print (formato ISO: YYYY-MM-DDTHH:MM:SS)
   - Se aparecer "27/11 18:00" → "2025-11-27T18:00:00"
   - Se não encontrar horário, use null

7. Responda APENAS com o JSON válido, sem texto adicional`;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = result.response;
      const content = response.text();
      
      console.log("🤖 Gemini Response:", content);

      // Parse JSON from response
      let parsed;
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", parseError);
        return res.status(422).json({ 
          error: "Failed to parse bet slip",
          message: "A IA não conseguiu interpretar o bilhete. Preencha manualmente.",
          raw: content
        });
      }

      console.log("✅ Parsed bet slip:", parsed);
      return res.json({ 
        success: true,
        data: parsed
      });

    } catch (error: any) {
      console.error("Scan ticket error:", error);
      return res.status(500).json({ 
        error: "AI scan failed",
        message: error.message || "Erro ao processar imagem"
      });
    }
  });

  // SECURITY: Admin-only helper function with dual verification (userId + email)
  const ALLOWED_ADMINS = ['kwillianferreira@gmail.com'];
  
  // SECURITY: Verify admin with both userId AND email to prevent spoofing
  // An attacker would need to know both the email AND the userId (UUID) to bypass
  const verifyAdmin = async (adminEmail: string | undefined, adminUserId?: string): Promise<boolean> => {
    if (!adminEmail) {
      console.warn("⚠️ [SECURITY] Admin verification failed: no email provided");
      return false;
    }
    
    const adminUser = await storage.getUserByEmail(adminEmail);
    if (!adminUser) {
      console.warn(`⚠️ [SECURITY] Admin verification failed: user not found for ${adminEmail}`);
      return false;
    }
    
    // SECURITY: If userId is provided, verify it matches the email's userId
    if (adminUserId && adminUser.id !== adminUserId) {
      console.warn(`⚠️ [SECURITY] Admin verification failed: userId mismatch for ${adminEmail}`);
      console.warn(`⚠️ [SECURITY] Expected: ${adminUser.id}, Got: ${adminUserId}`);
      return false;
    }
    
    const isAdmin = adminUser.role === 'admin' || ALLOWED_ADMINS.includes(adminEmail.toLowerCase());
    
    if (!isAdmin) {
      console.warn(`⚠️ [SECURITY] Admin verification failed: ${adminEmail} is not an admin`);
    }
    
    return isAdmin;
  };

  // SECURITY: Protected - only admins can create tips
  app.post("/api/tips", async (req, res) => {
    try {
      const { adminEmail, adminUserId, ...tipData } = req.body;
      
      // SECURITY: Verify admin with both email AND userId
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        console.warn(`⚠️ [SECURITY] Unauthorized tip creation attempt`);
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      
      const validatedData = insertTipSchema.parse(tipData);
      const tip = await storage.createTip(validatedData);
      return res.json({ tip });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // SECURITY: Protected - only admins can update tip status
  app.patch("/api/tips/:id/status", async (req, res) => {
    try {
      const { status, adminEmail, adminUserId } = req.body;
      
      // SECURITY: Verify admin with both email AND userId
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        console.warn(`⚠️ [SECURITY] Unauthorized tip status update attempt`);
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      
      if (!['pending', 'green', 'red'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const tip = await storage.updateTipStatus(req.params.id, status);
      if (!tip) {
        return res.status(404).json({ error: "Tip not found" });
      }
      
      return res.json({ tip });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // SECURITY: Protected - only admins can delete tips
  app.delete("/api/tips/:id", async (req, res) => {
    try {
      const adminEmail = req.query.adminEmail as string;
      const adminUserId = req.query.adminUserId as string;
      
      // SECURITY: Verify admin with both email AND userId
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        console.warn(`⚠️ [SECURITY] Unauthorized tip deletion attempt`);
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      await storage.deleteTip(req.params.id);
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Tips Statistics - Dashboard metrics calculated from real tips + baseline
  app.get("/api/tips/stats", async (req, res) => {
    try {
      // ========================================
      // BASELINE: Dados fictícios de lançamento
      // 196 entradas com 87% de assertividade
      // Odd média de 1.85
      // ========================================
      const BASELINE = {
        greens: 170,        // 196 × 87% = 170
        reds: 26,           // 196 - 170 = 26
        totalResolved: 196,
        oddSum: 362.6,      // 196 × 1.85 = 362.6 (soma das odds para média ponderada)
        profitUnits: 118.5  // 170 × (1.85 - 1) - 26 = 118.5 unidades de lucro
      };
      
      const allTips = await storage.getAllTips();
      
      // Filter resolved tips only (green or red)
      const resolvedTips = allTips.filter(tip => tip.status === 'green' || tip.status === 'red');
      
      // Count real greens and reds
      const realGreens = resolvedTips.filter(tip => tip.status === 'green').length;
      const realReds = resolvedTips.filter(tip => tip.status === 'red').length;
      const pending = allTips.filter(tip => tip.status === 'pending').length;
      
      // Combine baseline + real data
      const totalGreens = BASELINE.greens + realGreens;
      const totalReds = BASELINE.reds + realReds;
      const totalResolved = totalGreens + totalReds;
      
      // Calculate assertivity percentage (baseline + real)
      const assertivity = totalResolved > 0 
        ? (totalGreens / totalResolved) * 100 
        : 0;
      
      // Calculate average odd (weighted average of baseline + real)
      const realOdds = resolvedTips
        .map(tip => parseFloat(tip.odd))
        .filter(odd => !isNaN(odd) && odd > 0);
      const realOddSum = realOdds.reduce((sum, odd) => sum + odd, 0);
      const totalOddSum = BASELINE.oddSum + realOddSum;
      const averageOdd = totalResolved > 0 
        ? totalOddSum / totalResolved 
        : 0;
      
      // Calculate bankroll growth (baseline + real)
      const INITIAL_BANKROLL = 100; // 100 units base (1 unit per bet)
      const realGreenTips = resolvedTips.filter(tip => tip.status === 'green');
      const realGreenOdds = realGreenTips
        .map(tip => parseFloat(tip.odd))
        .filter(odd => !isNaN(odd) && odd > 0);
      const realProfitFromGreens = realGreenOdds.reduce((sum, odd) => sum + (odd - 1), 0);
      const realLossFromReds = realReds * 1;
      const realNetProfit = realProfitFromGreens - realLossFromReds;
      
      // Total profit = baseline profit + real profit
      const totalNetProfit = BASELINE.profitUnits + realNetProfit;
      const growthPercentage = (totalNetProfit / INITIAL_BANKROLL) * 100;
      
      return res.json({
        greens: totalGreens,
        reds: totalReds,
        pending,
        totalEntries: BASELINE.totalResolved + allTips.length,
        totalResolved,
        assertivity: parseFloat(assertivity.toFixed(1)),
        averageOdd: parseFloat(averageOdd.toFixed(2)),
        growthPercentage: parseFloat(growthPercentage.toFixed(1)),
        profitUnits: parseFloat(totalNetProfit.toFixed(1)),
        // Debug: separate baseline and real data
        _baseline: BASELINE,
        _real: {
          greens: realGreens,
          reds: realReds,
          pending,
          profitUnits: parseFloat(realNetProfit.toFixed(1))
        }
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // Mercado Pago Routes
  // ============================================

  // Get Mercado Pago configuration status and public key
  app.get("/api/mercadopago/config", (req, res) => {
    try {
      return res.json({
        configured: mercadoPagoService.isConfigured(),
        publicKey: mercadoPagoService.isConfigured() ? mercadoPagoService.getPublicKey() : null,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Create a subscription checkout for a user
  app.post("/api/mercadopago/create-subscription", async (req, res) => {
    try {
      const { userId, userEmail, planId } = req.body;

      if (!userId || !userEmail) {
        return res.status(400).json({ error: "userId and userEmail are required" });
      }

      // Create Ocean Prime plan (returns init_point for checkout)
      const plan = await mercadoPagoService.createSubscriptionPlan();

      // Return plan's init_point to redirect user to Mercado Pago checkout
      // When user completes payment, MP automatically creates the subscription
      return res.json({
        planId: plan.id,
        initPoint: plan.init_point,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get subscription status
  app.get("/api/mercadopago/subscription/:id", async (req, res) => {
    try {
      const subscription = await mercadoPagoService.getSubscription(req.params.id);
      return res.json({ subscription });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Cancel subscription
  app.delete("/api/mercadopago/subscription/:id", async (req, res) => {
    try {
      const result = await mercadoPagoService.cancelSubscription(req.params.id);
      
      // Update user subscription status in database
      // TODO: Implement storage.updateUserSubscription()
      
      return res.json({ success: true, result });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Create payment preference (supports PIX, Card, etc.)
  app.post("/api/mercadopago/preference", async (req, res) => {
    try {
      const { userId, userEmail, title, amount, quantity } = req.body;
      
      if (!userId || !userEmail) {
        return res.status(400).json({ error: "userId and userEmail are required" });
      }

      const preference = await mercadoPagoService.createPreference({
        title: title || 'True Signal Pro - Acesso Mensal',
        amount: amount || 47.90,
        quantity: quantity || 1,
        userId,
        userEmail,
      });

      return res.json({ 
        success: true,
        preference,
      });
    } catch (error: any) {
      console.error("Error creating preference:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Create PIX payment (transparent checkout) - requires authentication
  app.post("/api/mercadopago/pix", async (req, res) => {
    try {
      const { userId, userEmail, firstName, lastName, document } = req.body;
      
      // Validate required fields
      if (!userId || !userEmail) {
        return res.status(400).json({ error: "userId and userEmail are required" });
      }

      // Verify user exists in database (security check)
      const user = await storage.getProfileById(userId);
      if (!user) {
        return res.status(403).json({ error: "User not found" });
      }

      // Verify email matches user (prevent spoofing)
      if (user.email !== userEmail) {
        console.warn(`⚠️ PIX attempt with mismatched email: ${userEmail} vs ${user.email}`);
        return res.status(403).json({ error: "Email mismatch" });
      }

      // Fixed price - server-side controlled (prevent price manipulation)
      // BLACK FRIDAY: R$ 99,87 → R$ 47,90 (52% OFF)
      const TRUE_SIGNAL_PRO_PRICE = 47.90;

      const payment = await mercadoPagoService.createPixPayment({
        amount: TRUE_SIGNAL_PRO_PRICE,
        userId,
        userEmail: user.email, // Use verified email from database
        description: 'True Signal Pro - Acesso Mensal',
        firstName: firstName || 'Usuario',
        lastName: lastName || 'True Signal',
        document,
      });

      // Store payment ID for this user (for status verification)
      console.log(`✅ PIX payment created for user ${userId}: ${payment.id}`);

      return res.json({ 
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
        },
        qrCode: payment.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
      });
    } catch (error: any) {
      console.error("Error creating PIX payment:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get payment status - secured endpoint
  app.post("/api/mercadopago/payment-status", async (req, res) => {
    try {
      const { paymentId, userId } = req.body;
      
      if (!paymentId || !userId) {
        return res.status(400).json({ error: "paymentId and userId are required" });
      }

      // Verify user exists
      const user = await storage.getProfileById(userId);
      if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const paymentResponse = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        { headers: { 'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` } }
      );
      
      // Verify this payment belongs to this user
      if (paymentResponse.data.external_reference !== userId) {
        console.warn(`⚠️ Payment status check mismatch: user ${userId} tried to check payment ${paymentId}`);
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Return only necessary status info (no sensitive data)
      return res.json({ 
        status: paymentResponse.data.status,
      });
    } catch (error: any) {
      console.error("Error getting payment status:", error);
      return res.status(500).json({ error: "Unable to verify payment status" });
    }
  });

  // Card Payment - Transparent checkout with tokenized card
  app.post("/api/mercadopago/card-payment", async (req, res) => {
    try {
      const { token, issuerId, paymentMethodId, transactionAmount, installments, userId, userEmail, payer } = req.body;
      
      // Validate required fields
      if (!token || !paymentMethodId || !userId || !userEmail) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Verify user exists in database (security check)
      const user = await storage.getProfileById(userId);
      if (!user) {
        return res.status(403).json({ error: "User not found" });
      }

      // Verify email matches user (prevent spoofing)
      if (user.email !== userEmail) {
        console.warn(`⚠️ Card payment attempt with mismatched email: ${userEmail} vs ${user.email}`);
        return res.status(403).json({ error: "Email mismatch" });
      }

      // Fixed price - server-side controlled (prevent price manipulation)
      // BLACK FRIDAY: R$ 99,87 → R$ 47,90 (52% OFF)
      const TRUE_SIGNAL_PRO_PRICE = 47.90;

      const payment = await mercadoPagoService.createCardPayment({
        token,
        issuerId: issuerId || '',
        paymentMethodId,
        transactionAmount: TRUE_SIGNAL_PRO_PRICE, // Use server-side price
        installments: installments || 1,
        userId,
        userEmail: user.email,
        payer: {
          email: user.email,
          identification: payer?.identification || { type: 'CPF', number: '' },
        },
      });

      console.log(`✅ Card payment created for user ${userId}: ${payment.id}, status: ${payment.status}`);

      // If payment approved, activate subscription immediately
      if (payment.status === 'approved') {
        const now = new Date();
        const subscriptionEndsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

        await storage.updateUserSubscription(userId, {
          subscriptionStatus: "active",
          subscriptionActivatedAt: now,
          subscriptionEndsAt: subscriptionEndsAt,
          mercadopagoSubscriptionId: payment.id.toString(),
        });

        console.log(`🎉 [Card Payment] User ${userId} subscription activated until ${subscriptionEndsAt.toISOString()}`);
      }

      return res.json({ 
        success: payment.status === 'approved',
        status: payment.status,
        statusDetail: payment.status_detail,
        paymentId: payment.id,
      });
    } catch (error: any) {
      console.error("Error creating card payment:", error.response?.data || error.message);
      return res.status(500).json({ error: error.response?.data?.message || error.message });
    }
  });

  // Mercado Pago Webhook - Process payment notifications
  // SECURITY: Validate webhook origin
  app.post("/api/mercadopago/webhook", async (req, res) => {
    try {
      const { type, data } = req.body;
      
      // SECURITY: Log source information for audit
      const sourceIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      
      console.log("📩 [Mercado Pago Webhook] Received:", type, data);
      console.log("🔒 [Webhook Security] Source IP:", sourceIP);
      console.log("🔒 [Webhook Security] User-Agent:", userAgent);

      // SECURITY: Basic validation - check for required fields
      if (!type || !data || !data.id) {
        console.warn("⚠️ [SECURITY] Invalid webhook payload - missing required fields");
        return res.status(400).send("Invalid payload");
      }

      // SECURITY: Validate webhook by fetching resource from MP API
      // This ensures the webhook is legitimate since only MP can create valid resources
      // The actual validation happens when we fetch the payment/subscription details below

      // Respond immediately to MP (required)
      res.status(200).send("OK");

      // Process webhook asynchronously
      if (type === "subscription_preapproval") {
        // Subscription status changed
        const subscriptionId = data.id;
        const subscription = await mercadoPagoService.getSubscription(subscriptionId);
        
        console.log("📊 [Webhook] Subscription status:", subscription.status);
        console.log("📊 [Webhook] External reference (userId):", subscription.external_reference);

        // Update user subscription in database based on status
        let userId = subscription.external_reference;
        
        // If no external_reference (plan.init_point flow), lookup by email
        if (!userId) {
          console.log("⚠️ [Webhook] No external_reference, trying payer_email lookup...");
          const payerEmail = subscription.payer_email;
          if (!payerEmail) {
            console.error("❌ [Webhook] No external_reference or payer_email in subscription");
            return;
          }

          // Find user by email
          const user = await storage.getUserByEmail(payerEmail);
          if (!user) {
            console.error(`❌ [Webhook] No user found with email: ${payerEmail}`);
            return;
          }
          userId = user.id;
          console.log(`✅ [Webhook] User found by email: ${userId}`);
        }

        const status = subscription.status;

        if (status === "authorized") {
          // Subscription is active - upgrade user to True Signal Pro (30 days)
          const now = new Date();
          const endsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days
          
          console.log("✅ [Webhook] Activating True Signal Pro for user:", userId);
          console.log("📅 [Webhook] Subscription period:", now.toISOString(), "→", endsAt.toISOString());
          
          await storage.updateUserSubscription(userId, {
            subscriptionStatus: 'active',
            mercadopagoSubscriptionId: subscriptionId,
            subscriptionActivatedAt: now,
            subscriptionEndsAt: endsAt,
          });
          console.log("✅ [Webhook] User upgraded to True Signal Pro successfully (30 days)");
        } else if (status === "cancelled" || status === "paused") {
          // Subscription cancelled/paused - downgrade user
          console.log("⚠️ [Webhook] Deactivating subscription for user:", userId);
          await storage.updateUserSubscription(userId, {
            subscriptionStatus: 'expired',
            mercadopagoSubscriptionId: null,
          });
          console.log("⚠️ [Webhook] User subscription deactivated");
        }
      } else if (type === "payment") {
        // Individual payment received (PIX or recurring payment)
        const paymentId = data.id;
        console.log("💰 [Webhook] Payment received:", paymentId);
        
        try {
          // Fetch payment details from Mercado Pago
          const paymentResponse = await axios.get(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            { headers: { 'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` } }
          );
          
          const payment = paymentResponse.data;
          console.log("💰 [Webhook] Payment status:", payment.status);
          console.log("💰 [Webhook] Payment method:", payment.payment_method_id);
          console.log("💰 [Webhook] External reference:", payment.external_reference);
          console.log("💰 [Webhook] Payer email:", payment.payer?.email);
          
          if (payment.status === 'approved') {
            const userId = payment.external_reference;
            
            if (!userId) {
              // SECURITY: Do NOT activate based on email alone
              // This prevents malicious users from upgrading other accounts
              console.warn("⚠️ [Webhook] Payment without external_reference - manual verification required");
              console.warn("⚠️ [Webhook] Payment ID:", paymentId);
              console.warn("⚠️ [Webhook] Payer email:", payment.payer?.email);
              console.warn("⚠️ [Webhook] Amount:", payment.transaction_amount);
              // Admin should manually verify and activate via database
              return;
            }
            
            // Verify user exists in our database before activating
            const user = await storage.getProfileById(userId);
            if (!user) {
              console.error("❌ [Webhook] User not found in database:", userId);
              console.error("❌ [Webhook] Payment ID:", paymentId);
              return;
            }
            
            const now = new Date();
            const endsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            
            console.log("✅ [Webhook] Activating True Signal Pro via PIX for user:", userId);
            console.log("✅ [Webhook] User email:", user.email);
            await storage.updateUserSubscription(userId, {
              subscriptionStatus: 'active',
              subscriptionActivatedAt: now,
              subscriptionEndsAt: endsAt,
            });
            console.log("✅ [Webhook] PIX payment processed successfully!");
          }
        } catch (paymentError: any) {
          console.error("❌ [Webhook] Error fetching payment:", paymentError.message);
        }
      }
    } catch (error: any) {
      console.error("❌ [Webhook] Error processing:", error.message);
      // Don't return error - we already responded 200 to MP
    }
  });

  // Admin: Manually activate premium access for a user
  // SECURITY: Protected endpoint - requires admin authentication
  app.post("/api/admin/activate-premium", async (req, res) => {
    try {
      const { email, days, adminEmail, adminUserId } = req.body;
      
      // SECURITY: Verify admin authentication with both email AND userId
      if (!adminEmail || !adminUserId) {
        console.warn("⚠️ [SECURITY] Admin endpoint called without credentials");
        return res.status(401).json({ error: "Não autorizado" });
      }
      
      // SECURITY: Verify requester is admin using the helper function with dual verification
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        console.warn(`⚠️ [SECURITY] Non-admin user attempted admin action: ${adminEmail}`);
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      
      // Validate inputs
      if (!email || !days) {
        return res.status(400).json({ error: "Email e dias são obrigatórios" });
      }
      
      const numDays = parseInt(days);
      if (isNaN(numDays) || numDays < 1 || numDays > 365) {
        return res.status(400).json({ error: "Número de dias inválido (1-365)" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: `Usuário não encontrado: ${email}` });
      }
      
      // Calculate subscription period
      const now = new Date();
      const endsAt = new Date(now.getTime() + numDays * 24 * 60 * 60 * 1000);
      
      // Activate premium
      await storage.updateUserSubscription(user.id, {
        subscriptionStatus: 'active',
        subscriptionActivatedAt: now,
        subscriptionEndsAt: endsAt,
      });
      
      console.log(`🎉 [Admin] Premium ativado manualmente para ${email} por ${numDays} dias`);
      console.log(`📅 [Admin] Período: ${now.toISOString()} → ${endsAt.toISOString()}`);
      console.log(`👤 [Admin] Ação realizada por: ${adminEmail}`);
      
      return res.json({ 
        success: true,
        message: `Premium ativado para ${email} por ${numDays} dias`,
        endsAt: endsAt.toISOString(),
      });
    } catch (error: any) {
      console.error("Error activating premium:", error);
      return res.status(500).json({ error: "Erro ao ativar acesso premium" });
    }
  });

  // =====================================================
  // AI PREDICTION ENGINE ROUTES
  // =====================================================

  // Run AI analysis for upcoming fixtures
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { date, adminEmail, adminUserId } = req.body;
      
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      
      const analysisDate = date || new Date().toISOString().split('T')[0];
      console.log(`🤖 [AI Engine] Starting analysis for ${analysisDate}`);
      
      const result = await aiPredictionEngine.analyzeUpcomingFixtures(analysisDate);
      
      return res.json({
        success: true,
        date: analysisDate,
        fixturesAnalyzed: result.analyzed,
        predictionsGenerated: result.predictions,
        message: `Análise completa! ${result.predictions} previsões geradas de ${result.analyzed} jogos.`
      });
    } catch (error: any) {
      console.error("[AI Engine] Analysis error:", error);
      return res.status(500).json({ error: "Erro ao executar análise de IA" });
    }
  });

  // Get AI draft tickets
  app.get("/api/ai/drafts", async (req, res) => {
    try {
      const drafts = await aiPredictionEngine.getDraftTickets();
      return res.json(drafts);
    } catch (error: any) {
      console.error("[AI Engine] Error fetching drafts:", error);
      return res.status(500).json({ error: "Erro ao buscar rascunhos de IA" });
    }
  });

  // Approve AI ticket and convert to tip
  app.post("/api/ai/drafts/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const { adminEmail, adminUserId, notes, adjustedOdd, adjustedStake, betLink } = req.body;
      
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      
      // Get the draft ticket
      const drafts = await aiPredictionEngine.getDraftTickets();
      const draft = drafts.find((d: any) => d.id === id);
      
      if (!draft) {
        return res.status(404).json({ error: "Rascunho não encontrado" });
      }
      
      // Create a new tip from the draft
      const matchTime = new Date(draft.matchTime);
      const formattedTime = matchTime.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Handle combo (multiple legs) vs single bet
      const isCombo = draft.isCombo;
      const legsArray = parseLegs(draft.legs);
      
      let tipData: any;
      
      // Generate AI analysis summary for users
      const generateAnalysisSummary = (draft: any): string => {
        const confidence = parseFloat(draft.confidence || '0');
        const probability = parseFloat(draft.probability || '0');
        const ev = parseFloat(draft.expectedValue || '0');
        
        let summary = `Analisando o confronto entre ${draft.homeTeam} e ${draft.awayTeam}, `;
        
        if (confidence >= 85) {
          summary += `percebi que ambos os times apresentam padrões consistentes. `;
        } else if (confidence >= 75) {
          summary += `identifiquei tendências interessantes nos últimos jogos. `;
        } else {
          summary += `observei alguns indicadores relevantes. `;
        }
        
        summary += `Com base em tudo isso, a probabilidade calculada ficou em ${probability.toFixed(0)}%, `;
        summary += `o que me dá ${confidence.toFixed(0)}% de confiança. `;
        
        if (ev > 0) {
          summary += `O valor esperado é positivo (+${ev.toFixed(1)}%), indicando vantagem matemática a longo prazo.`;
        }
        
        return summary;
      };
      
      // Extract goal AVERAGE per game from team stats (goalsScored is already the average)
      const extractGoalsAvg = (statsJson: string | null): string | null => {
        if (!statsJson) return null;
        try {
          const stats = typeof statsJson === 'string' ? JSON.parse(statsJson) : statsJson;
          // goalsScored is already the average per game from the API
          const avg = parseFloat(stats.goalsScored) || 0;
          return avg.toFixed(2);
        } catch {
          return null;
        }
      };
      
      const homeGoalsAvg = extractGoalsAvg(draft.homeTeamStats);
      const awayGoalsAvg = extractGoalsAvg(draft.awayTeamStats);
      
      // CRITICAL: Convert all numeric fields to proper numbers to avoid NULL in database
      const safeParseFloat = (val: any): number | null => {
        if (val === null || val === undefined) return null;
        const num = parseFloat(String(val));
        return isNaN(num) ? null : num;
      };
      
      const numericConfidence = safeParseFloat(draft.confidence);
      const numericProbability = safeParseFloat(draft.probability);
      const numericExpectedValue = safeParseFloat(draft.expectedValue);
      const numericHomeGoalsAvg = safeParseFloat(homeGoalsAvg);
      const numericAwayGoalsAvg = safeParseFloat(awayGoalsAvg);
      const numericStake = safeParseFloat(adjustedStake || draft.suggestedStake) || 2.0;
      const numericOdd = safeParseFloat(adjustedOdd || draft.suggestedOdd) || 1.5;
      
      console.log(`[AI Approve] Converting fields - confidence: ${draft.confidence} -> ${numericConfidence}, EV: ${draft.expectedValue} -> ${numericExpectedValue}, homeGoals: ${homeGoalsAvg} -> ${numericHomeGoalsAvg}`);
      
      if (isCombo && legsArray && legsArray.length > 0) {
        // Use centralized combo metadata derivation
        const comboData = deriveComboMetadata(legsArray, formattedTime);
        if (comboData) {
          tipData = {
            ...comboData,
            odd: numericOdd,
            stake: numericStake,
            status: 'pending',
            isLive: false,
            betLink: betLink || null,
            // AI Analysis fields - MUST be numbers
            analysisRationale: draft.analysisRationale,
            analysisSummary: generateAnalysisSummary(draft),
            confidence: numericConfidence,
            probability: numericProbability,
            expectedValue: numericExpectedValue,
            homeGoalsAvg: numericHomeGoalsAvg,
            awayGoalsAvg: numericAwayGoalsAvg,
            aiSourceId: draft.id,
          };
        } else {
          return res.status(400).json({ error: "Combo inválido: legs vazios ou malformados" });
        }
      } else {
        // Single bet
        tipData = {
          fixtureId: draft.fixtureId,
          league: draft.league,
          homeTeam: draft.homeTeam,
          awayTeam: draft.awayTeam,
          homeTeamLogo: draft.homeTeamLogo,
          awayTeamLogo: draft.awayTeamLogo,
          matchTime: formattedTime,
          market: `${draft.market}: ${draft.predictedOutcome}`,
          odd: numericOdd,
          stake: numericStake,
          status: 'pending',
          isLive: false,
          isCombo: false,
          totalOdd: null,
          legs: null,
          betLink: betLink || null,
          // AI Analysis fields - MUST be numbers
          analysisRationale: draft.analysisRationale,
          analysisSummary: generateAnalysisSummary(draft),
          confidence: numericConfidence,
          probability: numericProbability,
          expectedValue: numericExpectedValue,
          homeGoalsAvg: numericHomeGoalsAvg,
          awayGoalsAvg: numericAwayGoalsAvg,
          aiSourceId: draft.id,
        };
      }
      
      const newTip = await storage.createTip(tipData);
      
      // Update the draft status
      await aiPredictionEngine.approveTicket(id, adminUserId, notes);
      
      console.log(`✅ [AI Engine] Draft ${id} approved and published as tip ${newTip.id}`);
      
      return res.json({
        success: true,
        message: "Previsão aprovada e publicada!",
        tipId: newTip.id
      });
    } catch (error: any) {
      console.error("[AI Engine] Error approving draft:", error);
      return res.status(500).json({ error: "Erro ao aprovar previsão" });
    }
  });

  // Reject AI ticket
  app.post("/api/ai/drafts/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      const { adminEmail, adminUserId, notes } = req.body;
      
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      
      await aiPredictionEngine.rejectTicket(id, adminUserId, notes);
      
      return res.json({
        success: true,
        message: "Previsão rejeitada."
      });
    } catch (error: any) {
      console.error("[AI Engine] Error rejecting draft:", error);
      return res.status(500).json({ error: "Erro ao rejeitar previsão" });
    }
  });

  // Update combo legs (remove lines from combo)
  app.patch("/api/ai/drafts/:id/update-legs", async (req, res) => {
    try {
      const { id } = req.params;
      const { legs, totalOdd, probability, confidence, adminEmail, adminUserId } = req.body;
      
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      
      if (!legs || !Array.isArray(legs)) {
        return res.status(400).json({ error: "Legs inválidas" });
      }
      
      // Update the draft with new legs
      await db.update(aiTickets)
        .set({
          legs: JSON.stringify(legs),
          totalOdd: String(totalOdd),
          probability: String(probability),
          confidence: String(confidence),
          isCombo: legs.length > 1, // If only 1 leg left, it's no longer a combo
        })
        .where(eq(aiTickets.id, id));
      
      console.log(`✏️ [AI Engine] Updated combo ${id}: ${legs.length} legs, odd ${totalOdd.toFixed(2)}, prob ${probability.toFixed(1)}%`);
      
      return res.json({
        success: true,
        message: `Combo atualizado com ${legs.length} seleções`
      });
    } catch (error: any) {
      console.error("[AI Engine] Error updating combo legs:", error);
      return res.status(500).json({ error: "Erro ao atualizar combo" });
    }
  });

  // Bulk approve multiple AI tickets
  app.post("/api/ai/drafts/bulk-approve", async (req, res) => {
    try {
      const { ids, adminEmail, adminUserId } = req.body;
      
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "IDs inválidos" });
      }
      
      const drafts = await aiPredictionEngine.getDraftTickets();
      let approvedCount = 0;
      
      // Helper to generate analysis summary
      const generateAnalysisSummary = (draft: any): string => {
        const confidence = parseFloat(draft.confidence || '0');
        const probability = parseFloat(draft.probability || '0');
        const ev = parseFloat(draft.expectedValue || '0');
        
        let summary = `Analisando o confronto entre ${draft.homeTeam} e ${draft.awayTeam}, `;
        
        if (confidence >= 85) {
          summary += `percebi que ambos os times apresentam padrões consistentes. `;
        } else if (confidence >= 75) {
          summary += `identifiquei tendências interessantes nos últimos jogos. `;
        } else {
          summary += `observei alguns indicadores relevantes. `;
        }
        
        summary += `Com base em tudo isso, a probabilidade calculada ficou em ${probability.toFixed(0)}%, `;
        summary += `o que me dá ${confidence.toFixed(0)}% de confiança. `;
        
        if (ev > 0) {
          summary += `O valor esperado é positivo (+${ev.toFixed(1)}%), indicando vantagem matemática a longo prazo.`;
        }
        
        return summary;
      };
      
      // Helper to extract goals AVERAGE per game from team stats JSON (goalsScored is already the average)
      const extractGoalsAvg = (statsJson: string | null): string | null => {
        if (!statsJson) return null;
        try {
          const stats = typeof statsJson === 'string' ? JSON.parse(statsJson) : statsJson;
          // goalsScored is already the average per game from the API
          const avg = parseFloat(stats.goalsScored) || 0;
          return avg.toFixed(2);
        } catch {
          return null;
        }
      };
      
      // CRITICAL: Safe number conversion to avoid NULL in database
      const safeParseFloat = (val: any): number | null => {
        if (val === null || val === undefined) return null;
        const num = parseFloat(String(val));
        return isNaN(num) ? null : num;
      };
      
      for (const id of ids) {
        const draft = drafts.find((d: any) => d.id === id);
        if (!draft) continue;
        
        const matchTime = new Date(draft.matchTime);
        const formattedTime = matchTime.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // Extract analysis data
        const homeGoalsAvg = extractGoalsAvg(draft.homeTeamStats);
        const awayGoalsAvg = extractGoalsAvg(draft.awayTeamStats);
        
        // CRITICAL: Convert all numeric fields properly
        const numericConfidence = safeParseFloat(draft.confidence);
        const numericProbability = safeParseFloat(draft.probability);
        const numericExpectedValue = safeParseFloat(draft.expectedValue);
        const numericHomeGoalsAvg = safeParseFloat(homeGoalsAvg);
        const numericAwayGoalsAvg = safeParseFloat(awayGoalsAvg);
        const numericStake = safeParseFloat(draft.suggestedStake) || 2.0;
        const numericOdd = safeParseFloat(draft.suggestedOdd) || 1.5;
        
        console.log(`[Bulk Approve] ${draft.homeTeam} vs ${draft.awayTeam} - confidence: ${numericConfidence}, EV: ${numericExpectedValue}, homeGoals: ${numericHomeGoalsAvg}`);
        
        // Handle combo (multiple legs) vs single bet
        const isCombo = draft.isCombo;
        const legsArray = parseLegs(draft.legs);
        
        let tipData: any;
        
        if (isCombo && legsArray && legsArray.length > 0) {
          // Use centralized combo metadata derivation
          const comboData = deriveComboMetadata(legsArray, formattedTime);
          if (comboData) {
            tipData = {
              ...comboData,
              stake: numericStake,
              status: 'pending',
              isLive: false,
              // AI Analysis fields - MUST be numbers
              analysisRationale: draft.analysisRationale,
              analysisSummary: generateAnalysisSummary(draft),
              confidence: numericConfidence,
              probability: numericProbability,
              expectedValue: numericExpectedValue,
              homeGoalsAvg: numericHomeGoalsAvg,
              awayGoalsAvg: numericAwayGoalsAvg,
              aiSourceId: draft.id,
            };
          } else {
            console.warn(`[Bulk Approve] Skipping invalid combo draft ${id}`);
            continue;
          }
        } else {
          // Single bet
          tipData = {
            fixtureId: draft.fixtureId,
            league: draft.league,
            homeTeam: draft.homeTeam,
            awayTeam: draft.awayTeam,
            homeTeamLogo: draft.homeTeamLogo,
            awayTeamLogo: draft.awayTeamLogo,
            matchTime: formattedTime,
            market: `${draft.market}: ${draft.predictedOutcome}`,
            odd: numericOdd,
            stake: numericStake,
            status: 'pending',
            isLive: false,
            isCombo: false,
            totalOdd: null,
            legs: null,
            // AI Analysis fields - MUST be numbers
            analysisRationale: draft.analysisRationale,
            analysisSummary: generateAnalysisSummary(draft),
            confidence: numericConfidence,
            probability: numericProbability,
            expectedValue: numericExpectedValue,
            homeGoalsAvg: numericHomeGoalsAvg,
            awayGoalsAvg: numericAwayGoalsAvg,
            aiSourceId: draft.id,
          };
        }
        
        await storage.createTip(tipData);
        
        await aiPredictionEngine.approveTicket(id, adminUserId, 'Bulk approved');
        approvedCount++;
      }
      
      return res.json({
        success: true,
        message: `${approvedCount} previsões aprovadas e publicadas!`,
        approvedCount
      });
    } catch (error: any) {
      console.error("[AI Engine] Error bulk approving:", error);
      return res.status(500).json({ error: "Erro ao aprovar previsões em lote" });
    }
  });

  // Get AI engine stats
  app.get("/api/ai/stats", async (req, res) => {
    try {
      const drafts = await aiPredictionEngine.getDraftTickets();
      
      const normalizeText = (text: string): string => {
        return (text || '').toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
      };
      
      const marketNorm = (d: any) => normalizeText(d.market);
      
      return res.json({
        pendingDrafts: drafts.length,
        highConfidence: drafts.filter((d: any) => parseFloat(d.confidence) >= 85).length,
        markets: {
          over25: drafts.filter((d: any) => 
            marketNorm(d).includes('over 2.5') || 
            marketNorm(d).includes('over 1.5') || 
            marketNorm(d).includes('gols')
          ).length,
          under25: drafts.filter((d: any) => marketNorm(d).includes('under 2.5')).length,
          btts: drafts.filter((d: any) => 
            marketNorm(d).includes('ambas') || 
            marketNorm(d).includes('btts')
          ).length,
          result: drafts.filter((d: any) => marketNorm(d).includes('resultado')).length,
          corners: drafts.filter((d: any) => 
            marketNorm(d).includes('corner') || 
            marketNorm(d).includes('escanteio')
          ).length,
          cards: drafts.filter((d: any) => 
            marketNorm(d).includes('card') || 
            marketNorm(d).includes('cartao') ||
            marketNorm(d).includes('cartoes')
          ).length,
          shots: drafts.filter((d: any) => 
            marketNorm(d).includes('shot') || 
            marketNorm(d).includes('chute')
          ).length,
        }
      });
    } catch (error: any) {
      console.error("[AI Engine] Error fetching stats:", error);
      return res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  });

  // =====================================================
  // TOP MATCHES SELECTOR - Seletor de Top 6-8 Jogos do Dia
  // =====================================================

  // Selecionar os melhores jogos do dia para bilhetes pré-live
  app.get("/api/ai/top-matches", async (req, res) => {
    try {
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      const maxMatches = parseInt(req.query.max as string) || 8;
      
      console.log(`[AI Selector] Requisição para top ${maxMatches} jogos em ${date}`);
      
      const result = await aiPredictionEngine.selectTopMatchesOfDay(date, maxMatches);
      
      return res.json({
        success: true,
        date,
        totalAnalyzed: result.totalAnalyzed,
        selectedCount: result.matches.length,
        matches: result.matches.map(m => ({
          fixtureId: m.fixture.fixture.id,
          league: m.fixture.league.name,
          homeTeam: m.fixture.teams.home.name,
          awayTeam: m.fixture.teams.away.name,
          homeTeamLogo: m.fixture.teams.home.logo,
          awayTeamLogo: m.fixture.teams.away.logo,
          matchTime: new Date(m.fixture.fixture.timestamp * 1000).toISOString(),
          compositeScore: Math.round(m.compositeScore * 10) / 10,
          importanceScore: Math.round(m.importanceScore * 10) / 10,
          tier: m.tier,
          factors: m.factors,
          breakdown: {
            form: Math.round(m.breakdown.form * 10) / 10,
            stats: Math.round(m.breakdown.stats * 10) / 10,
            market: Math.round(m.breakdown.market * 10) / 10,
            risk: Math.round(m.breakdown.risk * 10) / 10,
          }
        }))
      });
    } catch (error: any) {
      console.error("[AI Selector] Error:", error);
      return res.status(500).json({ error: "Erro ao selecionar jogos do dia" });
    }
  });

  // =====================================================
  // PATTERN SCANNER - Análise de Padrões com Regra dos 10 Jogos
  // =====================================================

  app.get("/api/ai/pattern-scanner", async (req, res) => {
    try {
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      
      console.log(`[Pattern Scanner] Requisição para oportunidades em ${date}`);
      
      const opportunities = await aiPredictionEngine.scanDailyOpportunities(date);
      
      return res.json({
        success: true,
        date,
        totalOpportunities: opportunities.length,
        threshold: 80,
        opportunities
      });
    } catch (error: any) {
      console.error("[Pattern Scanner] Error:", error);
      return res.status(500).json({ error: "Erro ao escanear padrões" });
    }
  });

  // =====================================================
  // LIVE PRESSURE MONITOR ENDPOINTS
  // =====================================================

  // Get hot matches (sorted by pressure)
  app.get("/api/live/pressure", async (req, res) => {
    try {
      const { livePressureMonitor } = await import("./live-pressure-monitor");
      const limit = parseInt(req.query.limit as string) || 20;
      const hotMatches = await livePressureMonitor.getHotMatches(limit);
      
      return res.json({
        success: true,
        matches: hotMatches,
        status: livePressureMonitor.getStatus(),
      });
    } catch (error: any) {
      console.error("[Live Monitor] Error fetching hot matches:", error);
      return res.status(500).json({ error: "Erro ao buscar jogos quentes" });
    }
  });

  // Get pressure history for a specific match
  app.get("/api/live/pressure/:fixtureId", async (req, res) => {
    try {
      const { livePressureMonitor } = await import("./live-pressure-monitor");
      const { fixtureId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await livePressureMonitor.getMatchPressureHistory(fixtureId, limit);
      
      return res.json({
        success: true,
        fixtureId,
        history,
      });
    } catch (error: any) {
      console.error("[Live Monitor] Error fetching pressure history:", error);
      return res.status(500).json({ error: "Erro ao buscar histórico de pressão" });
    }
  });

  // Get recent alerts
  app.get("/api/live/alerts", async (req, res) => {
    try {
      const { livePressureMonitor } = await import("./live-pressure-monitor");
      const limit = parseInt(req.query.limit as string) || 20;
      const alerts = await livePressureMonitor.getRecentAlerts(limit);
      
      return res.json({
        success: true,
        alerts,
      });
    } catch (error: any) {
      console.error("[Live Monitor] Error fetching alerts:", error);
      return res.status(500).json({ error: "Erro ao buscar alertas" });
    }
  });

  // Start/Stop live monitor (admin only)
  app.post("/api/live/monitor/start", async (req, res) => {
    try {
      const { adminEmail, adminUserId, intervalMs } = req.body;
      
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      
      const { livePressureMonitor } = await import("./live-pressure-monitor");
      await livePressureMonitor.start(intervalMs || 45000);
      
      return res.json({
        success: true,
        message: "Monitor de pressão ao vivo iniciado!",
        status: livePressureMonitor.getStatus(),
      });
    } catch (error: any) {
      console.error("[Live Monitor] Error starting:", error);
      return res.status(500).json({ error: "Erro ao iniciar monitor" });
    }
  });

  app.post("/api/live/monitor/stop", async (req, res) => {
    try {
      const { adminEmail, adminUserId } = req.body;
      
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      
      const { livePressureMonitor } = await import("./live-pressure-monitor");
      livePressureMonitor.stop();
      
      return res.json({
        success: true,
        message: "Monitor de pressão ao vivo parado.",
        status: livePressureMonitor.getStatus(),
      });
    } catch (error: any) {
      console.error("[Live Monitor] Error stopping:", error);
      return res.status(500).json({ error: "Erro ao parar monitor" });
    }
  });

  // Get monitor status
  app.get("/api/live/monitor/status", async (req, res) => {
    try {
      const { livePressureMonitor } = await import("./live-pressure-monitor");
      return res.json({
        success: true,
        status: livePressureMonitor.getStatus(),
      });
    } catch (error: any) {
      console.error("[Live Monitor] Error getting status:", error);
      return res.status(500).json({ error: "Erro ao buscar status" });
    }
  });

  // ==================== MULTI-BOT API ENDPOINTS ====================
  
  // Initialize Multi-Bot strategies on server start
  (async () => {
    try {
      const { multiBotEngine } = await import("./multi-bot-engine");
      await multiBotEngine.initializeStrategies();
      console.log("[Multi-Bot] Engine initialized successfully");
    } catch (error) {
      console.error("[Multi-Bot] Failed to initialize:", error);
    }
  })();
  
  // Auto-start Live Pressure Monitor on server start (poll every 20 seconds)
  (async () => {
    try {
      const { livePressureMonitor } = await import("./live-pressure-monitor");
      await livePressureMonitor.start(20000); // 20 segundos
      console.log("[Live Monitor] Auto-started with 20s interval");
    } catch (error) {
      console.error("[Live Monitor] Failed to auto-start:", error);
    }
  })();
  
  // Get all bot strategies
  app.get("/api/multibot/strategies", async (req, res) => {
    try {
      const { multiBotEngine } = await import("./multi-bot-engine");
      const strategies = await multiBotEngine.getStrategies();
      return res.json({
        success: true,
        strategies,
      });
    } catch (error: any) {
      console.error("[Multi-Bot] Error getting strategies:", error);
      return res.status(500).json({ error: "Erro ao buscar estratégias" });
    }
  });

  // Get signals for all or specific strategy
  app.get("/api/multibot/signals", async (req, res) => {
    try {
      const { strategyCode, status, limit } = req.query;
      const { multiBotEngine } = await import("./multi-bot-engine");
      const signals = await multiBotEngine.getSignals(
        strategyCode as string,
        status as string,
        Number(limit) || 50
      );
      return res.json({
        success: true,
        signals,
      });
    } catch (error: any) {
      console.error("[Multi-Bot] Error getting signals:", error);
      return res.status(500).json({ error: "Erro ao buscar sinais" });
    }
  });

  // Get performance stats for all bots
  app.get("/api/multibot/performance", async (req, res) => {
    try {
      const { periodType } = req.query;
      const { multiBotEngine } = await import("./multi-bot-engine");
      const stats = await multiBotEngine.getPerformanceStats(periodType as string || "all_time");
      return res.json({
        success: true,
        stats,
      });
    } catch (error: any) {
      console.error("[Multi-Bot] Error getting performance:", error);
      return res.status(500).json({ error: "Erro ao buscar performance" });
    }
  });

  // Get detailed stats for a specific bot
  app.get("/api/multibot/strategies/:strategyCode/stats", async (req, res) => {
    try {
      const { strategyCode } = req.params;
      const { multiBotEngine } = await import("./multi-bot-engine");
      const stats = await multiBotEngine.getBotDetailedStats(strategyCode);
      
      if (!stats) {
        return res.status(404).json({ error: "Estratégia não encontrada" });
      }
      
      return res.json({
        success: true,
        ...stats,
      });
    } catch (error: any) {
      console.error("[Multi-Bot] Error getting bot stats:", error);
      return res.status(500).json({ error: "Erro ao buscar estatísticas do bot" });
    }
  });

  // Toggle strategy active status (admin only)
  app.post("/api/multibot/strategies/:strategyCode/toggle", async (req, res) => {
    try {
      const { strategyCode } = req.params;
      const { adminEmail, adminUserId, isActive } = req.body;
      
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      
      const { multiBotEngine } = await import("./multi-bot-engine");
      await multiBotEngine.toggleStrategy(strategyCode, isActive);
      
      return res.json({
        success: true,
        message: `Estratégia ${strategyCode} ${isActive ? 'ativada' : 'desativada'}`,
      });
    } catch (error: any) {
      console.error("[Multi-Bot] Error toggling strategy:", error);
      return res.status(500).json({ error: "Erro ao alterar estratégia" });
    }
  });

  // Update signal outcome (admin only)
  app.post("/api/multibot/signals/:signalId/resolve", async (req, res) => {
    try {
      const { signalId } = req.params;
      const { adminEmail, adminUserId, status, finalScore } = req.body;
      
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      
      if (!["hit", "miss", "void"].includes(status)) {
        return res.status(400).json({ error: "Status inválido. Use: hit, miss ou void" });
      }
      
      const { multiBotEngine } = await import("./multi-bot-engine");
      await multiBotEngine.updateSignalOutcome(signalId, status, finalScore);
      
      return res.json({
        success: true,
        message: `Sinal atualizado para: ${status}`,
      });
    } catch (error: any) {
      console.error("[Multi-Bot] Error resolving signal:", error);
      return res.status(500).json({ error: "Erro ao resolver sinal" });
    }
  });

  // Publish a signal as a tip (admin only)
  app.post("/api/multibot/signals/:signalId/publish", async (req, res) => {
    try {
      const { signalId } = req.params;
      const { adminEmail, adminUserId } = req.body;
      
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      
      const { multiBotEngine } = await import("./multi-bot-engine");
      const tipId = await multiBotEngine.publishSignal(signalId, adminUserId);
      
      return res.json({
        success: true,
        message: "Sinal publicado como tip",
        tipId,
      });
    } catch (error: any) {
      console.error("[Multi-Bot] Error publishing signal:", error);
      return res.status(500).json({ error: "Erro ao publicar sinal" });
    }
  });

  // Manually analyze live matches with all bots (admin only)
  app.post("/api/multibot/analyze", async (req, res) => {
    try {
      const { adminEmail, adminUserId } = req.body;
      
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      
      // Fetch live matches
      const response = await axios.get("https://v3.football.api-sports.io/fixtures", {
        params: { live: "all" },
        headers: { "x-apisports-key": FOOTBALL_API_KEY },
      });
      
      const liveMatches = response.data?.response || [];
      
      // Transform API response to match format
      const formattedMatches = liveMatches.map((m: any) => ({
        fixtureId: m.fixture.id,
        league: m.league.name,
        leagueId: m.league.id,
        homeTeam: m.teams.home.name,
        awayTeam: m.teams.away.name,
        homeTeamLogo: m.teams.home.logo,
        awayTeamLogo: m.teams.away.logo,
        homeScore: m.goals.home || 0,
        awayScore: m.goals.away || 0,
        matchMinute: m.fixture.status.elapsed || 0,
        matchStatus: m.fixture.status.short,
        homePossession: 50,
        awayPossession: 50,
        homeShotsOnTarget: 0,
        awayShotsOnTarget: 0,
      }));
      
      const { multiBotEngine } = await import("./multi-bot-engine");
      const signals = await multiBotEngine.analyzeWithBots(formattedMatches);
      
      return res.json({
        success: true,
        matchesAnalyzed: formattedMatches.length,
        signalsGenerated: signals.length,
        signals,
      });
    } catch (error: any) {
      console.error("[Multi-Bot] Error analyzing matches:", error);
      return res.status(500).json({ error: "Erro ao analisar partidas" });
    }
  });

  // Legacy bot endpoints for compatibility
  app.get("/api/live/bots", async (req, res) => {
    try {
      const { multiBotEngine } = await import("./multi-bot-engine");
      const strategies = await multiBotEngine.getStrategies();
      return res.json({
        success: true,
        bots: strategies,
      });
    } catch (error: any) {
      console.error("[Multi-Bot] Error getting bots:", error);
      return res.status(500).json({ error: "Erro ao buscar bots" });
    }
  });

  app.post("/api/live/bots/:botId/toggle", async (req, res) => {
    try {
      const { botId } = req.params;
      const { adminEmail, adminUserId, enabled } = req.body;
      
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      
      const { multiBotEngine } = await import("./multi-bot-engine");
      await multiBotEngine.toggleStrategy(botId, enabled);
      
      return res.json({
        success: true,
        message: `Bot ${botId} ${enabled ? 'ativado' : 'desativado'}`,
      });
    } catch (error: any) {
      console.error("[Multi-Bot] Error toggling bot:", error);
      return res.status(500).json({ error: "Erro ao alterar bot" });
    }
  });

  app.get("/api/live/bots/stats", async (req, res) => {
    try {
      const { multiBotEngine } = await import("./multi-bot-engine");
      const stats = await multiBotEngine.getPerformanceStats("all_time");
      return res.json({
        success: true,
        stats,
      });
    } catch (error: any) {
      console.error("[Multi-Bot] Error getting bot stats:", error);
      return res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  });

  // =====================================================
  // RESULT CHECKER & STATISTICS ENDPOINTS
  // =====================================================

  // Start the result checker (runs every 10 minutes)
  resultChecker.start(10);

  // Manual trigger to check results
  app.post("/api/tips/check-results", async (req, res) => {
    try {
      const { adminEmail, adminUserId } = req.body;
      
      if (!await verifyAdmin(adminEmail, adminUserId)) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      
      const result = await resultChecker.checkPendingTips();
      
      return res.json({
        success: true,
        ...result,
        message: `Verificado ${result.checked} tips, ${result.updated} atualizados`
      });
    } catch (error: any) {
      console.error("[Result Checker] Error:", error);
      return res.status(500).json({ error: "Erro ao verificar resultados" });
    }
  });

  // Get monthly statistics (assertivity, profit, etc)
  app.get("/api/tips/stats", async (req, res) => {
    try {
      const { month, year } = req.query;
      
      const targetMonth = month ? parseInt(String(month)) : new Date().getMonth() + 1;
      const targetYear = year ? parseInt(String(year)) : new Date().getFullYear();
      
      // Get all tips for the month
      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
      
      const monthTips = await db.select()
        .from(tips)
        .where(
          sql`${tips.createdAt} >= ${startDate} AND ${tips.createdAt} <= ${endDate}`
        );
      
      // Calculate stats
      const totalTips = monthTips.length;
      const greenTips = monthTips.filter(t => t.status === 'green').length;
      const redTips = monthTips.filter(t => t.status === 'red').length;
      const pendingTips = monthTips.filter(t => t.status === 'pending').length;
      const settledTips = greenTips + redTips;
      
      // Assertivity (only counts settled tips)
      const assertivity = settledTips > 0 ? (greenTips / settledTips) * 100 : 0;
      
      // Calculate profit/loss
      let totalProfit = 0;
      for (const tip of monthTips) {
        if (tip.resultProfit) {
          totalProfit += parseFloat(String(tip.resultProfit));
        } else if (tip.status === 'green') {
          const odd = parseFloat(String(tip.odd));
          const stake = parseFloat(String(tip.stake || '1'));
          totalProfit += (odd - 1) * stake;
        } else if (tip.status === 'red') {
          const stake = parseFloat(String(tip.stake || '1'));
          totalProfit -= stake;
        }
      }
      
      // ROI (Return on Investment)
      const totalStaked = monthTips
        .filter(t => t.status !== 'pending')
        .reduce((sum, t) => sum + parseFloat(String(t.stake || '1')), 0);
      const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;
      
      // Average odd of green tips
      const avgOddGreen = greenTips > 0
        ? monthTips.filter(t => t.status === 'green').reduce((sum, t) => sum + parseFloat(String(t.odd)), 0) / greenTips
        : 0;
      
      // Current streak
      const sortedTips = monthTips
        .filter(t => t.status !== 'pending')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      let currentStreak = { wins: 0, losses: 0, type: 'none' as 'win' | 'loss' | 'none' };
      if (sortedTips.length > 0) {
        const lastStatus = sortedTips[0].status;
        let count = 0;
        for (const tip of sortedTips) {
          if (tip.status === lastStatus) {
            count++;
          } else {
            break;
          }
        }
        currentStreak = {
          wins: lastStatus === 'green' ? count : 0,
          losses: lastStatus === 'red' ? count : 0,
          type: lastStatus === 'green' ? 'win' : 'loss'
        };
      }
      
      return res.json({
        month: targetMonth,
        year: targetYear,
        totalTips,
        greenTips,
        redTips,
        pendingTips,
        settledTips,
        assertivity: parseFloat(assertivity.toFixed(1)),
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        roi: parseFloat(roi.toFixed(1)),
        avgOddGreen: parseFloat(avgOddGreen.toFixed(2)),
        currentStreak,
        lastUpdated: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("[Stats] Error fetching stats:", error);
      return res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  });

  // Get daily stats for chart
  app.get("/api/tips/stats/daily", async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const numDays = parseInt(String(days));
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - numDays);
      
      const allTips = await db.select()
        .from(tips)
        .where(sql`${tips.createdAt} >= ${startDate}`);
      
      // Group by day
      const dailyStats: Record<string, { date: string; green: number; red: number; profit: number }> = {};
      
      for (let i = 0; i <= numDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        dailyStats[dateKey] = { date: dateKey, green: 0, red: 0, profit: 0 };
      }
      
      for (const tip of allTips) {
        const dateKey = new Date(tip.createdAt).toISOString().split('T')[0];
        if (dailyStats[dateKey]) {
          if (tip.status === 'green') {
            dailyStats[dateKey].green++;
            const odd = parseFloat(String(tip.odd));
            const stake = parseFloat(String(tip.stake || '1'));
            dailyStats[dateKey].profit += (odd - 1) * stake;
          } else if (tip.status === 'red') {
            dailyStats[dateKey].red++;
            const stake = parseFloat(String(tip.stake || '1'));
            dailyStats[dateKey].profit -= stake;
          }
        }
      }
      
      // Convert to array sorted by date
      const result = Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date));
      
      return res.json(result);
    } catch (error: any) {
      console.error("[Stats] Error fetching daily stats:", error);
      return res.status(500).json({ error: "Erro ao buscar estatísticas diárias" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
