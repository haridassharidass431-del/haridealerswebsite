-- ========================================================
-- HARI DEALERS - SEED DATA FOR CATEGORIES & PRODUCTS
-- ========================================================

-- Initial Admin Settings
INSERT INTO public.admin_settings (
    store_name, store_email, store_phone, logo_url, currency, 
    cod_enabled, online_payment_enabled, delivery_charge, free_delivery_threshold, return_period_days
) VALUES (
    'Hari Dealers', 'haridealers@gmail.com', '+91 7339635485', '/logo.jpg', 'INR',
    true, true, 99.00, 1499.00, 7
) ON CONFLICT DO NOTHING;

-- Initial Coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, minimum_order_amount, maximum_discount, is_active)
VALUES 
    ('HARI10', 'Flat 10% off on all ethnic wear', 'percentage', 10, 999, 500, true),
    ('FESTIVE500', 'Flat ₹500 off on festive orders above ₹2499', 'fixed', 500, 2499, 500, true),
    ('WELCOME50', 'New Customer Special ₹50 off', 'fixed', 50, 499, 50, true)
ON CONFLICT (code) DO NOTHING;

-- Initial Categories
INSERT INTO public.categories (id, name, slug, description, image_url, is_active, display_order)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'Sarees', 'sarees', 'Authentic Banarasi, Kanjivaram, and pure silk sarees for grand celebrations.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', true, 1),
    ('c2222222-2222-2222-2222-222222222222', 'Kurtis', 'kurtis', 'Modern printed, straight cut, and daily comfort designer kurtis.', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', true, 2),
    ('c3333333-3333-3333-3333-333333333333', 'Anarkalis', 'anarkalis', 'Graceful flared anarkali sets with heavy handwork and dupattas.', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', true, 3),
    ('c4444444-4444-4444-4444-444444444444', 'Chudidhars', 'chudidhars', 'Traditional 3-piece chudidhar suits in rich chanderi and silk blends.', 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=80', true, 4),
    ('c5555555-5555-5555-5555-555555555555', 'Festive Dresses', 'dresses', 'Contemporary fusion dresses, gown styles, and western-ethnic silhouettes.', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80', true, 5),
    ('c6666666-6666-6666-6666-666666666666', 'Kids Wear', 'kids-wear', 'Adorable ethnic lehengas, kurtas, and festive sets for little stars.', 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- Initial Products
INSERT INTO public.products (id, name, slug, description, category_id, original_price, offer_price, stock, is_offer, is_featured, is_new_arrival, sku)
VALUES 
    ('p1111111-1111-1111-1111-111111111111', 'Elegant Cotton Embroidered Kurti', 'elegant-cotton-embroidered-kurti', 'Handcrafted pure breathable cotton kurti featuring delicate zari embroidery on neck and sleeves. Ideal for office, casual outings and lightweight festive gatherings.', 'c2222222-2222-2222-2222-222222222222', 1499.00, 999.00, 25, true, true, true, 'HD-KRT-001'),
    ('p2222222-2222-2222-2222-222222222222', 'Royal Designer Flared Anarkali Suit', 'royal-designer-flared-anarkali-suit', 'Floor-length festive anarkali suit embellished with intricate sequin work, gold brocade borders and paired with an ornate organza dupatta.', 'c3333333-3333-3333-3333-333333333333', 2499.00, 1799.00, 18, true, true, true, 'HD-ANK-002'),
    ('p3333333-3333-3333-3333-333333333333', 'Pure Kanjivaram Soft Silk Saree', 'pure-kanjivaram-soft-silk-saree', 'Traditional wedding collection soft silk saree in deep burgundy with opulent golden zari border and rich contrast pallu with matching unstitched blouse piece.', 'c1111111-1111-1111-1111-111111111111', 2999.00, 2199.00, 12, true, true, false, 'HD-SAR-003'),
    ('p4444444-4444-4444-4444-444444444444', 'Festive Burgundy Ethnic Evening Dress', 'festive-burgundy-ethnic-evening-dress', 'Fusion maxi dress designed with gold foil prints, tiered flare, pleated silhouette, and hand-embroidered waist belt.', 'c5555555-5555-5555-5555-555555555555', 1999.00, 1399.00, 15, true, true, true, 'HD-DRS-004'),
    ('p5555555-5555-5555-5555-555555555555', 'Traditional Chanderi Chudidhar Set', 'traditional-chanderi-chudidhar-set', 'Three-piece chudidhar suit crafted in lightweight Chanderi cotton silk with handblock motifs and matching modal silk dupatta.', 'c4444444-4444-4444-4444-444444444444', 1899.00, 1299.00, 20, true, false, true, 'HD-CHU-005'),
    ('p6666666-6666-6666-6666-666666666666', 'Bridal Heritage Banarasi Silk Saree', 'bridal-heritage-banarasi-silk-saree', 'Heirloom quality Banarasi brocade saree woven with pure tested zari motifs, rich floral jaal, and ceremonial golden border.', 'c1111111-1111-1111-1111-111111111111', 4999.00, 3499.00, 8, true, true, true, 'HD-SAR-006'),
    ('p7777777-7777-7777-7777-777777777777', 'Floral Print Daily Wear Rayon Kurti', 'floral-print-daily-wear-rayon-kurti', 'Comfortable A-line rayon kurti with contemporary floral print, mandarin collar, and three-quarter sleeves.', 'c2222222-2222-2222-2222-222222222222', 999.00, 699.00, 30, false, false, true, 'HD-KRT-007'),
    ('p8888888-8888-8888-8888-888888888888', 'Girls Festive Embroidered Lehanga Choli', 'girls-festive-embroidered-lehanga-choli', 'Dazzling festive lehenga set for girls with gold thread embroidery, flared can-can inner skirt, and net dupatta.', 'c6666666-6666-6666-6666-666666666666', 2299.00, 1599.00, 14, true, true, true, 'HD-KID-008')
ON CONFLICT (slug) DO NOTHING;
