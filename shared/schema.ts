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
  fixtureId: text("fixture_id"), // ID from external Football API
  league: text("league").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  homeTeamLogo: text("home_team_logo"), // URL of home team logo
  awayTeamLogo: text("away_team_logo"), // URL of away team logo
  market: text("market").notNull(),
  odd: decimal("odd", { precision: 5, scale: 2 }).notNull(),
  status: text("status", { enum: ["pending", "green", "red"] }).notNull().default("pending"),
  betLink: text("bet_link"),
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
