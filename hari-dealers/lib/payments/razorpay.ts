import crypto from 'crypto';

export interface RazorpayOrderOptions {
  amount: number; // in paise (e.g. ₹999 = 99900)
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export const razorpayService = {
  getKeyId(): string {
    return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  },

  isConfigured(): boolean {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    return Boolean(
      keyId && 
      keySecret && 
      !keyId.includes('placeholder') && 
      !keySecret.includes('placeholder')
    );
  },

  // Create Razorpay Order on server
  async createOrder(options: RazorpayOrderOptions): Promise<{ success: boolean; order?: RazorpayOrderResponse; error?: string }> {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes('placeholder')) {
      // Return realistic mock response for local testing without live key
      return {
        success: true,
        order: {
          id: `order_mock_${Date.now()}`,
          entity: 'order',
          amount: options.amount,
          amount_paid: 0,
          amount_due: options.amount,
          currency: options.currency || 'INR',
          receipt: options.receipt,
          status: 'created',
          created_at: Math.floor(Date.now() / 1000),
        },
      };
    }

    try {
      const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          amount: Math.round(options.amount),
          currency: options.currency || 'INR',
          receipt: options.receipt,
          notes: options.notes || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        return { success: false, error: `Razorpay API error: ${errorData}` };
      }

      const orderData = await response.json();
      return { success: true, order: orderData };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create Razorpay order' };
    }
  },

  // Server-side HMAC SHA256 Signature Verification
  verifyPaymentSignature({
    orderId,
    paymentId,
    signature,
  }: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    // In mock mode without secret, permit mock verification
    if (!keySecret || keySecret.includes('placeholder')) {
      return signature.startsWith('mock_sig_') || signature.length > 10;
    }

    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    return expectedSignature === signature;
  },

  // Webhook Signature Verification
  verifyWebhookSignature({
    body,
    signature,
  }: {
    body: string;
    signature: string;
  }): boolean {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret || webhookSecret.includes('placeholder')) {
      return true; // Allow in local development
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  },
};
