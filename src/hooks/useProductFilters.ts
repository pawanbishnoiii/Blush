import { useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import type { SortKey } from "@/lib/taxonomy";
import type { VariantFacets } from "@/lib/queries";

export type PriceRange = [number, number];

const DEFAULT_RANGE: PriceRange = [0, 10000];

function discountPct(p: Product) {
  if (!p.compare_at_inr || p.compare_at_inr <= p.price_inr) return 0;
  return Math.round(((p.compare_at_inr - p.price_inr) / p.compare_at_inr) * 100);
}

/** Shared filter/sort state for discovery grids (shop, category, search). */
export function useProductFilters(
  all: Product[],
  bounds: PriceRange = DEFAULT_RANGE,
  facets?: VariantFacets,
) {
  const [mood, setMood] = useState<string>("All");
  const [occasion, setOccasion] = useState<string>("All");
  const [gender, setGender] = useState<string>("All");
  const [brand, setBrand] = useState<string>("All");
  const [category, setCategory] = useState<string>("All");
  const [price, setPrice] = useState<PriceRange>(bounds);
  const [sort, setSort] = useState<SortKey>("newest");
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [minRating, setMinRating] = useState<number>(0);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const toggleSize = (s: string) =>
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const toggleColor = (c: string) =>
    setColors((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const filtered = useMemo(() => {
    let list = all.filter((p) => p.price_inr >= price[0] && p.price_inr <= price[1]);
    if (mood !== "All") list = list.filter((p) => p.mood_tags?.includes(mood));
    if (occasion !== "All") list = list.filter((p) => p.occasion_tags?.includes(occasion));
    if (gender !== "All") list = list.filter((p) => p.gender === gender);
    if (brand !== "All") list = list.filter((p) => p.brand_id === brand);
    if (category !== "All")
      list = list.filter((p) => p.category_slug === category || p.category === category);
    if (minDiscount > 0) list = list.filter((p) => discountPct(p) >= minDiscount);
    if (minRating > 0) list = list.filter((p) => (p.rating ?? 0) >= minRating);
    if (sizes.length > 0 && facets)
      list = list.filter((p) => (facets.sizes[p.id] ?? []).some((s) => sizes.includes(s)));
    if (colors.length > 0 && facets)
      list = list.filter((p) => (facets.colors[p.id] ?? []).some((c) => colors.includes(c)));

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price_inr - b.price_inr);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price_inr - a.price_inr);
        break;
      case "top-rated":
        sorted.sort((a, b) => b.rating - a.rating || b.review_count - a.review_count);
        break;
      case "discount":
        sorted.sort((a, b) => discountPct(b) - discountPct(a));
        break;
      case "popular":
        sorted.sort((a, b) => b.review_count - a.review_count || b.rating - a.rating);
        break;
      case "newest":
      default:
        sorted.sort((a, b) => {
          if (a.created_at && b.created_at) return b.created_at.localeCompare(a.created_at);
          return b.sort_order - a.sort_order;
        });
        break;
    }
    return sorted;
  }, [all, mood, occasion, gender, brand, category, price, sort, minDiscount, minRating, sizes, colors, facets]);

  const activeCount =
    (mood !== "All" ? 1 : 0) +
    (occasion !== "All" ? 1 : 0) +
    (gender !== "All" ? 1 : 0) +
    (brand !== "All" ? 1 : 0) +
    (category !== "All" ? 1 : 0) +
    (minDiscount > 0 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (sizes.length > 0 ? 1 : 0) +
    (colors.length > 0 ? 1 : 0) +
    (price[0] !== bounds[0] || price[1] !== bounds[1] ? 1 : 0);

  const reset = () => {
    setMood("All");
    setOccasion("All");
    setGender("All");
    setBrand("All");
    setCategory("All");
    setPrice(bounds);
    setSort("newest");
    setMinDiscount(0);
    setMinRating(0);
    setSizes([]);
    setColors([]);
  };

  return {
    mood,
    setMood,
    occasion,
    setOccasion,
    gender,
    setGender,
    brand,
    setBrand,
    category,
    setCategory,
    price,
    setPrice,
    sort,
    setSort,
    minDiscount,
    setMinDiscount,
    minRating,
    setMinRating,
    sizes,
    toggleSize,
    colors,
    toggleColor,
    facets,
    filtered,
    activeCount,
    reset,
    bounds,
  };
}
