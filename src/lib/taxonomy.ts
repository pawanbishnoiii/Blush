import type { Icon3DName } from "@/lib/icons3d";

export type IconEntry = { icon: Icon3DName; label: string; hint?: string };

/** Discovery rails on the homepage. */
export const DISCOVERY: IconEntry[] = [
  { icon: "new-arrivals", label: "New Arrivals", hint: "Fresh this week" },
  { icon: "best-sellers", label: "Best Sellers", hint: "Most loved" },
  { icon: "trending-now", label: "Trending Now", hint: "Blowing up" },
  { icon: "offers", label: "Offers", hint: "Up to 60% off" },
  { icon: "shop-by-mood", label: "Shop by Mood", hint: "Pick your vibe" },
  { icon: "top-rated", label: "Top Rated", hint: "4.5★ and above" },
];

/** Fashion categories. */
export const FASHION: IconEntry[] = [
  { icon: "women-fashion", label: "Women Fashion" },
  { icon: "footwear", label: "Footwear" },
  { icon: "bags", label: "Bags" },
  { icon: "accessories", label: "Accessories" },
  { icon: "jewellery", label: "Jewellery" },
  { icon: "size-guide", label: "Size Guide" },
];

/** Beauty categories. */
export const BEAUTY: IconEntry[] = [
  { icon: "beauty", label: "Beauty" },
  { icon: "makeup", label: "Makeup" },
  { icon: "skin-care", label: "Skincare" },
  { icon: "fragrance", label: "Fragrance" },
  { icon: "hair-care", label: "Hair Care" },
  { icon: "nails", label: "Nails" },
  { icon: "beauty-tools", label: "Beauty Tools" },
  { icon: "bath-body", label: "Bath & Body" },
  { icon: "wellness", label: "Wellness" },
];

/** Account / profile shortcuts. */
export const ACCOUNT: (IconEntry & { to: string })[] = [
  { icon: "my-orders", label: "My Orders", to: "/orders" },
  { icon: "wishlist", label: "Wishlist", to: "/profile/wishlist" },
  { icon: "profile", label: "Profile", to: "/profile" },
  { icon: "addresses", label: "Addresses", to: "/profile/addresses" },
  { icon: "payment-methods", label: "Payment Methods", to: "/profile/payments" },
  { icon: "notifications", label: "Notifications", to: "/profile/notifications" },
  { icon: "coupons", label: "Coupons", to: "/profile/coupons" },
  { icon: "rewards", label: "Rewards", to: "/profile/rewards" },
  { icon: "support", label: "Support", to: "/profile/support" },
];

/** Trust badges + shopping utilities. */
export const TRUST: IconEntry[] = [
  { icon: "secure-payment", label: "Secure Payment", hint: "UPI, cards & COD" },
  { icon: "fast-delivery", label: "Fast Delivery", hint: "2–4 day dispatch" },
  { icon: "easy-returns", label: "Easy Returns", hint: "15-day window" },
  { icon: "testimonials", label: "Real Reviews", hint: "Verified buyers only" },
];

export const UTILITIES: Record<"search" | "filters" | "sort" | "review", Icon3DName> = {
  search: "search",
  filters: "filters",
  sort: "sort",
  review: "camera-review",
};

/** Special / editorial sections. */
export const SPECIAL: IconEntry[] = [
  { icon: "gifts", label: "Gifts", hint: "Wrapped & ready" },
  { icon: "store", label: "Our Store", hint: "Tiruppur studio" },
  { icon: "collections", label: "Collections", hint: "Curated edits" },
  { icon: "fun-zone", label: "Fun Zone", hint: "Spin & win" },
  { icon: "gift-cards", label: "Gift Cards", hint: "₹500 upwards" },
  { icon: "saved-items", label: "Saved Items", hint: "Your shortlist" },
];

/** Sizing helpers used on product pages. */
export const SIZING: IconEntry[] = [
  { icon: "size-guide", label: "Size Guide" },
  { icon: "size-chart", label: "Size Chart" },
  { icon: "measurements", label: "Measurements" },
  { icon: "tools", label: "Styling Tools" },
];

export const MISC_ICONS: IconEntry[] = [
  { icon: "messages", label: "Messages" },
  { icon: "rewards", label: "Rewards" },
];


/** Mood system — drives hero, copy and product recommendations. */
export type MoodKey =
  | "cute"
  | "soft"
  | "y2k"
  | "minimal"
  | "bold"
  | "party"
  | "everyday"
  | "elegant";

export type Mood = {
  key: MoodKey;
  label: string;
  icon: Icon3DName;
  tone: "blush" | "lilac" | "peach" | "cream";
  headline: string;
  copy: string;
  cta: string;
};

export const MOODS: Mood[] = [
  {
    key: "cute",
    label: "Cute",
    icon: "trending-now",
    tone: "blush",
    headline: "Soft bows, sweeter days.",
    copy: "Ribbons, blush knits and everything that makes people say aww.",
    cta: "Shop the cute edit",
  },
  {
    key: "soft",
    label: "Soft",
    icon: "bath-body",
    tone: "cream",
    headline: "Soft girl, softer fabric.",
    copy: "Cloud cottons, milky pastels and gentle silhouettes.",
    cta: "Shop soft picks",
  },
  {
    key: "y2k",
    label: "Y2K",
    icon: "fun-zone",
    tone: "lilac",
    headline: "Butterfly clips are back.",
    copy: "Low-rise energy, shine, and unapologetic 2003 nostalgia.",
    cta: "Shop Y2K",
  },
  {
    key: "minimal",
    label: "Minimal",
    icon: "collections",
    tone: "cream",
    headline: "One colour. Perfect cut.",
    copy: "Clean lines, zero noise, everything works with everything.",
    cta: "Shop minimal",
  },
  {
    key: "bold",
    label: "Bold",
    icon: "best-sellers",
    tone: "blush",
    headline: "Loud on purpose.",
    copy: "Statement colour, sharp shape, made to be looked at.",
    cta: "Shop bold",
  },
  {
    key: "party",
    label: "Party",
    icon: "gifts",
    tone: "lilac",
    headline: "Dressed for the after-party.",
    copy: "Shimmer, drape and heels you can actually dance in.",
    cta: "Shop party",
  },
  {
    key: "everyday",
    label: "Everyday",
    icon: "women-fashion",
    tone: "peach",
    headline: "Your everyday uniform.",
    copy: "The pieces you reach for before you're fully awake.",
    cta: "Shop everyday",
  },
  {
    key: "elegant",
    label: "Elegant",
    icon: "jewellery",
    tone: "cream",
    headline: "Quiet luxury, loud confidence.",
    copy: "Considered tailoring and jewellery that does the talking.",
    cta: "Shop elegant",
  },
];

/** Editorial "vibe" collections shown as a scrollable rail. */
export const VIBES: { key: string; label: string; icon: Icon3DName }[] = [
  { key: "soft-girl", label: "Soft Girl", icon: "bath-body" },
  { key: "y2k", label: "Y2K", icon: "fun-zone" },
  { key: "cute", label: "Cute", icon: "trending-now" },
  { key: "minimal", label: "Minimal", icon: "collections" },
  { key: "elegant", label: "Elegant", icon: "jewellery" },
  { key: "street", label: "Street", icon: "footwear" },
  { key: "college", label: "College", icon: "bags" },
  { key: "office", label: "Office", icon: "size-guide" },
  { key: "party", label: "Party", icon: "gifts" },
  { key: "festive", label: "Festive", icon: "rewards" },
  { key: "travel", label: "Travel", icon: "fast-delivery" },
  { key: "self-care", label: "Self Care", icon: "wellness" },
];

/** Order status → icon, shared by tracking timeline and order cards. */
export const STATUS_ICON: Record<string, Icon3DName> = {
  placed: "my-orders",
  confirmed: "secure-payment",
  packed: "easy-returns",
  shipped: "fast-delivery",
  in_transit: "fast-delivery",
  out_for_delivery: "fast-delivery",
  delivered: "best-sellers",
  cancelled: "filters",
  returned: "easy-returns",
};

/** Admin control-centre shortcuts. */
export const ADMIN_NAV: (IconEntry & { to: string })[] = [
  { icon: "store", label: "Dashboard", to: "/admin" },
  { icon: "women-fashion", label: "Products", to: "/admin/products" },
  { icon: "my-orders", label: "Orders", to: "/admin/orders" },
  { icon: "fast-delivery", label: "Shipments", to: "/admin/shipments" },
  { icon: "measurements", label: "Inventory", to: "/admin/inventory" },
  { icon: "camera-review", label: "Reviews", to: "/admin/reviews" },
  { icon: "profile", label: "Customers", to: "/admin/customers" },
  { icon: "messages", label: "FAQs", to: "/admin/faqs" },
  { icon: "notifications", label: "Notifications", to: "/admin/notifications" },
  { icon: "rewards", label: "Automation", to: "/admin/automation" },
];
