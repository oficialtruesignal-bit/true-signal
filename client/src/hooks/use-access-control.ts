import { useAuth } from './use-auth';
import { differenceInCalendarDays, differenceInHours } from 'date-fns';

const TRIAL_DAYS = 15;
const TRIAL_HOURS = TRIAL_DAYS * 24; // 360 hours = 15 full days

export function useAccessControl() {
  const { user } = useAuth();
  
  if (!user) {
    return {
      daysRemaining: 0,
      isLocked: true,
      canSeeAllTips: false,
      isPremium: false,
      isTrial: false,
      isExpired: true,
    };
  }
  
  const isPremium = user.subscriptionStatus === 'active';
  const isTrial = user.subscriptionStatus === 'trial';
  const isExpired = user.subscriptionStatus === 'expired';
  
  // Premium users (subscriptionStatus === 'active') have full access
  if (isPremium) {
    return {
      daysRemaining: 999,
      isLocked: false,
      canSeeAllTips: true,
      isPremium: true,
      isTrial: false,
      isExpired: false,
    };
  }
  
  // Expired users are locked out
  if (isExpired) {
    return {
      daysRemaining: 0,
      isLocked: true,
      canSeeAllTips: false,
      isPremium: false,
      isTrial: false,
      isExpired: true,
    };
  }
  
  // Trial users: calculate days remaining
  // Use trial_start_date if available, fallback to created_at
  const trialStartDate = new Date(user.trialStartDate || user.createdAt);
  const now = new Date();
  
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
    isLocked,
    canSeeAllTips: false, // Trial users see only 1 tip
    isPremium: false,
    isTrial: true,
    isExpired: false,
  };
}
