import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';

const STORAGE_KEY = 'vantage_viewed_tips';

interface ViewedTips {
  [userId: string]: string[]; // userId -> array of viewed tip IDs
}

export function useUnreadTips(allTipIds: string[]) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || allTipIds.length === 0) {
      setUnreadCount(0);
      return;
    }

    // Get viewed tips from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    const viewedTips: ViewedTips = stored ? JSON.parse(stored) : {};
    const userViewedTips = viewedTips[user.id] || [];

    // Calculate unread count
    const unread = allTipIds.filter(id => !userViewedTips.includes(id));
    setUnreadCount(unread.length);
  }, [user, allTipIds]);

  const markAsViewed = (tipIds: string[]) => {
    if (!user) return;

    // Get current viewed tips
    const stored = localStorage.getItem(STORAGE_KEY);
    const viewedTips: ViewedTips = stored ? JSON.parse(stored) : {};
    const userViewedTips = viewedTips[user.id] || [];

    // Add new tip IDs (remove duplicates)
    const combined = [...userViewedTips, ...tipIds];
    const uniqueSet = new Set(combined);
    const updatedViewedTips = Array.from(uniqueSet);
    viewedTips[user.id] = updatedViewedTips;

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(viewedTips));

    // Update unread count
    const unread = allTipIds.filter(id => !updatedViewedTips.includes(id));
    setUnreadCount(unread.length);
  };

  const markAllAsViewed = () => {
    if (!user || allTipIds.length === 0) return;
    markAsViewed(allTipIds);
  };

  return {
    unreadCount,
    markAsViewed,
    markAllAsViewed,
  };
}
