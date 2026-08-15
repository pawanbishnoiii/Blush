import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { Icon3D, Icon3DTile } from "@/components/site/Icon3D";
import { ProductCard } from "@/components/site/ProductCard";
import { bannersQuery, couponsQuery, productsQuery } from "@/lib/queries";
import { discountPct, inr } from "@/lib/catalog";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & coupons — Blush" },
      {
        name: "description",
        content:
          "Live coupons, price drops and budget edits. Save more on fashion, beauty and accessories at Blush.",
      },
      { property: "og:title", content: "Offers & coupons — Blush" },
      { property: "og:description", content: "Live coupons and price drops updated daily." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const coupons = useQuery(couponsQuery);
  const products = useQuery(productsQuery);
  const promos = useQuery(bannersQuery("offers"));

  const deals = useMemo(
    () =>
      (products.data ?? [])
        .filter((p) => discountPct(p.price_inr, p.compare_at_inr) > 0)
        .sort(
          (a, b) =>
            discountPct(b.price_inr, b.compare_at_inr) - discountPct(a.price_inr, a.compare_at_inr),
        ),
    [products.data],
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 pb-24 pt-8 sm:px-8 md:pb-16">
      <div className="flex items-center gap-4">
        <Icon3D name="deals-of-the-day" size="xl" float />
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Offers</h1>
          <p className="text-sm text-muted-foreground">Coupons, price drops and budget edits</p>
        </div>
      </div>

      {(promos.data?.length ?? 0) > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {(promos.data ?? []).map((b) => (
            <a key={b.id} href={b.link_url ?? "/shop"} className="overflow-hidden rounded-3xl shadow-soft">
              <img src={b.image_url} alt={b.title} className="w-full object-cover" />
            </a>
          ))}
        </div>
      )}

      <h2 className="mt-10 font-display text-xl font-extrabold">Your coupons</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(coupons.data ?? []).map((c) => (
          <div
            key={c.id}
            className="flex min-w-0 items-center gap-4 rounded-3xl border border-dashed border-primary/40 bg-card p-5 shadow-soft"
          >
            <Icon3D name="promo-code" size="lg" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-extrabold">{c.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">Min cart {inr(c.min_cart)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(c.code);
                toast.success(`Copied ${c.code}`);
              }}
              className="shrink-0 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
            >
              {c.code}
            </button>
          </div>
        ))}
        {(coupons.data?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">
            No live coupons right now — check back soon.
          </p>
        )}
      </div>

      <h2 className="mt-12 font-display text-xl font-extrabold">Price drops</h2>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {deals.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>

      <div className="mt-14 grid grid-cols-3 gap-4 sm:grid-cols-6">
        {(["gifts", "gift-cards", "fun-zone", "rewards", "best-sellers", "top-rated"] as const).map(
          (icon) => (
            <Link key={icon} to="/shop">
              <Icon3DTile name={icon} label={icon.replace(/-/g, " ")} tone="peach" />
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
