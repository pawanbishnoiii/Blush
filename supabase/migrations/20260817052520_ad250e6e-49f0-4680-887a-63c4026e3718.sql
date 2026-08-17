CREATE TABLE public.payment_gateways (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  logo_url text,
  mode text NOT NULL DEFAULT 'demo',
  is_enabled boolean NOT NULL DEFAULT false,
  supports_upi boolean NOT NULL DEFAULT true,
  supports_cards boolean NOT NULL DEFAULT true,
  supports_netbanking boolean NOT NULL DEFAULT true,
  supports_wallet boolean NOT NULL DEFAULT false,
  supports_cod boolean NOT NULL DEFAULT false,
  merchant_id text,
  api_key_public text,
  api_key_secret_name text,
  webhook_url text,
  fee_percent numeric NOT NULL DEFAULT 0,
  notes text,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_gateways TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_gateways TO authenticated;
GRANT ALL ON public.payment_gateways TO service_role;

ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_gateways_public_read" ON public.payment_gateways
FOR SELECT USING (true);

CREATE POLICY "payment_gateways_admin_write" ON public.payment_gateways
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER payment_gateways_touch BEFORE UPDATE ON public.payment_gateways
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.payment_gateways (code, name, mode, is_enabled, supports_upi, supports_cards, supports_netbanking, supports_wallet, supports_cod, fee_percent, priority, notes) VALUES
('razorpay', 'Razorpay', 'demo', true, true, true, true, true, false, 2.0, 10, 'Demo mode — add live key id and secret to go live.'),
('cashfree', 'Cashfree', 'demo', false, true, true, true, true, false, 1.9, 20, 'Demo mode.'),
('phonepe', 'PhonePe', 'demo', false, true, false, false, true, false, 1.8, 30, 'UPI-first gateway.'),
('cod', 'Cash on Delivery', 'live', true, false, false, false, false, true, 0, 40, 'No gateway needed.');