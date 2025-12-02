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

// User Bets - Track individual user entries and results
export const userBets = pgTable("user_bets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  tipId: uuid("tip_id").notNull().references(() => tips.id, { onDelete: "cascade" }),
  enteredAt: timestamp("entered_at").notNull().defaultNow(),
  result: text("result", { enum: ["pending", "green", "red"] }).notNull().default("pending"),
  resultMarkedAt: timestamp("result_marked_at"),
  stakeUsed: decimal("stake_used", { precision: 5, scale: 2 }).notNull().default("1.0"),
  oddAtEntry: decimal("odd_at_entry", { precision: 5, scale: 2 }).notNull(),
  profit: decimal("profit", { precision: 10, scale: 2 }),
});

export const insertUserBetSchema = createInsertSchema(userBets).omit({
  id: true,
  enteredAt: true,
});

export type InsertUserBet = z.infer<typeof insertUserBetSchema>;
export type UserBet = typeof userBets.$inferSelect;

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
  stake: decimal("stake", { precision: 3, scale: 1 }).notNull().default("1.0"),
  status: text("status", { enum: ["pending", "green", "red"] }).notNull().default("pending"),
  betLink: text("bet_link"),
  imageUrl: text("image_url"),
  isLive: boolean("is_live").notNull().default(false),
  // Combo bet fields
  isCombo: boolean("is_combo").notNull().default(false),
  totalOdd: decimal("total_odd", { precision: 6, scale: 2 }),
  legs: text("legs"), // JSON array of BetLeg for combo bets
  // AI Analysis fields (from AI prediction engine)
  analysisRationale: text("analysis_rationale"), // JSON with detailed reasoning
  analysisSummary: text("analysis_summary"), // Short summary text
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // 0-100%
  probability: decimal("probability", { precision: 5, scale: 2 }), // Calculated probability
  expectedValue: decimal("expected_value", { precision: 6, scale: 2 }), // EV percentage
  homeGoalsAvg: decimal("home_goals_avg", { precision: 4, scale: 2 }), // Home team avg goals
  awayGoalsAvg: decimal("away_goals_avg", { precision: 4, scale: 2 }), // Away team avg goals
  aiSourceId: uuid("ai_source_id"), // Reference to ai_tickets.id
  // Settlement fields
  settledAt: timestamp("settled_at"), // When result was verified
  resultProfit: decimal("result_profit", { precision: 8, scale: 2 }), // Profit/loss from this tip
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
  
  // Combo Support - multiple legs for combined bets
  isCombo: boolean("is_combo").notNull().default(false),
  legs: text("legs"), // JSON array of BetLeg objects
  totalOdd: decimal("total_odd", { precision: 6, scale: 2 }), // Combined odd (product of all leg odds)
  
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

// =====================================================
// LIVE PRESSURE MONITOR TABLES
// =====================================================

// Live Pressure Snapshots - Rolling window of live match pressure data
export const livePressureSnapshots = pgTable("live_pressure_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  fixtureId: text("fixture_id").notNull(),
  
  // Match info
  league: text("league").notNull(),
  leagueId: text("league_id"),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  homeTeamLogo: text("home_team_logo"),
  awayTeamLogo: text("away_team_logo"),
  
  // Current match state
  matchMinute: decimal("match_minute", { precision: 3, scale: 0 }).notNull().default("0"),
  homeScore: decimal("home_score", { precision: 2, scale: 0 }).notNull().default("0"),
  awayScore: decimal("away_score", { precision: 2, scale: 0 }).notNull().default("0"),
  matchStatus: text("match_status").notNull(), // 1H, 2H, HT, FT, etc
  
  // Live statistics (current totals)
  homePossession: decimal("home_possession", { precision: 5, scale: 2 }).notNull().default("50"),
  awayPossession: decimal("away_possession", { precision: 5, scale: 2 }).notNull().default("50"),
  homeShotsTotal: decimal("home_shots_total", { precision: 3, scale: 0 }).notNull().default("0"),
  awayShotsTotal: decimal("away_shots_total", { precision: 3, scale: 0 }).notNull().default("0"),
  homeShotsOnTarget: decimal("home_shots_on_target", { precision: 3, scale: 0 }).notNull().default("0"),
  awayShotsOnTarget: decimal("away_shots_on_target", { precision: 3, scale: 0 }).notNull().default("0"),
  homeCorners: decimal("home_corners", { precision: 3, scale: 0 }).notNull().default("0"),
  awayCorners: decimal("away_corners", { precision: 3, scale: 0 }).notNull().default("0"),
  homeDangerousAttacks: decimal("home_dangerous_attacks", { precision: 3, scale: 0 }).notNull().default("0"),
  awayDangerousAttacks: decimal("away_dangerous_attacks", { precision: 3, scale: 0 }).notNull().default("0"),
  homeAttacks: decimal("home_attacks", { precision: 3, scale: 0 }).notNull().default("0"),
  awayAttacks: decimal("away_attacks", { precision: 3, scale: 0 }).notNull().default("0"),
  
  // Calculated pressure metrics
  homePressureIndex: decimal("home_pressure_index", { precision: 5, scale: 2 }).notNull().default("0"),
  awayPressureIndex: decimal("away_pressure_index", { precision: 5, scale: 2 }).notNull().default("0"),
  homeGoalProbability: decimal("home_goal_probability", { precision: 5, scale: 2 }).notNull().default("0"),
  awayGoalProbability: decimal("away_goal_probability", { precision: 5, scale: 2 }).notNull().default("0"),
  
  // Pressure trends (delta from last snapshot)
  homePressureDelta: decimal("home_pressure_delta", { precision: 5, scale: 2 }).notNull().default("0"),
  awayPressureDelta: decimal("away_pressure_delta", { precision: 5, scale: 2 }).notNull().default("0"),
  
  // Alert status
  alertTriggered: boolean("alert_triggered").notNull().default(false),
  alertType: text("alert_type"), // "home_pressure", "away_pressure", "imminent_goal"
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLivePressureSnapshotSchema = createInsertSchema(livePressureSnapshots).omit({
  id: true,
  createdAt: true,
});

export type InsertLivePressureSnapshot = z.infer<typeof insertLivePressureSnapshotSchema>;
export type LivePressureSnapshot = typeof livePressureSnapshots.$inferSelect;

// Live Alerts - History of alerts sent for live matches
export const liveAlerts = pgTable("live_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  fixtureId: text("fixture_id").notNull(),
  snapshotId: uuid("snapshot_id").references(() => livePressureSnapshots.id),
  
  // Alert details
  alertType: text("alert_type", { 
    enum: ["home_pressure", "away_pressure", "imminent_goal", "goal_scored", "pressure_surge"] 
  }).notNull(),
  teamSide: text("team_side", { enum: ["home", "away"] }).notNull(),
  pressureIndex: decimal("pressure_index", { precision: 5, scale: 2 }).notNull(),
  goalProbability: decimal("goal_probability", { precision: 5, scale: 2 }).notNull(),
  
  // Message sent
  alertTitle: text("alert_title").notNull(),
  alertMessage: text("alert_message").notNull(),
  
  // Match context at alert time
  matchMinute: decimal("match_minute", { precision: 3, scale: 0 }).notNull(),
  currentScore: text("current_score").notNull(), // "1-0"
  
  // Notification tracking
  notificationSent: boolean("notification_sent").notNull().default(false),
  notificationId: text("notification_id"), // OneSignal notification ID
  
  // Outcome tracking (did goal happen within 5 min?)
  goalScoredWithin5Min: boolean("goal_scored_within_5_min"),
  actualOutcome: text("actual_outcome"), // "goal_home", "goal_away", "no_goal"
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLiveAlertSchema = createInsertSchema(liveAlerts).omit({
  id: true,
  createdAt: true,
});

export type InsertLiveAlert = z.infer<typeof insertLiveAlertSchema>;
export type LiveAlert = typeof liveAlerts.$inferSelect;

// Live Monitor Settings - Configurable thresholds per user/admin
export const liveMonitorSettings = pgTable("live_monitor_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id),
  
  // Global or user-specific
  isGlobal: boolean("is_global").notNull().default(false),
  
  // Pressure thresholds
  pressureAlertThreshold: decimal("pressure_alert_threshold", { precision: 5, scale: 2 }).notNull().default("70"), // Alert when pressure > 70%
  pressureSurgeThreshold: decimal("pressure_surge_threshold", { precision: 5, scale: 2 }).notNull().default("25"), // Alert on +25% surge
  sustainedPressureIntervals: decimal("sustained_pressure_intervals", { precision: 2, scale: 0 }).notNull().default("2"), // Require 2 consecutive intervals
  
  // Goal probability thresholds
  goalProbabilityAlertThreshold: decimal("goal_probability_alert_threshold", { precision: 5, scale: 2 }).notNull().default("75"),
  
  // Notification preferences
  enablePushNotifications: boolean("enable_push_notifications").notNull().default(true),
  enableSoundAlerts: boolean("enable_sound_alerts").notNull().default(true),
  
  // Leagues to monitor (JSON array of league IDs, null = all)
  monitoredLeagues: text("monitored_leagues"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLiveMonitorSettingsSchema = createInsertSchema(liveMonitorSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLiveMonitorSettings = z.infer<typeof insertLiveMonitorSettingsSchema>;
export type LiveMonitorSettings = typeof liveMonitorSettings.$inferSelect;

// =====================================================
// MULTI-BOT SYSTEM TABLES
// =====================================================

// Bot Strategy Configurations - Define different bot strategies
export const botStrategies = pgTable("bot_strategies", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Bot identification
  strategyCode: text("strategy_code").notNull().unique(), // "home_favorite", "away_dominant", etc
  strategyName: text("strategy_name").notNull(),
  strategyDescription: text("strategy_description"),
  strategyIcon: text("strategy_icon"), // Lucide icon name
  strategyColor: text("strategy_color"), // Hex color for UI
  
  // Bot parameters (JSON)
  parameters: text("parameters").notNull(), // JSON with strategy-specific thresholds
  
  // Strategy type
  strategyType: text("strategy_type", {
    enum: ["pre_live", "live_ht", "live_ft", "live_late", "special"]
  }).notNull().default("live_ft"),
  
  // Timing windows (minutes range for live strategies)
  minMinute: decimal("min_minute", { precision: 3, scale: 0 }),
  maxMinute: decimal("max_minute", { precision: 3, scale: 0 }),
  
  // Required pressure/thresholds
  minPressureThreshold: decimal("min_pressure_threshold", { precision: 5, scale: 2 }),
  minConfidenceThreshold: decimal("min_confidence_threshold", { precision: 5, scale: 2 }).notNull().default("70"),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBotStrategySchema = createInsertSchema(botStrategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBotStrategy = z.infer<typeof insertBotStrategySchema>;
export type BotStrategy = typeof botStrategies.$inferSelect;

// Bot Signals - Individual signals generated by each bot
export const botSignals = pgTable("bot_signals", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Link to strategy
  strategyId: uuid("strategy_id").notNull().references(() => botStrategies.id),
  strategyCode: text("strategy_code").notNull(), // Denormalized for fast queries
  
  // Match info
  fixtureId: text("fixture_id").notNull(),
  league: text("league").notNull(),
  leagueId: text("league_id"),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  homeTeamLogo: text("home_team_logo"),
  awayTeamLogo: text("away_team_logo"),
  
  // Signal details
  signalType: text("signal_type", {
    enum: ["goal_ht", "goal_ft", "over_15", "over_25", "btts", "corners", "cards", "goal_now"]
  }).notNull(),
  market: text("market").notNull(), // "Over 0.5 FT", "Over 1.5 2º Tempo", etc
  predictedOutcome: text("predicted_outcome").notNull(),
  
  // Match state when signal was generated
  signalMinute: decimal("signal_minute", { precision: 3, scale: 0 }).notNull(),
  scoreWhenGenerated: text("score_when_generated").notNull(), // "0-0", "1-0", etc
  matchStatus: text("match_status").notNull(), // "1H", "2H", "HT"
  
  // Bot analysis metrics
  pressureIndex: decimal("pressure_index", { precision: 5, scale: 2 }),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }).notNull(),
  probabilityScore: decimal("probability_score", { precision: 5, scale: 2 }),
  
  // Analysis rationale (JSON)
  analysisData: text("analysis_data"), // JSON with pressure metrics, stats, etc
  
  // Suggested bet
  suggestedOdd: decimal("suggested_odd", { precision: 5, scale: 2 }),
  suggestedStake: decimal("suggested_stake", { precision: 3, scale: 1 }).notNull().default("1.0"),
  
  // Outcome tracking
  signalStatus: text("signal_status", {
    enum: ["pending", "hit", "miss", "void", "expired"]
  }).notNull().default("pending"),
  
  // Final match result
  finalScore: text("final_score"), // "2-1"
  resultAtExpiry: text("result_at_expiry"), // Score when signal window expired
  
  // Timing for outcome validation
  expiresAt: timestamp("expires_at"), // When to check outcome
  resolvedAt: timestamp("resolved_at"),
  
  // Was published to users?
  isPublished: boolean("is_published").notNull().default(false),
  publishedTipId: uuid("published_tip_id").references(() => tips.id),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBotSignalSchema = createInsertSchema(botSignals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBotSignal = z.infer<typeof insertBotSignalSchema>;
export type BotSignal = typeof botSignals.$inferSelect;

// Bot Performance Stats - Aggregated performance per strategy per period
export const botPerformanceStats = pgTable("bot_performance_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Link to strategy
  strategyId: uuid("strategy_id").notNull().references(() => botStrategies.id),
  strategyCode: text("strategy_code").notNull(),
  
  // Period
  periodType: text("period_type", {
    enum: ["daily", "weekly", "monthly", "all_time"]
  }).notNull(),
  periodDate: text("period_date").notNull(), // "2024-12-01", "2024-W48", "2024-12", "all"
  
  // Counts
  totalSignals: decimal("total_signals", { precision: 6, scale: 0 }).notNull().default("0"),
  hitCount: decimal("hit_count", { precision: 6, scale: 0 }).notNull().default("0"),
  missCount: decimal("miss_count", { precision: 6, scale: 0 }).notNull().default("0"),
  voidCount: decimal("void_count", { precision: 6, scale: 0 }).notNull().default("0"),
  pendingCount: decimal("pending_count", { precision: 6, scale: 0 }).notNull().default("0"),
  
  // Percentages
  hitRate: decimal("hit_rate", { precision: 5, scale: 2 }).notNull().default("0"), // % of hits
  roi: decimal("roi", { precision: 7, scale: 2 }).notNull().default("0"), // Return on investment
  avgConfidence: decimal("avg_confidence", { precision: 5, scale: 2 }).notNull().default("0"),
  avgOdd: decimal("avg_odd", { precision: 5, scale: 2 }).notNull().default("0"),
  
  // Profit/Loss tracking (assuming 1 unit per signal)
  totalProfit: decimal("total_profit", { precision: 10, scale: 2 }).notNull().default("0"),
  totalLoss: decimal("total_loss", { precision: 10, scale: 2 }).notNull().default("0"),
  netProfit: decimal("net_profit", { precision: 10, scale: 2 }).notNull().default("0"),
  
  // Streaks
  currentStreak: decimal("current_streak", { precision: 4, scale: 0 }).notNull().default("0"), // positive = wins, negative = losses
  longestWinStreak: decimal("longest_win_streak", { precision: 4, scale: 0 }).notNull().default("0"),
  longestLossStreak: decimal("longest_loss_streak", { precision: 4, scale: 0 }).notNull().default("0"),
  
  // League breakdown (JSON)
  leagueBreakdown: text("league_breakdown"), // JSON with per-league stats
  
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBotPerformanceStatsSchema = createInsertSchema(botPerformanceStats).omit({
  id: true,
  updatedAt: true,
});

export type InsertBotPerformanceStats = z.infer<typeof insertBotPerformanceStatsSchema>;
export type BotPerformanceStats = typeof botPerformanceStats.$inferSelect;

// =====================================================
// TIP ANALYSIS & EV TABLES
// =====================================================

// Tip Analyses - Detailed analysis for each tip (1:1 with tips)
export const tipAnalyses = pgTable("tip_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  tipId: uuid("tip_id").notNull().references(() => tips.id, { onDelete: "cascade" }),
  fixtureId: text("fixture_id"),
  
  // Goals Analysis Section
  goalsAnalysis: text("goals_analysis"), // JSON: { over15Pct, over25Pct, over35Pct, avgGoals, reasoning }
  
  // Corners Analysis Section
  cornersAnalysis: text("corners_analysis"), // JSON: { over85Pct, over95Pct, avgCorners, reasoning }
  
  // H2H (Head-to-Head) Section
  h2hAnalysis: text("h2h_analysis"), // JSON: { totalMatches, homeWins, awayWins, draws, avgGoals, trends, reasoning }
  
  // Climate/Weather Impact
  climateAnalysis: text("climate_analysis"), // JSON: { temperature, humidity, windSpeed, condition, impact, reasoning }
  
  // Tactical Insights Section
  tacticalInsights: text("tactical_insights"), // JSON array: [{ title, description, highlighted }]
  
  // Final Recommendation
  finalRecommendation: text("final_recommendation"), // Summary text with market suggestions
  
  // Data Sources & Metadata
  dataSources: text("data_sources"), // JSON array: ["API-Football", "Historical Data", etc]
  analysisVersion: text("analysis_version").notNull().default("1.0"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTipAnalysisSchema = createInsertSchema(tipAnalyses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTipAnalysis = z.infer<typeof insertTipAnalysisSchema>;
export type TipAnalysis = typeof tipAnalyses.$inferSelect;

// Tip Market Recommendations - Multiple EV-backed market suggestions per tip (1:N with tips)
export const tipMarketRecommendations = pgTable("tip_market_recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  tipId: uuid("tip_id").notNull().references(() => tips.id, { onDelete: "cascade" }),
  analysisId: uuid("analysis_id").references(() => tipAnalyses.id, { onDelete: "cascade" }),
  
  // Market Details
  marketType: text("market_type").notNull(), // "over_25", "btts_yes", "home_win", "corners_over_85", etc
  marketLabel: text("market_label").notNull(), // "Mais de 2.5 Gols", "Ambas Marcam - Sim", etc
  selection: text("selection").notNull(), // The actual bet selection
  
  // Odds & Probabilities
  bookmakerOdd: decimal("bookmaker_odd", { precision: 5, scale: 2 }).notNull(), // Odd from bookmaker (e.g., 1.85)
  modelProbability: decimal("model_probability", { precision: 5, scale: 2 }).notNull(), // Our calculated probability (0-100)
  fairOdd: decimal("fair_odd", { precision: 5, scale: 2 }).notNull(), // Fair odd = 100 / probability
  
  // Expected Value
  evPercent: decimal("ev_percent", { precision: 6, scale: 2 }).notNull(), // EV% = ((prob/100 * odd) - 1) * 100
  evRating: text("ev_rating", { enum: ["negative", "neutral", "positive", "excellent"] }).notNull().default("neutral"),
  
  // Stake Recommendation
  suggestedStake: decimal("suggested_stake", { precision: 3, scale: 1 }).notNull().default("1.0"), // Units to stake
  kellyStake: decimal("kelly_stake", { precision: 5, scale: 2 }), // Kelly criterion stake
  
  // Reasoning
  rationale: text("rationale"), // JSON array: ["Strong home form", "H2H favors over", etc]
  confidenceLevel: text("confidence_level", { enum: ["low", "medium", "high", "very_high"] }).notNull().default("medium"),
  
  // Status
  isMainPick: boolean("is_main_pick").notNull().default(false), // Is this the primary recommendation?
  isValueBet: boolean("is_value_bet").notNull().default(false), // EV > 5%?
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTipMarketRecommendationSchema = createInsertSchema(tipMarketRecommendations).omit({
  id: true,
  createdAt: true,
});

export type InsertTipMarketRecommendation = z.infer<typeof insertTipMarketRecommendationSchema>;
export type TipMarketRecommendation = typeof tipMarketRecommendations.$inferSelect;

// Zod schemas for JSON fields
export const goalsAnalysisSchema = z.object({
  over15Pct: z.number(),
  over25Pct: z.number(),
  over35Pct: z.number(),
  avgGoalsHome: z.number(),
  avgGoalsAway: z.number(),
  avgGoalsTotal: z.number(),
  reasoning: z.string(),
});

export const cornersAnalysisSchema = z.object({
  over85Pct: z.number(),
  over95Pct: z.number(),
  over105Pct: z.number(),
  avgCornersHome: z.number(),
  avgCornersAway: z.number(),
  avgCornersTotal: z.number(),
  reasoning: z.string(),
});

export const h2hAnalysisSchema = z.object({
  totalMatches: z.number(),
  homeWins: z.number(),
  awayWins: z.number(),
  draws: z.number(),
  avgGoals: z.number(),
  avgCorners: z.number().optional(),
  lastResults: z.array(z.object({
    date: z.string(),
    homeGoals: z.number(),
    awayGoals: z.number(),
    winner: z.enum(["home", "away", "draw"]),
  })).optional(),
  trends: z.array(z.string()),
  reasoning: z.string(),
});

export const climateAnalysisSchema = z.object({
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  windSpeed: z.number().optional(),
  condition: z.string().optional(),
  impact: z.enum(["none", "low", "medium", "high"]),
  reasoning: z.string(),
});

export const tacticalInsightSchema = z.object({
  title: z.string(),
  description: z.string(),
  highlighted: z.boolean().optional(),
  sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
});

export type GoalsAnalysis = z.infer<typeof goalsAnalysisSchema>;
export type CornersAnalysis = z.infer<typeof cornersAnalysisSchema>;
export type H2HAnalysis = z.infer<typeof h2hAnalysisSchema>;
export type ClimateAnalysis = z.infer<typeof climateAnalysisSchema>;
export type TacticalInsight = z.infer<typeof tacticalInsightSchema>;
