import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Brand,
  Category,
  Collection,
  Coupon,
  Product,
  ProductImage,
  Review,
  SiteSettings,
  Variant,
} from "@/lib/catalog";

/* ---------- Brands & categories ---------- */
export const brandsQuery = queryOptions({
  queryKey: ["brands"],
  queryFn: async (): Promise<Brand[]> => {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Brand[];
  },
});

export const allBrandsQuery = queryOptions({
  queryKey: ["brands", "all"],
  queryFn: async (): Promise<Brand[]> => {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Brand[];
  },
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Category[];
  },
});

export const allCategoriesQuery = queryOptions({
  queryKey: ["categories", "all"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Category[];
  },
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Product[];
  },
});

export const allProductsQuery = queryOptions({
  queryKey: ["products", "all"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Product[];
  },
});

export const productImagesQuery = queryOptions({
  queryKey: ["product_images"],
  queryFn: async (): Promise<Record<string, ProductImage[]>> => {
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    const map: Record<string, ProductImage[]> = {};
    for (const row of (data ?? []) as unknown as ProductImage[]) {
      (map[row.product_id] ??= []).push(row);
    }
    return map;
  },
});

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async (): Promise<SiteSettings> => {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
    if (error) throw error;
    return data as SiteSettings;
  },
});

export const collectionsQuery = queryOptions({
  queryKey: ["collections"],
  queryFn: async (): Promise<Collection[]> => {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Collection[];
  },
});

export const couponsQuery = queryOptions({
  queryKey: ["coupons"],
  queryFn: async (): Promise<Coupon[]> => {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("is_active", true)
      .order("min_cart", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Coupon[];
  },
});

export const myAddressesQuery = queryOptions({
  queryKey: ["my_addresses"],
  queryFn: async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const faqsQuery = queryOptions({
  queryKey: ["faqs"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export type VariantFacets = {
  /** product id -> available size labels */
  sizes: Record<string, string[]>;
  /** product id -> available colour names */
  colors: Record<string, string[]>;
  /** global option lists for the filter UI */
  allSizes: string[];
  allColors: { name: string; hex: string }[];
};

export type PaymentGateway = {
  id: string;
  code: string;
  name: string;
  logo_url: string | null;
  mode: string;
  is_enabled: boolean;
  supports_upi: boolean;
  supports_cards: boolean;
  supports_netbanking: boolean;
  supports_wallet: boolean;
  supports_cod: boolean;
  merchant_id: string | null;
  api_key_public: string | null;
  api_key_secret_name: string | null;
  webhook_url: string | null;
  fee_percent: number;
  notes: string | null;
  priority: number;
};

export const paymentGatewaysQuery = queryOptions({
  queryKey: ["payment_gateways"],
  queryFn: async (): Promise<PaymentGateway[]> => {
    const { data, error } = await supabase
      .from("payment_gateways")
      .select("*")
      .order("priority", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as PaymentGateway[];
  },
});

type _VariantFacetsShape = {
  /** product id -> available size labels */
  sizes: Record<string, string[]>;
  /** product id -> available colour names */
  colors: Record<string, string[]>;
  /** global option lists for the filter UI */
  allSizes: string[];
  allColors: { name: string; hex: string }[];
};

/** Lightweight size/colour facets for filter sheets across shop, search and category. */
export const variantFacetsQuery = queryOptions({
  queryKey: ["variant_facets"],
  queryFn: async (): Promise<VariantFacets> => {
    const { data, error } = await supabase
      .from("product_variants")
      .select("product_id,size,color_name,color_hex,stock");
    if (error) throw error;
    const sizes: Record<string, string[]> = {};
    const colors: Record<string, string[]> = {};
    const sizeSet = new Set<string>();
    const colorMap = new Map<string, string>();
    for (const row of data ?? []) {
      const pid = row.product_id as string;
      const size = (row.size ?? "").trim();
      const color = (row.color_name ?? "").trim();
      if (size) {
        (sizes[pid] ??= []).includes(size) || sizes[pid]!.push(size);
        sizeSet.add(size);
      }
      if (color) {
        (colors[pid] ??= []).includes(color) || colors[pid]!.push(color);
        if (!colorMap.has(color)) colorMap.set(color, (row.color_hex as string) ?? "#ccc");
      }
    }
    const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free"];
    return {
      sizes,
      colors,
      allSizes: [...sizeSet].sort((a, b) => {
        const ia = SIZE_ORDER.indexOf(a);
        const ib = SIZE_ORDER.indexOf(b);
        if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        return a.localeCompare(b, undefined, { numeric: true });
      }),
      allColors: [...colorMap.entries()].map(([name, hex]) => ({ name, hex })).sort((a, b) => a.name.localeCompare(b.name)),
    };
  },
});


export function productDetailQuery(slug: string) {
  return queryOptions({
    queryKey: ["product", slug],
    queryFn: async (): Promise<{
      product: Product;
      variants: Variant[];
      images: ProductImage[];
      reviews: Review[];
    }> => {
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!product) throw new Error("Product not found");

      const [{ data: variants }, { data: images }, { data: reviews }] = await Promise.all([
        supabase
          .from("product_variants")
          .select("*")
          .eq("product_id", product.id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("product_images")
          .select("*")
          .eq("product_id", product.id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("reviews")
          .select("*")
          .eq("product_id", product.id)
          .eq("status", "approved")
          .order("helpful_count", { ascending: false }),
      ]);

      const productTyped = product as unknown as Product;
      let variantRows = (variants ?? []) as unknown as Variant[];

      // Fallback for products that don't have variants yet: create a synthetic
      // single-SKU variant so the purchase flow still works.
      if (variantRows.length === 0) {
        variantRows = [
          {
            id: productTyped.id,
            product_id: productTyped.id,
            color_name: "Default",
            color_hex: "#e5e7eb",
            size: "One Size",
            sku: productTyped.slug.toUpperCase(),
            stock: 50,
            price_delta: 0,
            sort_order: 0,
            image_key: null,
            swatch_url: null,
          } satisfies Variant,
        ];
      }

      return {
        product: productTyped,
        variants: variantRows,
        images: (images ?? []) as unknown as ProductImage[],
        reviews: (reviews ?? []) as unknown as Review[],
      };
    },
  });
}

export const wishlistQuery = queryOptions({
  queryKey: ["wishlist"],
  queryFn: async (): Promise<string[]> => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];
    const { data, error } = await supabase.from("wishlist").select("product_id");
    if (error) throw error;
    return (data ?? []).map((r) => r.product_id as string);
  },
});

export const myOrdersQuery = queryOptions({
  queryKey: ["my_orders"],
  queryFn: async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

/* ---------- Reviews ---------- */
export const reviewsQuery = queryOptions({
  queryKey: ["reviews", "approved"],
  queryFn: async (): Promise<Review[]> => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("status", "approved")
      .order("helpful_count", { ascending: false })
      .limit(24);
    if (error) throw error;
    return (data ?? []) as unknown as Review[];
  },
});

/* ---------- Banners ---------- */
export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  mobile_image_url: string | null;
  media_type: "image" | "video";
  video_url: string | null;
  link_url: string | null;
  cta_label: string | null;
  placement: string;
  mood_key: string | null;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  sort_order: number;
};

export function bannersQuery(placement?: string) {
  return queryOptions({
    queryKey: ["banners", placement ?? "all"],
    queryFn: async (): Promise<Banner[]> => {
      let q = supabase.from("banners").select("*").order("sort_order", { ascending: true });
      if (placement) q = q.eq("placement", placement);
      const { data, error } = await q;
      if (error) throw error;
      const now = Date.now();
      return ((data ?? []) as unknown as Banner[]).filter(
        (b) =>
          b.is_active &&
          new Date(b.starts_at).getTime() <= now &&
          (!b.ends_at || new Date(b.ends_at).getTime() >= now),
      );
    },
  });
}

export const allBannersQuery = queryOptions({
  queryKey: ["banners", "admin"],
  queryFn: async (): Promise<Banner[]> => {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Banner[];
  },
});

/* ---------- Delivery providers ---------- */
export type DeliveryProvider = {
  id: string;
  name: string;
  code: string;
  logo_url: string | null;
  tracking_url_pattern: string | null;
  api_base_url: string | null;
  api_key_secret_name: string | null;
  supports_cod: boolean;
  supports_reverse_pickup: boolean;
  min_days: number;
  max_days: number;
  serviceable_pincode_prefixes: string[];
  is_enabled: boolean;
  priority: number;
};

export const deliveryProvidersQuery = queryOptions({
  queryKey: ["delivery_providers"],
  queryFn: async (): Promise<DeliveryProvider[]> => {
    const { data, error } = await supabase
      .from("delivery_providers")
      .select("*")
      .order("priority", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as DeliveryProvider[];
  },
});

/* ---------- Profile ---------- */
export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  gender: string | null;
  age: number | null;
  birthday: string | null;
  language: string;
  preferred_moods: string[];
  preferred_vibes: string[];
  preferred_sizes: Record<string, string>;
  favourite_colours: string[];
  skin_tone: string | null;
  reward_points: number;
  tier: string;
  onboarded: boolean;
};

export const myProfileQuery = queryOptions({
  queryKey: ["my_profile"],
  queryFn: async (): Promise<Profile | null> => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", auth.user.id)
      .maybeSingle();
    if (error) throw error;
    return (data ?? null) as unknown as Profile | null;
  },
});

export function orderDetailQuery(id: string) {
  return queryOptions({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), tracking_events(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export const myNotificationsQuery = queryOptions({
  queryKey: ["my_notifications"],
  queryFn: async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  },
});

export const adminOrdersQuery = queryOptions({
  queryKey: ["admin_orders"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  },
});

export const adminReviewsQuery = queryOptions({
  queryKey: ["admin_reviews"],
  queryFn: async (): Promise<Review[]> => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []) as unknown as Review[];
  },
});

export const adminCustomersQuery = queryOptions({
  queryKey: ["admin_customers"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  },
});

export const adminVariantsQuery = queryOptions({
  queryKey: ["admin_variants"],
  queryFn: async (): Promise<Variant[]> => {
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Variant[];
  },
});
