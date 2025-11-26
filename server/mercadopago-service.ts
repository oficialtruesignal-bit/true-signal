import axios from 'axios';

const MP_API_BASE_URL = 'https://api.mercadopago.com';

interface MercadoPagoConfig {
  accessToken: string;
  publicKey: string;
}

interface CreateSubscriptionPlanParams {
  reason: string;
  autoRecurring: {
    frequency: number;
    frequencyType: 'months' | 'days' | 'weeks';
    transactionAmount: number;
    currencyId: string;
    freeTrial?: {
      frequency: number;
      frequencyType: 'months' | 'days';
    };
  };
  backUrl: string;
}

interface CreateSubscriptionParams {
  preapprovalPlanId: string;
  reason: string;
  externalReference: string;
  payerEmail: string;
  cardTokenId?: string;
  backUrl: string;
  status: 'authorized' | 'pending';
}

export class MercadoPagoService {
  private config: MercadoPagoConfig;

  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;

    if (!accessToken || !publicKey) {
      console.warn('⚠️ Mercado Pago credentials not configured');
      this.config = { accessToken: '', publicKey: '' };
    } else {
      this.config = { accessToken, publicKey };
      console.log('✅ Mercado Pago service initialized');
    }
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.config.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  isConfigured(): boolean {
    return Boolean(this.config.accessToken && this.config.publicKey);
  }

  getPublicKey(): string {
    return this.config.publicKey;
  }

  /**
   * Create a subscription plan for Ocean Prime (R$ 99,87/month with 15-day trial)
   */
  async createSubscriptionPlan(): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Mercado Pago not configured');
    }

    const planData: CreateSubscriptionPlanParams = {
      reason: 'Ocean Prime - Assinatura Mensal',
      autoRecurring: {
        frequency: 1,
        frequencyType: 'months',
        transactionAmount: 99.87,
        currencyId: 'BRL',
        freeTrial: {
          frequency: 15,
          frequencyType: 'days',
        },
      },
      backUrl: process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}/app`
        : 'http://localhost:5000/app',
    };

    try {
      const response = await axios.post(
        `${MP_API_BASE_URL}/preapproval_plan`,
        planData,
        { headers: this.headers }
      );

      console.log('✅ Subscription plan created:', response.data.id);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating subscription plan:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a subscription for a user
   */
  async createSubscription(params: {
    planId: string;
    userEmail: string;
    userId: string;
  }): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Mercado Pago not configured');
    }

    const subscriptionData: CreateSubscriptionParams = {
      preapprovalPlanId: params.planId,
      reason: 'Ocean Prime - Assinatura Mensal',
      externalReference: params.userId,
      payerEmail: params.userEmail,
      backUrl: process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}/app`
        : 'http://localhost:5000/app',
      status: 'pending', // Will be authorized after payment
    };

    try {
      const response = await axios.post(
        `${MP_API_BASE_URL}/preapproval`,
        subscriptionData,
        { headers: this.headers }
      );

      console.log('✅ Subscription created:', response.data.id);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating subscription:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Mercado Pago not configured');
    }

    try {
      const response = await axios.get(
        `${MP_API_BASE_URL}/preapproval/${subscriptionId}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching subscription:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Mercado Pago not configured');
    }

    try {
      const response = await axios.put(
        `${MP_API_BASE_URL}/preapproval/${subscriptionId}`,
        { status: 'cancelled' },
        { headers: this.headers }
      );

      console.log('✅ Subscription cancelled:', subscriptionId);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error cancelling subscription:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Pause a subscription
   */
  async pauseSubscription(subscriptionId: string): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Mercado Pago not configured');
    }

    try {
      const response = await axios.put(
        `${MP_API_BASE_URL}/preapproval/${subscriptionId}`,
        { status: 'paused' },
        { headers: this.headers }
      );

      console.log('✅ Subscription paused:', subscriptionId);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error pausing subscription:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a payment preference (one-time checkout)
   * Useful for testing or one-time payments
   */
  async createPreference(params: {
    title: string;
    amount: number;
    quantity: number;
    userId: string;
    userEmail: string;
  }): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Mercado Pago not configured');
    }

    const preferenceData = {
      items: [
        {
          title: params.title,
          unit_price: params.amount,
          quantity: params.quantity,
        },
      ],
      payer: {
        email: params.userEmail,
      },
      external_reference: params.userId,
      back_urls: {
        success: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/checkout/success`,
        failure: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/checkout/failure`,
        pending: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/checkout/pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/api/mercadopago/webhook`,
    };

    try {
      const response = await axios.post(
        `${MP_API_BASE_URL}/checkout/preferences`,
        preferenceData,
        { headers: this.headers }
      );

      console.log('✅ Payment preference created:', response.data.id);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating preference:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Search payments by external reference (userId)
   */
  async searchPayments(externalReference: string): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Mercado Pago not configured');
    }

    try {
      const response = await axios.get(
        `${MP_API_BASE_URL}/v1/payments/search`,
        {
          params: {
            external_reference: externalReference,
            status: 'approved',
            limit: 50,
          },
          headers: this.headers,
        }
      );

      return response.data.results;
    } catch (error: any) {
      console.error('❌ Error searching payments:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Singleton instance
export const mercadoPagoService = new MercadoPagoService();
