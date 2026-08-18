ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS corner_radius integer NOT NULL DEFAULT 24;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_order_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_payment_id text;

ALTER TABLE public.delivery_providers ADD COLUMN IF NOT EXISTS api_email text;
ALTER TABLE public.delivery_providers ADD COLUMN IF NOT EXISTS webhook_token text;
ALTER TABLE public.delivery_providers ADD COLUMN IF NOT EXISTS webhook_url text;
ALTER TABLE public.delivery_providers ADD COLUMN IF NOT EXISTS config jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_code text,
  category text NOT NULL DEFAULT 'general',
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  admin_reply text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS support_tickets_own_read ON public.support_tickets;
CREATE POLICY support_tickets_own_read ON public.support_tickets FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS support_tickets_own_insert ON public.support_tickets;
CREATE POLICY support_tickets_own_insert ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS support_tickets_admin_all ON public.support_tickets;
CREATE POLICY support_tickets_admin_all ON public.support_tickets FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS support_tickets_touch ON public.support_tickets;
CREATE TRIGGER support_tickets_touch BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.has_delivered(_user_id uuid, _product_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  select exists (
    select 1
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where oi.product_id = _product_id
      and o.user_id = _user_id
      and o.status = 'delivered'
  )
$$;

DROP POLICY IF EXISTS reviews_own_insert ON public.reviews;
CREATE POLICY reviews_own_insert ON public.reviews FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND product_id IS NOT NULL
  AND public.has_delivered(auth.uid(), product_id)
);