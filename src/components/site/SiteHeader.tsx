import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";
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
  const [q, setQ] = useState("");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => setCount(cartCount(lines)), [lines]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cartBadge = (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          className="num-strong absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] leading-none text-primary-foreground"
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "glass-bar border-b border-border/70" : "bg-background/90 backdrop-blur",
      )}
    >
      {/* Mobile: compact commerce header */}
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-2 px-3 py-2.5 md:hidden">
        <Link to="/" className="flex shrink-0 items-center gap-1.5" aria-label="Blush home">
          <Icon3D name="brand-store" size="xs" />
          <span
            className="font-display text-lg font-extrabold tracking-[-0.04em]"
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

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            void navigate({ to: "/search", search: { q: q.trim() } });
          }}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5"
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, brands…"
            aria-label="Search products"
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
          />
        </form>

        <Link
          to="/cart"
          aria-label={`Cart, ${count} items`}
          className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full active:scale-95"
        >
          <Icon3D name="my-purchases" size="xs" />
          {cartBadge}
        </Link>

        {loading ? (
          <span className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
        ) : user ? (
          <Link
            to="/account"
            aria-label="Account"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full active:scale-95"
          >
            <Icon3D name="profile" size="xs" />
          </Link>
        ) : (
          <Link
            to="/auth"
            className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground active:scale-95"
          >
            Login
          </Link>
        )}
      </div>

      {/* Desktop */}
      <div className="mx-auto hidden w-full max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3 sm:px-8 md:grid">
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

        <div className="flex justify-center">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              void navigate({ to: "/search", search: { q: q.trim() } });
            }}
            className="flex w-full max-w-md items-center gap-2 rounded-full border border-border bg-card px-4 py-2"
          >
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for products, brands and more"
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </form>
        </div>

        <div className="flex items-center justify-end gap-1">
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="grid h-10 w-10 place-items-center rounded-full active:scale-95"
          >
            <Icon3D name="wishlist" size="xs" />
          </Link>
          <Link
            to="/orders"
            aria-label="Track orders"
            className="grid h-10 w-10 place-items-center rounded-full active:scale-95"
          >
            <Icon3D name="track-order" size="xs" />
          </Link>
          <Link
            to="/cart"
            aria-label={`Cart, ${count} items`}
            className="relative grid h-10 w-10 place-items-center rounded-full active:scale-95"
          >
            <Icon3D name="my-purchases" size="xs" />
            {cartBadge}
          </Link>
          {loading ? (
            <span className="h-10 w-24 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <Link
              to="/account"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold"
            >
              <Icon3D name="profile" size="xs" className="h-5 w-5" />
              Account
            </Link>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-soft active:scale-95"
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
