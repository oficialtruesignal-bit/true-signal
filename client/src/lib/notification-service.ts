import OneSignal from 'react-onesignal';

export const notificationService = {
  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    try {
      const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
      if (!appId) {
        console.log("OneSignal not configured, using browser notifications");
        
        // Fallback to browser notification API
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        }
        return false;
      }

      // Use browser notification API as OneSignal wrapper
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  },

  /**
   * Send a notification about a new betting tip
   * In production, this would be called from the backend after creating a tip
   */
  async sendNewTipNotification(tipData: {
    match: string;
    market: string;
    odd: number;
  }): Promise<void> {
    try {
      const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
      if (!appId) {
        console.log("OneSignal not configured, notification not sent");
        return;
      }

      // In production, this would be done via backend API
      // For now, we'll just log the notification
      console.log("📢 New Tip Notification:", {
        title: "Nova Oportunidade Identificada 🎯",
        message: `${tipData.match} - ${tipData.market} @ ${tipData.odd}`,
      });

      // Optional: Show browser notification for testing
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("Nova Oportunidade Identificada 🎯", {
          body: `${tipData.match} - ${tipData.market} @ ${tipData.odd}`,
          icon: "/favicon.ico",
          tag: "new-tip",
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  },

  /**
   * Check if notifications are enabled
   */
  async isEnabled(): Promise<boolean> {
    try {
      if ('Notification' in window) {
        return Notification.permission === 'granted';
      }
      return false;
    } catch (error) {
      return false;
    }
  },
};
