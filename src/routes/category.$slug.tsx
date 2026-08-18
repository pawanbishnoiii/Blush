import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { Icon3D } from "@/components/site/Icon3D";
import { ProductFilterBar } from "@/components/site/ProductFilters";
import { useProductFilters, type PriceRange } from "@/hooks/useProductFilters";
import { categoriesQuery, productsQuery, variantFacetsQuery } from "@/lib/queries";
import { BEAUTY, FASHION, VIBES } from "@/lib/taxonomy";
import type { Product } from "@/lib/catalog";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const title = label(params.slug);
    return {
      meta: [
        { title: `${title} — Blush` },
        { name: "description", content: `Shop ${title.toLowerCase()} picked for your vibe. Fast delivery and easy returns across India.` },
        { property: "og:title", content: `${title} — Blush` },
        { property: "og:description", content: `Shop ${title.toLowerCase()} at Blush.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
});

function label(slug: string) {
  const known = [...FASHION, ...BEAUTY].find((c) => c.icon === slug);
  if (known) return known.label;
  const vibe = VIBES.find((v) => v.key === slug);
  if (vibe) return vibe.label;
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function iconFor(slug: string) {
  const known = [...FASHION, ...BEAUTY].find((c) => c.icon === slug);
  if (known) return known.icon;
  const vibe = VIBES.find((v) => v.key === slug);
  return vibe?.icon ?? "collections";
}

function CategoryPage() {
  const { slug } = Route.useParams();
  const products = useQuery(productsQuery);
  const facets = useQuery(variantFacetsQuery);
  const categories = useQuery(categoriesQuery);
  const title = label(slug);

  const subCategories = useMemo(
    () => (categories.data ?? []).filter((c: { parent_slug: string | null }) => c.parent_slug === slug),
    [categories.data, slug],
  );

  const matches = useMemo(() => {
    const all: Product[] = products.data ?? [];
    const needle = slug.replace(/-/g, " ").toLowerCase();
    return all.filter(
      (p) =>
        p.category?.toLowerCase() === needle ||
        p.subcategory?.toLowerCase() === needle ||
        p.mood_tags?.includes(slug) ||
        p.vibe_tags?.includes(slug) ||
        p.occasion_tags?.includes(slug) ||
        p.name.toLowerCase().includes(needle),
    );
  }, [products.data, slug]);

  const bounds: PriceRange = useMemo(() => {
    if (matches.length === 0) return [0, 10000];
    const prices = matches.map((p) => p.price_inr);
    return [Math.min(...prices), Math.max(...prices)];
  }, [matches]);

  const filters = useProductFilters(matches, bounds, facets.data);
  const items = filters.filtered;

  const childSlugs = useMemo(
    () => new Set(subCategories.map((c: { slug: string }) => c.slug)),
    [subCategories],
  );

  /** A parent category also lists everything sitting inside its sub-categories. */
  const withChildren = useMemo(() => {
    if (childSlugs.size === 0) return items;
    const all: Product[] = products.data ?? [];
    const extra = all.filter(
      (p) =>
        !items.some((i) => i.id === p.id) &&
        (childSlugs.has(p.category_slug ?? "") ||
          childSlugs.has((p.subcategory ?? "").toLowerCase().replace(/\s+/g, "-"))),
    );
    return [...items, ...extra];
  }, [items, childSlugs, products.data]);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 pb-24 pt-8 sm:px-8 md:pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Icon3D name={iconFor(slug)} size="xl" />
          <div className="min-w-0">
            <h1 className="truncate font-display text-3xl font-extrabold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{withChildren.length} products</p>
          </div>
        </div>
        {matches.length > 0 && <ProductFilterBar {...filters} />}
      </div>

      {subCategories.length > 0 && (
        <div className="-mx-5 mt-5 flex gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {subCategories.map((c: { slug: string; name: string; image_url: string | null }) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="w-[86px] shrink-0 text-center"
            >
              <span className="block h-[86px] w-[86px] overflow-hidden rounded-2xl bg-surface">
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Icon3D name={iconFor(c.slug)} size="md" className="mx-auto mt-5" />
                )}
              </span>
              <span className="mt-1.5 block truncate text-[11px] font-semibold">{c.name}</span>
            </Link>
          ))}
        </div>
      )}

      {products.isLoading ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      ) : withChildren.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <Icon3D name={matches.length === 0 ? "search" : "filters"} size="2xl" />
          <p className="font-display text-xl font-bold">
            {matches.length === 0 ? "Nothing here yet" : "No matches for these filters"}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {matches.length === 0
              ? "This edit is being restocked. Browse everything while you wait."
              : "Try widening the price range or clearing a filter."}
          </p>
          {matches.length === 0 ? (
            <Link
              to="/shop"
              className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
            >
              Browse all
            </Link>
          ) : (
            <button
              type="button"
              onClick={filters.reset}
              className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {withChildren.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
