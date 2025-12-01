import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Profiles table - User profiles with authentication data
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  subscriptionStatus: text("subscription_status", { enum: ["trial", "active", "expired"] }).notNull().default("trial"),
  trialStartDate: timestamp("trial_start_date").notNull().defaultNow(),
  mercadopagoSubscriptionId: text("mercadopago_subscription_id"),
  mercadopagoCustomerId: text("mercadopago_customer_id"),
  subscriptionActivatedAt: timestamp("subscription_activated_at"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  privacyAcceptedAt: timestamp("privacy_accepted_at"),
  riskDisclaimerAcceptedAt: timestamp("risk_disclaimer_accepted_at"),
  // Bankroll Management Fields
  bankrollInitial: decimal("bankroll_initial", { precision: 12, scale: 2 }),
  riskProfile: text("risk_profile", { enum: ["conservador", "moderado", "agressivo"] }),
  unitValue: decimal("unit_value", { precision: 10, scale: 2 }),
  // User Preferences
  hasCompletedTour: boolean("has_completed_tour").notNull().default(false),
  preferredTheme: text("preferred_theme", { enum: ["dark", "light"] }).default("dark"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Favorites table - User saved tips
export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  tipId: uuid("tip_id").notNull().references(() => tips.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  passwordHash: true,
});

export const selectProfileSchema = createSelectSchema(profiles);

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

// Tips table - Betting signals/tips
export const tips = pgTable("tips", {
  id: uuid("id").primaryKey().defaultRandom(),
  fixtureId: text("fixture_id"),
  league: text("league").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  homeTeamLogo: text("home_team_logo"),
  awayTeamLogo: text("away_team_logo"),
  matchTime: text("match_time"),
  market: text("market").notNull(),
  odd: decimal("odd", { precision: 5, scale: 2 }).notNull(),
  stake: decimal("stake", { precision: 3, scale: 1 }).notNull().default("1.0"), // Peso da tip em unidades (0.5, 1, 1.5, 2, etc)
  status: text("status", { enum: ["pending", "green", "red"] }).notNull().default("pending"),
  betLink: text("bet_link"),
  imageUrl: text("image_url"),
  isLive: boolean("is_live").notNull().default(false),
  createdBy: uuid("created_by").references(() => profiles.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTipSchema = createInsertSchema(tips).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectTipSchema = createSelectSchema(tips);

export type InsertTip = z.infer<typeof insertTipSchema>;
export type Tip = typeof tips.$inferSelect;

// =====================================================
// AI PREDICTION ENGINE TABLES
// =====================================================

// Team Match Stats - Cached statistics from last 10 matches per team
export const teamMatchStats = pgTable("team_match_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: text("team_id").notNull(),
  teamName: text("team_name").notNull(),
  teamLogo: text("team_logo"),
  leagueId: text("league_id").notNull(),
  leagueName: text("league_name").notNull(),
  season: text("season").notNull(),
  
  // Aggregated stats from last 10 matches
  matchesAnalyzed: decimal("matches_analyzed", { precision: 3, scale: 0 }).notNull().default("10"),
  
  // Goals stats
  goalsScored: decimal("goals_scored", { precision: 5, scale: 2 }).notNull().default("0"),
  goalsConceded: decimal("goals_conceded", { precision: 5, scale: 2 }).notNull().default("0"),
  goalsScoredHome: decimal("goals_scored_home", { precision: 5, scale: 2 }).notNull().default("0"),
  goalsConcededHome: decimal("goals_conceded_home", { precision: 5, scale: 2 }).notNull().default("0"),
  goalsScoredAway: decimal("goals_scored_away", { precision: 5, scale: 2 }).notNull().default("0"),
  goalsConcededAway: decimal("goals_conceded_away", { precision: 5, scale: 2 }).notNull().default("0"),
  
  // Over/Under percentages (based on last 10 games)
  over05Pct: decimal("over_05_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  over15Pct: decimal("over_15_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  over25Pct: decimal("over_25_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  over35Pct: decimal("over_35_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  
  // BTTS (Both Teams To Score)
  bttsPct: decimal("btts_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  
  // Clean sheets and failed to score
  cleanSheetPct: decimal("clean_sheet_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  failedToScorePct: decimal("failed_to_score_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  
  // First half stats
  goalsFirstHalf: decimal("goals_first_half", { precision: 5, scale: 2 }).notNull().default("0"),
  goalsConcededFirstHalf: decimal("goals_conceded_first_half", { precision: 5, scale: 2 }).notNull().default("0"),
  
  // Form (W/D/L from last 5)
  formWins: decimal("form_wins", { precision: 3, scale: 0 }).notNull().default("0"),
  formDraws: decimal("form_draws", { precision: 3, scale: 0 }).notNull().default("0"),
  formLosses: decimal("form_losses", { precision: 3, scale: 0 }).notNull().default("0"),
  formPoints: decimal("form_points", { precision: 3, scale: 0 }).notNull().default("0"),
  
  // Corners and cards
  avgCorners: decimal("avg_corners", { precision: 5, scale: 2 }).notNull().default("0"),
  avgCards: decimal("avg_cards", { precision: 5, scale: 2 }).notNull().default("0"),
  
  // Raw fixture IDs used for analysis (JSON array)
  sourceFixtureIds: text("source_fixture_ids"),
  
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTeamMatchStatsSchema = createInsertSchema(teamMatchStats).omit({
  id: true,
  updatedAt: true,
});

export type InsertTeamMatchStats = z.infer<typeof insertTeamMatchStatsSchema>;
export type TeamMatchStats = typeof teamMatchStats.$inferSelect;

// AI Generated Tickets - Draft predictions waiting for admin approval
export const aiTickets = pgTable("ai_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Match info
  fixtureId: text("fixture_id").notNull(),
  league: text("league").notNull(),
  leagueId: text("league_id"),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  homeTeamId: text("home_team_id").notNull(),
  awayTeamId: text("away_team_id").notNull(),
  homeTeamLogo: text("home_team_logo"),
  awayTeamLogo: text("away_team_logo"),
  matchTime: timestamp("match_time").notNull(),
  
  // Prediction
  market: text("market").notNull(), // Over 2.5, BTTS Yes, Home Win, etc
  predictedOutcome: text("predicted_outcome").notNull(),
  suggestedOdd: decimal("suggested_odd", { precision: 5, scale: 2 }).notNull(),
  suggestedStake: decimal("suggested_stake", { precision: 3, scale: 1 }).notNull().default("1.0"),
  
  // AI Analysis
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(), // 0-100%
  probability: decimal("probability", { precision: 5, scale: 2 }).notNull(), // Calculated probability
  expectedValue: decimal("expected_value", { precision: 5, scale: 2 }), // EV calculation
  
  // Analysis breakdown (JSON)
  analysisRationale: text("analysis_rationale"), // JSON with detailed reasoning
  homeTeamStats: text("home_team_stats"), // JSON snapshot of home team stats
  awayTeamStats: text("away_team_stats"), // JSON snapshot of away team stats
  h2hAnalysis: text("h2h_analysis"), // JSON with head-to-head data
  
  // Feature scores (for transparency)
  formScore: decimal("form_score", { precision: 5, scale: 2 }),
  goalTrendScore: decimal("goal_trend_score", { precision: 5, scale: 2 }),
  h2hScore: decimal("h2h_score", { precision: 5, scale: 2 }),
  
  // Status
  status: text("status", { 
    enum: ["draft", "approved", "rejected", "published", "expired"] 
  }).notNull().default("draft"),
  
  // Admin actions
  reviewedBy: uuid("reviewed_by").references(() => profiles.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  // Link to published tip (if approved and published)
  publishedTipId: uuid("published_tip_id").references(() => tips.id),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAiTicketSchema = createInsertSchema(aiTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiTicket = z.infer<typeof insertAiTicketSchema>;
export type AiTicket = typeof aiTickets.$inferSelect;

// AI Analysis Cache - Store raw API responses to avoid rate limits
export const aiAnalysisCache = pgTable("ai_analysis_cache", {
  id: uuid("id").primaryKey().defaultRandom(),
  cacheKey: text("cache_key").notNull().unique(), // e.g., "team_stats_33_2024"
  cacheType: text("cache_type", { 
    enum: ["team_fixtures", "team_stats", "h2h", "fixture_stats"] 
  }).notNull(),
  data: text("data").notNull(), // JSON stringified response
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAiAnalysisCacheSchema = createInsertSchema(aiAnalysisCache).omit({
  id: true,
  createdAt: true,
});

export type InsertAiAnalysisCache = z.infer<typeof insertAiAnalysisCacheSchema>;
export type AiAnalysisCache = typeof aiAnalysisCache.$inferSelect;
