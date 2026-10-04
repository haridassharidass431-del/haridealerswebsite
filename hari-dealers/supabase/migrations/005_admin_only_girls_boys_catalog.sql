ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS variety TEXT;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_admin_uploaded BOOLEAN NOT NULL DEFAULT false;

INSERT INTO public.categories (id, name, slug, description, image_url, is_active, display_order)
VALUES
    ('c7777777-7777-7777-7777-777777777777', 'Girls Collection', 'girls-collection',
     'Explore Tops, Fashion Tops, Shawls, Leggings, Ankle Fit, and Palazzo.',
     '/logo.jpg', true, 1),
    ('c8888888-8888-8888-8888-888888888888', 'Boys Collection', 'boys-collection',
     'Discover comfortable and occasion-ready styles for boys.',
     '/logo.jpg', true, 2)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = true;

UPDATE public.categories
SET is_active = (slug IN ('girls-collection', 'boys-collection'));

-- Existing seeded/demo catalog rows remain hidden; products created through the admin API are marked true.
UPDATE public.products
SET is_admin_uploaded = false
WHERE is_admin_uploaded IS NULL;
