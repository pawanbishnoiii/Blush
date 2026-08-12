import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Minus, Plus, ShieldCheck, Truck, RotateCcw, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { productDetailQuery, productsQuery } from "@/lib/queries";
import { deliveryEstimate, imageFor, inr } from "@/lib/catalog";
import { useCart } from "@/lib/cart-store";
import { Stars } from "@/components/site/Stars";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const name = params.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${name} — Esko` },
        {
          name: "description",
          content: `${name} by Esko. Heavyweight, honestly made, shipped across India with 15-day returns.`,
        },
        { property: "og:title", content: `${name} — Esko` },
        {
          property: "og:description",
          content: `${name} by Esko. Heavyweight, honestly made, shipped across India.`,
        },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

const SIZES = ["S", "M", "L", "XL"];

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const detail = useQuery(productDetailQuery(slug));
  const allProducts = useQuery(productsQuery);
  const add = useCart((s) => s.add);

  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string>("M");
  const [qty, setQty] = useState(1);
  const [showSticky, setShowSticky] = useState(false);

  const product = detail.data?.product;
  const variants = useMemo(() => detail.data?.variants ?? [], [detail.data]);
  const reviews = detail.data?.reviews ?? [];

  const colors = useMemo(() => {
    const map = new Map<string, string>();
    variants.forEach((v) => map.set(v.color_name, v.color_hex));
    return Array.from(map, ([name, hex]) => ({ name, hex }));
  }, [variants]);

  useEffect(() => {
    if (!color && colors.length) setColor(colors[0]!.name);
  }, [colors, color]);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const selected = variants.find((v) => v.color_name === color && v.size === size);
  const unitPrice = product ? product.price_inr + (selected?.price_delta ?? 0) : 0;
  const inStock = (selected?.stock ?? 0) > 0;
  const lowStock = inStock && (selected?.stock ?? 0) <= 5;

  const related = (allProducts.data ?? []).filter((p) => p.slug !== slug).slice(0, 3);

  function handleAdd(then?: "cart" | "checkout") {
    if (!product || !selected) return;
    if (!inStock) return;
    add({
      variantId: selected.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageKey: product.image_key,
      colorName: selected.color_name,
      size: selected.size,
      unitPrice,
      compareAt: product.compare_at_inr,
      quantity: qty,
      maxStock: selected.stock,
    });
    if (then === "checkout") {
      navigate({ to: "/checkout" });
      return;
    }
    if (then === "cart") {
      navigate({ to: "/cart" });
      return;
    }
    toast.success(`${product.name} added`, {
      description: `${selected.color_name} · ${selected.size} · ${inr(unitPrice * qty)}`,
    });
  }

  if (detail.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse rounded-[2rem] bg-muted" />
          <div className="space-y-4">
            <div className="h-10 w-2/3 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-muted" />
            <div className="h-32 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-md px-5 py-28 text-center">
        <h1 className="section-type">We couldn&apos;t find that piece.</h1>
        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Back to the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="surface-warm pb-28 lg:pb-16">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 lg:py-14">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-foreground">
            {product.category}
          </Link>
          <span>/</span>
          <span className="truncate text-foreground">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* GALLERY */}
          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={color ?? "base"}
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="group overflow-hidden rounded-[2rem] bg-surface shadow-lift"
              >
                <img
                  src={imageFor(product.image_key)}
                  alt={`${product.name} in ${color ?? ""}`}
                  width={1200}
                  height={1504}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </motion.div>
            </AnimatePresence>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <Spec label="Fabric" value={product.fabric ?? "—"} />
              <Spec label="Fit" value={product.fit ?? "—"} />
              <Spec label="Care" value={product.care ?? "—"} />
            </div>
          </div>

          {/* PURCHASE PANEL */}
          <div className="min-w-0">
            {product.badge && (
              <span className="eyebrow inline-block rounded-full bg-accent/12 px-3 py-1.5 text-accent">
                {product.badge}
              </span>
            )}
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 text-base text-muted-foreground">{product.tagline}</p>

            <div className="mt-4 flex items-center gap-3">
              <Stars rating={product.rating} />
              <span className="text-sm text-muted-foreground">
                {product.rating} · {product.review_count} reviews
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <motion.p
                key={unitPrice}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="num-strong text-4xl"
              >
                {inr(unitPrice)}
              </motion.p>
              {product.compare_at_inr && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {inr(product.compare_at_inr)}
                  </span>
                  <span className="num-strong rounded-full bg-success/12 px-2.5 py-1 text-xs text-success">
                    Save {inr(product.compare_at_inr - product.price_inr)}
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>

            {/* COLOUR */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-muted-foreground">Colour</p>
                <p className="text-sm font-semibold">{color}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    aria-label={c.name}
                    className={cn(
                      "grid h-11 w-11 place-items-center rounded-full border-2 transition-all",
                      color === c.name ? "border-foreground scale-105" : "border-border hover:border-foreground/40",
                    )}
                  >
                    <span
                      className="h-8 w-8 rounded-full ring-1 ring-inset ring-black/10"
                      style={{ backgroundColor: c.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* SIZE */}
            <div className="mt-7">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-muted-foreground">Size</p>
                <span className="text-xs text-muted-foreground">{product.fit}</span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2.5">
                {SIZES.map((s) => {
                  const v = variants.find((x) => x.color_name === color && x.size === s);
                  const disabled = !v || v.stock === 0;
                  return (
                    <button
                      key={s}
                      disabled={disabled}
                      onClick={() => setSize(s)}
                      className={cn(
                        "h-12 rounded-xl border text-sm font-semibold transition-all",
                        size === s
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-foreground/30",
                        disabled && "cursor-not-allowed border-dashed text-muted-foreground/50 line-through hover:border-border",
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STOCK + QTY */}
            <div className="mt-7 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
              <div className="inline-flex h-12 items-center rounded-full border border-border bg-card">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="grid h-12 w-12 place-items-center rounded-full"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="num-strong w-8 text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(selected?.stock ?? 1, q + 1))}
                  aria-label="Increase quantity"
                  className="grid h-12 w-12 place-items-center rounded-full"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className={cn("text-sm font-medium", inStock ? "text-success" : "text-destructive")}>
                {inStock
                  ? lowStock
                    ? `Only ${selected?.stock} left in ${color} ${size}`
                    : "In stock, ready to ship"
                  : `${color} ${size} is sold out`}
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                disabled={!inStock}
                onClick={() => handleAdd()}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-primary bg-card text-[15px] font-semibold transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Add to cart
              </button>
              <button
                disabled={!inStock}
                onClick={() => handleAdd("checkout")}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Buy now <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* ASSURANCES */}
            <div className="mt-7 space-y-3 rounded-2xl border border-border bg-card p-5">
              <Assurance
                icon={<Truck className="h-4 w-4 text-accent" />}
                title={`Delivery by ${deliveryEstimate(4)}`}
                body="Free above ₹1,499 · ₹79 below"
              />
              <Assurance
                icon={<RotateCcw className="h-4 w-4 text-accent" />}
                title="15-day returns"
                body="Free pickup, refunded in 5 working days"
              />
              <Assurance
                icon={<ShieldCheck className="h-4 w-4 text-accent" />}
                title="UPI, cards & cash on delivery"
                body="Payment captured only after you confirm"
              />
            </div>

            {/* STORY */}
            <div className="mt-9">
              <p className="eyebrow text-accent">Why it exists</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {product.story}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        {reviews.length > 0 && (
          <section className="mt-20">
            <h2 className="section-type">Reviews for {product.name}</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r, i) => (
                <Reveal key={r.id} delay={(i % 3) * 0.05}>
                  <figure className="flex h-full flex-col rounded-3xl border border-border bg-card p-6">
                    <Stars rating={r.rating} />
                    <p className="mt-3 text-base font-semibold">{r.title}</p>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {r.body}
                    </p>
                    <figcaption className="mt-4 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{r.author}</span>
                      {r.city && ` · ${r.city}`}
                      {r.is_verified && <span className="text-success"> · Verified</span>}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* RELATED */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="section-type">Goes well with</h2>
            <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* SMART STICKY BUY BAR */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border glass-bar"
          >
            <div className="mx-auto grid w-full max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={imageFor(product.image_key)}
                  alt=""
                  loading="lazy"
                  className="hidden h-11 w-11 shrink-0 rounded-xl object-cover sm:block"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{product.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {color} · {size} · {inStock ? "In stock" : "Sold out"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="num-strong hidden text-lg sm:block">{inr(unitPrice * qty)}</span>
                <button
                  disabled={!inStock}
                  onClick={() => handleAdd()}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-primary bg-card px-4 text-sm font-semibold active:scale-95 disabled:opacity-40"
                >
                  <Check className="h-4 w-4" /> Add
                </button>
                <button
                  disabled={!inStock}
                  onClick={() => handleAdd("checkout")}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground active:scale-95 disabled:opacity-40"
                >
                  Buy now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-4">
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-xs leading-snug">{value}</p>
    </div>
  );
}

function Assurance({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
