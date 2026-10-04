import { NextResponse } from 'next/server';
import { razorpayService } from '@/lib/payments/razorpay';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    const isValid = razorpayService.verifyWebhookSignature({
      body: rawBody,
      signature,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log(`[RAZORPAY WEBHOOK RECEIVED] Event: ${event.event}`, event?.payload?.payment?.entity?.id);

    switch (event.event) {
      case 'payment.captured':
        // Webhook confirmed payment captured
        break;
      case 'payment.failed':
        // Webhook reported payment failure
        break;
      case 'order.paid':
        // Webhook reported full order payment
        break;
      default:
        break;
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err?.message || 'Webhook processing failed' }, { status: 500 });
  }
}
