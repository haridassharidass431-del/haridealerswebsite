-- Google OAuth profiles and order snapshots needed for fulfillment.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE OR REPLACE FUNCTION public.create_customer_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.create_customer_profile();

INSERT INTO public.profiles (id, name, email, avatar_url, role)
SELECT
  users.id,
  COALESCE(users.raw_user_meta_data->>'full_name', users.raw_user_meta_data->>'name', split_part(users.email, '@', 1)),
  users.email,
  COALESCE(users.raw_user_meta_data->>'avatar_url', users.raw_user_meta_data->>'picture'),
  'customer'
FROM auth.users AS users
WHERE users.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Customers may edit their own contact fields, but must never grant themselves admin.
DROP POLICY IF EXISTS "Customer read/update profile" ON public.profiles;
DROP POLICY IF EXISTS "Customer read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Customer update own profile" ON public.profiles;
CREATE POLICY "Customer read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Customer update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin())
  WITH CHECK ((auth.uid() = id AND role = 'customer') OR public.is_admin());
