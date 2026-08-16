import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, X, Clock, TrendingUp } from "lucide-react";
import { Icon3D, Icon3DTile } from "@/components/site/Icon3D";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductFilterBar } from "@/components/site/ProductFilters";
import { useProductFilters } from "@/hooks/useProductFilters";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { productsQuery } from "@/lib/queries";
import { DISCOVERY, FASHION, BEAUTY } from "@/lib/taxonomy";

const TRENDING = ["cute top", "lip gloss", "tote bag", "kurti", "perfume"];

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Search — Blush" },
      { name: "description", content: "Search dresses, tops, bags, makeup, skincare and more at Blush." },
      { property: "og:title", content: "Search — Blush" },
      { property: "og:description", content: "Find your next favourite thing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q: initialQ } = Route.useSearch();
  const [q, setQ] = useState(initialQ ?? "");
  const products = useQuery(productsQuery);
  const { recent, add, remove, clear } = useRecentSearches();

  useEffect(() => {
    if (initialQ !== undefined) setQ(initialQ);
  }, [initialQ]);

  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return (products.data ?? []).filter((p) =>
      [p.name, p.tagline, p.category, p.subcategory ?? "", ...(p.mood_tags ?? []), ...(p.vibe_tags ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [q, products.data]);

  const filters = useProductFilters(matches);
  const results = filters.filtered;

  const runSearch = (term: string) => {
    setQ(term);
    add(term);
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 pb-24 pt-8 sm:px-8 md:pb-16">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Search</h1>

      <div className="mt-5 flex items-center gap-3 rounded-full border border-border bg-card px-4 py-3 shadow-soft">
        <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try 'cute top', 'lip gloss', 'tote bag'"
          aria-label="Search products"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label="Clear search">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {!q && (
        <>
          {recent.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="eyebrow flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Recent searches
                </p>
                <button type="button" onClick={clear} className="text-xs font-semibold text-muted-foreground underline">
                  Clear all
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {recent.map((term) => (
                  <span
                    key={term}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-card py-1.5 pl-3.5 pr-2 text-xs font-semibold"
                  >
                    <button type="button" onClick={() => runSearch(term)} className="capitalize">
                      {term}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(term)}
                      aria-label={`Remove ${term} from recent searches`}
                      className="grid h-4 w-4 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="eyebrow mt-10 flex items-center gap-1.5 text-primary">
            <TrendingUp className="h-3.5 w-3.5" /> Trending searches
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TRENDING.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => runSearch(term)}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold capitalize transition-all hover:border-foreground/30"
              >
                {term}
              </button>
            ))}
          </div>

          <p className="eyebrow mt-10 text-primary">Popular right now</p>
          <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-6">
            {DISCOVERY.map((d) => (
              <button key={d.icon} type="button" onClick={() => setQ(d.label)}>
                <Icon3DTile name={d.icon} label={d.label} tone="blush" />
              </button>
            ))}
          </div>
          <p className="eyebrow mt-10 text-secondary">Browse categories</p>
          <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-6 lg:grid-cols-8">
            {[...FASHION, ...BEAUTY].map((c) => (
              <Link key={c.icon} to="/category/$slug" params={{ slug: c.icon }}>
                <Icon3DTile name={c.icon} label={c.label} tone="lilac" />
              </Link>
            ))}
          </div>
        </>
      )}

      {q && results.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Icon3D name="search" size="2xl" />
          <p className="font-display text-lg font-bold">No matches for “{q}”</p>
          <p className="text-sm text-muted-foreground">
            {matches.length > 0 ? "Try loosening your filters." : "Try a shorter word or browse categories."}
          </p>
          {matches.length > 0 && (
            <button type="button" onClick={filters.reset} className="rounded-full border border-border px-4 py-2 text-xs font-bold">
              Reset filters
            </button>
          )}
        </div>
      )}

      {q && (
        <>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {results.length} results for “{q}”
            </p>
            <ProductFilterBar {...filters} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
