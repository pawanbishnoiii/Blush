import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductFilterBar } from "@/components/site/ProductFilters";
import { useProductFilters, type PriceRange } from "@/hooks/useProductFilters";
import { productsQuery, variantFacetsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "The Esko collection — six everyday essentials" },
      {
        name: "description",
        content:
          "Browse all Esko pieces: heavyweight tees, linen shirts, stretch trousers, overshirts, knit polos and cargos. Free delivery over ₹1,499.",
      },
      { property: "og:title", content: "The Esko collection" },
      {
        property: "og:description",
        content: "Six honestly-made essentials, cut and sewn in Tiruppur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

function Shop() {
  const products = useQuery(productsQuery);
  const facets = useQuery(variantFacetsQuery);
  const [filter, setFilter] = useState<string>("All");

  const all = products.data ?? [];
  const categories = ["All", ...Array.from(new Set(all.map((p) => p.category)))];
  const byCategory = filter === "All" ? all : all.filter((p) => p.category === filter);

  const bounds: PriceRange = useMemo(() => {
    if (all.length === 0) return [0, 10000];
    const prices = all.map((p) => p.price_inr);
    return [Math.min(...prices), Math.max(...prices)];
  }, [all]);

  const filters = useProductFilters(byCategory, bounds, facets.data);
  const visible = filters.filtered;

  return (
    <div className="surface-warm">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 lg:py-20">
        <p className="eyebrow text-accent">The collection</p>
        <h1 className="section-type mt-4 max-w-3xl">
          Everything we make. Nothing we don&apos;t believe in.
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          A deliberately short line. Each piece is restocked rather than replaced, so the fit you
          like stays available.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                  filter === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-foreground/30",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <ProductFilterBar {...filters} />
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{visible.length} products</p>

        {products.isLoading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
