-- ============================================================
-- 1. ROLES
-- ============================================================
create type public.app_role as enum ('admin', 'moderator', 'customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin')
$$;

create policy "user_roles_own_read" on public.user_roles
  for select to authenticated using (user_id = auth.uid());
create policy "user_roles_admin_read" on public.user_roles
  for select to authenticated using (public.is_admin());
create policy "user_roles_admin_write" on public.user_roles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- shared updated_at trigger fn
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 2. PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key,
  display_name text,
  avatar_url text,
  phone text,
  birthday date,
  language text not null default 'en',
  preferred_moods text[] not null default '{}',
  preferred_vibes text[] not null default '{}',
  preferred_sizes jsonb not null default '{}'::jsonb,
  favourite_colours text[] not null default '{}',
  skin_tone text,
  reward_points integer not null default 0,
  tier text not null default 'blush',
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "profiles_own_read" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles_own_insert" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles_own_update" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_admin_read" on public.profiles
  for select to authenticated using (public.is_admin());

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 3. ADDRESSES / WISHLIST / NOTIFICATIONS
-- ============================================================
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  label text not null default 'Home',
  full_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  latitude numeric,
  longitude numeric,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.addresses to authenticated;
grant all on public.addresses to service_role;
alter table public.addresses enable row level security;
create policy "addresses_own_all" on public.addresses
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create trigger addresses_touch before update on public.addresses
  for each row execute function public.touch_updated_at();

create table public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, product_id, variant_id)
);
grant select, insert, delete on public.wishlist to authenticated;
grant all on public.wishlist to service_role;
alter table public.wishlist enable row level security;
create policy "wishlist_own_all" on public.wishlist
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null default 'general',
  title text not null,
  body text,
  link text,
  icon text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "notifications_own_read" on public.notifications
  for select to authenticated using (user_id = auth.uid());
create policy "notifications_own_update" on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications_own_delete" on public.notifications
  for delete to authenticated using (user_id = auth.uid());
create policy "notifications_admin_all" on public.notifications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- ============================================================
-- 4. PRODUCT EXPERIENCE
-- ============================================================
alter table public.products
  add column if not exists subcategory text,
  add column if not exists gender text not null default 'women',
  add column if not exists mood_tags text[] not null default '{}',
  add column if not exists vibe_tags text[] not null default '{}',
  add column if not exists occasion_tags text[] not null default '{}',
  add column if not exists size_chart jsonb,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists is_published boolean not null default true;

alter table public.product_variants
  add column if not exists image_key text,
  add column if not exists swatch_url text;

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  color_name text,
  url text not null,
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.product_images to anon, authenticated;
grant all on public.product_images to service_role;
alter table public.product_images enable row level security;
create policy "product_images_public_read" on public.product_images
  for select to anon, authenticated using (true);
create policy "product_images_admin_write" on public.product_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create index product_images_product_idx on public.product_images (product_id, sort_order);

-- admin write access on the existing catalogue tables
create policy "products_admin_write" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "variants_admin_write" on public.product_variants
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "settings_admin_write" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.product_variants to authenticated;
grant insert, update, delete on public.site_settings to authenticated;

-- ============================================================
-- 5. COLLECTIONS
-- ============================================================
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  icon text,
  mood_key text,
  hero_gradient text,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.collections to anon, authenticated;
grant insert, update, delete on public.collections to authenticated;
grant all on public.collections to service_role;
alter table public.collections enable row level security;
create policy "collections_public_read" on public.collections
  for select to anon, authenticated using (is_published or public.is_admin());
create policy "collections_admin_write" on public.collections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.collection_products (
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, product_id)
);
grant select on public.collection_products to anon, authenticated;
grant insert, update, delete on public.collection_products to authenticated;
grant all on public.collection_products to service_role;
alter table public.collection_products enable row level security;
create policy "collection_products_public_read" on public.collection_products
  for select to anon, authenticated using (true);
create policy "collection_products_admin_write" on public.collection_products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 6. REVIEWS (real, with photos + verified purchase)
-- ============================================================
alter table public.reviews
  add column if not exists user_id uuid,
  add column if not exists order_id uuid references public.orders(id) on delete set null,
  add column if not exists variant_label text,
  add column if not exists photos text[] not null default '{}',
  add column if not exists helpful_count integer not null default 0,
  add column if not exists status text not null default 'approved',
  add column if not exists updated_at timestamptz not null default now();

alter table public.reviews
  add constraint reviews_rating_range check (rating between 1 and 5);
alter table public.reviews
  add constraint reviews_status_valid check (status in ('pending', 'approved', 'rejected'));

create index reviews_product_idx on public.reviews (product_id, created_at desc);
create trigger reviews_touch before update on public.reviews
  for each row execute function public.touch_updated_at();

-- has this user actually received this product?
create or replace function public.has_purchased(_user_id uuid, _product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where oi.product_id = _product_id
      and o.user_id = _user_id
      and o.status in ('delivered', 'shipped', 'out_for_delivery', 'in_transit')
  )
$$;

create or replace function public.reviews_set_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.is_verified := coalesce(new.user_id is not null and public.has_purchased(new.user_id, new.product_id), false);
  return new;
end;
$$;

create trigger reviews_verify before insert or update of user_id, product_id on public.reviews
  for each row execute function public.reviews_set_verified();

drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
  for select to anon, authenticated using (status = 'approved');
create policy "reviews_own_read" on public.reviews
  for select to authenticated using (user_id = auth.uid());
create policy "reviews_own_insert" on public.reviews
  for insert to authenticated with check (user_id = auth.uid() and array_length(photos, 1) is distinct from 7);
create policy "reviews_own_update" on public.reviews
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "reviews_own_delete" on public.reviews
  for delete to authenticated using (user_id = auth.uid());
create policy "reviews_admin_all" on public.reviews
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant insert, update, delete on public.reviews to authenticated;

-- keep aggregate rating on products accurate
create or replace function public.refresh_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid := coalesce(new.product_id, old.product_id);
  avg_rating numeric;
  cnt integer;
begin
  select round(avg(rating)::numeric, 2), count(*) into avg_rating, cnt
  from public.reviews where product_id = pid and status = 'approved';

  update public.products
  set rating = coalesce(avg_rating, 4.8), review_count = coalesce(cnt, 0)
  where id = pid;

  return null;
end;
$$;

create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();

-- ============================================================
-- 7. COUPONS
-- ============================================================
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  kind text not null default 'percent',
  value integer not null,
  min_cart integer not null default 0,
  max_discount integer,
  usage_limit integer,
  used_count integer not null default 0,
  per_user_limit integer not null default 1,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint coupons_kind_valid check (kind in ('percent', 'flat', 'shipping'))
);
grant select on public.coupons to anon, authenticated;
grant insert, update, delete on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy "coupons_public_read" on public.coupons
  for select to anon, authenticated using (is_active);
create policy "coupons_admin_write" on public.coupons
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid,
  order_id uuid references public.orders(id) on delete set null,
  amount integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.coupon_redemptions to authenticated;
grant all on public.coupon_redemptions to service_role;
alter table public.coupon_redemptions enable row level security;
create policy "redemptions_own_read" on public.coupon_redemptions
  for select to authenticated using (user_id = auth.uid());
create policy "redemptions_admin_all" on public.coupon_redemptions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 8. FAQS + SEO
-- ============================================================
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  group_name text not null default 'General',
  question text not null,
  answer text not null,
  question_hi text,
  answer_hi text,
  icon text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.faqs to anon, authenticated;
grant insert, update, delete on public.faqs to authenticated;
grant all on public.faqs to service_role;
alter table public.faqs enable row level security;
create policy "faqs_public_read" on public.faqs
  for select to anon, authenticated using (is_published or public.is_admin());
create policy "faqs_admin_write" on public.faqs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger faqs_touch before update on public.faqs
  for each row execute function public.touch_updated_at();

create table public.seo_settings (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  title text not null,
  description text not null,
  keywords text[] not null default '{}',
  og_image_url text,
  noindex boolean not null default false,
  updated_at timestamptz not null default now()
);
grant select on public.seo_settings to anon, authenticated;
grant insert, update, delete on public.seo_settings to authenticated;
grant all on public.seo_settings to service_role;
alter table public.seo_settings enable row level security;
create policy "seo_public_read" on public.seo_settings
  for select to anon, authenticated using (true);
create policy "seo_admin_write" on public.seo_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger seo_touch before update on public.seo_settings
  for each row execute function public.touch_updated_at();

-- ============================================================
-- 9. AUTOMATION
-- ============================================================
create table public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  trigger_event text not null,
  action_kind text not null,
  action_config jsonb not null default '{}'::jsonb,
  is_enabled boolean not null default true,
  last_run_at timestamptz,
  run_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint automation_trigger_valid check (
    trigger_event in ('order_placed', 'order_shipped', 'order_delivered', 'low_stock', 'review_posted', 'abandoned_cart', 'back_in_stock')
  ),
  constraint automation_action_valid check (
    action_kind in ('notify_customer', 'notify_admin', 'restock_alert', 'grant_points', 'send_coupon', 'request_review')
  )
);
grant select on public.automation_rules to authenticated;
grant insert, update, delete on public.automation_rules to authenticated;
grant all on public.automation_rules to service_role;
alter table public.automation_rules enable row level security;
create policy "automation_rules_admin_all" on public.automation_rules
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger automation_rules_touch before update on public.automation_rules
  for each row execute function public.touch_updated_at();

create table public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid references public.automation_rules(id) on delete set null,
  rule_name text not null,
  trigger_event text not null,
  status text not null default 'success',
  payload jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  constraint automation_log_status_valid check (status in ('success', 'skipped', 'failed'))
);
grant select on public.automation_logs to authenticated;
grant all on public.automation_logs to service_role;
alter table public.automation_logs enable row level security;
create policy "automation_logs_admin_read" on public.automation_logs
  for select to authenticated using (public.is_admin());
create index automation_logs_created_idx on public.automation_logs (created_at desc);

-- ============================================================
-- 10. ORDER / TRACKING ADMIN ACCESS + REALTIME
-- ============================================================
create policy "orders_admin_all" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "order_items_admin_all" on public.order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "tracking_admin_all" on public.tracking_events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant insert, update, delete on public.orders to authenticated;
grant insert, update, delete on public.order_items to authenticated;
grant insert, update, delete on public.tracking_events to authenticated;

alter table public.orders replica identity full;
alter table public.tracking_events replica identity full;
alter table public.notifications replica identity full;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.tracking_events;
alter publication supabase_realtime add table public.notifications;

-- ============================================================
-- 11. SEED CONTENT (collections, faqs, seo, automation, coupons)
-- ============================================================
insert into public.collections (slug, title, subtitle, icon, mood_key, sort_order) values
  ('soft-girl', 'Soft Girl', 'Cloud cottons and milky pastels', 'bath-body', 'soft', 1),
  ('y2k', 'Y2K Revival', 'Butterfly clips and low-rise shine', 'fun-zone', 'y2k', 2),
  ('cute-core', 'Cute Core', 'Bows, ribbons and blush knits', 'trending-now', 'cute', 3),
  ('minimal-edit', 'Minimal Edit', 'One colour, perfect cut', 'collections', 'minimal', 4),
  ('bold-statement', 'Bold Statement', 'Loud on purpose', 'best-sellers', 'bold', 5),
  ('party-nights', 'Party Nights', 'Shimmer and drape', 'gifts', 'party', 6),
  ('everyday-uniform', 'Everyday Uniform', 'Your reach-for-it pieces', 'women-fashion', 'everyday', 7),
  ('quiet-luxury', 'Quiet Luxury', 'Considered tailoring', 'jewellery', 'elegant', 8);

insert into public.faqs (group_name, question, answer, question_hi, answer_hi, icon, sort_order) values
  ('Delivery', 'How fast will my order arrive?', 'Orders are packed within 24 hours and delivered in 2–4 days across India. You will get a tracking link the moment your parcel leaves our studio.', 'मेरा ऑर्डर कितनी जल्दी आएगा?', 'ऑर्डर 24 घंटे में पैक होता है और भारत भर में 2–4 दिनों में डिलीवर होता है। पार्सल निकलते ही आपको ट्रैकिंग लिंक मिल जाएगा।', 'fast-delivery', 1),
  ('Delivery', 'Is cash on delivery available?', 'Yes, COD is available on most PIN codes for orders under ₹5,000.', 'क्या कैश ऑन डिलीवरी उपलब्ध है?', 'हाँ, ₹5,000 से कम के ऑर्डर पर ज़्यादातर पिन कोड पर COD उपलब्ध है।', 'secure-payment', 2),
  ('Returns', 'What is the return window?', 'You get 15 days from delivery. Keep the tags on and we will arrange a free pickup.', 'रिटर्न की समय सीमा क्या है?', 'डिलीवरी से 15 दिन। टैग लगे रहने दें, हम मुफ़्त पिकअप करा देंगे।', 'easy-returns', 3),
  ('Returns', 'Can I exchange for a different size?', 'Yes. Start an exchange from your order page and we will swap sizes at no cost, once per order.', 'क्या मैं दूसरा साइज़ एक्सचेंज कर सकती हूँ?', 'हाँ। अपने ऑर्डर पेज से एक्सचेंज शुरू करें, प्रति ऑर्डर एक बार मुफ़्त।', 'size-guide', 4),
  ('Sizing', 'How do I find my size?', 'Every product page has a size chart with garment measurements in inches. Measure a favourite piece flat and match the numbers.', 'मैं अपना साइज़ कैसे पता करूँ?', 'हर प्रोडक्ट पेज पर इंच में माप वाला साइज़ चार्ट है। अपनी पसंदीदा ड्रेस को सपाट रखकर माप मिलाएँ।', 'measurements', 5),
  ('Beauty', 'Are the beauty products cruelty-free?', 'Every beauty SKU we stock is cruelty-free, and shade ranges are built for Indian skin tones.', 'क्या ब्यूटी प्रोडक्ट क्रूरता-मुक्त हैं?', 'हमारे सभी ब्यूटी प्रोडक्ट क्रूरता-मुक्त हैं और शेड्स भारतीय स्किन टोन के लिए बने हैं।', 'beauty', 6),
  ('Payments', 'Which payment methods do you accept?', 'UPI, all major cards, net banking, wallets and cash on delivery.', 'आप कौन से पेमेंट तरीके स्वीकार करते हैं?', 'UPI, सभी प्रमुख कार्ड, नेट बैंकिंग, वॉलेट और कैश ऑन डिलीवरी।', 'payment-methods', 7),
  ('Rewards', 'How do reward points work?', 'Earn 1 point per ₹10 spent, plus bonus points for photo reviews. 100 points equal ₹50 off.', 'रिवॉर्ड पॉइंट कैसे काम करते हैं?', 'हर ₹10 खर्च पर 1 पॉइंट, फोटो रिव्यू पर बोनस। 100 पॉइंट = ₹50 की छूट।', 'rewards', 8);

insert into public.seo_settings (path, title, description, keywords) values
  ('/', 'Blush — Girls-First Fashion, Beauty & Accessories', 'Shop cute, stylish and premium fashion, beauty and accessories curated by mood. Free delivery over ₹1,499, 15-day returns, COD available.', '{"girls fashion","women clothing online","beauty products india","y2k outfits","soft girl aesthetic"}'),
  ('/shop', 'Shop All — Fashion, Beauty & Accessories | Blush', 'Browse dresses, tops, bags, footwear, jewellery, makeup and skincare. Filter by mood, size, colour and price.', '{"shop women fashion","online beauty store","accessories india"}'),
  ('/moods', 'Shop by Mood — Soft Girl, Y2K, Cute, Minimal | Blush', 'Pick your vibe and we will style the whole page around it. Soft Girl, Y2K, Cute Core, Minimal, Bold, Party, Everyday and Elegant edits.', '{"shop by mood","soft girl outfits","y2k clothing india"}'),
  ('/faq', 'Help & FAQs — Delivery, Returns, Sizing | Blush', 'Answers on delivery timelines, COD, 15-day returns, exchanges, sizing and reward points — in English and Hindi.', '{"blush faq","return policy","delivery time"}');

insert into public.automation_rules (name, description, trigger_event, action_kind, action_config) values
  ('Welcome the order', 'Notify the shopper the moment an order is confirmed.', 'order_placed', 'notify_customer', '{"title":"Order confirmed 💖","body":"We are packing your parcel now."}'),
  ('Shipping ping', 'Tell the shopper when the parcel leaves the studio.', 'order_shipped', 'notify_customer', '{"title":"Your parcel is on the way 🚚","body":"Track it live from your orders page."}'),
  ('Delivered + points', 'Award reward points once an order is delivered.', 'order_delivered', 'grant_points', '{"points_per_rupee":0.1}'),
  ('Ask for a photo review', 'Request a photo review two days after delivery.', 'order_delivered', 'request_review', '{"delay_days":2,"bonus_points":50}'),
  ('Low stock alert', 'Alert admins when a variant drops below five units.', 'low_stock', 'notify_admin', '{"threshold":5}'),
  ('Review moderation ping', 'Notify admins whenever a new review lands.', 'review_posted', 'notify_admin', '{"title":"New review posted"}');

insert into public.coupons (code, title, description, kind, value, min_cart, max_discount, per_user_limit) values
  ('BLUSH10', 'Flat 10% off', 'First-order treat for new shoppers.', 'percent', 10, 999, 400, 1),
  ('SOFTGIRL', '₹250 off soft picks', 'On carts above ₹1,999.', 'flat', 250, 1999, null, 2),
  ('FREESHIP', 'Free delivery', 'Shipping on us, any cart size.', 'shipping', 0, 0, null, 3);