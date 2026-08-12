import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, PackageSearch } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cartCount, useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const linkCls =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";


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
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3.5 sm:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link to="/" className="shrink-0">
            <span className="font-display text-xl font-extrabold tracking-[-0.06em]">ESKO</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/shop" className={linkCls}>
              Collection
            </Link>
            <Link to="/" hash="story" className={linkCls}>
              Story
            </Link>
            <Link to="/" hash="details" className={linkCls}>
              Details
            </Link>
          </nav>

        </div>

        <div className="hidden justify-center md:flex">
          <span className="eyebrow text-muted-foreground">Free delivery over ₹1,499</span>
        </div>

        <div className="flex items-center justify-end gap-1.5">
          <Link
            to="/track"
            className="hidden h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <PackageSearch className="h-4 w-4" /> Track
          </Link>
          <Link
            to="/cart"
            aria-label={`Cart, ${count} items`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-transform active:scale-95"
          >
            <ShoppingBag className="h-4 w-4" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  className="num-strong absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] text-accent-foreground"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
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
              <Link to="/shop" className="rounded-xl px-3 py-3 text-base font-semibold">
                Collection
              </Link>
              <Link to="/" hash="story" className="rounded-xl px-3 py-3 text-base font-semibold">
                Our story
              </Link>
              <Link to="/track" className="rounded-xl px-3 py-3 text-base font-semibold">
                Track order
              </Link>
              <Link to="/cart" className="rounded-xl px-3 py-3 text-base font-semibold">
                Cart ({count})
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
