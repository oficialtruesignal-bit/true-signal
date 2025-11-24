import { db } from "./db";
import { profiles, tips, type InsertProfile, type Profile, type InsertTip, type Tip } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Profile/Auth methods
  getProfileById(id: string): Promise<Profile | undefined>;
  getProfileByEmail(email: string): Promise<Profile | undefined>;
  createProfile(profile: Omit<InsertProfile, 'passwordHash'> & { password: string }): Promise<Profile>;
  verifyPassword(email: string, password: string): Promise<Profile | null>;

  // Tips methods
  getAllTips(): Promise<Tip[]>;
  getTipById(id: string): Promise<Tip | undefined>;
  createTip(tip: InsertTip): Promise<Tip>;
  updateTipStatus(id: string, status: 'pending' | 'green' | 'red'): Promise<Tip | undefined>;
  deleteTip(id: string): Promise<void>;
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

  async createProfile(data: Omit<InsertProfile, 'passwordHash'> & { password: string }): Promise<Profile> {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const [profile] = await db
      .insert(profiles)
      .values({
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        role: data.role || 'user',
        subscriptionStatus: data.subscriptionStatus || 'free',
      })
      .returning();
    return profile;
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
}

export const storage = new DatabaseStorage();
