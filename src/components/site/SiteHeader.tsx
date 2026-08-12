import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon3D } from "@/components/site/Icon3D";
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
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setCount(cartCount(lines)), [lines]);
  useEffect(() => setOpen(false), [pathname]);
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
            <Icon3D name="store" size="sm" />
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
            <Icon3D name="fast-delivery" size="xs" />
          </Link>
          <Link
            to="/cart"
            aria-label={`Bag, ${count} items`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95"
          >
            <Icon3D name="my-orders" size="xs" />
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
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-border glass-bar md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV.map((n) =>
                "params" in n ? (
                  <Link
                    key={n.label}
                    to={n.to}
                    params={n.params}
                    className="rounded-xl px-3 py-3 text-base font-semibold"
                  >
                    {n.label}
                  </Link>
                ) : (
                  <Link key={n.label} to={n.to} className="rounded-xl px-3 py-3 text-base font-semibold">
                    {n.label}
                  </Link>
                ),
              )}
              <Link to="/orders" className="rounded-xl px-3 py-3 text-base font-semibold">
                Track order
              </Link>
              <Link to="/account" className="rounded-xl px-3 py-3 text-base font-semibold">
                Your account
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
