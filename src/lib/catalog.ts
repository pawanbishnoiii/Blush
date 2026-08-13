export function inr(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  story: string | null;
  category: string;
  subcategory: string | null;
  gender: string;
  price_inr: number;
  compare_at_inr: number | null;
  fabric: string | null;
  fit: string | null;
  care: string | null;
  badge: string | null;
  image_key: string;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  mood_tags: string[];
  vibe_tags: string[];
  occasion_tags: string[];
  size_chart: Record<string, Record<string, string>> | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at?: string;
};

export type ProductExtras = {
  brand_id: string | null;
  category_slug: string | null;
  about: string | null;
  weight_grams: number | null;
  refund_policy: string | null;
  return_days: number | null;
  is_returnable: boolean | null;
};

export type Brand = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  parent_slug: string | null;
  gender: string | null;
  icon: string | null;
  image_url: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

export type Variant = {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  size: string;
  sku: string;
  stock: number;
  price_delta: number;
  sort_order: number;
  image_key: string | null;
  swatch_url: string | null;
};

export type ProductImage = {
  id: string;
  product_id: string;
  variant_id: string | null;
  color_name: string | null;
  url: string;
  alt: string | null;
  sort_order: number;
};

export type Review = {
  id: string;
  product_id: string | null;
  user_id: string | null;
  order_id: string | null;
  author: string;
  city: string | null;
  rating: number;
  title: string;
  body: string;
  variant_label: string | null;
  photos: string[];
  helpful_count: number;
  status: string;
  is_verified: boolean;
  created_at: string;
};

export type Collection = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  icon: string | null;
  mood_key: string | null;
  hero_gradient: string | null;
  is_published: boolean;
  sort_order: number;
};

export type Coupon = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  kind: string;
  value: number;
  min_cart: number;
  max_discount: number | null;
  expires_at: string | null;
  is_active: boolean;
  used_count: number;
  usage_limit: number | null;
  per_user_limit: number;
};

/** Compute the discount amount a coupon yields against a given subtotal, or 0 if inapplicable. */
export function couponDiscount(coupon: Pick<Coupon, "kind" | "value" | "max_discount">, subtotal: number): number {
  const raw = coupon.kind === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  const capped = coupon.max_discount ? Math.min(raw, coupon.max_discount) : raw;
  return Math.max(0, Math.min(capped, subtotal));
}

export function couponError(
  coupon: Coupon | null | undefined,
  subtotal: number,
): string | null {
  if (!coupon) return "Coupon not found";
  if (!coupon.is_active) return "This coupon is no longer active";
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) return "This coupon has expired";
  if (subtotal < coupon.min_cart) return `Add ${inr(coupon.min_cart - subtotal)} more to use this coupon`;
  if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) return "This coupon has been fully redeemed";
  return null;
}

export type SiteSettings = {
  free_delivery_threshold: number;
  shipping_fee: number;
  cod_enabled: boolean;
  support_email: string;
  support_phone: string;
  return_window_days: number;
};

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750"><rect width="600" height="750" fill="#fbe9ee"/></svg>`,
  );

/** Resolve a display image from image rows, a direct URL, or nothing. */
export function imageFor(
  source: ProductImage[] | string | null | undefined,
  fallback?: string | null,
): string {
  if (typeof source === "string") return source || fallback || PLACEHOLDER;
  if (source && source.length > 0) return source[0]!.url;
  return fallback || PLACEHOLDER;
}

export const imagePlaceholder = PLACEHOLDER;

export function discountPct(price: number, compareAt: number | null): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export const TRACKING_STEPS = [
  { key: "placed", label: "Order placed", note: "We got your order" },
  { key: "confirmed", label: "Confirmed", note: "Payment & stock confirmed" },
  { key: "packed", label: "Packed", note: "Wrapped with a bow" },
  { key: "shipped", label: "Shipped", note: "Handed to the courier" },
  { key: "in_transit", label: "In transit", note: "On the way to your city" },
  { key: "out_for_delivery", label: "Out for delivery", note: "Arriving today" },
  { key: "delivered", label: "Delivered", note: "Enjoy it!" },
] as const;

export type TrackingStepKey = (typeof TRACKING_STEPS)[number]["key"];

export function stepIndex(status: string): number {
  const i = TRACKING_STEPS.findIndex((s) => s.key === status);
  return i < 0 ? 0 : i;
}

export function deliveryEstimate(days = 4): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

/* ---------- Editorial imagery ---------- */
import heroBanner from "@/assets/hero-banner.webp.asset.json";
import fabricDetail from "@/assets/fabric-detail.jpg";

export const heroImage: string = heroBanner.url;
export const fabricImage: string = fabricDetail;
