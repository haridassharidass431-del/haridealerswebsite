ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_admin_uploaded BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.admin_settings
ALTER COLUMN store_phone SET DEFAULT '+91 7339635485',
ALTER COLUMN store_email SET DEFAULT 'haridealers@gmail.com';

UPDATE public.admin_settings
SET store_phone = '+91 7339635485',
    store_email = 'haridealers@gmail.com';
