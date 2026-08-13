import { supabase } from "@/integrations/supabase/client";
import type { ProductImage } from "@/lib/catalog";

/**
 * Resolve a stored image reference (either a full URL or a storage path in the
 * `products` bucket) into a browser-usable URL.
 */
export function resolveImageKey(key: string | null | undefined): string {
  if (!key) return "";
  if (/^https?:\/\//i.test(key) || key.startsWith("data:")) return key;
  const { data } = supabase.storage.from("products").getPublicUrl(key);
  return data.publicUrl;
}

/**
 * Pick the best available image for a cart/checkout line: prefer a
 * product_images row matching the line's variant, then any product image,
 * then fall back to the product's own image_key.
 */
export function resolveLineImage(
  line: { productId: string; variantId: string; imageKey: string },
  imagesByProduct?: Record<string, ProductImage[]>,
): string {
  const imgs = imagesByProduct?.[line.productId];
  if (imgs && imgs.length > 0) {
    const match =
      imgs.find((i) => i.variant_id === line.variantId) ??
      imgs.find((i) => !i.variant_id) ??
      imgs[0];
    if (match) return resolveImageKey(match.url);
  }
  return resolveImageKey(line.imageKey);
}
