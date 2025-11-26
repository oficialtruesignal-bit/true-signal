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

      // If no planId provided, create a default Ocean Prime plan
      let subscriptionPlanId = planId;
      if (!subscriptionPlanId) {
        const plan = await mercadoPagoService.createSubscriptionPlan();
        subscriptionPlanId = plan.id;
      }

      // Create subscription
      const subscription = await mercadoPagoService.createSubscription({
        planId: subscriptionPlanId,
        userEmail,
        userId,
      });

      // Return init_point (checkout URL) for user to complete payment
      return res.json({
        subscriptionId: subscription.id,
        initPoint: subscription.init_point,
        status: subscription.status,
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
        const userId = subscription.external_reference;
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
