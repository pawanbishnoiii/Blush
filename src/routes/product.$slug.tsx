import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowRight,
  Ruler,
  Heart,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { productDetailQuery, productsQuery } from "@/lib/queries";
import { deliveryEstimate, discountPct, imageFor, inr, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/hooks/useWishlist";
import { Stars } from "@/components/site/Stars";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductGallery } from "@/components/site/ProductGallery";
import { Reveal } from "@/components/site/Reveal";
import { Icon3D } from "@/components/site/Icon3D";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const name = params.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${name} — Blush` },
        {
          name: "description",
          content: `${name} at Blush. Fashion, beauty and accessories curated by vibe, delivered fast with easy returns.`,
        },
        { property: "og:title", content: `${name} — Blush` },
        {
          property: "og:description",
          content: `${name} at Blush. Fashion, beauty and accessories curated by vibe.`,
        },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const detail = useQuery(productDetailQuery(slug));
  const allProducts = useQuery(productsQuery);
  const add = useCart((s) => s.add);
  const wishlist = useWishlist();

  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const [added, setAdded] = useState(false);

  const product = detail.data?.product;
  const variants = useMemo(() => detail.data?.variants ?? [], [detail.data]);
  const productImages = useMemo(() => detail.data?.images ?? [], [detail.data]);
  const reviews = detail.data?.reviews ?? [];

  const colors = useMemo(() => {
    const map = new Map<string, { name: string; hex: string; swatch?: string | null }>();
    variants.forEach((v) => map.set(v.color_name, { name: v.color_name, hex: v.color_hex, swatch: v.swatch_url }));
    return Array.from(map.values());
  }, [variants]);

  const sizes = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v) => set.add(v.size));
    return Array.from(set);
  }, [variants]);

  // Default selections.
  useEffect(() => {
    if (!color && colors.length) setColor(colors[0]!.name);
  }, [colors, color]);

  useEffect(() => {
    if (!size && sizes.length) setSize(sizes[0]!);
  }, [sizes, size]);

  // Reset gallery index when colour changes so variant images appear first.
  useEffect(() => {
    setGalleryIndex(0);
  }, [color]);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const selected = useMemo(() => {
    if (!color || !size) return variants[0] ?? null;
    return variants.find((v) => v.color_name === color && v.size === size) ?? null;
  }, [variants, color, size]);

  // When only one dimension exists, derive the matching variant.
  const effectiveVariant = useMemo(() => {
    if (selected) return selected;
    if (color && !size) return variants.find((v) => v.color_name === color) ?? variants[0] ?? null;
    if (size && !color) return variants.find((v) => v.size === size) ?? variants[0] ?? null;
    return variants[0] ?? null;
  }, [selected, color, size, variants]);

  const unitPrice = product ? product.price_inr + (effectiveVariant?.price_delta ?? 0) : 0;
  const inStock = (effectiveVariant?.stock ?? 0) > 0;
  const lowStock = inStock && (effectiveVariant?.stock ?? 0) <= 5;

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const base = product.image_key ? [{ url: product.image_key, alt: product.name }] : [];
    const byColor =
      color && productImages.length
        ? productImages
            .filter((img) => img.color_name === color)
            .sort((a, b) => a.sort_order - b.sort_order)
        : [];
    const rest = productImages
      .filter((img) => img.color_name !== color)
      .sort((a, b) => a.sort_order - b.sort_order);
    return [
      ...byColor.map((img) => ({ url: img.url, alt: img.alt ?? product.name })),
      ...base,
      ...rest.map((img) => ({ url: img.url, alt: img.alt ?? product.name })),
    ];
  }, [product, productImages, color]);

  const completeLook = useMemo(() => {
    if (!product) return [];
    const all = allProducts.data ?? [];
    const scored = all
      .filter((p) => p.id !== product.id)
      .map((p) => {
        let score = 0;
        if (p.category === product.category) score += 3;
        const sharedMoods = (p.mood_tags ?? []).filter((m) => (product.mood_tags ?? []).includes(m)).length;
        const sharedVibes = (p.vibe_tags ?? []).filter((v) => (product.vibe_tags ?? []).includes(v)).length;
        const sharedOcc = (p.occasion_tags ?? []).filter((o) => (product.occasion_tags ?? []).includes(o)).length;
        score += sharedMoods * 2 + sharedVibes * 2 + sharedOcc;
        return { product: p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.product);
    return scored;
  }, [allProducts.data, product]);

  const similar = useMemo(() => {
    if (!product) return [];
    const all = allProducts.data ?? [];
    return all
      .filter((p) => p.id !== product.id)
      .map((p) => {
        const sharedMoods = (p.mood_tags ?? []).filter((m) => (product.mood_tags ?? []).includes(m)).length;
        const sharedVibes = (p.vibe_tags ?? []).filter((v) => (product.vibe_tags ?? []).includes(v)).length;
        return { product: p, score: sharedMoods + sharedVibes };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating)
      .slice(0, 4)
      .map((x) => x.product);
  }, [allProducts.data, product]);

  function handleAdd(then?: "cart" | "checkout") {
    if (!product || !effectiveVariant) return;
    if (!inStock) return;
    add({
      variantId: effectiveVariant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageKey: product.image_key,
      colorName: effectiveVariant.color_name,
      size: effectiveVariant.size,
      unitPrice,
      compareAt: product.compare_at_inr,
      quantity: qty,
      maxStock: effectiveVariant.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    if (then === "checkout") {
      navigate({ to: "/checkout" });
      return;
    }
    if (then === "cart") {
      navigate({ to: "/cart" });
      return;
    }
    toast.success(`${product.name} added`, {
      description: `${effectiveVariant.color_name} · ${effectiveVariant.size} · ${inr(unitPrice * qty)}`,
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
        <Icon3D name="search" size="2xl" />
        <h1 className="section-type mt-6">We couldn&apos;t find that piece.</h1>
        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Back to the collection
        </Link>
      </div>
    );
  }

  const saved = wishlist.isSaved(product.id);
  const discount = discountPct(product.price_inr, product.compare_at_inr);

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
          <ProductGallery
            images={galleryImages}
            activeIndex={galleryIndex}
            onIndexChange={setGalleryIndex}
            badge={product.badge}
          />

          {/* PURCHASE PANEL */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {product.badge && (
                <span className="eyebrow inline-flex items-center gap-1 rounded-full bg-accent/12 px-3 py-1.5 text-accent">
                  <Sparkles className="h-3 w-3" /> {product.badge}
                </span>
              )}
              {discount > 0 && (
                <span className="num-strong rounded-full bg-success/12 px-2.5 py-1 text-xs text-success">
                  {discount}% off
                </span>
              )}
            </div>

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
                    Save {inr(product.compare_at_inr - unitPrice)}
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes · SKU: {effectiveVariant?.sku ?? "—"}</p>

            {/* COLOUR */}
            {colors.length > 1 && (
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
                      {c.swatch ? (
                        <img src={c.swatch} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-inset ring-black/10" />
                      ) : (
                        <span
                          className="h-8 w-8 rounded-full ring-1 ring-inset ring-black/10"
                          style={{ backgroundColor: c.hex }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SIZE */}
            {sizes.length > 1 && (
              <div className="mt-7">
                <div className="flex items-center justify-between">
                  <p className="eyebrow text-muted-foreground">Size</p>
                  <SizeGuideTrigger chart={product.size_chart} fit={product.fit} />
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2.5">
                  {sizes.map((s) => {
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
            )}

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
                  onClick={() => setQty((q) => Math.min(effectiveVariant?.stock ?? 1, q + 1))}
                  aria-label="Increase quantity"
                  className="grid h-12 w-12 place-items-center rounded-full"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className={cn("text-sm font-medium", inStock ? "text-success" : "text-destructive")}>
                {inStock
                  ? lowStock
                    ? `Only ${effectiveVariant?.stock} left in ${color ?? ""} ${effectiveVariant?.size ?? ""}`
                    : "In stock, ready to ship"
                  : `${color ?? ""} ${effectiveVariant?.size ?? ""} is sold out`}
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                disabled={!inStock}
                onClick={() => handleAdd()}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-primary bg-card text-[15px] font-semibold transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {added ? "Added" : "Add to cart"}
              </button>
              <button
                disabled={!inStock}
                onClick={() => handleAdd("checkout")}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Buy now <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* WISHLIST */}
            <button
              type="button"
              onClick={() => wishlist.toggle(product.id)}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              <Heart className={cn("h-4 w-4", saved && "fill-primary text-primary")} />
              {saved ? "Saved to wishlist" : "Save to wishlist"}
            </button>

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

            {/* SPECS */}
            <div className="mt-7 grid grid-cols-3 gap-3">
              <Spec label="Fabric" value={product.fabric ?? "—"} />
              <Spec label="Fit" value={product.fit ?? "—"} />
              <Spec label="Care" value={product.care ?? "—"} />
            </div>
          </div>
        </div>

        {/* COMPLETE THE LOOK */}
        {completeLook.length > 0 && (
          <section className="mt-20">
            <div className="flex items-center gap-3">
              <Icon3D name="collections" size="md" />
              <h2 className="section-type">Complete the look</h2>
            </div>
            <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {completeLook.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

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

        {/* SIMILAR */}
        {similar.length > 0 && (
          <section className="mt-20">
            <h2 className="section-type">You may also like</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {similar.map((p, i) => (
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
                    {effectiveVariant?.color_name} · {effectiveVariant?.size} · {inStock ? "In stock" : "Sold out"}
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
                  Buy
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

function SizeGuideTrigger({
  chart,
  fit,
}: {
  chart: Record<string, Record<string, string>> | null;
  fit: string | null;
}) {
  const hasChart = chart && Object.keys(chart).length > 0;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
          <Ruler className="h-3 w-3" /> Size guide
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold">Size guide</DialogTitle>
        </DialogHeader>
        {fit && (
          <p className="mt-2 text-sm text-muted-foreground">
            Fit: <span className="font-semibold text-foreground">{fit}</span>
          </p>
        )}
        {hasChart ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Size</th>
                  {Object.keys(chart).map((size) => (
                    <th key={size} className="px-4 py-3 text-center font-semibold">
                      {size}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(chart[Object.keys(chart)[0]!]!).map(([measure, _]) => (
                  <tr key={measure} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{measure}</td>
                    {Object.keys(chart).map((size) => (
                      <td key={size} className="px-4 py-3 text-center text-muted-foreground">
                        {chart[size]![measure]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center">
            <Icon3D name="size-guide" size="lg" />
            <p className="mt-3 font-display font-bold">No size chart yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This piece is free-size or the chart is being added. Check the fabric & fit notes above.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
