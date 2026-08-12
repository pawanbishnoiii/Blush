import terraTee from "@/assets/terra-tee.jpg";
import driftShirt from "@/assets/drift-shirt.jpg";
import atlasTrouser from "@/assets/atlas-trouser.jpg";
import nimbusOvershirt from "@/assets/nimbus-overshirt.jpg";
import koraPolo from "@/assets/kora-polo.jpg";
import roveCargo from "@/assets/rove-cargo.jpg";
import heroCampaign from "@/assets/hero-campaign.jpg";
import fabricDetail from "@/assets/fabric-detail.jpg";

export const productImages: Record<string, string> = {
  "terra-tee": terraTee,
  "drift-shirt": driftShirt,
  "atlas-trouser": atlasTrouser,
  "nimbus-overshirt": nimbusOvershirt,
  "kora-polo": koraPolo,
  "rove-cargo": roveCargo,
};

export const heroImage = heroCampaign;
export const fabricImage = fabricDetail;

export function imageFor(key: string): string {
  return productImages[key] ?? terraTee;
}

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
};

export type Review = {
  id: string;
  product_id: string | null;
  author: string;
  city: string | null;
  rating: number;
  title: string;
  body: string;
  is_verified: boolean;
};

export type SiteSettings = {
  free_delivery_threshold: number;
  shipping_fee: number;
  cod_enabled: boolean;
  support_email: string;
  support_phone: string;
  return_window_days: number;
};

export const TRACKING_STEPS = [
  { key: "placed", label: "Order placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "in_transit", label: "In transit" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
] as const;

export function deliveryEstimate(days = 4): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
