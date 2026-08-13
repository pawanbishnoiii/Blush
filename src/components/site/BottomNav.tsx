import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Icon3D } from "@/components/site/Icon3D";
import { cartCount, useCart } from "@/lib/cart-store";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";
import type { Icon3DName } from "@/lib/icons3d";

type Item = { to: string; label: string; icon: Icon3DName; match: (p: string) => boolean };

const ITEMS: Item[] = [
  { to: "/", label: "Home", icon: "store", match: (p) => p === "/" },
  { to: "/shop", label: "Shop", icon: "women-fashion", match: (p) => p.startsWith("/shop") || p.startsWith("/product") || p.startsWith("/category") },
  { to: "/search", label: "Search", icon: "search", match: (p) => p.startsWith("/search") },
  { to: "/offers", label: "Offers", icon: "offers", match: (p) => p.startsWith("/offers") },
  { to: "/wishlist", label: "Loved", icon: "wishlist", match: (p) => p.startsWith("/wishlist") },
  { to: "/cart", label: "Bag", icon: "my-orders", match: (p) => p.startsWith("/cart") || p.startsWith("/checkout") },
  { to: "/account", label: "You", icon: "profile", match: (p) => p.startsWith("/account") || p.startsWith("/orders") },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lines = useCart((s) => s.lines);
  const count = cartCount(lines);
  const { ids } = useWishlist();
  const wishCount = ids.size;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 glass-bar pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-7">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const badge = item.to === "/cart" ? count : item.to === "/wishlist" ? wishCount : 0;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-2 transition-all",
                  active ? "opacity-100" : "opacity-55",
                )}
              >
                <motion.span
                  className="relative"
                  animate={active ? { y: -2, scale: 1.12 } : { y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                >
                  <Icon3D name={item.icon} size="xs" />
                  {badge > 0 && (
                    <span className="num-strong absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                      {badge}
                    </span>
                  )}
                </motion.span>
                <span className={cn("text-[9px] font-semibold", active && "text-primary")}>
                  {item.label}
                </span>
                {active && (
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
