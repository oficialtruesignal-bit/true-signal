import { db } from "./db";
import { profiles, tips, favorites, type InsertProfile, type Profile, type InsertTip, type Tip, type Favorite, type InsertFavorite } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Profile/Auth methods
  getProfileById(id: string): Promise<Profile | undefined>;
  getProfileByEmail(email: string): Promise<Profile | undefined>;
  getUserByEmail(email: string): Promise<Profile | undefined>; // Alias for getProfileByEmail
  createProfile(profile: Omit<InsertProfile, 'passwordHash'> & { password: string }): Promise<Profile>;
  upsertProfileFromSupabase(data: { id: string; email: string; firstName?: string }): Promise<Profile>;
  verifyPassword(email: string, password: string): Promise<Profile | null>;
  updateUserSubscription(userId: string, subscriptionData: {
    subscriptionStatus: 'trial' | 'active' | 'expired';
    mercadopagoSubscriptionId?: string | null;
    subscriptionActivatedAt?: Date | null;
    subscriptionEndsAt?: Date | null;
  }): Promise<Profile | undefined>;
  updateLegalAcceptance(userId: string, acceptanceData: {
    termsAcceptedAt?: Date;
    privacyAcceptedAt?: Date;
    riskDisclaimerAcceptedAt?: Date;
  }): Promise<Profile | undefined>;
  updateProfileBankroll(userId: string, bankrollData: {
    bankrollInitial: string;
    riskProfile: string;
    unitValue: string;
  }): Promise<Profile | undefined>;

  // Tips methods
  getAllTips(): Promise<Tip[]>;
  getTipById(id: string): Promise<Tip | undefined>;
  createTip(tip: InsertTip): Promise<Tip>;
  updateTipStatus(id: string, status: 'pending' | 'green' | 'red'): Promise<Tip | undefined>;
  deleteTip(id: string): Promise<void>;
  
  // Onboarding methods
  updateTourCompleted(userId: string, completed: boolean): Promise<Profile | undefined>;
  updatePreferredTheme(userId: string, theme: 'dark' | 'light'): Promise<Profile | undefined>;
  
  // Favorites methods
  getUserFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(userId: string, tipId: string): Promise<Favorite>;
  removeFavorite(userId: string, tipId: string): Promise<void>;
  isFavorite(userId: string, tipId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Profile/Auth methods
  async getProfileById(id: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async getProfileByEmail(email: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.email, email));
    return profile;
  }

  async getUserByEmail(email: string): Promise<Profile | undefined> {
    return this.getProfileByEmail(email);
  }

  async createProfile(data: Omit<InsertProfile, 'passwordHash'> & { password: string }): Promise<Profile> {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const now = new Date();
    const [profile] = await db
      .insert(profiles)
      .values({
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        role: data.role || 'user',
        subscriptionStatus: data.subscriptionStatus || 'trial',
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
        riskDisclaimerAcceptedAt: now,
      })
      .returning();
    return profile;
  }

  async upsertProfileFromSupabase(data: { id: string; email: string; firstName?: string }): Promise<Profile> {
    const existing = await this.getProfileById(data.id);
    
    if (existing) {
      return existing;
    }

    try {
      const now = new Date();
      const trialStartDate = now;

      const [profile] = await db
        .insert(profiles)
        .values({
          id: data.id,
          email: data.email,
          passwordHash: '',
          firstName: data.firstName || data.email.split('@')[0],
          role: 'user',
          subscriptionStatus: 'trial',
          trialStartDate: trialStartDate,
          termsAcceptedAt: now,
          privacyAcceptedAt: now,
          riskDisclaimerAcceptedAt: now,
        })
        .returning();
      
      console.log(`[STORAGE] Created new profile for Supabase user: ${data.email} with trial starting ${trialStartDate.toISOString()}`);
      return profile;
    } catch (error: any) {
      if (error.code === '23505') {
        const existingAfterError = await this.getProfileById(data.id);
        if (existingAfterError) {
          return existingAfterError;
        }
      }
      throw error;
    }
  }

  async verifyPassword(email: string, password: string): Promise<Profile | null> {
    const profile = await this.getProfileByEmail(email);
    if (!profile) {
      console.log(`[STORAGE] Profile not found for email: ${email}`);
      return null;
    }
    
    console.log(`[STORAGE] Verifying password for ${email}`);
    const match = await bcrypt.compare(password, profile.passwordHash);
    console.log(`[STORAGE] Password match result: ${match}`);
    
    if (!match) return null;
    
    return profile;
  }

  async updateUserSubscription(
    userId: string, 
    subscriptionData: {
      subscriptionStatus: 'trial' | 'active' | 'expired';
      mercadopagoSubscriptionId?: string | null;
      subscriptionActivatedAt?: Date | null;
      subscriptionEndsAt?: Date | null;
    }
  ): Promise<Profile | undefined> {
    const updateData: Partial<Profile> = {
      subscriptionStatus: subscriptionData.subscriptionStatus,
    };

    if (subscriptionData.mercadopagoSubscriptionId !== undefined) {
      updateData.mercadopagoSubscriptionId = subscriptionData.mercadopagoSubscriptionId;
    }

    if (subscriptionData.subscriptionActivatedAt !== undefined) {
      updateData.subscriptionActivatedAt = subscriptionData.subscriptionActivatedAt;
    }

    if (subscriptionData.subscriptionEndsAt !== undefined) {
      updateData.subscriptionEndsAt = subscriptionData.subscriptionEndsAt;
    }

    const [updatedProfile] = await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.id, userId))
      .returning();

    return updatedProfile;
  }

  async updateLegalAcceptance(
    userId: string,
    acceptanceData: {
      termsAcceptedAt?: Date;
      privacyAcceptedAt?: Date;
      riskDisclaimerAcceptedAt?: Date;
    }
  ): Promise<Profile | undefined> {
    const [updatedProfile] = await db
      .update(profiles)
      .set(acceptanceData)
      .where(eq(profiles.id, userId))
      .returning();

    return updatedProfile;
  }

  async updateProfileBankroll(
    userId: string,
    bankrollData: {
      bankrollInitial: string;
      riskProfile: string;
      unitValue: string;
    }
  ): Promise<Profile | undefined> {
    const [updatedProfile] = await db
      .update(profiles)
      .set({
        bankrollInitial: bankrollData.bankrollInitial,
        riskProfile: bankrollData.riskProfile as 'conservador' | 'moderado' | 'agressivo',
        unitValue: bankrollData.unitValue,
      })
      .where(eq(profiles.id, userId))
      .returning();

    return updatedProfile;
  }

  // Tips methods
  async getAllTips(): Promise<Tip[]> {
    return await db.select().from(tips).orderBy(desc(tips.createdAt));
  }

  async getTipById(id: string): Promise<Tip | undefined> {
    const [tip] = await db.select().from(tips).where(eq(tips.id, id));
    return tip;
  }

  async createTip(tip: InsertTip): Promise<Tip> {
    const [newTip] = await db.insert(tips).values(tip).returning();
    return newTip;
  }

  async updateTipStatus(id: string, status: 'pending' | 'green' | 'red'): Promise<Tip | undefined> {
    const [updatedTip] = await db
      .update(tips)
      .set({ status, updatedAt: new Date() })
      .where(eq(tips.id, id))
      .returning();
    return updatedTip;
  }

  async deleteTip(id: string): Promise<void> {
    await db.delete(tips).where(eq(tips.id, id));
  }

  // Onboarding methods
  async updateTourCompleted(userId: string, completed: boolean): Promise<Profile | undefined> {
    const [updatedProfile] = await db
      .update(profiles)
      .set({ hasCompletedTour: completed })
      .where(eq(profiles.id, userId))
      .returning();
    return updatedProfile;
  }

  async updatePreferredTheme(userId: string, theme: 'dark' | 'light'): Promise<Profile | undefined> {
    const [updatedProfile] = await db
      .update(profiles)
      .set({ preferredTheme: theme })
      .where(eq(profiles.id, userId))
      .returning();
    return updatedProfile;
  }

  // Favorites methods
  async getUserFavorites(userId: string): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
  }

  async addFavorite(userId: string, tipId: string): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values({ userId, tipId })
      .returning();
    return favorite;
  }

  async removeFavorite(userId: string, tipId: string): Promise<void> {
    await db.delete(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.tipId, tipId))
    );
  }

  async isFavorite(userId: string, tipId: string): Promise<boolean> {
    const [existing] = await db.select().from(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.tipId, tipId))
    );
    return !!existing;
  }
}

export const storage = new DatabaseStorage();
