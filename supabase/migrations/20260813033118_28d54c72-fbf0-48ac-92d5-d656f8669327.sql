create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  logo_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.brands to anon;
grant select, insert, update, delete on public.brands to authenticated;
grant all on public.brands to service_role;
alter table public.brands enable row level security;
create policy "brands public read" on public.brands for select using (true);
create policy "brands admin write" on public.brands for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger brands_touch before update on public.brands for each row execute function public.touch_updated_at();

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  parent_slug text,
  gender text not null default 'all',
  icon text,
  image_url text,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select using (true);
create policy "categories admin write" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger categories_touch before update on public.categories for each row execute function public.touch_updated_at();

alter table public.products
  add column if not exists brand_id uuid references public.brands(id) on delete set null,
  add column if not exists category_slug text,
  add column if not exists about text,
  add column if not exists weight_grams integer,
  add column if not exists refund_policy text not null default '15-day easy returns. Free reverse pickup on all prepaid orders.',
  add column if not exists return_days integer not null default 15,
  add column if not exists is_returnable boolean not null default true;

alter table public.orders
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancel_reason text,
  add column if not exists refund_status text;

insert into public.site_settings (id, free_delivery_threshold, shipping_fee, cod_enabled, support_email, support_phone, return_window_days) values (1, 999, 49, true, 'care@bnoistudios.in', '+91 98765 43210', 15) on conflict (id) do nothing;

insert into public.brands (slug,name,tagline,sort_order,logo_url) values
('bnoi-studio','Bnoi Studio','Everyday luxe, made in Tiruppur',0,'https://picsum.photos/seed/bnoi-studio-logo/200/200'),
('aurelia-rose','Aurelia Rose','Soft romance in every stitch',1,'https://picsum.photos/seed/aurelia-rose-logo/200/200'),
('meraki','Meraki','Handcrafted with soul',2,'https://picsum.photos/seed/meraki-logo/200/200'),
('noor-and-co','Noor & Co','Modern ethnic edits',3,'https://picsum.photos/seed/noor-and-co-logo/200/200'),
('kalakriti','Kalakriti','Heritage weaves, new energy',4,'https://picsum.photos/seed/kalakriti-logo/200/200'),
('urban-muse','Urban Muse','Street-ready silhouettes',5,'https://picsum.photos/seed/urban-muse-logo/200/200'),
('silk-route','Silk Route','Occasion dressing done right',6,'https://picsum.photos/seed/silk-route-logo/200/200'),
('lumen-beauty','Lumen Beauty','Clean glow essentials',7,'https://picsum.photos/seed/lumen-beauty-logo/200/200'),
('terra-bloom','Terra Bloom','Botanical skincare',8,'https://picsum.photos/seed/terra-bloom-logo/200/200'),
('glow-theory','Glow Theory','Colour that lasts',9,'https://picsum.photos/seed/glow-theory-logo/200/200'),
('stride-co','Stride Co.','Footwear for long days',10,'https://picsum.photos/seed/stride-co-logo/200/200'),
('carry-club','Carry Club','Bags with a plan',11,'https://picsum.photos/seed/carry-club-logo/200/200')
on conflict (slug) do nothing;

insert into public.categories (slug,name,parent_slug,gender,icon,image_url,sort_order) values
('fashion','Fashion',null,'all','women-fashion','https://picsum.photos/seed/cat-fashion/600/600',0),
('dresses','Dresses','fashion','women','women-fashion','https://picsum.photos/seed/cat-dresses/600/600',1),
('tops','Tops & Tees','fashion','women','women-fashion','https://picsum.photos/seed/cat-tops/600/600',2),
('kurtis','Kurtis','fashion','women','women-fashion','https://picsum.photos/seed/cat-kurtis/600/600',3),
('sarees','Sarees','fashion','women','women-fashion','https://picsum.photos/seed/cat-sarees/600/600',4),
('ethnic-sets','Ethnic Sets','fashion','women','women-fashion','https://picsum.photos/seed/cat-ethnic-sets/600/600',5),
('co-ord-sets','Co-ord Sets','fashion','women','women-fashion','https://picsum.photos/seed/cat-co-ord-sets/600/600',6),
('jeans','Jeans & Denim','fashion','all','women-fashion','https://picsum.photos/seed/cat-jeans/600/600',7),
('trousers','Trousers','fashion','all','women-fashion','https://picsum.photos/seed/cat-trousers/600/600',8),
('skirts','Skirts','fashion','women','women-fashion','https://picsum.photos/seed/cat-skirts/600/600',9),
('loungewear','Loungewear','fashion','all','women-fashion','https://picsum.photos/seed/cat-loungewear/600/600',10),
('activewear','Activewear','fashion','all','wellness','https://picsum.photos/seed/cat-activewear/600/600',11),
('winterwear','Winterwear','fashion','all','women-fashion','https://picsum.photos/seed/cat-winterwear/600/600',12),
('shirts','Shirts','fashion','men','women-fashion','https://picsum.photos/seed/cat-shirts/600/600',13),
('tshirts','T-Shirts','fashion','men','women-fashion','https://picsum.photos/seed/cat-tshirts/600/600',14),
('kids','Kids','fashion','kids','fun-zone','https://picsum.photos/seed/cat-kids/600/600',15),
('footwear','Footwear',null,'all','footwear','https://picsum.photos/seed/cat-footwear/600/600',16),
('heels','Heels','footwear','women','footwear','https://picsum.photos/seed/cat-heels/600/600',17),
('flats','Flats & Juttis','footwear','women','footwear','https://picsum.photos/seed/cat-flats/600/600',18),
('sneakers','Sneakers','footwear','all','footwear','https://picsum.photos/seed/cat-sneakers/600/600',19),
('sandals','Sandals','footwear','all','footwear','https://picsum.photos/seed/cat-sandals/600/600',20),
('bags','Bags',null,'all','bags','https://picsum.photos/seed/cat-bags/600/600',21),
('totes','Totes','bags','all','bags','https://picsum.photos/seed/cat-totes/600/600',22),
('slings','Slings','bags','women','bags','https://picsum.photos/seed/cat-slings/600/600',23),
('backpacks','Backpacks','bags','all','bags','https://picsum.photos/seed/cat-backpacks/600/600',24),
('accessories','Accessories',null,'all','accessories','https://picsum.photos/seed/cat-accessories/600/600',25),
('jewellery','Jewellery','accessories','women','jewellery','https://picsum.photos/seed/cat-jewellery/600/600',26),
('watches','Watches','accessories','all','accessories','https://picsum.photos/seed/cat-watches/600/600',27),
('sunglasses','Sunglasses','accessories','all','accessories','https://picsum.photos/seed/cat-sunglasses/600/600',28),
('hair-accessories','Hair Accessories','accessories','women','accessories','https://picsum.photos/seed/cat-hair-accessories/600/600',29),
('beauty','Beauty',null,'all','beauty','https://picsum.photos/seed/cat-beauty/600/600',30),
('makeup','Makeup','beauty','all','makeup','https://picsum.photos/seed/cat-makeup/600/600',31),
('skincare','Skincare','beauty','all','skin-care','https://picsum.photos/seed/cat-skincare/600/600',32),
('haircare','Haircare','beauty','all','hair-care','https://picsum.photos/seed/cat-haircare/600/600',33),
('fragrance','Fragrance','beauty','all','fragrance','https://picsum.photos/seed/cat-fragrance/600/600',34),
('nails','Nails','beauty','all','nails','https://picsum.photos/seed/cat-nails/600/600',35),
('bath-body','Bath & Body','beauty','all','bath-body','https://picsum.photos/seed/cat-bath-body/600/600',36),
('wellness','Wellness','beauty','all','wellness','https://picsum.photos/seed/cat-wellness/600/600',37),
('gifting','Gifting',null,'all','gifts','https://picsum.photos/seed/cat-gifting/600/600',38)
on conflict (slug) do nothing;