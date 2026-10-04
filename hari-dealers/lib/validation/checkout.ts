import { Product, Coupon } from '@/types';

export interface CheckoutCalculationInput {
  items: Array<{
    product_id: string;
    variant_id?: string;
    quantity: number;
    size: string;
    color: string;
  }>;
  coupon_code?: string;
  delivery_threshold?: number;
  standard_delivery_fee?: number;
  authoritativeProducts: Product[];
  authoritativeCoupons: Coupon[];
}

export interface CheckoutCalculationResult {
  valid: boolean;
  subtotal: number;
  discount: number;
  coupon_discount: number;
  delivery_charge: number;
  total_amount: number;
  validatedItems: Array<{
    product_id: string;
    product_name: string;
    size: string;
    color: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    image_url: string;
  }>;
  couponApplied?: {
    code: string;
    discount: number;
  };
  error?: string;
}

export function calculateCheckoutOrder(input: CheckoutCalculationInput): CheckoutCalculationResult {
  const {
    items,
    coupon_code,
    delivery_threshold = 1499,
    standard_delivery_fee = 99,
    authoritativeProducts,
    authoritativeCoupons,
  } = input;

  if (!items || items.length === 0) {
    return {
      valid: false,
      subtotal: 0,
      discount: 0,
      coupon_discount: 0,
      delivery_charge: 0,
      total_amount: 0,
      validatedItems: [],
      error: 'Shopping cart is empty',
    };
  }

  let subtotal = 0;
  let originalSubtotal = 0;
  const validatedItems: CheckoutCalculationResult['validatedItems'] = [];

  for (const item of items) {
    const product = authoritativeProducts.find((p) => p.id === item.product_id);
    if (!product) {
      return {
        valid: false,
        subtotal: 0,
        discount: 0,
        coupon_discount: 0,
        delivery_charge: 0,
        total_amount: 0,
        validatedItems: [],
        error: `Product with ID ${item.product_id} is no longer available.`,
      };
    }

    if (!product.is_active) {
      return {
        valid: false,
        subtotal: 0,
        discount: 0,
        coupon_discount: 0,
        delivery_charge: 0,
        total_amount: 0,
        validatedItems: [],
        error: `Product "${product.name}" is currently inactive.`,
      };
    }

    // Check inventory
    if (product.stock < item.quantity) {
      return {
        valid: false,
        subtotal: 0,
        discount: 0,
        coupon_discount: 0,
        delivery_charge: 0,
        total_amount: 0,
        validatedItems: [],
        error: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
      };
    }

    const unitPrice = product.offer_price > 0 ? product.offer_price : product.original_price;
    const itemTotal = unitPrice * item.quantity;
    
    subtotal += itemTotal;
    originalSubtotal += product.original_price * item.quantity;

    validatedItems.push({
      product_id: product.id,
      product_name: product.name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: itemTotal,
      image_url: product.images[0] || '/logo.jpg',
    });
  }

  const catalogDiscount = Math.max(0, originalSubtotal - subtotal);

  // Validate coupon
  let couponDiscount = 0;
  let couponApplied: CheckoutCalculationResult['couponApplied'] = undefined;

  if (coupon_code) {
    const coupon = authoritativeCoupons.find(
      (c) => c.code.toUpperCase() === coupon_code.trim().toUpperCase() && c.is_active
    );

    if (coupon) {
      const now = new Date();
      const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < now;
      const meetsMinOrder = !coupon.minimum_order_amount || subtotal >= coupon.minimum_order_amount;
      const withinUsageLimit = !coupon.usage_limit || coupon.used_count < coupon.usage_limit;

      if (!isExpired && meetsMinOrder && withinUsageLimit) {
        if (coupon.discount_type === 'percentage') {
          couponDiscount = (subtotal * coupon.discount_value) / 100;
          if (coupon.maximum_discount && couponDiscount > coupon.maximum_discount) {
            couponDiscount = coupon.maximum_discount;
          }
        } else {
          couponDiscount = Math.min(coupon.discount_value, subtotal);
        }

        couponDiscount = Math.round(couponDiscount);
        couponApplied = {
          code: coupon.code,
          discount: couponDiscount,
        };
      }
    }
  }

  const deliveryCharge = subtotal >= delivery_threshold ? 0 : standard_delivery_fee;
  const totalAmount = Math.max(0, subtotal - couponDiscount + deliveryCharge);

  return {
    valid: true,
    subtotal,
    discount: catalogDiscount,
    coupon_discount: couponDiscount,
    delivery_charge: deliveryCharge,
    total_amount: totalAmount,
    validatedItems,
    couponApplied,
  };
}
