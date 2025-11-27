import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTipSchema, insertProfileSchema } from "@shared/schema";
import axios from "axios";
import { mercadoPagoService } from "./mercadopago-service";

const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;

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

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      console.log(`[AUTH] Login attempt for email: ${email}`);
      const profile = await storage.verifyPassword(email, password);
      
      if (!profile) {
        console.log(`[AUTH] Login failed for email: ${email}`);
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      console.log(`[AUTH] Login successful for email: ${email}, role: ${profile.role}`);
      return res.json({ profile });
    } catch (error: any) {
      console.error(`[AUTH] Login error:`, error);
      return res.status(500).json({ error: error.message });
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

  // Tips Routes
  app.get("/api/tips", async (req, res) => {
    try {
      const allTips = await storage.getAllTips();
      return res.json({ tips: allTips });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tips", async (req, res) => {
    try {
      const validatedData = insertTipSchema.parse(req.body);
      const tip = await storage.createTip(validatedData);
      return res.json({ tip });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/tips/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      
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

  app.delete("/api/tips/:id", async (req, res) => {
    try {
      await storage.deleteTip(req.params.id);
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Tips Statistics - Dashboard metrics calculated from real tips
  app.get("/api/tips/stats", async (req, res) => {
    try {
      const allTips = await storage.getAllTips();
      
      // Filter resolved tips only (green or red)
      const resolvedTips = allTips.filter(tip => tip.status === 'green' || tip.status === 'red');
      
      // Count greens and reds
      const greens = resolvedTips.filter(tip => tip.status === 'green').length;
      const reds = resolvedTips.filter(tip => tip.status === 'red').length;
      const pending = allTips.filter(tip => tip.status === 'pending').length;
      const totalResolved = greens + reds;
      
      // Calculate assertivity percentage (only from resolved tips)
      const assertivity = totalResolved > 0 
        ? (greens / totalResolved) * 100 
        : 0;
      
      // Calculate average odd from RESOLVED tips only (filter out null/invalid odds)
      const resolvedOdds = resolvedTips
        .map(tip => parseFloat(tip.odd))
        .filter(odd => !isNaN(odd) && odd > 0);
      const averageOdd = resolvedOdds.length > 0 
        ? resolvedOdds.reduce((sum, odd) => sum + odd, 0) / resolvedOdds.length 
        : 0;
      
      // Calculate bankroll growth from resolved tips
      // Greens: win (odd - 1) units per green
      // Reds: lose 1 unit per red
      const INITIAL_BANKROLL = 100; // 100 units base (1 unit per bet)
      const greenTips = resolvedTips.filter(tip => tip.status === 'green');
      const greenOdds = greenTips
        .map(tip => parseFloat(tip.odd))
        .filter(odd => !isNaN(odd) && odd > 0);
      const profitFromGreens = greenOdds.reduce((sum, odd) => sum + (odd - 1), 0);
      const lossFromReds = reds * 1;
      const netProfit = profitFromGreens - lossFromReds;
      const growthPercentage = (netProfit / INITIAL_BANKROLL) * 100;
      
      return res.json({
        greens,
        reds,
        pending,
        totalEntries: allTips.length,
        totalResolved,
        assertivity: parseFloat(assertivity.toFixed(1)),
        averageOdd: parseFloat(averageOdd.toFixed(2)),
        growthPercentage: parseFloat(growthPercentage.toFixed(1)),
        profitUnits: parseFloat(netProfit.toFixed(1)),
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

  // Mercado Pago Webhook - Process payment notifications
  app.post("/api/mercadopago/webhook", async (req, res) => {
    try {
      const { type, data } = req.body;
      
      console.log("📩 [Mercado Pago Webhook] Received:", type, data);

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
          // Subscription is active - upgrade user to Ocean Prime
          console.log("✅ [Webhook] Activating Ocean Prime for user:", userId);
          await storage.updateUserSubscription(userId, {
            subscriptionStatus: 'active',
            mercadopagoSubscriptionId: subscriptionId,
          });
          console.log("✅ [Webhook] User upgraded to Ocean Prime successfully");
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
        // Individual payment received (recurring payment)
        const paymentId = data.id;
        console.log("💰 [Webhook] Payment received:", paymentId);
        // TODO: Log payment, extend subscription end date
      }
    } catch (error: any) {
      console.error("❌ [Webhook] Error processing:", error.message);
      // Don't return error - we already responded 200 to MP
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
