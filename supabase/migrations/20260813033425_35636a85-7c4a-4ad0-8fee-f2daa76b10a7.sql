with src(slug,name,cat,gender,price,mrp,brand,kind,fabric,rating,rc,badge,so,m1,m2,v1,v2,o1,o2,wt) as (values
('cloudsoft-slip-dress','Cloudsoft Slip Dress','dresses','women',1699,2599,'aurelia-rose','apparel','Satin viscose',4.5,166,null,0,'bold','dreamy','classic','glam','party','travel',600),
('sunday-wrap-midi','Sunday Wrap Midi','dresses','women',1899,2899,'aurelia-rose','apparel','Rayon crepe',4.9,138,'Limited',1,'cute','festive','street','classic','office','self-care',600),
('cottagecore-tiered-dress','Cottagecore Tiered Dress','dresses','women',2099,3199,'meraki','apparel','Cotton dobby',4.8,151,'Trending',2,'festive','sporty','y2k','glam','office','self-care',180),
('bodycon-rib-dress','Bodycon Rib Dress','dresses','women',1299,1999,'urban-muse','apparel','Rib knit',4.7,228,'Bestseller',3,'sporty','cute','glam','classic','college','party',450),
('boxy-crop-tee','Boxy Crop Tee','tops','women',599,999,'bnoi-studio','apparel','240 GSM cotton',4.5,52,'Bestseller',4,'dreamy','festive','y2k','boho','festive','travel',180),
('sheer-puff-blouse','Sheer Puff Blouse','tops','women',1099,1799,'aurelia-rose','apparel','Georgette',4.7,236,'Bestseller',5,'cute','bold','boho','glam','party','festive',450),
('ribbed-tank-top','Ribbed Tank Top','tops','women',499,899,'bnoi-studio','apparel','Cotton rib',4.5,77,'Bestseller',6,'dreamy','festive','classic','street','travel','self-care',180),
('oversized-graphic-tee','Oversized Graphic Tee','tops','women',749,1299,'urban-muse','apparel','Combed cotton',4.9,164,'Limited',7,'calm','dreamy','y2k','glam','self-care','party',180),
('chikankari-straight-kurti','Chikankari Straight Kurti','kurtis','women',1499,2299,'noor-and-co','apparel','Cotton chikan',4.3,141,'Trending',8,'sporty','bold','y2k','classic','party','self-care',180),
('angrakha-print-kurti','Angrakha Print Kurti','kurtis','women',1299,1999,'noor-and-co','apparel','Rayon',4.5,124,null,9,'calm','cute','boho','glam','college','party',180),
('handloom-cotton-saree','Handloom Cotton Saree','sarees','women',2499,3999,'kalakriti','one','Handloom cotton',4.4,89,'Limited',10,'dreamy','sporty','minimal','boho','self-care','travel',240),
('organza-shimmer-saree','Organza Shimmer Saree','sarees','women',3299,4999,'silk-route','one','Organza',4.6,68,'Trending',11,'cute','calm','minimal','y2k','college','travel',320),
('sharara-festive-set','Sharara Festive Set','ethnic-sets','women',3499,5499,'silk-route','apparel','Viscose silk',4.5,53,'Trending',12,'dreamy','calm','glam','minimal','party','self-care',450),
('mirror-work-kurta-set','Mirror Work Kurta Set','ethnic-sets','women',2899,4299,'noor-and-co','apparel','Cotton',4.3,225,'Limited',13,'festive','dreamy','boho','classic','self-care','travel',320),
('linen-shirt-co-ord','Linen Shirt Co-ord','co-ord-sets','women',2199,3299,'bnoi-studio','apparel','Linen blend',4.4,104,null,14,'festive','bold','street','boho','party','travel',450),
('knit-lounge-co-ord','Knit Lounge Co-ord','co-ord-sets','women',1799,2699,'bnoi-studio','apparel','Cotton knit',4.6,33,'Bestseller',15,'dreamy','calm','minimal','boho','travel','self-care',450),
('high-rise-straight-jeans','High Rise Straight Jeans','jeans','women',1799,2799,'urban-muse','apparel','Stretch denim',4.2,33,null,16,'calm','sporty','classic','street','self-care','festive',320),
('baggy-wide-leg-jeans','Baggy Wide Leg Jeans','jeans','women',1999,2999,'urban-muse','apparel','Rigid denim',4.3,65,'Bestseller',17,'calm','festive','street','classic','travel','party',320),
('pleated-wide-trousers','Pleated Wide Trousers','trousers','women',1499,2299,'bnoi-studio','apparel','Poly viscose',4.9,193,'New',18,'dreamy','calm','street','boho','college','self-care',320),
('cargo-parachute-pants','Cargo Parachute Pants','trousers','women',1699,2499,'urban-muse','apparel','Nylon twill',4.3,129,null,19,'dreamy','bold','y2k','street','office','party',180),
('denim-mini-skirt','Denim Mini Skirt','skirts','women',1099,1699,'urban-muse','apparel','Denim',4.3,207,'New',20,'dreamy','calm','street','glam','festive','office',600),
('satin-slip-skirt','Satin Slip Skirt','skirts','women',1199,1899,'aurelia-rose','apparel','Satin',4.9,98,'Limited',21,'festive','calm','glam','minimal','college','travel',240),
('cloud-pyjama-set','Cloud Pyjama Set','loungewear','women',1299,1999,'bnoi-studio','apparel','Modal',4.6,125,'Bestseller',22,'calm','sporty','y2k','minimal','travel','party',600),
('fleece-lounge-hoodie','Fleece Lounge Hoodie','loungewear','all',1599,2399,'bnoi-studio','apparel','Fleece',4.6,27,'Trending',23,'calm','festive','street','boho','party','festive',240),
('seamless-sports-bra','Seamless Sports Bra','activewear','women',899,1499,'bnoi-studio','apparel','Nylon spandex',4.6,201,'New',24,'bold','cute','boho','classic','travel','festive',180),
('high-waist-gym-leggings','High Waist Gym Leggings','activewear','women',1199,1899,'bnoi-studio','apparel','Poly spandex',4.4,76,null,25,'sporty','festive','y2k','classic','party','travel',600),
('quilted-puffer-jacket','Quilted Puffer Jacket','winterwear','all',2799,4299,'urban-muse','apparel','Nylon and poly fill',4.8,128,'Limited',26,'calm','cute','glam','minimal','college','travel',180),
('chunky-knit-cardigan','Chunky Knit Cardigan','winterwear','women',1899,2899,'meraki','apparel','Acrylic wool',4.4,187,null,27,'cute','festive','y2k','minimal','office','travel',600),
('oxford-casual-shirt','Oxford Casual Shirt','shirts','men',1399,2199,'bnoi-studio','apparel','Oxford cotton',4.3,238,'Limited',28,'dreamy','festive','minimal','classic','college','party',450),
('heavyweight-boxy-tee','Heavyweight Boxy Tee','tshirts','men',799,1299,'urban-muse','apparel','260 GSM cotton',4.8,48,'New',29,'cute','calm','glam','y2k','college','travel',240),
('kids-rainbow-tee','Kids Rainbow Tee','kids','kids',549,899,'bnoi-studio','apparel','Cotton',4.8,30,'Bestseller',30,'calm','bold','minimal','boho','self-care','travel',240),
('block-heel-sandals','Block Heel Sandals','heels','women',1899,2899,'stride-co','shoe','Vegan leather',4.5,216,null,31,'calm','dreamy','classic','y2k','festive','college',180),
('embroidered-juttis','Embroidered Juttis','flats','women',1299,1999,'meraki','shoe','Silk and jute',4.9,236,null,32,'bold','cute','minimal','y2k','college','festive',600),
('everyday-court-sneakers','Everyday Court Sneakers','sneakers','all',2199,3299,'stride-co','shoe','Canvas',4.4,183,'Trending',33,'dreamy','festive','street','glam','party','college',600),
('chunky-dad-sneakers','Chunky Dad Sneakers','sneakers','all',2699,3999,'stride-co','shoe','Mesh and PU',4.3,160,null,34,'calm','sporty','street','glam','party','festive',450),
('slide-comfort-sandals','Slide Comfort Sandals','sandals','all',899,1499,'stride-co','shoe','EVA',4.6,218,'Limited',35,'cute','dreamy','glam','minimal','party','festive',450),
('canvas-everyday-tote','Canvas Everyday Tote','totes','all',1199,1899,'carry-club','one','Canvas',4.6,212,'Bestseller',36,'sporty','cute','classic','boho','college','party',450),
('quilted-sling-bag','Quilted Sling Bag','slings','women',1499,2399,'carry-club','one','Vegan leather',4.6,195,'Limited',37,'sporty','festive','boho','minimal','office','self-care',180),
('mini-backpack','Mini Backpack','backpacks','all',1699,2599,'carry-club','one','Nylon',4.5,161,'Bestseller',38,'festive','bold','boho','glam','college','party',180),
('pearl-drop-earrings','Pearl Drop Earrings','jewellery','women',699,1199,'meraki','one','Brass and pearl',4.7,162,'Limited',39,'festive','cute','y2k','classic','festive','college',180),
('layered-chain-necklace','Layered Chain Necklace','jewellery','women',899,1499,'meraki','one','Gold plated',4.2,41,'Limited',40,'dreamy','cute','boho','glam','office','festive',180),
('minimal-mesh-watch','Minimal Mesh Watch','watches','all',2499,3999,'urban-muse','one','Stainless steel',4.2,47,'Trending',41,'sporty','festive','glam','minimal','party','college',320),
('retro-cat-eye-sunglasses','Retro Cat Eye Sunglasses','sunglasses','all',999,1699,'urban-muse','one','Acetate',4.6,79,null,42,'dreamy','calm','minimal','y2k','travel','self-care',600),
('satin-scrunchie-trio','Satin Scrunchie Trio','hair-accessories','women',399,699,'aurelia-rose','one','Satin',4.8,64,null,43,'sporty','cute','classic','minimal','travel','party',240),
('velvet-matte-lipstick','Velvet Matte Lipstick','makeup','all',649,999,'glow-theory','one','Vegan formula',4.4,171,'Trending',44,'bold','sporty','boho','classic','self-care','festive',320),
('glass-skin-serum-foundation','Glass Skin Serum Foundation','makeup','all',1099,1699,'glow-theory','one','Water based',4.9,123,'New',45,'dreamy','festive','minimal','boho','travel','office',450),
('niacinamide-glow-serum','Niacinamide Glow Serum','skincare','all',749,1199,'terra-bloom','one','10 percent niacinamide',4.3,120,'New',46,'sporty','dreamy','classic','y2k','self-care','festive',240),
('rice-water-gel-cleanser','Rice Water Gel Cleanser','skincare','all',549,899,'terra-bloom','one','pH 5.5',4.9,168,'New',47,'cute','festive','y2k','boho','self-care','travel',240),
('rosemary-hair-growth-oil','Rosemary Hair Growth Oil','haircare','all',649,999,'terra-bloom','one','Cold pressed',4.9,235,'Limited',48,'calm','bold','glam','classic','travel','party',320),
('oud-rose-eau-de-parfum','Oud Rose Eau de Parfum','fragrance','all',1899,2999,'lumen-beauty','one','EDP 50ml',4.8,96,null,49,'sporty','festive','classic','y2k','travel','party',320),
('gel-nail-kit','Gel Nail Kit','nails','all',999,1599,'glow-theory','one','12 piece',4.4,141,'New',50,'festive','sporty','glam','y2k','travel','party',450),
('shea-body-butter','Shea Body Butter','bath-body','all',599,999,'lumen-beauty','one','Whipped shea',4.6,228,'Limited',51,'sporty','festive','y2k','classic','office','festive',180),
('sleep-well-aroma-candle','Sleep Well Aroma Candle','wellness','all',799,1299,'lumen-beauty','one','Soy wax',4.8,183,null,52,'festive','cute','boho','minimal','festive','office',240),
('curated-gift-hamper','Curated Gift Hamper','gifting','all',2499,3499,'bnoi-studio','one','Assorted',4.6,190,null,53,'calm','bold','glam','street','office','self-care',320)
)
insert into public.products (slug,name,tagline,description,story,about,category,category_slug,subcategory,gender,price_inr,compare_at_inr,fabric,fit,care,badge,image_key,rating,review_count,is_featured,is_published,sort_order,mood_tags,vibe_tags,occasion_tags,weight_grams,seo_title,seo_description,brand_id)
select
  s.slug, s.name,
  s.fabric || ' · made for ' || s.o1,
  'Meet the ' || s.name || ' — a ' || s.v1 || ' pick styled for ' || s.o1 || ' days and ' || s.o2 || ' nights. ' || s.fabric || ' keeps it breathable, easy to care for and ready to layer.',
  'Designed in our Tiruppur studio and produced in small batches with fair-wage partners.',
  s.name || ' from our ' || replace(s.cat,'-',' ') || ' edit. Cut in ' || lower(s.fabric) || ' with a soft hand-feel, finished with clean seams and a fit that holds shape all day.',
  s.cat, s.cat, s.cat, s.gender, s.price, s.mrp, s.fabric, 'Regular fit', 'Machine wash cold, dry in shade', s.badge,
  'https://picsum.photos/seed/' || s.slug || '/800/1000',
  s.rating, s.rc, (s.so % 7 = 0), true, s.so,
  array[s.m1, s.m2]::text[], array[s.v1, s.v2]::text[], array[s.o1, s.o2]::text[],
  s.wt,
  s.name || ' | Bnoi Studios',
  'Shop the ' || s.name || ' in ' || lower(s.fabric) || '. Free delivery over ₹999 and 15-day easy returns.',
  b.id
from src s left join public.brands b on b.slug = s.brand;

with palette(cn, ch, ord) as (values
  ('Blush Pink','#f7c9d3',0),('Midnight','#1f2233',1),('Ivory','#f6f1e7',2),('Olive','#6b7250',3),('Terracotta','#c1663f',4),
  ('Sky','#a8c8e8',5),('Wine','#6d2740',6),('Butter','#f2dc9b',7),('Sage','#b6c9b1',8),('Cocoa','#5b4436',9)
),
kinds as (
  select p.id, p.slug, p.sort_order, p.category,
    case when p.category in ('sarees','totes','slings','backpacks','jewellery','watches','sunglasses','hair-accessories','makeup','skincare','haircare','fragrance','nails','bath-body','wellness','gifting')
      then array['One Size'] when p.category in ('heels','flats','sneakers','sandals') then array['37','38','39','40']
      else array['S','M','L','XL'] end as sizes
  from public.products p
),
pc as (
  select k.*, pl.cn, pl.ch, row_number() over (partition by k.id order by pl.ord) - 1 as ci
  from kinds k join palette pl on pl.ord in (k.sort_order % 10, (k.sort_order + 3) % 10)
)
insert into public.product_variants (product_id,color_name,color_hex,size,sku,stock,price_delta,sort_order,image_key)
select pc.id, pc.cn, pc.ch, sz.size,
  upper(left(pc.slug,12)) || '-' || upper(left(regexp_replace(lower(pc.cn),'[^a-z]','','g'),3)) || '-' || sz.size,
  5 + (abs(hashtext(pc.slug || pc.cn || sz.size)) % 26),
  case when sz.ord > 3 then 100 else 0 end,
  pc.ci * 10 + sz.ord,
  'https://picsum.photos/seed/' || pc.slug || '-' || regexp_replace(lower(pc.cn),'[^a-z]','','g') || '-0/800/1000'
from pc cross join lateral unnest(pc.sizes) with ordinality as sz(size, ord);

with palette(cn, ord) as (values
  ('Blush Pink',0),('Midnight',1),('Ivory',2),('Olive',3),('Terracotta',4),('Sky',5),('Wine',6),('Butter',7),('Sage',8),('Cocoa',9)
),
pc as (
  select p.id, p.slug, p.name, pl.cn, row_number() over (partition by p.id order by pl.ord) - 1 as ci
  from public.products p join palette pl on pl.ord in (p.sort_order % 10, (p.sort_order + 3) % 10)
)
insert into public.product_images (product_id,color_name,url,alt,sort_order)
select pc.id, pc.cn,
  'https://picsum.photos/seed/' || pc.slug || '-' || regexp_replace(lower(pc.cn),'[^a-z]','','g') || '-' || g.i || '/800/1000',
  pc.name || ' in ' || pc.cn,
  pc.ci * 10 + g.i
from pc cross join generate_series(0,2) as g(i);

with t(i, author, city, rating, title, body) as (values
  (0,'Aditi','Mumbai',5,'Absolutely love it','Fabric feels premium and the fit is true to size. Delivery was quick too.'),
  (1,'Sneha','Delhi',5,'Great quality','Colour is exactly like the photos. Got so many compliments already.'),
  (2,'Riya','Bengaluru',4,'Worth every rupee','Comfortable for all-day wear, no irritation. Would buy another colour.'),
  (3,'Meera','Pune',5,'Repeat buy','Good pick for the price. Stitching is neat and the finish is clean.')
)
insert into public.reviews (product_id,author,city,rating,title,body,status,photos,helpful_count)
select p.id, t.author, t.city, t.rating, t.title, t.body, 'approved',
  case when t.i = 0 then array['https://picsum.photos/seed/' || p.slug || '-rev/600/600']::text[] else '{}'::text[] end,
  abs(hashtext(p.slug || t.i::text)) % 40
from public.products p cross join t
where (p.sort_order + t.i) % 4 <> 3;

insert into public.collections (slug,title,subtitle,icon,mood_key,is_published,sort_order,hero_gradient) values
('new-arrivals','New Arrivals','Fresh drops this week','new-arrivals','cute',true,0,'linear-gradient(135deg,#ffd9e3,#ffe9c9)'),
('best-sellers','Best Sellers','Most loved by you','best-sellers','bold',true,1,'linear-gradient(135deg,#ffe0e9,#e8d9ff)'),
('trending-now','Trending Now','Blowing up right now','trending-now','bold',true,2,'linear-gradient(135deg,#ffe9c9,#d9f2ff)'),
('festive-edit','Festive Edit','Lights, sequins, action','gifts','festive',true,3,'linear-gradient(135deg,#ffd9c9,#ffe9f2)'),
('office-core','Office Core','Desk to dinner','women-fashion','calm',true,4,'linear-gradient(135deg,#e3f0ff,#f4f0ff)'),
('self-care','Self Care Sunday','Slow mornings','wellness','calm',true,5,'linear-gradient(135deg,#e9f7ef,#fff4e0)')
on conflict do nothing;

insert into public.collection_products (collection_id, product_id, sort_order)
select c.id, p.id, p.sort_order from public.collections c join public.products p on true
where (c.slug='new-arrivals' and p.sort_order < 12)
   or (c.slug='best-sellers' and p.rating >= 4.6)
   or (c.slug='trending-now' and p.review_count > 100)
   or (c.slug='festive-edit' and 'festive' = any(p.occasion_tags))
   or (c.slug='office-core' and 'office' = any(p.occasion_tags))
   or (c.slug='self-care' and p.category in ('skincare','bath-body','wellness','haircare'))
on conflict do nothing;

insert into public.coupons (code,title,description,kind,value,min_cart,max_discount,is_active,per_user_limit) values
('WELCOME10','10% off your first order','Save 10% on your very first Bnoi order.','percent',10,999,300,true,1),
('FLAT200','Flat ₹200 off above ₹1499','Straight ₹200 off carts over ₹1499.','flat',200,1499,null,true,2),
('FESTIVE25','25% off the festive edit','Big savings on festive picks.','percent',25,1999,750,true,1),
('FREESHIP','Free delivery, any cart','We cover the delivery fee.','flat',49,0,49,true,5),
('BEAUTY15','15% off beauty picks','Glow for less across beauty.','percent',15,799,400,true,2)
on conflict do nothing;

insert into public.banners (title,subtitle,image_url,mobile_image_url,link_url,cta_label,placement,is_active,sort_order) values
('Monsoon Muse','Up to 60% off the rain-ready edit','https://picsum.photos/seed/banner-0/1600/700','https://picsum.photos/seed/banner-0/800/900','/shop','Shop the edit','hero',true,0),
('Festive Lights','New ethnic sets just landed','https://picsum.photos/seed/banner-1/1600/700','https://picsum.photos/seed/banner-1/800/900','/category/ethnic-sets','Explore','hero',true,1),
('Glow Season','Beauty under ₹999','https://picsum.photos/seed/banner-2/1600/700','https://picsum.photos/seed/banner-2/800/900','/category/beauty','Shop beauty','strip',true,2);

insert into public.faqs (group_name,question,answer,sort_order,is_published) values
('Orders','How long does delivery take?','Metro cities get orders in 2-4 days; rest of India in 4-7 days.',0,true),
('Orders','Can I cancel my order?','Yes — you can cancel any order from My Orders until it is shipped.',1,true),
('Returns','What is the refund policy?','Most products have a 15-day easy return window with free reverse pickup on prepaid orders.',2,true),
('Returns','How long do refunds take?','Refunds land back in your original payment method within 5-7 working days after pickup.',3,true),
('Payments','Is COD available?','Yes, cash on delivery is available on orders up to ₹5000.',4,true),
('Sizing','How do I pick my size?','Every product page has a size chart with exact measurements in inches.',5,true);

insert into public.delivery_providers (name,code,tracking_url_pattern,min_days,max_days,is_enabled,priority,supports_cod,supports_reverse_pickup) values
('Delhivery','delhivery','https://www.delhivery.com/track/package/{tracking}',2,5,true,0,true,true),
('Blue Dart','bluedart','https://www.bluedart.com/tracking/{tracking}',1,3,true,1,true,true),
('India Post','indiapost','https://www.indiapost.gov.in/{tracking}',4,9,true,2,true,false);