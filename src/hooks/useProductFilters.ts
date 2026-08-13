import { useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import type { SortKey } from "@/lib/taxonomy";

export type PriceRange = [number, number];

const DEFAULT_RANGE: PriceRange = [0, 10000];

/** Shared filter/sort state for discovery grids (shop, category, search). */
export function useProductFilters(all: Product[], bounds: PriceRange = DEFAULT_RANGE) {
  const [mood, setMood] = useState<string>("All");
  const [occasion, setOccasion] = useState<string>("All");
  const [gender, setGender] = useState<string>("All");
  const [brand, setBrand] = useState<string>("All");
  const [category, setCategory] = useState<string>("All");
  const [price, setPrice] = useState<PriceRange>(bounds);
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    let list = all.filter((p) => p.price_inr >= price[0] && p.price_inr <= price[1]);
    if (mood !== "All") list = list.filter((p) => p.mood_tags?.includes(mood));
    if (occasion !== "All") list = list.filter((p) => p.occasion_tags?.includes(occasion));
    if (gender !== "All") list = list.filter((p) => p.gender === gender);
    if (brand !== "All") list = list.filter((p) => p.brand_id === brand);
    if (category !== "All")
      list = list.filter((p) => p.category_slug === category || p.category === category);

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
      case "newest":
      default:
        sorted.sort((a, b) => {
          if (a.created_at && b.created_at) return b.created_at.localeCompare(a.created_at);
          return b.sort_order - a.sort_order;
        });
        break;
    }
    return sorted;
  }, [all, mood, occasion, gender, brand, category, price, sort]);

  const activeCount =
    (mood !== "All" ? 1 : 0) +
    (occasion !== "All" ? 1 : 0) +
    (gender !== "All" ? 1 : 0) +
    (brand !== "All" ? 1 : 0) +
    (category !== "All" ? 1 : 0) +
    (price[0] !== bounds[0] || price[1] !== bounds[1] ? 1 : 0);

  const reset = () => {
    setMood("All");
    setOccasion("All");
    setGender("All");
    setBrand("All");
    setCategory("All");
    setPrice(bounds);
    setSort("newest");
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
    filtered,
    activeCount,
    reset,
    bounds,
  };
}
