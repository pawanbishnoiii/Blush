import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { MOODS, OCCASIONS, SORT_OPTIONS, type SortKey } from "@/lib/taxonomy";
import { brandsQuery, categoriesQuery } from "@/lib/queries";
import { inr } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import type { PriceRange } from "@/hooks/useProductFilters";
import type { VariantFacets } from "@/lib/queries";

type Filters = {
  mood: string;
  setMood: (v: string) => void;
  occasion: string;
  setOccasion: (v: string) => void;
  gender: string;
  setGender: (v: string) => void;
  brand: string;
  setBrand: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  price: PriceRange;
  setPrice: (v: PriceRange) => void;
  sort: SortKey;
  setSort: (v: SortKey) => void;
  minDiscount: number;
  setMinDiscount: (v: number) => void;
  minRating: number;
  setMinRating: (v: number) => void;
  sizes: string[];
  toggleSize: (v: string) => void;
  colors: string[];
  toggleColor: (v: string) => void;
  facets?: VariantFacets | undefined;
  filtered: { id: string }[];
  bounds: PriceRange;
  reset: () => void;
  activeCount: number;
};

function Chips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="eyebrow text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange("All")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
            value === "All"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:border-foreground/30",
          )}
        >
          All
        </button>
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-all",
              value === o.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-foreground/30",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PriceFilter({
  price,
  setPrice,
  bounds,
}: {
  price: PriceRange;
  setPrice: (v: PriceRange) => void;
  bounds: PriceRange;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="eyebrow text-muted-foreground">Price range</p>
        <p className="num-strong text-xs">
          {inr(price[0])} – {inr(price[1])}
        </p>
      </div>
      <Slider
        className="mt-3"
        min={bounds[0]}
        max={bounds[1]}
        step={100}
        value={price}
        onValueChange={(v) => setPrice([v[0] ?? bounds[0], v[1] ?? bounds[1]] as PriceRange)}
      />
    </div>
  );
}

export function SortSelect({ sort, setSort }: { sort: SortKey; setSort: (v: SortKey) => void }) {
  return (
    <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
      <SelectTrigger className="w-auto min-w-[9.5rem] gap-2 rounded-full border-border bg-card px-4 py-2 text-sm font-semibold shadow-none">
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((o) => (
          <SelectItem key={o.key} value={o.key}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function FilterFields(props: Filters) {
  const brands = useQuery(brandsQuery);
  const categories = useQuery(categoriesQuery);
  return (
    <div className="space-y-6">
      <Chips
        label="Gender"
        options={[
          { key: "women", label: "Women" },
          { key: "men", label: "Men" },
          { key: "unisex", label: "Unisex" },
          { key: "kids", label: "Kids" },
        ]}
        value={props.gender}
        onChange={props.setGender}
      />
      <PriceFilter price={props.price} setPrice={props.setPrice} bounds={props.bounds} />
      <div>
        <p className="eyebrow text-muted-foreground">Discount</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[0, 10, 20, 30, 50, 60].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => props.setMinDiscount(d)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
                props.minDiscount === d
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-foreground/30",
              )}
            >
              {d === 0 ? "Any" : `${d}%+ off`}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow text-muted-foreground">Customer rating</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[0, 3, 3.5, 4, 4.5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => props.setMinRating(r)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
                props.minRating === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-foreground/30",
              )}
            >
              {r === 0 ? "Any" : `${r}★ & above`}
            </button>
          ))}
        </div>
      </div>
      {(props.facets?.allSizes.length ?? 0) > 0 && (
        <div>
          <p className="eyebrow text-muted-foreground">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {props.facets!.allSizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => props.toggleSize(s)}
                aria-pressed={props.sizes.includes(s)}
                className={cn(
                  "min-w-[2.75rem] rounded-xl border px-3 py-2 text-xs font-bold transition-all",
                  props.sizes.includes(s)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-foreground/30",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      {(props.facets?.allColors.length ?? 0) > 0 && (
        <div>
          <p className="eyebrow text-muted-foreground">Colour</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {props.facets!.allColors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => props.toggleColor(c.name)}
                aria-pressed={props.colors.includes(c.name)}
                className={cn(
                  "flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-xs font-semibold capitalize transition-all",
                  props.colors.includes(c.name)
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-foreground/30",
                )}
              >
                <span
                  className="h-5 w-5 rounded-full border border-border"
                  style={{ background: c.hex }}
                  aria-hidden
                />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <Chips
        label="Category"
        options={(categories.data ?? []).map((c) => ({ key: c.slug, label: c.name }))}
        value={props.category}
        onChange={props.setCategory}
      />
      <Chips
        label="Brand"
        options={(brands.data ?? []).map((b) => ({ key: b.id, label: b.name }))}
        value={props.brand}
        onChange={props.setBrand}
      />
      <Chips label="Mood" options={MOODS.map((m) => ({ key: m.key, label: m.label }))} value={props.mood} onChange={props.setMood} />
      <Chips label="Occasion" options={OCCASIONS} value={props.occasion} onChange={props.setOccasion} />
    </div>
  );
}

/** Desktop inline filter row: sort select + a "Filters" sheet trigger shared with mobile. */
export function ProductFilterBar(props: Filters & { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", props.className)}>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 rounded-full border-border bg-card font-semibold">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {props.activeCount > 0 && (
              <span className="num-strong grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {props.activeCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader className="text-left">
            <SheetTitle>Filter & sort</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-6">
            <div>
              <p className="eyebrow text-muted-foreground">Sort by</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => props.setSort(o.key)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
                      props.sort === o.key
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:border-foreground/30",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <FilterFields {...props} />
          </div>
          <div className="mt-8 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-full" onClick={props.reset}>
              Reset
            </Button>
            <SheetClose asChild>
              <Button className="flex-1 rounded-full">Show {props.filtered.length} results</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

      <SortSelect sort={props.sort} setSort={props.setSort} />
    </div>
  );
}
