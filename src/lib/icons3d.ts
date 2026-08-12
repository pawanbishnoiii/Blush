// Central registry for the 3D icon language (48 icons, individually cropped).
// Every icon is a CDN-hosted transparent WebP; never render the source sheet.
import i0 from "@/assets/icons3d/accessories.webp.asset.json";
import i1 from "@/assets/icons3d/addresses.webp.asset.json";
import i2 from "@/assets/icons3d/bags.webp.asset.json";
import i3 from "@/assets/icons3d/bath-body.webp.asset.json";
import i4 from "@/assets/icons3d/beauty.webp.asset.json";
import i5 from "@/assets/icons3d/beauty-tools.webp.asset.json";
import i6 from "@/assets/icons3d/best-sellers.webp.asset.json";
import i7 from "@/assets/icons3d/camera-review.webp.asset.json";
import i8 from "@/assets/icons3d/collections.webp.asset.json";
import i9 from "@/assets/icons3d/coupons.webp.asset.json";
import i10 from "@/assets/icons3d/easy-returns.webp.asset.json";
import i11 from "@/assets/icons3d/fast-delivery.webp.asset.json";
import i12 from "@/assets/icons3d/filters.webp.asset.json";
import i13 from "@/assets/icons3d/footwear.webp.asset.json";
import i14 from "@/assets/icons3d/fragrance.webp.asset.json";
import i15 from "@/assets/icons3d/fun-zone.webp.asset.json";
import i16 from "@/assets/icons3d/gift-cards.webp.asset.json";
import i17 from "@/assets/icons3d/gifts.webp.asset.json";
import i18 from "@/assets/icons3d/hair-care.webp.asset.json";
import i19 from "@/assets/icons3d/jewellery.webp.asset.json";
import i20 from "@/assets/icons3d/makeup.webp.asset.json";
import i21 from "@/assets/icons3d/measurements.webp.asset.json";
import i22 from "@/assets/icons3d/messages.webp.asset.json";
import i23 from "@/assets/icons3d/my-orders.webp.asset.json";
import i24 from "@/assets/icons3d/nails.webp.asset.json";
import i25 from "@/assets/icons3d/new-arrivals.webp.asset.json";
import i26 from "@/assets/icons3d/notifications.webp.asset.json";
import i27 from "@/assets/icons3d/offers.webp.asset.json";
import i28 from "@/assets/icons3d/payment-methods.webp.asset.json";
import i29 from "@/assets/icons3d/profile.webp.asset.json";
import i30 from "@/assets/icons3d/rewards.webp.asset.json";
import i31 from "@/assets/icons3d/saved-items.webp.asset.json";
import i32 from "@/assets/icons3d/search.webp.asset.json";
import i33 from "@/assets/icons3d/secure-payment.webp.asset.json";
import i34 from "@/assets/icons3d/shop-by-mood.webp.asset.json";
import i35 from "@/assets/icons3d/size-chart.webp.asset.json";
import i36 from "@/assets/icons3d/size-guide.webp.asset.json";
import i37 from "@/assets/icons3d/skin-care.webp.asset.json";
import i38 from "@/assets/icons3d/sort.webp.asset.json";
import i39 from "@/assets/icons3d/store.webp.asset.json";
import i40 from "@/assets/icons3d/support.webp.asset.json";
import i41 from "@/assets/icons3d/testimonials.webp.asset.json";
import i42 from "@/assets/icons3d/tools.webp.asset.json";
import i43 from "@/assets/icons3d/top-rated.webp.asset.json";
import i44 from "@/assets/icons3d/trending-now.webp.asset.json";
import i45 from "@/assets/icons3d/wellness.webp.asset.json";
import i46 from "@/assets/icons3d/wishlist.webp.asset.json";
import i47 from "@/assets/icons3d/women-fashion.webp.asset.json";

export type Icon3DName =
  | "accessories"
  | "addresses"
  | "bags"
  | "bath-body"
  | "beauty"
  | "beauty-tools"
  | "best-sellers"
  | "camera-review"
  | "collections"
  | "coupons"
  | "easy-returns"
  | "fast-delivery"
  | "filters"
  | "footwear"
  | "fragrance"
  | "fun-zone"
  | "gift-cards"
  | "gifts"
  | "hair-care"
  | "jewellery"
  | "makeup"
  | "measurements"
  | "messages"
  | "my-orders"
  | "nails"
  | "new-arrivals"
  | "notifications"
  | "offers"
  | "payment-methods"
  | "profile"
  | "rewards"
  | "saved-items"
  | "search"
  | "secure-payment"
  | "shop-by-mood"
  | "size-chart"
  | "size-guide"
  | "skin-care"
  | "sort"
  | "store"
  | "support"
  | "testimonials"
  | "tools"
  | "top-rated"
  | "trending-now"
  | "wellness"
  | "wishlist"
  | "women-fashion";

export const ICON_3D: Record<Icon3DName, string> = {
  "accessories": i0.url,
  "addresses": i1.url,
  "bags": i2.url,
  "bath-body": i3.url,
  "beauty": i4.url,
  "beauty-tools": i5.url,
  "best-sellers": i6.url,
  "camera-review": i7.url,
  "collections": i8.url,
  "coupons": i9.url,
  "easy-returns": i10.url,
  "fast-delivery": i11.url,
  "filters": i12.url,
  "footwear": i13.url,
  "fragrance": i14.url,
  "fun-zone": i15.url,
  "gift-cards": i16.url,
  "gifts": i17.url,
  "hair-care": i18.url,
  "jewellery": i19.url,
  "makeup": i20.url,
  "measurements": i21.url,
  "messages": i22.url,
  "my-orders": i23.url,
  "nails": i24.url,
  "new-arrivals": i25.url,
  "notifications": i26.url,
  "offers": i27.url,
  "payment-methods": i28.url,
  "profile": i29.url,
  "rewards": i30.url,
  "saved-items": i31.url,
  "search": i32.url,
  "secure-payment": i33.url,
  "shop-by-mood": i34.url,
  "size-chart": i35.url,
  "size-guide": i36.url,
  "skin-care": i37.url,
  "sort": i38.url,
  "store": i39.url,
  "support": i40.url,
  "testimonials": i41.url,
  "tools": i42.url,
  "top-rated": i43.url,
  "trending-now": i44.url,
  "wellness": i45.url,
  "wishlist": i46.url,
  "women-fashion": i47.url,
};

export const ICON_3D_NAMES = Object.keys(ICON_3D) as Icon3DName[];

/** Human label used for alt text and chips. */
export function icon3dLabel(name: Icon3DName): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
