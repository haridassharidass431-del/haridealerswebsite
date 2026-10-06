'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  Product, Category, CartItem, WishlistItem, Order, Coupon, 
  Review, AdminSettings, OfferBanner, UserProfile, OrderStatus, PaymentStatus 
} from '@/types';
import { calculateCheckoutOrder } from '@/lib/validation/checkout';
import { supabase } from '@/lib/supabase/client';

import { 
  STORE_CATEGORIES,
  INITIAL_OFFER_BANNER,
  INITIAL_COUPONS,
  INITIAL_SETTINGS,
  INITIAL_REVIEWS,
} from '@/lib/data/initialData';

export {
  STORE_CATEGORIES,
  INITIAL_OFFER_BANNER,
  INITIAL_COUPONS,
  INITIAL_SETTINGS,
  INITIAL_REVIEWS,
};

// --- STORE CONTEXT INTERFACE ---
interface StoreContextType {
  // Catalog
  products: Product[];
  categories: Category[];
  offerBanner: OfferBanner;
  coupons: Coupon[];
  reviews: Review[];
  settings: AdminSettings;
  orders: Order[];
  
  // User & Auth
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  logout: () => void;
  
  // Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  appliedCoupon: Coupon | null;
  addToCart: (product: Product, size: string, color: string, quantity?: number) => boolean;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string; discount?: number };
  removeCoupon: () => void;

  // Wishlist
  wishlist: WishlistItem[];
  wishlistCount: number;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  // Order Operations
  createOrder: (orderData: Partial<Order>) => Order;
  refreshOrders: () => Promise<void>;
  cancelOrder: (orderId: string, reason: string) => boolean;
  requestReturn: (orderId: string, reason: string) => boolean;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string, tracking?: { courier_name?: string; tracking_number?: string; tracking_url?: string }) => void;

  // Admin Catalog Management
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  refreshCatalog: () => Promise<void>;
  updateOfferBanner: (updates: Partial<OfferBanner>) => void;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  updateSettings: (updates: Partial<AdminSettings>) => void;
  moderateReview: (id: string, action: 'approve' | 'reject' | 'delete') => void;
  addReview: (review: Omit<Review, 'id' | 'created_at' | 'is_approved'>) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // State initialization with localStorage fallback
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(STORE_CATEGORIES);
  const [offerBanner, setOfferBanner] = useState<OfferBanner>(INITIAL_OFFER_BANNER);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [settings, setSettings] = useState<AdminSettings>(INITIAL_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedProducts = localStorage.getItem('hd_products');
      if (savedProducts) {
        const localProducts = JSON.parse(savedProducts) as Product[];
        setProducts(localProducts.filter((product) => product.is_admin_uploaded === true));
      }

      localStorage.removeItem('hd_orders');

      const savedCart = localStorage.getItem('hd_cart');
      if (savedCart) {
        const localCart = JSON.parse(savedCart) as CartItem[];
        setCart(localCart.filter((item) => item.product.is_admin_uploaded === true));
      }

      const savedWishlist = localStorage.getItem('hd_wishlist');
      if (savedWishlist) {
        const localWishlist = JSON.parse(savedWishlist) as WishlistItem[];
        setWishlist(localWishlist.filter((item) => item.product.is_admin_uploaded === true));
      }

      const savedBanner = localStorage.getItem('hd_offer_banner');
      if (savedBanner) setOfferBanner(JSON.parse(savedBanner));

      const savedSettings = localStorage.getItem('hd_settings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      // A browser-saved profile is not proof of identity. Restore customers only
      // from the Supabase Auth session below.
      localStorage.removeItem('hd_user');
    } catch (e) {
      console.error('Failed to load local state', e);
    }

    void fetch('/api/catalog')
      .then(async (response) => {
        if (!response.ok) throw new Error(`Catalog request failed with status ${response.status}.`);
        return response.json();
      })
      .then((catalog: { products: Product[]; categories: Category[] }) => {
        setProducts(catalog.products);
        setCategories(catalog.categories);
      })
      .catch((error: unknown) => {
        console.error('Failed to load shared product catalog:', error);
      });
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const applyAuthUser = async (authUser: import('@supabase/supabase-js').User | null, accessToken?: string) => {
      if (!authUser) {
        setCurrentUser(null);
        setOrders([]);
        return;
      }
      const metadata = authUser.user_metadata || {};
      setCurrentUser({
        id: authUser.id,
        name: metadata.full_name || metadata.name || authUser.email?.split('@')[0] || 'Google User',
        email: authUser.email || '',
        phone: metadata.phone,
        role: 'customer',
        avatar_url: metadata.avatar_url || metadata.picture,
        created_at: authUser.created_at,
      });
      if (accessToken) {
        const response = await fetch('/api/orders', { headers: { Authorization: `Bearer ${accessToken}` } });
        if (response.ok) {
          const result = await response.json();
          setOrders((result.orders || []).map((order: any) => ({
            ...order,
            items: order.order_items || [],
            history: order.order_status_history || [],
          })));
        }
      }
    };
    void supabase.auth.getSession().then(({ data }) => applyAuthUser(data.session?.user || null, data.session?.access_token));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void applyAuthUser(session?.user || null, session?.access_token);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    void fetch('/api/admin/orders')
      .then(async (response) => response.ok ? response.json() : null)
      .then((result) => {
        if (result?.orders) setOrders(result.orders.map((order: any) => ({ ...order, items: order.order_items || [], history: order.order_status_history || [] })));
      })
      .catch(() => undefined);
  }, []);

  // Save changes to localStorage
  const saveState = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key}`, e);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('hd_user');
    localStorage.removeItem('hd_session');
    document.cookie = 'hd_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  }, [currentUser]);

  const logout = () => {
    setCurrentUser(null);
    void supabase?.auth.signOut();
  };

  const refreshOrders = async () => {
    const { data: { session } } = await supabase?.auth.getSession() || { data: { session: null } };
    if (!session?.access_token) return;
    const response = await fetch('/api/orders', { headers: { Authorization: `Bearer ${session.access_token}` } });
    if (!response.ok) return;
    const result = await response.json();
    setOrders((result.orders || []).map((order: any) => ({
      ...order,
      items: order.order_items || [],
      history: order.order_status_history || [],
    })));
  };

  // Cart operations
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((sum, item) => sum + item.total_price, 0), [cart]);

  const addToCart = (product: Product, size: string, color: string, quantity = 1): boolean => {
    if (product.stock <= 0) return false;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product_id === product.id && item.size === size && item.color === color
      );

      let nextCart: CartItem[];
      const unitPrice = product.offer_price > 0 ? product.offer_price : product.original_price;

      if (existingIndex > -1) {
        nextCart = [...prev];
        const newQty = Math.min(product.stock, nextCart[existingIndex].quantity + quantity);
        nextCart[existingIndex] = {
          ...nextCart[existingIndex],
          quantity: newQty,
          total_price: newQty * unitPrice,
        };
      } else {
        const newItem: CartItem = {
          id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product_id: product.id,
          product,
          size,
          color,
          quantity: Math.min(quantity, product.stock),
          unit_price: unitPrice,
          total_price: Math.min(quantity, product.stock) * unitPrice,
        };
        nextCart = [newItem, ...prev];
      }

      saveState('hd_cart', nextCart);
      return nextCart;
    });

    return true;
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        const next = prev.filter((i) => i.id !== itemId);
        saveState('hd_cart', next);
        return next;
      }

      const next = prev.map((item) => {
        if (item.id === itemId) {
          const maxStock = item.product.stock;
          const safeQty = Math.min(quantity, maxStock);
          return {
            ...item,
            quantity: safeQty,
            total_price: safeQty * item.unit_price,
          };
        }
        return item;
      });

      saveState('hd_cart', next);
      return next;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const next = prev.filter((i) => i.id !== itemId);
      saveState('hd_cart', next);
      return next;
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    localStorage.removeItem('hd_cart');
  };

  const applyCoupon = (code: string) => {
    const coupon = coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.is_active
    );

    if (!coupon) {
      return { success: false, message: 'Invalid or expired coupon code' };
    }

    if (cartSubtotal < coupon.minimum_order_amount) {
      return { 
        success: false, 
        message: `Order subtotal must be at least ₹${coupon.minimum_order_amount} to use this coupon.` 
      };
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (cartSubtotal * coupon.discount_value) / 100;
      if (coupon.maximum_discount && discount > coupon.maximum_discount) {
        discount = coupon.maximum_discount;
      }
    } else {
      discount = Math.min(coupon.discount_value, cartSubtotal);
    }

    setAppliedCoupon(coupon);
    return { 
      success: true, 
      message: `Coupon "${coupon.code}" applied! You save ₹${Math.round(discount)}`, 
      discount: Math.round(discount) 
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Wishlist operations
  const wishlistCount = wishlist.length;

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((i) => i.product_id === product.id);
      let next: WishlistItem[];
      if (exists) {
        next = prev.filter((i) => i.product_id !== product.id);
      } else {
        next = [{ id: `wl-${Date.now()}`, product_id: product.id, product, created_at: new Date().toISOString() }, ...prev];
      }
      saveState('hd_wishlist', next);
      return next;
    });
  };

  const isInWishlist = (productId: string) => wishlist.some((i) => i.product_id === productId);

  // Order Operations
  const createOrder = (orderData: Partial<Order>): Order => {
    const newOrderNumber = `HD${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: newOrderNumber,
      user_id: currentUser?.id,
      customer_name: orderData.customer_name || currentUser?.name || 'Valued Customer',
      customer_email: orderData.customer_email || currentUser?.email || 'customer@example.com',
      customer_phone: orderData.customer_phone || currentUser?.phone || '+91 7339635485',
      subtotal: orderData.subtotal || 0,
      discount: orderData.discount || 0,
      coupon_code: orderData.coupon_code,
      coupon_discount: orderData.coupon_discount || 0,
      delivery_charge: orderData.delivery_charge || 0,
      total_amount: orderData.total_amount || 0,
      payment_method: orderData.payment_method || 'cod',
      payment_status: orderData.payment_status || (orderData.payment_method === 'online' ? 'paid' : 'pending'),
      order_status: 'confirmed',
      shipping_address: orderData.shipping_address!,
      items: orderData.items || [],
      history: [
        {
          id: `h-${Date.now()}`,
          order_id: `ord-${Date.now()}`,
          status: 'confirmed',
          message: orderData.payment_method === 'online' ? 'Order confirmed & paid online' : 'Order placed with Cash on Delivery',
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Decrement stock for ordered items
    setProducts((prevProducts) => {
      const updated = prevProducts.map((prod) => {
        const orderedItem = newOrder.items.find((item) => item.product_id === prod.id);
        if (orderedItem) {
          const newStock = Math.max(0, prod.stock - orderedItem.quantity);
          return { ...prod, stock: newStock };
        }
        return prod;
      });
      saveState('hd_products', updated);
      return updated;
    });

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveState('hd_orders', updatedOrders);
    clearCart();

    return newOrder;
  };

  const cancelOrder = (orderId: string, reason: string): boolean => {
    let success = false;
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === orderId || ord.order_number === orderId) {
          if (ord.order_status === 'shipped' || ord.order_status === 'delivered') {
            return ord; // Cannot cancel after shipped
          }
          success = true;
          const newHistory = [
            ...(ord.history || []),
            {
              id: `h-${Date.now()}`,
              order_id: ord.id,
              status: 'cancelled' as OrderStatus,
              message: `Order cancelled by customer: ${reason}`,
              created_at: new Date().toISOString(),
            },
          ];
          return {
            ...ord,
            order_status: 'cancelled' as OrderStatus,
            cancellation_reason: reason,
            payment_status: ord.payment_status === 'paid' ? ('refunded' as PaymentStatus) : ord.payment_status,
            history: newHistory,
            updated_at: new Date().toISOString(),
          };
        }
        return ord;
      });
      saveState('hd_orders', updated);
      return updated;
    });
    return success;
  };

  const requestReturn = (orderId: string, reason: string): boolean => {
    let success = false;
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === orderId || ord.order_number === orderId) {
          success = true;
          const newHistory = [
            ...(ord.history || []),
            {
              id: `h-${Date.now()}`,
              order_id: ord.id,
              status: 'return_requested' as OrderStatus,
              message: `Return request submitted: ${reason}`,
              created_at: new Date().toISOString(),
            },
          ];
          return {
            ...ord,
            order_status: 'return_requested' as OrderStatus,
            return_reason: reason,
            history: newHistory,
            updated_at: new Date().toISOString(),
          };
        }
        return ord;
      });
      saveState('hd_orders', updated);
      return updated;
    });
    return success;
  };

  const updateOrderStatus = (
    orderId: string, 
    status: OrderStatus, 
    notes?: string, 
    tracking?: { courier_name?: string; tracking_number?: string; tracking_url?: string }
  ) => {
    const existingOrder = orders.find((ord) => ord.id === orderId || ord.order_number === orderId);
    if (existingOrder) {
      void fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: existingOrder.order_number, status, notes, tracking }),
      }).catch((err) => console.error('Failed to save order status:', err));
    }
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === orderId || ord.order_number === orderId) {
          const newHistory = [
            ...(ord.history || []),
            {
              id: `h-${Date.now()}`,
              order_id: ord.id,
              status,
              message: notes || `Order status updated to ${status.toUpperCase().replace('_', ' ')}`,
              created_at: new Date().toISOString(),
            },
          ];
          return {
            ...ord,
            order_status: status,
            courier_name: tracking?.courier_name ?? ord.courier_name,
            tracking_number: tracking?.tracking_number ?? ord.tracking_number,
            tracking_url: tracking?.tracking_url ?? ord.tracking_url,
            payment_status: status === 'delivered' && ord.payment_method === 'cod' ? 'paid' : ord.payment_status,
            history: newHistory,
            updated_at: new Date().toISOString(),
          };
        }
        return ord;
      });
      saveState('hd_orders', updated);
      return updated;
    });
  };

  // Admin Catalog Operations
  const refreshCatalog = async () => {
    const response = await fetch('/api/catalog');
    if (!response.ok) throw new Error('Could not refresh the product catalog.');
    const catalog: { products: Product[]; categories: Category[] } = await response.json();
    setProducts(catalog.products);
    setCategories(catalog.categories);
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...productData, image_url: productData.images[0] || '' }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not add product.');
    await refreshCatalog();
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const current = products.find((product) => product.id === id);
    if (!current) throw new Error('Product was not found.');
    const response = await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...current,
        ...updates,
        id,
        image_url: updates.images?.[0] || current.images[0] || '',
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not update product.');
    await refreshCatalog();
  };

  const deleteProduct = async (id: string) => {
    const response = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not delete product.');
    await refreshCatalog();
    if (result.warning) throw new Error(result.warning);
  };

  const updateOfferBanner = (updates: Partial<OfferBanner>) => {
    setOfferBanner((prev) => {
      const next = { ...prev, ...updates };
      saveState('hd_offer_banner', next);
      return next;
    });
  };

  const addCoupon = (couponData: Omit<Coupon, 'id'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `cp-${Date.now()}`,
    };
    setCoupons((prev) => [...prev, newCoupon]);
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const updateSettings = (updates: Partial<AdminSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveState('hd_settings', next);
      return next;
    });
  };

  const moderateReview = (id: string, action: 'approve' | 'reject' | 'delete') => {
    setReviews((prev) => {
      if (action === 'delete') return prev.filter((r) => r.id !== id);
      return prev.map((r) => (r.id === id ? { ...r, is_approved: action === 'approve' } : r));
    });
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'created_at' | 'is_approved'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `rv-${Date.now()}`,
      is_approved: true, // auto-approve in demo
      created_at: new Date().toISOString(),
    };
    setReviews((prev) => [newRev, ...prev]);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        offerBanner,
        coupons,
        reviews,
        settings,
        orders,
        currentUser,
        setCurrentUser,
        logout,
        cart,
        cartCount,
        cartSubtotal,
        appliedCoupon,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        wishlist,
        wishlistCount,
        toggleWishlist,
        isInWishlist,
        createOrder,
        refreshOrders,
        cancelOrder,
        requestReturn,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        refreshCatalog,
        updateOfferBanner,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        updateSettings,
        moderateReview,
        addReview,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
