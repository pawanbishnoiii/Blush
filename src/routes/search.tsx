import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { Icon3D, Icon3DTile } from "@/components/site/Icon3D";
import { ProductCard } from "@/components/site/ProductCard";
import { productsQuery } from "@/lib/queries";
import { DISCOVERY, FASHION, BEAUTY } from "@/lib/taxonomy";

export const Route = createFileRoute("/search")({
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
  const [q, setQ] = useState("");
  const products = useQuery(productsQuery);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return (products.data ?? []).filter((p) =>
      [p.name, p.tagline, p.category, p.subcategory ?? "", ...(p.mood_tags ?? []), ...(p.vibe_tags ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [q, products.data]);

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
          <p className="text-sm text-muted-foreground">Try a shorter word or browse categories.</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p className="mt-8 text-sm text-muted-foreground">{results.length} results</p>
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
