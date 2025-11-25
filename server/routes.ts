import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTipSchema, insertProfileSchema } from "@shared/schema";
import axios from "axios";

const SPORTMONKS_API_KEY = process.env.VITE_SPORTMONKS_API_KEY || process.env.SPORTMONKS_API_TOKEN;
const SPORTMONKS_BASE_URL = "https://api.sportmonks.com/v3/football";

if (!SPORTMONKS_API_KEY) {
  console.warn('⚠️ SPORTMONKS API KEY NOT FOUND - check VITE_SPORTMONKS_API_KEY or SPORTMONKS_API_TOKEN env var');
} else {
  console.log('✅ Sportmonks API Key loaded successfully');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Sportmonks API Proxy Routes (to avoid CORS issues)
  app.get("/api/sportmonks/livescores/inplay", async (req, res) => {
    try {
      const response = await axios.get(`${SPORTMONKS_BASE_URL}/livescores/inplay`, {
        params: {
          api_token: SPORTMONKS_API_KEY,
          include: "participants;league;scores",
        },
      });
      return res.json(response.data);
    } catch (error: any) {
      console.error("[Sportmonks Proxy] Error fetching live scores:", error.message);
      if (axios.isAxiosError(error) && error.response) {
        console.error("[Sportmonks Proxy] Response Status:", error.response.status);
        console.error("[Sportmonks Proxy] Response Data:", error.response.data);
      }
      return res.status(500).json({ error: "Failed to fetch live scores", details: error.message });
    }
  });

  app.get("/api/sportmonks/fixtures/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const response = await axios.get(`${SPORTMONKS_BASE_URL}/fixtures/date/${date}`, {
        params: {
          api_token: SPORTMONKS_API_KEY,
          include: "participants;league;scores",
        },
      });
      return res.json(response.data);
    } catch (error: any) {
      console.error(`[Sportmonks Proxy] Error fetching fixtures for ${req.params.date}:`, error.message);
      if (axios.isAxiosError(error) && error.response) {
        console.error("[Sportmonks Proxy] Response Status:", error.response.status);
        console.error("[Sportmonks Proxy] Response Data:", error.response.data);
      }
      return res.status(500).json({ error: "Failed to fetch fixtures", details: error.message });
    }
  });

  app.get("/api/sportmonks/fixtures/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await axios.get(`${SPORTMONKS_BASE_URL}/fixtures/${id}`, {
        params: {
          api_token: SPORTMONKS_API_KEY,
          include: "statistics;participants",
        },
      });
      return res.json(response.data);
    } catch (error: any) {
      console.error(`[Sportmonks Proxy] Error fetching fixture ${req.params.id}:`, error.message);
      if (axios.isAxiosError(error) && error.response) {
        console.error("[Sportmonks Proxy] Response Status:", error.response.status);
        console.error("[Sportmonks Proxy] Response Data:", error.response.data);
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
        return res.status(400).json({ error: "Email already registered" });
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
        return res.status(401).json({ error: "Invalid credentials" });
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

  const httpServer = createServer(app);
  return httpServer;
}
