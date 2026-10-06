import { NextResponse } from 'next/server';
import { calculateCheckoutOrder } from '@/lib/validation/checkout';
import { INITIAL_COUPONS } from '@/lib/data/initialData';
import { getCatalog } from '@/lib/catalog-server';
import { getAuthenticatedCustomer } from '@/lib/supabase/request-auth';
import { emailService } from '@/lib/email/emailService';
import { Order } from '@/types';

export async function POST(request: Request) {
  try {
    const customer = await getAuthenticatedCustomer(request);
    if (!customer) return NextResponse.json({ error: 'Please login with Google to place your order.' }, { status: 401 });

    const body = await request.json();
    const { items, coupon_code, shipping_address, payment_method, customer_name, customer_phone } = body;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required.' }, { status: 400 });
    }
    const phoneDigits = typeof customer_phone === 'string' ? customer_phone.replace(/\D/g, '') : '';
    if (
      !shipping_address?.address_line1?.trim() ||
      !shipping_address?.city?.trim() ||
      !shipping_address?.state?.trim() ||
      !/^\d{6}$/.test(String(shipping_address?.pincode || '')) ||
      !/^(?:91)?[6-9]\d{9}$/.test(phoneDigits)
    ) {
      return NextResponse.json({ error: 'A valid mobile number and delivery address are required.' }, { status: 400 });
    }

    const catalog = await getCatalog();
    if (!catalog) return NextResponse.json({ error: 'The product database is not configured.' }, { status: 503 });

    const calculation = calculateCheckoutOrder({
      items,
      coupon_code,
      delivery_threshold: 1499,
      standard_delivery_fee: 99,
      authoritativeProducts: catalog.products,
      authoritativeCoupons: INITIAL_COUPONS,
    });
    if (!calculation.valid) return NextResponse.json({ error: calculation.error || 'Cart validation failed.' }, { status: 400 });

    const fullName = String(customer_name || customer.profile.name || '').trim();
    const phone = String(customer_phone).trim();
    const address = { ...shipping_address, full_name: fullName, phone, is_default: true };
    await customer.supabase.from('profiles').update({ name: fullName, phone }).eq('id', customer.user.id);

    const orderNumber = `HD${Date.now().toString().slice(-8)}${Math.floor(10 + Math.random() * 90)}`;
    const { data: savedOrder, error: orderError } = await customer.supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: customer.user.id,
        customer_name: fullName,
        customer_email: customer.user.email,
        customer_phone: phone,
        subtotal: calculation.subtotal,
        discount: calculation.discount,
        coupon_code: calculation.couponApplied?.code || null,
        coupon_discount: calculation.coupon_discount,
        delivery_charge: calculation.delivery_charge,
        total_amount: calculation.total_amount,
        payment_method: payment_method === 'online' ? 'online' : 'cod',
        payment_status: 'pending',
        order_status: 'pending',
        shipping_address: address,
      })
      .select('*')
      .single();
    if (orderError || !savedOrder) throw orderError || new Error('Could not save order.');

    const itemRows = calculation.validatedItems.map((item) => ({
      order_id: savedOrder.id,
      product_id: item.product_id,
      product_name: item.product_name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      image_url: item.image_url,
    }));
    const [{ error: itemError }, { error: historyError }] = await Promise.all([
      customer.supabase.from('order_items').insert(itemRows),
      customer.supabase.from('order_status_history').insert({
        order_id: savedOrder.id,
        status: 'pending',
        message: payment_method === 'online' ? 'Order created; awaiting payment.' : 'Order placed with Cash on Delivery.',
      }),
    ]);
    if (itemError || historyError) {
      await customer.supabase.from('orders').delete().eq('id', savedOrder.id);
      throw itemError || historyError;
    }

    const orderRecord = {
      ...savedOrder,
      items: calculation.validatedItems.map((item, index) => ({ ...item, id: `item-${index}`, order_id: savedOrder.id })),
    } as Order;
    await Promise.all([
      emailService.send(emailService.orderConfirmation(orderRecord)),
      emailService.send(emailService.adminNewOrder(orderRecord)),
    ]);

    return NextResponse.json({ success: true, order: orderRecord }, { status: 201 });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err?.message || 'Server error processing checkout.' }, { status: 500 });
  }
}
