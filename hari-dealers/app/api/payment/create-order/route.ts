import { NextResponse } from 'next/server';
import { razorpayService } from '@/lib/payments/razorpay';

export async function POST(req: Request) {
  try {
    const { amount, receipt, notes } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid payment amount is required' }, { status: 400 });
    }

    // Razorpay requires amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    const result = await razorpayService.createOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    });

    if (!result.success || !result.order) {
      return NextResponse.json({ error: result.error || 'Failed to create Razorpay order' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      keyId: razorpayService.getKeyId(),
      orderId: result.order.id,
      amount: result.order.amount,
      currency: result.order.currency,
      isConfigured: razorpayService.isConfigured(),
    });
  } catch (err: any) {
    console.error('Create order error:', err);
    return NextResponse.json({ error: err?.message || 'Server error creating payment' }, { status: 500 });
  }
}
