import { NextResponse } from 'next/server';
import { razorpayService } from '@/lib/payments/razorpay';
import { getAuthenticatedCustomer } from '@/lib/supabase/request-auth';

export async function POST(req: Request) {
  try {
    const customer = await getAuthenticatedCustomer(req);
    if (!customer) return NextResponse.json({ error: 'Please login with Google to place your order.' }, { status: 401 });
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_number } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || typeof order_number !== 'string') {
      return NextResponse.json({ error: 'Missing payment signature verification parameters' }, { status: 400 });
    }

    const isValid = razorpayService.verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature. Payment verification failed.' },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } = await customer.supabase.from('orders')
      .select('id, payment_method').eq('order_number', order_number).eq('user_id', customer.user.id).single();
    if (orderError || !order) return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    if (order.payment_method !== 'online') return NextResponse.json({ success: false, error: 'This order does not require online payment.' }, { status: 400 });
    const isMockPayment = String(razorpay_order_id).startsWith('order_mock_');
    if (!isMockPayment) {
      const { data: payment } = await customer.supabase.from('payments').select('id')
        .eq('order_id', order.id).eq('gateway_order_id', razorpay_order_id).maybeSingle();
      if (!payment) return NextResponse.json({ success: false, error: 'Payment does not match this order.' }, { status: 400 });
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'Mock payments are disabled in production.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const { error: updateError } = await customer.supabase.from('orders')
      .update({ payment_status: 'paid', order_status: 'confirmed' }).eq('id', order.id);
    if (updateError) return NextResponse.json({ success: false, error: 'Could not update order payment.' }, { status: 500 });
    const { error: paymentUpdateError } = await customer.supabase.from('payments').update({ status: 'paid', gateway_payment_id: razorpay_payment_id, paid_at: now })
      .eq('order_id', order.id).eq('gateway_order_id', razorpay_order_id);
    if (paymentUpdateError && !isMockPayment) return NextResponse.json({ success: false, error: 'Could not update payment record.' }, { status: 500 });
    const { error: historyError } = await customer.supabase.from('order_status_history').insert({
      order_id: order.id,
      status: 'confirmed',
      message: 'Payment verified successfully.',
    });
    if (historyError) console.error('Could not record payment history:', historyError);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (err: any) {
    console.error('Payment verify error:', err);
    return NextResponse.json({ error: err?.message || 'Server error verifying payment' }, { status: 500 });
  }
}
