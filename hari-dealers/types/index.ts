export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  display_order?: number;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Free Size';
  color: string;
  stock: number;
  sku?: string;
  price?: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  category_name?: string;
  variety?: string;
  original_price: number;
  offer_price: number;
  discount_percentage: number;
  stock: number;
  is_offer: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_active: boolean;
  is_admin_uploaded?: boolean;
  sku?: string;
  images: string[];
  variants?: ProductVariant[];
  rating?: number;
  reviews_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  variant_id?: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  product: Product;
  created_at: string;
}

export interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancel_requested'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type PaymentMethod = 'online' | 'cod';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  variant_id?: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  order_id: string;
  status: OrderStatus;
  message: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  discount: number;
  coupon_code?: string;
  coupon_discount: number;
  delivery_charge: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  shipping_address: Address;
  courier_name?: string;
  tracking_number?: string;
  tracking_url?: string;
  cancellation_reason?: string;
  return_reason?: string;
  items: OrderItem[];
  history?: OrderStatusHistoryItem[];
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount?: number;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
  start_date: string;
  expiry_date?: string;
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  product_id: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment: string;
  image_url?: string;
  is_approved: boolean;
  created_at: string;
}

export interface AdminSettings {
  id: string;
  store_name: string;
  store_email: string;
  store_phone: string;
  logo_url: string;
  currency: string;
  cod_enabled: boolean;
  online_payment_enabled: boolean;
  delivery_charge: number;
  free_delivery_threshold: number;
  return_period_days: number;
}

export interface OfferBanner {
  id: string;
  title: string;
  subtitle: string;
  discount_badge: string;
  button_text: string;
  button_link: string;
  banner_image: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
}
