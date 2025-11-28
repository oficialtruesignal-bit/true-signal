import { useAuth } from './use-auth';
import { differenceInCalendarDays, differenceInHours } from 'date-fns';

const TRIAL_DAYS = 15;
const TRIAL_HOURS = TRIAL_DAYS * 24; // 360 hours = 15 full days

export function useAccessControl() {
  const { user } = useAuth();
  
  if (!user) {
    return {
      daysRemaining: 0,
      subscriptionDaysRemaining: 0,
      isLocked: true,
      canSeeAllTips: false,
      isPremium: false,
      isTrial: false,
      isExpired: true,
      subscriptionEndsAt: null,
    };
  }
  
  const isPremium = user.subscriptionStatus === 'active';
  const isTrial = user.subscriptionStatus === 'trial';
  const isExpired = user.subscriptionStatus === 'expired';
  const now = new Date();
  
  // Premium users (subscriptionStatus === 'active') have full access
  if (isPremium) {
    // Calculate days remaining in subscription using precise timestamp comparison
    let subscriptionDaysRemaining = 30; // Default
    let subscriptionHasExpired = false;
    
    if (user.subscriptionEndsAt) {
      const endsAt = new Date(user.subscriptionEndsAt);
      
      // Use precise timestamp comparison (not calendar days)
      // Subscription is only expired when current time is PAST the end timestamp
      subscriptionHasExpired = now.getTime() >= endsAt.getTime();
      
      // Calculate days remaining for display (round up to give full day credit)
      const hoursRemaining = differenceInHours(endsAt, now);
      subscriptionDaysRemaining = Math.max(0, Math.ceil(hoursRemaining / 24));
      
      // If subscription has expired, treat as expired user
      if (subscriptionHasExpired) {
        return {
          daysRemaining: 0,
          subscriptionDaysRemaining: 0,
          isLocked: true,
          canSeeAllTips: false,
          isPremium: false,
          isTrial: false,
          isExpired: true,
          subscriptionEndsAt: user.subscriptionEndsAt,
        };
      }
    }
    
    return {
      daysRemaining: subscriptionDaysRemaining,
      subscriptionDaysRemaining,
      isLocked: false,
      canSeeAllTips: true,
      isPremium: true,
      isTrial: false,
      isExpired: false,
      subscriptionEndsAt: user.subscriptionEndsAt,
    };
  }
  
  // Expired users are locked out
  if (isExpired) {
    return {
      daysRemaining: 0,
      subscriptionDaysRemaining: 0,
      isLocked: true,
      canSeeAllTips: false,
      isPremium: false,
      isTrial: false,
      isExpired: true,
      subscriptionEndsAt: user.subscriptionEndsAt,
    };
  }
  
  // Trial users: calculate days remaining
  // Use trial_start_date if available, fallback to created_at
  const trialStartDate = new Date(user.trialStartDate || user.createdAt);
  
  // Calculate hours elapsed for precise 15×24h trial window
  const hoursElapsed = differenceInHours(now, trialStartDate);
  
  // Calculate calendar days for display purposes
  const daysElapsed = differenceInCalendarDays(now, trialStartDate);
  const daysRemaining = Math.max(0, TRIAL_DAYS - daysElapsed);
  
  // Lock when 360 hours (15 full days) have elapsed
  // This ensures users get exactly 15×24h of access regardless of signup time
  const isLocked = hoursElapsed >= TRIAL_HOURS;
  
  return {
    daysRemaining,
    subscriptionDaysRemaining: 0,
    isLocked,
    canSeeAllTips: false, // Trial users see limited tips
    isPremium: false,
    isTrial: true,
    isExpired: false,
    subscriptionEndsAt: null,
  };
}
