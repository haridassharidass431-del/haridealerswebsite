import { NextResponse } from 'next/server';
import { razorpayService } from '@/lib/payments/razorpay';
import { getAuthenticatedCustomer } from '@/lib/supabase/request-auth';

export async function POST(req: Request) {
  try {
    const customer = await getAuthenticatedCustomer(req);
    if (!customer) return NextResponse.json({ error: 'Please login with Google to place your order.' }, { status: 401 });
    const { order_number } = await req.json();
    if (typeof order_number !== 'string') return NextResponse.json({ error: 'Order number is required.' }, { status: 400 });
    const { data: order, error: orderError } = await customer.supabase.from('orders')
      .select('id, order_number, total_amount, payment_method').eq('order_number', order_number).eq('user_id', customer.user.id).single();
    if (orderError || !order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    if (order.payment_method !== 'online') return NextResponse.json({ error: 'This order does not require online payment.' }, { status: 400 });

    // Razorpay requires amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(order.total_amount) * 100);

    const result = await razorpayService.createOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.order_number,
      notes: { order_number: order.order_number },
    });

    if (!result.success || !result.order) {
      return NextResponse.json({ error: result.error || 'Failed to create Razorpay order' }, { status: 500 });
    }

    const { error: paymentLogError } = await customer.supabase.from('payments').insert({
      order_id: order.id,
      gateway: 'razorpay',
      gateway_order_id: result.order.id,
      amount: Number(order.total_amount),
      currency: 'INR',
      status: 'pending',
    });
    if (paymentLogError) return NextResponse.json({ error: 'Could not save payment record.' }, { status: 500 });

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
