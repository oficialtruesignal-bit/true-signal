// Facebook Pixel and Google Analytics tracking utilities

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    gtag: (...args: any[]) => void;
  }
}

// Facebook Pixel Events
export const fbPixel = {
  // Standard Events
  pageView: () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  },
  
  // User Registration
  completeRegistration: (data?: { content_name?: string; currency?: string; value?: number }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'CompleteRegistration', data);
    }
  },
  
  // User Login
  login: () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', 'Login');
    }
  },
  
  // View Content (viewing a specific page/product)
  viewContent: (data: { content_name: string; content_category?: string; content_ids?: string[]; value?: number; currency?: string }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', data);
    }
  },
  
  // Initiate Checkout
  initiateCheckout: (data?: { content_ids?: string[]; num_items?: number; value?: number; currency?: string }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        currency: 'BRL',
        value: 49.93,
        ...data
      });
    }
  },
  
  // Add Payment Info
  addPaymentInfo: (data?: { content_category?: string; content_ids?: string[]; currency?: string; value?: number }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddPaymentInfo', {
        currency: 'BRL',
        ...data
      });
    }
  },
  
  // Purchase (Subscription completed)
  purchase: (data: { value: number; currency?: string; content_name?: string; content_ids?: string[] }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        currency: 'BRL',
        ...data
      });
    }
  },
  
  // Start Trial
  startTrial: (data?: { value?: number; currency?: string; predicted_ltv?: number }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'StartTrial', {
        currency: 'BRL',
        value: 0,
        ...data
      });
    }
  },
  
  // Subscribe
  subscribe: (data: { value: number; currency?: string; predicted_ltv?: number }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Subscribe', {
        currency: 'BRL',
        ...data
      });
    }
  },
  
  // Lead (user shows interest)
  lead: (data?: { content_name?: string; content_category?: string; value?: number; currency?: string }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', data);
    }
  },
  
  // Custom event
  custom: (eventName: string, data?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', eventName, data);
    }
  }
};

// Google Analytics 4 Events
export const ga4 = {
  // Page View (usually automatic, but can be manual for SPAs)
  pageView: (pagePath: string, pageTitle?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle
      });
    }
  },
  
  // User Registration
  signUp: (method?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sign_up', {
        method: method || 'email'
      });
    }
  },
  
  // User Login
  login: (method?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'login', {
        method: method || 'email'
      });
    }
  },
  
  // View Item (tip, signal)
  viewItem: (item: { item_id: string; item_name: string; item_category?: string; price?: number }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'BRL',
        items: [item]
      });
    }
  },
  
  // Begin Checkout
  beginCheckout: (value: number, items?: any[]) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'BRL',
        value: value,
        items: items || [{ item_id: 'true_signal_prime', item_name: 'True Signal Prime', price: value }]
      });
    }
  },
  
  // Add Payment Info
  addPaymentInfo: (value: number, paymentType?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_payment_info', {
        currency: 'BRL',
        value: value,
        payment_type: paymentType
      });
    }
  },
  
  // Purchase
  purchase: (transactionId: string, value: number, items?: any[]) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        currency: 'BRL',
        value: value,
        items: items || [{ item_id: 'true_signal_prime', item_name: 'True Signal Prime', price: value }]
      });
    }
  },
  
  // Generate Lead
  generateLead: (value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'generate_lead', {
        currency: 'BRL',
        value: value || 0
      });
    }
  },
  
  // Custom Event
  event: (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }
  },
  
  // Set User ID (for cross-device tracking)
  setUserId: (userId: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-MV7TWK7WWN', {
        user_id: userId
      });
    }
  }
};

// Combined tracking helper
export const analytics = {
  // Track registration on both platforms
  trackRegistration: (email?: string) => {
    fbPixel.completeRegistration({ content_name: 'True Signal Prime' });
    ga4.signUp('email');
  },
  
  // Track login on both platforms
  trackLogin: () => {
    fbPixel.login();
    ga4.login('email');
  },
  
  // Track checkout initiation
  trackCheckoutStart: () => {
    fbPixel.initiateCheckout({ value: 49.93, currency: 'BRL' });
    ga4.beginCheckout(49.93);
  },
  
  // Track successful purchase/subscription
  trackPurchase: (transactionId: string, value: number) => {
    fbPixel.purchase({ value, content_name: 'True Signal Prime' });
    fbPixel.subscribe({ value });
    ga4.purchase(transactionId, value);
  },
  
  // Track trial start
  trackTrialStart: () => {
    fbPixel.startTrial({ value: 0 });
    fbPixel.lead({ content_name: 'Trial Start' });
    ga4.generateLead(0);
  },
  
  // Track page view
  trackPageView: (pagePath: string, pageTitle?: string) => {
    fbPixel.pageView();
    ga4.pageView(pagePath, pageTitle);
  },
  
  // Set user for tracking
  setUser: (userId: string) => {
    ga4.setUserId(userId);
  }
};
