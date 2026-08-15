import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon3D } from "@/components/site/Icon3D";
import { useAuth } from "@/hooks/useAuth";
import { cartCount, useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const linkCls =
  "text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground";

const NAV = [
  { to: "/shop", label: "New in" },
  { to: "/category/$slug", params: { slug: "women-fashion" }, label: "Fashion" },
  { to: "/category/$slug", params: { slug: "beauty" }, label: "Beauty" },
  { to: "/category/$slug", params: { slug: "accessories" }, label: "Accessories" },
  { to: "/offers", label: "Offers" },
] as const;

export function SiteHeader() {
  const lines = useCart((s) => s.lines);
  const [count, setCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => setCount(cartCount(lines)), [lines]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "glass-bar border-b border-border/70" : "bg-transparent",
      )}
    >
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3 sm:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <Icon3D name="brand-store" size="sm" />
            <span
              className="font-display text-xl font-extrabold tracking-[-0.04em]"
              style={{
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Blush
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((n) =>
              "params" in n ? (
                <Link key={n.label} to={n.to} params={n.params} className={linkCls}>
                  {n.label}
                </Link>
              ) : (
                <Link key={n.label} to={n.to} className={linkCls}>
                  {n.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        <div className="hidden justify-center md:flex">
          <span className="eyebrow text-muted-foreground">Free delivery over ₹1,499 ✿</span>
        </div>

        <div className="flex items-center justify-end gap-1">
          <Link
            to="/search"
            aria-label="Search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95"
          >
            <Icon3D name="search" size="xs" />
          </Link>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="hidden h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95 sm:inline-flex"
          >
            <Icon3D name="wishlist" size="xs" />
          </Link>
          <Link
            to="/orders"
            aria-label="Track orders"
            className="hidden h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95 sm:inline-flex"
          >
            <Icon3D name="track-order" size="xs" />
          </Link>
          <Link
            to="/cart"
            aria-label={`Bag, ${count} items`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95"
          >
            <Icon3D name="my-purchases" size="xs" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  className="num-strong absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] text-primary-foreground"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <Link
            to="/account"
            aria-label="Account"
            className="hidden h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95 sm:inline-flex"
          >
            <Icon3D name="profile" size="xs" />
          </Link>
          {loading ? (
            <span className="h-10 w-20 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <Link
              to="/account"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-bold sm:hidden"
            >
              <Icon3D name="profile" size="xs" className="h-5 w-5" />
              You
            </Link>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-soft transition-transform active:scale-95"
            >
              <Icon3D name="profile" size="xs" className="h-5 w-5" />
              Login
            </Link>
          )}
        </div>
      </div>

    </header>
  );
}
