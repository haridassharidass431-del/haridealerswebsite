-- Dedicated customer-facing collections for girls and boys products.
INSERT INTO public.categories (id, name, slug, description, image_url, is_active, display_order)
VALUES
    ('c7777777-7777-7777-7777-777777777777', 'Girls Collection', 'girls-collection',
     'Explore our curated collection of dresses and styles for girls.',
     'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80', true, 7),
    ('c8888888-8888-8888-8888-888888888888', 'Boys Collection', 'boys-collection',
     'Discover comfortable and occasion-ready styles for boys.',
     'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80', true, 8)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = true;

UPDATE public.products
SET category_id = (SELECT id FROM public.categories WHERE slug = 'girls-collection')
WHERE slug = 'girls-festive-embroidered-lehanga-choli';

INSERT INTO public.product_images (product_id, image_url, display_order)
SELECT id,
       CASE slug
           WHEN 'elegant-cotton-embroidered-kurti' THEN 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
           WHEN 'royal-designer-flared-anarkali-suit' THEN 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
           WHEN 'pure-kanjivaram-soft-silk-saree' THEN 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
           WHEN 'festive-burgundy-ethnic-evening-dress' THEN 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80'
           WHEN 'traditional-chanderi-chudidhar-set' THEN 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=80'
           WHEN 'bridal-heritage-banarasi-silk-saree' THEN 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
           WHEN 'floral-print-daily-wear-rayon-kurti' THEN 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
           WHEN 'girls-festive-embroidered-lehanga-choli' THEN 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'
       END,
       0
FROM public.products
WHERE slug IN (
    'elegant-cotton-embroidered-kurti',
    'royal-designer-flared-anarkali-suit',
    'pure-kanjivaram-soft-silk-saree',
    'festive-burgundy-ethnic-evening-dress',
    'traditional-chanderi-chudidhar-set',
    'bridal-heritage-banarasi-silk-saree',
    'floral-print-daily-wear-rayon-kurti',
    'girls-festive-embroidered-lehanga-choli'
);

-- Public product images are readable by shoppers; uploads/deletes use the server-only service role key.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Public read Hari Dealers product images'
    ) THEN
        CREATE POLICY "Public read Hari Dealers product images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'product-images');
    END IF;
END
$$;
