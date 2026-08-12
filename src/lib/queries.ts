import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Collection,
  Coupon,
  Product,
  ProductImage,
  Review,
  SiteSettings,
  Variant,
} from "@/lib/catalog";

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

      return {
        product: product as unknown as Product,
        variants: (variants ?? []) as unknown as Variant[],
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
