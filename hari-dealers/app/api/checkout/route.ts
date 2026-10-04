import { NextResponse } from 'next/server';
import { calculateCheckoutOrder } from '@/lib/validation/checkout';
import { INITIAL_COUPONS } from '@/lib/data/initialData';
import { getCatalog } from '@/lib/catalog-server';
import { emailService } from '@/lib/email/emailService';
import { Order } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, coupon_code, shipping_address, payment_method, customer_name, customer_email, customer_phone } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    if (!shipping_address || !shipping_address.address_line1 || !shipping_address.city || !shipping_address.pincode) {
      return NextResponse.json({ error: 'Valid shipping address is required' }, { status: 400 });
    }

    // Authoritative calculation on server
    const catalog = await getCatalog();
    const calc = calculateCheckoutOrder({
      items,
      coupon_code,
      delivery_threshold: 1499,
      standard_delivery_fee: 99,
      authoritativeProducts: catalog?.products || [],
      authoritativeCoupons: INITIAL_COUPONS,
    });

    if (!calc.valid) {
      return NextResponse.json({ error: calc.error || 'Cart validation failed' }, { status: 400 });
    }

    const orderNumber = `HD${Math.floor(1000 + Math.random() * 9000)}`;

    const orderRecord: Order = {
      id: `ord_${Date.now()}`,
      order_number: orderNumber,
      customer_name: customer_name || shipping_address.full_name,
      customer_email: customer_email || 'customer@example.com',
      customer_phone: customer_phone || shipping_address.phone,
      subtotal: calc.subtotal,
      discount: calc.discount,
      coupon_code: calc.couponApplied?.code,
      coupon_discount: calc.coupon_discount,
      delivery_charge: calc.delivery_charge,
      total_amount: calc.total_amount,
      payment_method: payment_method === 'online' ? 'online' : 'cod',
      payment_status: payment_method === 'online' ? 'pending' : 'pending',
      order_status: 'confirmed',
      shipping_address,
      items: calc.validatedItems.map((item, idx) => ({
        id: `oi_${Date.now()}_${idx}`,
        order_id: `ord_${Date.now()}`,
        product_id: item.product_id,
        product_name: item.product_name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        image_url: item.image_url,
      })),
      history: [
        {
          id: `h_${Date.now()}`,
          order_id: `ord_${Date.now()}`,
          status: 'confirmed',
          message: payment_method === 'online' ? 'Order initiated for online checkout' : 'Order placed via Cash on Delivery',
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Dispatch notifications
    await emailService.send(emailService.orderConfirmation(orderRecord));
    await emailService.send(emailService.adminNewOrder(orderRecord));

    return NextResponse.json({
      success: true,
      order: orderRecord,
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err?.message || 'Server error processing checkout' }, { status: 500 });
  }
}
