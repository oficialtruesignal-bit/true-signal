import axios from 'axios';

const MP_API_BASE_URL = 'https://api.mercadopago.com';

interface MercadoPagoConfig {
  accessToken: string;
  publicKey: string;
}

interface CreateSubscriptionPlanParams {
  reason: string;
  auto_recurring: {
    frequency: number;
    frequency_type: 'months' | 'days' | 'weeks';
    transaction_amount: number;
    currency_id: string;
    free_trial?: {
      frequency: number;
      frequency_type: 'months' | 'days';
    };
  };
  back_url: string;
}

interface CreateSubscriptionParams {
  preapproval_plan_id: string;
  reason: string;
  external_reference: string;
  payer_email: string;
  back_url: string;
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
   * Create a subscription plan for Vantage Prime (R$ 2,00/month with 15-day trial)
   */
  async createSubscriptionPlan(): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Mercado Pago not configured');
    }

    const planData: CreateSubscriptionPlanParams = {
      reason: 'Vantage Prime - Assinatura Mensal',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 2.00,
        currency_id: 'BRL',
        free_trial: {
          frequency: 15,
          frequency_type: 'days',
        },
      },
      back_url: process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}/obrigado`
        : 'http://localhost:5000/obrigado',
    };

    try {
      const response = await axios.post(
        `${MP_API_BASE_URL}/preapproval_plan`,
        planData,
        { headers: this.headers }
      );

      console.log('✅ Subscription plan created:', response.data.id);
      console.log('📊 Plan response:', JSON.stringify(response.data, null, 2));
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
      preapproval_plan_id: params.planId,
      reason: 'Ocean Prime - Assinatura Mensal',
      external_reference: params.userId,
      payer_email: params.userEmail,
      back_url: process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}/obrigado`
        : 'http://localhost:5000/obrigado',
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
