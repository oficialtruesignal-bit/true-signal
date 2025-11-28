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
   * Create a subscription plan for Vantage Prime
   * BLACK FRIDAY: R$ 99,87 → R$ 47,90 (52% OFF) with 15-day trial
   */
  async createSubscriptionPlan(): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Mercado Pago not configured');
    }

    const planData: CreateSubscriptionPlanParams = {
      reason: 'Vantage Prime - Assinatura Mensal (BLACK FRIDAY)',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 47.90,
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
      reason: 'Vantage Prime - Assinatura Mensal',
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
   * Create a payment preference with PIX and other payment methods
   * Supports: PIX, Credit Card, Debit Card, Bank Slip
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

    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://localhost:5000';

    const preferenceData = {
      items: [
        {
          id: 'vantage-prime-monthly',
          title: params.title,
          description: 'Acesso mensal à plataforma Vantage Prime com sinais de apostas esportivas',
          category_id: 'services',
          unit_price: params.amount,
          quantity: params.quantity,
          currency_id: 'BRL',
        },
      ],
      payer: {
        email: params.userEmail,
      },
      external_reference: params.userId,
      back_urls: {
        success: `${baseUrl}/obrigado`,
        failure: `${baseUrl}/checkout/failure`,
        pending: `${baseUrl}/obrigado`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      payment_methods: {
        excluded_payment_types: [],
        installments: 1,
        default_installments: 1,
      },
      statement_descriptor: 'VANTAGE PRIME',
      binary_mode: false,
    };

    try {
      const response = await axios.post(
        `${MP_API_BASE_URL}/checkout/preferences`,
        preferenceData,
        { headers: this.headers }
      );

      console.log('✅ Payment preference created with PIX enabled:', response.data.id);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating preference:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a PIX payment directly (instant payment - transparent checkout)
   */
  async createPixPayment(params: {
    amount: number;
    userId: string;
    userEmail: string;
    description: string;
    firstName?: string;
    lastName?: string;
    document?: string;
  }): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Mercado Pago not configured');
    }

    const paymentData: any = {
      transaction_amount: params.amount,
      description: params.description,
      payment_method_id: 'pix',
      payer: {
        email: params.userEmail,
        first_name: params.firstName || 'Usuario',
        last_name: params.lastName || 'Vantage',
      },
      external_reference: params.userId,
      notification_url: process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}/api/mercadopago/webhook`
        : 'http://localhost:5000/api/mercadopago/webhook',
    };

    // Add CPF if provided
    if (params.document) {
      paymentData.payer.identification = {
        type: 'CPF',
        number: params.document,
      };
    }

    // Generate unique idempotency key for this payment
    const idempotencyKey = `pix-${params.userId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    try {
      const response = await axios.post(
        `${MP_API_BASE_URL}/v1/payments`,
        paymentData,
        { 
          headers: {
            ...this.headers,
            'X-Idempotency-Key': idempotencyKey,
          }
        }
      );

      console.log('✅ PIX payment created:', response.data.id);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating PIX payment:', error.response?.data || error.message);
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

  /**
   * Create a card payment (transparent checkout with tokenized card)
   */
  async createCardPayment(params: {
    token: string;
    issuerId: string;
    paymentMethodId: string;
    transactionAmount: number;
    installments: number;
    userId: string;
    userEmail: string;
    payer: {
      email: string;
      identification: {
        type: string;
        number: string;
      };
    };
  }): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Mercado Pago not configured');
    }

    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://localhost:5000';

    const paymentData = {
      token: params.token,
      issuer_id: params.issuerId,
      payment_method_id: params.paymentMethodId,
      transaction_amount: params.transactionAmount,
      installments: params.installments,
      description: 'Vantage Prime - Assinatura Mensal',
      payer: {
        email: params.payer.email,
        identification: params.payer.identification,
      },
      external_reference: params.userId,
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      statement_descriptor: 'VANTAGE PRIME',
      binary_mode: false,
    };

    // Generate unique idempotency key for this payment
    const idempotencyKey = `card-${params.userId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    try {
      const response = await axios.post(
        `${MP_API_BASE_URL}/v1/payments`,
        paymentData,
        { 
          headers: {
            ...this.headers,
            'X-Idempotency-Key': idempotencyKey,
          }
        }
      );

      console.log('✅ Card payment created:', response.data.id, 'Status:', response.data.status);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating card payment:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Singleton instance
export const mercadoPagoService = new MercadoPagoService();
