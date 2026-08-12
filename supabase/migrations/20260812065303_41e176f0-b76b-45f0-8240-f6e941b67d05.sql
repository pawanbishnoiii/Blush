CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text NOT NULL,
  description text NOT NULL,
  story text,
  category text NOT NULL,
  price_inr integer NOT NULL,
  compare_at_inr integer,
  fabric text,
  fit text,
  care text,
  badge text,
  image_key text NOT NULL,
  rating numeric(2,1) NOT NULL DEFAULT 4.8,
  review_count integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON public.products FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color_name text NOT NULL,
  color_hex text NOT NULL,
  size text NOT NULL,
  sku text NOT NULL UNIQUE,
  stock integer NOT NULL DEFAULT 0,
  price_delta integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variants_public_read" ON public.product_variants FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  author text NOT NULL,
  city text,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text NOT NULL,
  body text NOT NULL,
  is_verified boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  free_delivery_threshold integer NOT NULL DEFAULT 1499,
  shipping_fee integer NOT NULL DEFAULT 79,
  cod_enabled boolean NOT NULL DEFAULT true,
  support_email text NOT NULL DEFAULT 'care@esko.in',
  support_phone text NOT NULL DEFAULT '+91 80 4718 2200',
  return_window_days integer NOT NULL DEFAULT 15
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text NOT NULL UNIQUE,
  user_id uuid,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  latitude numeric,
  longitude numeric,
  subtotal integer NOT NULL,
  shipping integer NOT NULL,
  total integer NOT NULL,
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'placed',
  courier text,
  tracking_number text,
  eta date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_owner_read" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  name text NOT NULL,
  variant_label text NOT NULL,
  image_key text NOT NULL,
  unit_price integer NOT NULL,
  quantity integer NOT NULL
);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_owner_read" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE TABLE public.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  title text NOT NULL,
  note text,
  happened_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tracking_events TO authenticated;
GRANT ALL ON public.tracking_events TO service_role;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tracking_owner_read" ON public.tracking_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

INSERT INTO public.site_settings (id) VALUES (1);

INSERT INTO public.products (slug, name, tagline, description, story, category, price_inr, compare_at_inr, fabric, fit, care, badge, image_key, rating, review_count, is_featured, sort_order) VALUES
('terra-oversized-tee','Terra Oversized Tee','240 GSM cotton that holds its shape','A heavyweight oversized tee cut from 240 GSM combed cotton with a structured drop shoulder and a collar that refuses to sag after the tenth wash.','We kept buying tees that looked great for three weeks. Terra is our answer: heavier yarn, bio-washed, pre-shrunk, and stitched with a twin-needle hem so the shape stays exactly where you left it.','T-Shirts',1299,1899,'240 GSM combed cotton, bio-washed','Oversized, drop shoulder','Machine wash cold, tumble dry low','Bestseller','terra-tee',4.8,412,true,1),
('drift-linen-shirt','Drift Linen Shirt','Breathable European flax for Indian summers','A relaxed camp-collar shirt in 100% European flax linen, garment dyed for a soft lived-in hand from the first wear.','Summer in India is not a season, it is a negotiation. Drift is woven from long-staple flax that moves air instead of trapping it, then washed twice so it never feels stiff.','Shirts',2499,3299,'100% European flax linen, 140 GSM','Relaxed, camp collar','Gentle wash, line dry in shade','New','drift-shirt',4.9,238,true,2),
('atlas-tapered-trouser','Atlas Tapered Trouser','Structured stretch twill, all-day tapered','A clean tapered trouser in four-way stretch cotton twill with a hidden comfort waistband and a crease that survives the commute.','Formal trousers that fight you by 3pm are a design failure. Atlas adds 2% elastane and a knit-backed waistband so it reads sharp but wears like a joggers.','Trousers',2199,2899,'Cotton twill with 2% elastane','Mid-rise, tapered','Machine wash cold, warm iron','Editor Pick','atlas-trouser',4.7,186,true,3),
('nimbus-overshirt','Nimbus Overshirt','The layer for eleven months of the year','A mid-weight cotton-suede overshirt with utility pockets, corozo buttons and a boxy cut that layers over a tee or under a coat.','India does not really do coats. Nimbus is the in-between layer: warm enough for a Delhi December evening, light enough for a Bengaluru morning.','Outerwear',3499,4499,'Brushed cotton suede, 320 GSM','Boxy, mid-length','Dry clean or gentle cold wash','Limited','nimbus-overshirt',4.9,124,true,4),
('kora-knit-polo','Kora Knit Polo','Textured knit that dresses up or down','A fine-gauge textured knit polo in mercerised cotton with a ribbed placket and a collar that stands on its own.','Kora sits exactly between a tee and a shirt, which is where most of our week actually happens.','Polos',1799,2399,'Mercerised cotton, fine gauge knit','Regular, straight hem','Hand wash cold, dry flat',NULL,'kora-polo',4.7,159,false,5),
('rove-cargo-pant','Rove Cargo Pant','Six pockets, zero bulk','A modern cargo in ripstop cotton with bellow pockets engineered flat so they carry without adding volume.','Every cargo we tried looked like camping gear. Rove keeps the utility and loses the silhouette problem.','Trousers',2399,2999,'Ripstop cotton, 260 GSM','Straight, slight taper','Machine wash cold, hang dry',NULL,'rove-cargo',4.6,97,false,6);

INSERT INTO public.product_variants (product_id, color_name, color_hex, size, sku, stock, sort_order)
SELECT p.id, c.color_name, c.color_hex, s.size, upper(replace(p.slug,'-','')) || '-' || c.code || '-' || s.size, c.stock_base + s.stock_add, c.ord * 10 + s.ord
FROM public.products p
CROSS JOIN (VALUES
  ('Bone','#F3EDE3','BN',14,1),
  ('Clay','#C4653A','CL',9,2),
  ('Forest','#264A3B','FR',11,3),
  ('Ink','#1C1C1E','IN',16,4)
) AS c(color_name,color_hex,code,stock_base,ord)
CROSS JOIN (VALUES ('S',0,1),('M',5,2),('L',4,3),('XL',2,4)) AS s(size,stock_add,ord);

UPDATE public.product_variants SET stock = 0 WHERE sku LIKE 'NIMBUSOVERSHIRT-CL-%';

INSERT INTO public.reviews (product_id, author, city, rating, title, body)
SELECT p.id, r.author, r.city, r.rating, r.title, r.body
FROM public.products p
JOIN (VALUES
 ('terra-oversized-tee','Aditya R.','Bengaluru',5,'Finally a tee that stays boxy','Washed it eight times now and the collar is still standing. The 240 GSM is genuinely noticeable.'),
 ('terra-oversized-tee','Sneha M.','Pune',5,'Colour did not fade','Bought Clay and Ink. Both look exactly like day one after a month of weekly washes.'),
 ('terra-oversized-tee','Kabir S.','Delhi',4,'Size up if you want it longer','Great fabric, I am 6ft and went XL for a longer drop. Very happy.'),
 ('drift-linen-shirt','Meera V.','Chennai',5,'Made Chennai May survivable','It actually breathes. Wore it through a full day outdoors and never felt sticky.'),
 ('drift-linen-shirt','Rohan T.','Mumbai',5,'Soft from the first wear','No stiff linen phase at all. The garment dye makes a real difference.'),
 ('atlas-tapered-trouser','Nikhil J.','Gurugram',5,'Office to dinner without a change','The stretch waistband is the whole point. Sharp fit, zero discomfort on long days.'),
 ('atlas-tapered-trouser','Priya K.','Hyderabad',4,'Great taper, slightly long','Needed a small hem but the fabric and finish are well above the price.'),
 ('nimbus-overshirt','Arjun D.','Jaipur',5,'The only layer I reach for','Brushed inside, structured outside. Wore it every evening this winter.'),
 ('kora-knit-polo','Farhan A.','Kolkata',5,'Collar actually stands','Most knit polos flop. This one holds. Looks smart under a jacket.'),
 ('rove-cargo-pant','Ishaan G.','Ahmedabad',4,'Flat pockets are a smart call','Carries my phone and wallet without looking bulky. Ripstop feels tough.')
) AS r(slug,author,city,rating,title,body) ON r.slug = p.slug;