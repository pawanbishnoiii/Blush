import { Link, useRouterState } from "@tanstack/react-router";
import { Icon3D } from "@/components/site/Icon3D";
import { cartCount, useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import type { Icon3DName } from "@/lib/icons3d";

type Item = { to: string; label: string; icon: Icon3DName; match: (p: string) => boolean };

const ITEMS: Item[] = [
  { to: "/", label: "Home", icon: "store", match: (p) => p === "/" },
  { to: "/shop", label: "Shop", icon: "women-fashion", match: (p) => p.startsWith("/shop") || p.startsWith("/product") },
  { to: "/offers", label: "Offers", icon: "offers", match: (p) => p.startsWith("/offers") },
  { to: "/wishlist", label: "Wishlist", icon: "wishlist", match: (p) => p.startsWith("/wishlist") },
  { to: "/cart", label: "Bag", icon: "my-orders", match: (p) => p.startsWith("/cart") },
  { to: "/account", label: "You", icon: "profile", match: (p) => p.startsWith("/account") || p.startsWith("/orders") },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lines = useCart((s) => s.lines);
  const count = cartCount(lines);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 glass-bar pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-6">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-2 transition-opacity",
                  active ? "opacity-100" : "opacity-55",
                )}
              >
                <span className="relative">
                  <Icon3D name={item.icon} size="xs" />
                  {item.to === "/cart" && count > 0 && (
                    <span className="num-strong absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                      {count}
                    </span>
                  )}
                </span>
                <span className={cn("text-[10px] font-semibold", active && "text-primary")}>
                  {item.label}
                </span>
                {active && (
                  <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
