import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Icon3D } from "@/components/site/Icon3D";
import { AnimatedTabBar } from "@/components/ui/animated-tab-bar";
import { cartCount, useCart } from "@/lib/cart-store";
import { useWishlist } from "@/hooks/useWishlist";
import type { Icon3DName } from "@/lib/icons3d";

type Item = {
  to: string;
  label: string;
  icon: Icon3DName;
  color: string;
  match: (p: string) => boolean;
};

const ITEMS: Item[] = [
  { to: "/", label: "Home", icon: "brand-store", color: "var(--primary)", match: (p) => p === "/" },
  {
    to: "/shop",
    label: "Shop",
    icon: "browse-categories",
    color: "var(--secondary)",
    match: (p) => p.startsWith("/shop") || p.startsWith("/product") || p.startsWith("/category"),
  },
  {
    to: "/offers",
    label: "Offers",
    icon: "hot-deals",
    color: "var(--accent)",
    match: (p) => p.startsWith("/offers") || p.startsWith("/search"),
  },
  {
    to: "/wishlist",
    label: "Loved",
    icon: "wishlist",
    color: "var(--primary)",
    match: (p) => p.startsWith("/wishlist"),
  },
  {
    to: "/cart",
    label: "Bag",
    icon: "my-purchases",
    color: "var(--secondary)",
    match: (p) => p.startsWith("/cart") || p.startsWith("/checkout"),
  },
  {
    to: "/account",
    label: "You",
    icon: "profile",
    color: "var(--accent)",
    match: (p) => p.startsWith("/account") || p.startsWith("/orders"),
  },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const lines = useCart((s) => s.lines);
  const count = cartCount(lines);
  const { ids } = useWishlist();

  const activeIndex = Math.max(
    0,
    ITEMS.findIndex((i) => i.match(pathname)),
  );

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <AnimatedTabBar
        activeIndex={activeIndex}
        onTabChange={(i) => {
          const item = ITEMS[i];
          if (item) void navigate({ to: item.to });
        }}
        items={ITEMS.map((item) => ({
          label: item.label,
          color: item.color,
          badge: item.to === "/cart" ? count : item.to === "/wishlist" ? ids.size : 0,
          icon: <Icon3D name={item.icon} size="xs" />,
        }))}
      />
    </nav>
  );
}
