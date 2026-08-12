-- 1. Banners
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  mobile_image_url text,
  link_url text,
  cta_label text,
  placement text NOT NULL DEFAULT 'home_hero',
  mood_key text,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active banners are public" ON public.banners
  FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage banners" ON public.banners
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER banners_touch BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2. Delivery providers
CREATE TABLE public.delivery_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  logo_url text,
  tracking_url_pattern text,
  api_base_url text,
  api_key_secret_name text,
  supports_cod boolean NOT NULL DEFAULT true,
  supports_reverse_pickup boolean NOT NULL DEFAULT true,
  min_days integer NOT NULL DEFAULT 2,
  max_days integer NOT NULL DEFAULT 6,
  serviceable_pincode_prefixes text[] NOT NULL DEFAULT '{}',
  is_enabled boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.delivery_providers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_providers TO authenticated;
GRANT ALL ON public.delivery_providers TO service_role;

ALTER TABLE public.delivery_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enabled providers are public" ON public.delivery_providers
  FOR SELECT USING (is_enabled = true OR public.is_admin());
CREATE POLICY "Admins manage providers" ON public.delivery_providers
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER delivery_providers_touch BEFORE UPDATE ON public.delivery_providers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. Profile onboarding fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS age integer;

-- 4. Top 5 Indian courier partners
INSERT INTO public.delivery_providers (name, code, tracking_url_pattern, api_base_url, api_key_secret_name, min_days, max_days, priority) VALUES
  ('Delhivery', 'delhivery', 'https://www.delhivery.com/track/package/{awb}', 'https://track.delhivery.com/api', 'DELHIVERY_API_KEY', 2, 5, 100),
  ('Blue Dart', 'bluedart', 'https://www.bluedart.com/tracking?trackn={awb}', 'https://apigateway.bluedart.com', 'BLUEDART_API_KEY', 1, 4, 90),
  ('DTDC', 'dtdc', 'https://www.dtdc.in/tracking/{awb}', 'https://blktracksvc.dtdc.com', 'DTDC_API_KEY', 3, 7, 70),
  ('Ecom Express', 'ecom_express', 'https://ecomexpress.in/tracking/?awb_field={awb}', 'https://api.ecomexpress.in', 'ECOM_EXPRESS_API_KEY', 2, 6, 80),
  ('Shiprocket', 'shiprocket', 'https://shiprocket.co/tracking/{awb}', 'https://apiv2.shiprocket.in/v1/external', 'SHIPROCKET_API_KEY', 2, 6, 95);