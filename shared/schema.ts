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
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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
