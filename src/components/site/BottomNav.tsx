import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Icon3D } from "@/components/site/Icon3D";
import { AnimatedTabBar } from "@/components/ui/animated-tab-bar";
import { cartCount, useCart } from "@/lib/cart-store";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import type { Icon3DName } from "@/lib/icons3d";

type Item = {
  to: string;
  label: string;
  icon: Icon3DName;
  match: (p: string) => boolean;
};

const ITEMS: Item[] = [
  { to: "/", label: "Home", icon: "brand-store", match: (p) => p === "/" },
  {
    to: "/shop",
    label: "Categories",
    icon: "browse-categories",
    match: (p) => p.startsWith("/shop") || p.startsWith("/product") || p.startsWith("/category"),
  },
  {
    to: "/offers",
    label: "Offers",
    icon: "offers",
    match: (p) => p.startsWith("/offers") || p.startsWith("/search"),
  },
  {
    to: "/wishlist",
    label: "Wishlist",
    icon: "wishlist",
    match: (p) => p.startsWith("/wishlist"),
  },
  {
    to: "/cart",
    label: "Cart",
    icon: "my-purchases",
    match: (p) => p.startsWith("/cart") || p.startsWith("/checkout"),
  },
  {
    to: "/account",
    label: "Account",
    icon: "profile",
    match: (p) => p.startsWith("/account") || p.startsWith("/orders") || p.startsWith("/auth"),
  },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const lines = useCart((s) => s.lines);
  const count = cartCount(lines);
  const { ids } = useWishlist();
  const { user } = useAuth();

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
          if (!item) return;
          if (item.to === "/account" && !user) {
            void navigate({ to: "/auth" });
            return;
          }
          void navigate({ to: item.to });
        }}
        items={ITEMS.map((item) => ({
          label: item.label,
          color: "var(--primary)",
          badge: item.to === "/cart" ? count : item.to === "/wishlist" ? ids.size : 0,
          icon: <Icon3D name={item.icon} size="xs" />,
        }))}
      />
    </nav>
  );
}
