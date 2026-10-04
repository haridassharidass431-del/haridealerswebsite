import { NextResponse } from 'next/server';
import { INITIAL_COUPONS } from '@/lib/data/initialData';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const coupon = INITIAL_COUPONS.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.is_active
    );

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 404 });
    }

    if (subtotal && subtotal < coupon.minimum_order_amount) {
      return NextResponse.json({
        error: `Minimum order amount of ₹${coupon.minimum_order_amount} required to use this coupon.`,
      }, { status: 400 });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = ((subtotal || coupon.minimum_order_amount) * coupon.discount_value) / 100;
      if (coupon.maximum_discount && discount > coupon.maximum_discount) {
        discount = coupon.maximum_discount;
      }
    } else {
      discount = coupon.discount_value;
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      calculated_discount: Math.round(discount),
      description: coupon.description,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error validating coupon' }, { status: 500 });
  }
}
