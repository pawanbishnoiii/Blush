import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Heart, ShieldCheck, RotateCcw, Truck } from "lucide-react";
import { cartSavings, cartSubtotal, useCart } from "@/lib/cart-store";
import { settingsQuery } from "@/lib/queries";
import { deliveryEstimate, imageFor, inr } from "@/lib/catalog";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Esko" },
      { name: "description", content: "Review your Esko selection before checkout." },
      { property: "og:title", content: "Your cart — Esko" },
      { property: "og:description", content: "Review your Esko selection before checkout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, setQty, remove } = useCart();
  const settings = useQuery(settingsQuery);
  const wishlist = useWishlist();

  const subtotal = cartSubtotal(lines);
  const savings = cartSavings(lines);
  const threshold = settings.data?.free_delivery_threshold ?? 1499;
  const fee = settings.data?.shipping_fee ?? 79;
  const shipping = lines.length === 0 || subtotal >= threshold ? 0 : fee;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);

  if (lines.length === 0) {
    return (
      <div className="surface-warm">
        <div className="mx-auto max-w-md px-5 py-28 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-surface">
            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
          </span>
          <h1 className="section-type mt-6">Your cart is empty.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Six pieces, one of them is probably yours.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex h-13 items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground"
          >
            Browse the collection <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-warm">
      <div className="mx-auto w-full max-w-[1100px] px-5 pb-44 pt-12 sm:px-8 lg:pb-16 lg:pt-16">
        <h1 className="section-type">Your cart</h1>

        <div className="mt-9 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <div className="min-w-0">
            {/* free delivery progress */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">
                {remaining > 0 ? (
                  <>
                    <span className="text-accent">{inr(remaining)}</span> more for FREE delivery
                  </>
                ) : (
                  <span className="text-success">You&apos;ve unlocked free delivery</span>
                )}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <ul className="mt-5 space-y-4">
              <AnimatePresence initial={false}>
                {lines.map((l) => (
                  <motion.li
                    key={l.variantId}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 rounded-2xl border border-border bg-card p-4"
                  >
                    <Link to="/product/$slug" params={{ slug: l.slug }} className="shrink-0">
                      <img
                        src={imageFor(l.imageKey)}
                        alt={l.name}
                        loading="lazy"
                        className="h-24 w-20 rounded-xl object-cover sm:h-28 sm:w-24"
                      />
                    </Link>
                    <div className="min-w-0">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold">{l.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {l.colorName} · Size {l.size}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="num-strong text-[15px]">{inr(l.unitPrice * l.quantity)}</p>
                          {l.compareAt && (
                            <p className="text-xs text-muted-foreground line-through">
                              {inr(l.compareAt * l.quantity)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="inline-flex h-10 items-center rounded-full border border-border">
                          <button
                            aria-label="Decrease"
                            onClick={() => setQty(l.variantId, l.quantity - 1)}
                            className="grid h-10 w-10 place-items-center rounded-full"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="num-strong w-7 text-center text-sm">{l.quantity}</span>
                          <button
                            aria-label="Increase"
                            onClick={() => setQty(l.variantId, l.quantity + 1)}
                            disabled={l.quantity >= l.maxStock}
                            className="grid h-10 w-10 place-items-center rounded-full disabled:opacity-30"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(l.variantId)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                        <button
                          onClick={() => {
                            wishlist.toggle(l.productId);
                            remove(l.variantId);
                            toast.success("Moved to wishlist");
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                          <Heart className="h-3.5 w-3.5" /> Save for later
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

          {/* SUMMARY */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <Row label="Subtotal" value={inr(subtotal)} />
                {savings > 0 && (
                  <Row label="You save" value={`− ${inr(savings)}`} accent="text-success" />
                )}
                <Row label="Delivery" value={shipping === 0 ? "Free" : inr(shipping)} />
                <Row label="Estimated delivery" value={deliveryEstimate(4)} muted />
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-base font-semibold">Total</dt>
                    <dd className="num-strong text-2xl">{inr(subtotal + shipping)}</dd>
                  </div>
                </div>
              </dl>

              <Link
                to="/checkout"
                className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Checkout <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-full border border-border text-sm font-semibold"
              >
                Continue shopping
              </Link>

              <div className="mt-6 grid gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent" /> 100% secure payments · UPI, cards, COD
                </span>
                <span className="inline-flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-accent" /> 15-day easy returns with free pickup
                </span>
                <span className="inline-flex items-center gap-2">
                  <Truck className="h-4 w-4 text-accent" /> Dispatched in 24 hours
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BAR */}
      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border glass-bar px-5 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="num-strong text-lg">{inr(subtotal + shipping)}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {lines.length} item{lines.length > 1 ? "s" : ""} · {shipping === 0 ? "Free delivery" : inr(shipping) + " delivery"}
            </p>
          </div>
          <Link
            to="/checkout"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground"
          >
            Checkout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: string;
  accent?: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={muted ? "text-muted-foreground" : ""}>{label}</dt>
      <dd className={accent ?? (muted ? "text-muted-foreground" : "font-medium")}>{value}</dd>
    </div>
  );
}
