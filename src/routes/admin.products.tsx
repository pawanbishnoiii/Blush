import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Icon3D } from "@/components/site/Icon3D";
import { Area, Field, ImageUploader, Select, Toggle } from "@/components/admin/AdminForm";
import {
  adminVariantsQuery,
  allBrandsQuery,
  allCategoriesQuery,
  allProductsQuery,
  productImagesQuery,
} from "@/lib/queries";
import { imageFor, inr, type Product, type ProductImage, type Variant } from "@/lib/catalog";
import { MOODS, VIBES } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

const SIZE_PRESETS: Record<string, string[]> = {
  apparel: ["XS", "S", "M", "L", "XL", "XXL"],
  footwear: ["UK3", "UK4", "UK5", "UK6", "UK7", "UK8"],
  beauty: ["30ml", "50ml", "100ml"],
  onesize: ["One Size"],
};

type Draft = {
  id?: string | undefined;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  about: string;
  category: string;
  category_slug: string;
  subcategory: string;
  brand_id: string;
  gender: string;
  price_inr: number;
  compare_at_inr: number | null;
  weight_grams: number | null;
  image_key: string;
  badge: string;
  fabric: string;
  fit: string;
  care: string;
  refund_policy: string;
  return_days: number;
  is_returnable: boolean;
  mood_tags: string[];
  vibe_tags: string[];
  occasion_tags: string[];
  is_featured: boolean;
  is_published: boolean;
  seo_title: string;
  seo_description: string;
};

const DEFAULT_REFUND = "Easy 15-day returns. Item must be unused with original tags and packaging.";

const EMPTY: Draft = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  about: "",
  category: "fashion",
  category_slug: "",
  subcategory: "",
  brand_id: "",
  gender: "women",
  price_inr: 799,
  compare_at_inr: null,
  weight_grams: null,
  image_key: "",
  badge: "",
  fabric: "",
  fit: "",
  care: "",
  refund_policy: DEFAULT_REFUND,
  return_days: 15,
  is_returnable: true,
  mood_tags: [],
  vibe_tags: [],
  occasion_tags: [],
  is_featured: false,
  is_published: true,
  seo_title: "",
  seo_description: "",
};

function AdminProducts() {
  const qc = useQueryClient();
  const products = useQuery(allProductsQuery);
  const images = useQuery(productImagesQuery);
  const variants = useQuery(adminVariantsQuery);
  const brands = useQuery(allBrandsQuery);
  const categories = useQuery(allCategoriesQuery);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [q, setQ] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [saving, setSaving] = useState(false);

  const brandName = (id: string | null | undefined) =>
    (brands.data ?? []).find((b) => b.id === id)?.name ?? "No brand";

  const list = useMemo(() => {
    let all = products.data ?? [];
    const needle = q.trim().toLowerCase();
    if (needle) all = all.filter((p) => p.name.toLowerCase().includes(needle) || p.slug.includes(needle));
    if (filterCat) all = all.filter((p) => p.category_slug === filterCat || p.category === filterCat);
    return all;
  }, [products.data, q, filterCat]);

  function edit(p: Product) {
    setDraft({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      about: p.about ?? "",
      category: p.category,
      category_slug: p.category_slug ?? "",
      subcategory: p.subcategory ?? "",
      brand_id: p.brand_id ?? "",
      gender: p.gender,
      price_inr: p.price_inr,
      compare_at_inr: p.compare_at_inr,
      weight_grams: p.weight_grams ?? null,
      image_key: p.image_key,
      badge: p.badge ?? "",
      fabric: p.fabric ?? "",
      fit: p.fit ?? "",
      care: p.care ?? "",
      refund_policy: p.refund_policy ?? DEFAULT_REFUND,
      return_days: p.return_days ?? 15,
      is_returnable: p.is_returnable ?? true,
      mood_tags: p.mood_tags ?? [],
      vibe_tags: p.vibe_tags ?? [],
      occasion_tags: p.occasion_tags ?? [],
      is_featured: p.is_featured,
      is_published: p.is_published,
      seo_title: p.seo_title ?? "",
      seo_description: p.seo_description ?? "",
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    if (!draft) return;
    if (!draft.name.trim()) return void toast.error("Name is required");
    const slug = (draft.slug || draft.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setSaving(true);
    const payload = {
      slug,
      name: draft.name.trim(),
      tagline: draft.tagline,
      description: draft.description,
      about: draft.about || null,
      category: draft.category_slug || draft.category,
      category_slug: draft.category_slug || null,
      subcategory: draft.subcategory || null,
      brand_id: draft.brand_id || null,
      gender: draft.gender,
      price_inr: Number(draft.price_inr),
      compare_at_inr: draft.compare_at_inr ? Number(draft.compare_at_inr) : null,
      weight_grams: draft.weight_grams ? Number(draft.weight_grams) : null,
      image_key: draft.image_key,
      badge: draft.badge || null,
      fabric: draft.fabric || null,
      fit: draft.fit || null,
      care: draft.care || null,
      refund_policy: draft.refund_policy || DEFAULT_REFUND,
      return_days: Number(draft.return_days) || 15,
      is_returnable: draft.is_returnable,
      mood_tags: draft.mood_tags,
      vibe_tags: draft.vibe_tags,
      occasion_tags: draft.occasion_tags,
      is_featured: draft.is_featured,
      is_published: draft.is_published,
      seo_title: draft.seo_title || null,
      seo_description: draft.seo_description || null,
    };
    const res = draft.id
      ? await supabase.from("products").update(payload).eq("id", draft.id).select("id").maybeSingle()
      : await supabase.from("products").insert(payload).select("id").maybeSingle();
    setSaving(false);
    if (res.error) return void toast.error(res.error.message);
    await qc.invalidateQueries({ queryKey: ["products"] });
    toast.success(draft.id ? "Product updated" : "Product created");
    const newId = (res.data as { id: string } | null)?.id;
    setDraft((d) => (d ? { ...d, id: d.id ?? newId, slug } : d));
  }

  async function remove(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["products"] });
    toast.success("Product deleted");
  }

  async function togglePublish(p: Product) {
    const { error } = await supabase
      .from("products")
      .update({ is_published: !p.is_published })
      .eq("id", p.id);
    if (error) return void toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["products"] });
  }

  const cats = categories.data ?? [];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products"
          className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none"
        />
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none"
        >
          <option value="">All categories</option>
          {cats.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setDraft({ ...EMPTY })}
          className="shrink-0 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground"
        >
          New product
        </button>
      </div>

      {draft && (
        <div className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-lift">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="truncate font-display text-base font-extrabold">
              {draft.id ? `Edit — ${draft.name || "product"}` : "New product"}
            </h2>
            <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-[11px] font-bold capitalize text-muted-foreground">
              {kind} setup
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setTab(s.key)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-colors",
                  tab === s.key ? "bg-primary text-primary-foreground" : "bg-surface",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className={cn("mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3", tab !== "basics" && "hidden")}>
            <Field label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
            <Field label="Slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} placeholder="auto from name" />
            <Field label="Tagline" value={draft.tagline} onChange={(v) => setDraft({ ...draft, tagline: v })} />
            <Select
              label="Brand"
              value={draft.brand_id}
              onChange={(v) => setDraft({ ...draft, brand_id: v })}
              options={[{ value: "", label: "No brand" }, ...(brands.data ?? []).map((b) => ({ value: b.id, label: b.name }))]}
            />
            <Select
              label="Category"
              value={draft.category_slug}
              onChange={(v) => setDraft({ ...draft, category_slug: v })}
              options={[{ value: "", label: "Uncategorised" }, ...cats.map((c) => ({ value: c.slug, label: c.parent_slug ? `${c.parent_slug} / ${c.name}` : c.name }))]}
            />
            <Select
              label="Gender"
              value={draft.gender}
              onChange={(v) => setDraft({ ...draft, gender: v })}
              options={["women", "men", "unisex", "kids"].map((g) => ({ value: g, label: g }))}
            />
            <Field label="Badge" value={draft.badge} onChange={(v) => setDraft({ ...draft, badge: v })} />
            <Field label="Weight (grams)" value={draft.weight_grams ? String(draft.weight_grams) : ""} onChange={(v) => setDraft({ ...draft, weight_grams: v ? Number(v.replace(/\D/g, "")) : null })} />
            {kind === "fashion" && (
              <>
                <Field label="Fabric / material" value={draft.fabric} onChange={(v) => setDraft({ ...draft, fabric: v })} />
                <Field label="Fit" value={draft.fit} onChange={(v) => setDraft({ ...draft, fit: v })} />
                <Field label="Wash care" value={draft.care} onChange={(v) => setDraft({ ...draft, care: v })} />
              </>
            )}
            {kind === "beauty" && (
              <>
                <Field label="Key ingredients" value={draft.fabric} onChange={(v) => setDraft({ ...draft, fabric: v })} placeholder="Niacinamide, Vitamin C" />
                <Field label="Skin / hair type" value={draft.fit} onChange={(v) => setDraft({ ...draft, fit: v })} placeholder="All skin types" />
                <Field label="How to use" value={draft.care} onChange={(v) => setDraft({ ...draft, care: v })} />
              </>
            )}
            {kind === "accessory" && (
              <>
                <Field label="Material" value={draft.fabric} onChange={(v) => setDraft({ ...draft, fabric: v })} placeholder="Gold-plated brass" />
                <Field label="Dimensions" value={draft.fit} onChange={(v) => setDraft({ ...draft, fit: v })} placeholder="24cm x 12cm" />
                <Field label="Care" value={draft.care} onChange={(v) => setDraft({ ...draft, care: v })} />
              </>
            )}
          </div>

          <div className={cn("mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3", tab !== "pricing" && "hidden")}>
            <Field label="Price (₹)" value={String(draft.price_inr)} onChange={(v) => setDraft({ ...draft, price_inr: Number(v.replace(/\D/g, "")) || 0 })} />
            <Field label="MRP / compare at (₹)" value={draft.compare_at_inr ? String(draft.compare_at_inr) : ""} onChange={(v) => setDraft({ ...draft, compare_at_inr: v ? Number(v.replace(/\D/g, "")) : null })} />
            <Field label="Return window (days)" value={String(draft.return_days)} onChange={(v) => setDraft({ ...draft, return_days: Number(v.replace(/\D/g, "")) || 0 })} />
          </div>

          <div className={cn("mt-3 grid gap-3 lg:grid-cols-2", tab !== "content" && "hidden")}>
            <Area label="Description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} />
            <Area label="About this product" value={draft.about} onChange={(v) => setDraft({ ...draft, about: v })} />
            <Field label="SEO title" value={draft.seo_title} onChange={(v) => setDraft({ ...draft, seo_title: v })} />
            <Field label="SEO description" value={draft.seo_description} onChange={(v) => setDraft({ ...draft, seo_description: v })} />
          </div>

          <div className={cn("mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_auto]", tab !== "pricing" && "hidden")}>
            <Area label="Refund / return policy" value={draft.refund_policy} onChange={(v) => setDraft({ ...draft, refund_policy: v })} rows={2} />
            <div className="flex items-end gap-2 pb-1">
              <Toggle label={draft.is_returnable ? "Returnable" : "Final sale"} checked={draft.is_returnable} onChange={(v) => setDraft({ ...draft, is_returnable: v })} />
              <button
                type="button"
                onClick={() => setDraft({ ...draft, refund_policy: DEFAULT_REFUND, return_days: 15, is_returnable: true })}
                className="rounded-full border border-border px-3 py-1.5 text-[11px] font-bold"
              >
                Use default
              </button>
            </div>
          </div>

          <div className={cn("mt-4", tab !== "media" && "hidden")}>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Main image</p>
            <div className="flex items-start gap-3">
              {draft.image_key && (
                <img src={draft.image_key} alt="" className="h-24 w-20 shrink-0 rounded-2xl border border-border object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <ImageUploader
                  bucket="product-images"
                  folder="products"
                  label="Upload main image"
                  onDone={(urls) => setDraft((d) => (d ? { ...d, image_key: urls[0] ?? d.image_key } : d))}
                />
              </div>
            </div>
          </div>

          <div className={cn(tab !== "content" && "hidden")}>
            <TagPicker label="Moods" options={MOODS.map((m) => m.key)} value={draft.mood_tags} onChange={(v) => setDraft({ ...draft, mood_tags: v })} />
            <TagPicker label="Vibes" options={VIBES.map((v) => v.key)} value={draft.vibe_tags} onChange={(v) => setDraft({ ...draft, vibe_tags: v })} />
            <TagPicker label="Occasions" options={["college", "office", "party", "festive", "travel", "self-care"]} value={draft.occasion_tags} onChange={(v) => setDraft({ ...draft, occasion_tags: v })} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Toggle label="Featured" checked={draft.is_featured} onChange={(v) => setDraft({ ...draft, is_featured: v })} />
            <Toggle label={draft.is_published ? "Published" : "Draft"} checked={draft.is_published} onChange={(v) => setDraft({ ...draft, is_published: v })} />
          </div>

          <div className="sticky bottom-4 z-10 mt-5 flex gap-3 rounded-full border border-border bg-card/95 p-2 shadow-lift backdrop-blur">
            <button type="button" onClick={save} disabled={saving} className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-60">
              {saving ? "Saving…" : "Save product"}
            </button>
            <button type="button" onClick={() => setDraft(null)} className="rounded-full border border-border px-5 py-2.5 text-xs font-bold">
              Close
            </button>
          </div>

          {draft.id && tab === "media" && (
            <>
              <GalleryManager
                productId={draft.id}
                rows={images.data?.[draft.id] ?? []}
                variants={(variants.data ?? []).filter((v) => v.product_id === draft.id)}
              />
            </>
          )}
          {draft.id && tab === "variants" && (
            <>
              <VariantManager
                productId={draft.id}
                rows={(variants.data ?? []).filter((v) => v.product_id === draft.id)}
                slug={draft.slug}
              />
            </>
          )}
          {!draft.id && (tab === "media" || tab === "variants") && (
            <p className="mt-6 rounded-2xl bg-surface p-3 text-xs text-muted-foreground">
              Save the product first to add colour galleries, sizes and stock.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {list.map((p) => {
          const pv = (variants.data ?? []).filter((v) => v.product_id === p.id);
          const stock = pv.reduce((s, v) => s + v.stock, 0);
          const colors = new Set(pv.map((v) => v.color_name)).size;
          return (
            <div key={p.id} className="flex gap-3 rounded-3xl border border-border bg-card p-3 shadow-soft">
              <img
                src={imageFor(images.data?.[p.id], p.image_key)}
                alt={p.name}
                className="h-20 w-16 shrink-0 rounded-2xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {brandName(p.brand_id)} · {p.category_slug ?? p.category} · {inr(p.price_inr)}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {colors} colours · {pv.length} sizes · {stock} in stock
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" onClick={() => edit(p)} className="rounded-full bg-surface px-3 py-1.5 text-[11px] font-bold">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePublish(p)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[11px] font-bold",
                      p.is_published ? "bg-success text-success-foreground" : "bg-muted",
                    )}
                  >
                    {p.is_published ? "Published" : "Draft"}
                  </button>
                  <button type="button" onClick={() => remove(p.id)} className="rounded-full px-3 py-1.5 text-[11px] font-bold text-destructive">
                    Delete
                  </button>
                </div>
              </div>
              <Icon3D name="women-fashion" size="sm" className="shrink-0" />
            </div>
          );
        })}
        {list.length === 0 && <p className="text-sm text-muted-foreground">No products found.</p>}
      </div>
    </div>
  );
}

/* ---------- Colour gallery ---------- */
function GalleryManager({
  productId,
  rows,
  variants,
}: {
  productId: string;
  rows: ProductImage[];
  variants: Variant[];
}) {
  const qc = useQueryClient();
  const colors = Array.from(new Set(variants.map((v) => v.color_name)));
  const [color, setColor] = useState<string>(colors[0] ?? "");

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["product_images"] });
  }

  async function add(urls: string[]) {
    const base = rows.length;
    const { error } = await supabase.from("product_images").insert(
      urls.map((url, i) => ({
        product_id: productId,
        color_name: color || null,
        url,
        alt: null,
        sort_order: base + i,
      })),
    );
    if (error) return void toast.error(error.message);
    await refresh();
  }

  async function del(id: string) {
    const { error } = await supabase.from("product_images").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    await refresh();
  }

  async function move(row: ProductImage, delta: number) {
    const { error } = await supabase
      .from("product_images")
      .update({ sort_order: Math.max(0, row.sort_order + delta) })
      .eq("id", row.id);
    if (error) return void toast.error(error.message);
    await refresh();
  }

  const shown = color ? rows.filter((r) => (r.color_name ?? "") === color) : rows;

  return (
    <div className="mt-6 rounded-2xl border border-border bg-background/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-extrabold">Gallery ({rows.length} images)</h3>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setColor("")}
            className={cn("rounded-full border px-3 py-1 text-[11px] font-bold", color === "" ? "border-transparent bg-primary text-primary-foreground" : "border-border")}
          >
            All / no colour
          </button>
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn("rounded-full border px-3 py-1 text-[11px] font-bold", color === c ? "border-transparent bg-primary text-primary-foreground" : "border-border")}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <ImageUploader
          bucket="product-images"
          folder={`products/${productId}`}
          label={color ? `Upload images for ${color}` : "Upload images"}
          multiple
          onDone={add}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
        {shown.map((r) => (
          <div key={r.id} className="group relative overflow-hidden rounded-xl border border-border">
            <img src={r.url} alt={r.alt ?? ""} className="aspect-[4/5] w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-background/85 p-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button type="button" onClick={() => move(r, -1)} className="text-[10px] font-bold">↑</button>
              <span className="truncate text-[9px] text-muted-foreground">{r.color_name ?? "—"}</span>
              <button type="button" onClick={() => move(r, 1)} className="text-[10px] font-bold">↓</button>
              <button type="button" onClick={() => del(r.id)} className="text-[10px] font-bold text-destructive">✕</button>
            </div>
          </div>
        ))}
        {shown.length === 0 && <p className="col-span-full text-xs text-muted-foreground">No images yet.</p>}
      </div>
    </div>
  );
}

/* ---------- Colour + size + stock ---------- */
function VariantManager({ productId, rows, slug }: { productId: string; rows: Variant[]; slug: string }) {
  const qc = useQueryClient();
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#f3c1cd");
  const [sizes, setSizes] = useState<string[]>(SIZE_PRESETS['apparel'] ?? []);
  const [stock, setStock] = useState(25);
  const [priceDelta, setPriceDelta] = useState(0);

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin_variants"] });
  }

  async function addColor() {
    if (!colorName.trim()) return void toast.error("Colour name is required");
    if (sizes.length === 0) return void toast.error("Pick at least one size");
    const base = rows.length;
    const { error } = await supabase.from("product_variants").insert(
      sizes.map((size, i) => ({
        product_id: productId,
        color_name: colorName.trim(),
        color_hex: colorHex,
        size,
        sku: `${slug.toUpperCase().slice(0, 12)}-${colorName.trim().toUpperCase().slice(0, 4)}-${size}`.replace(/[^A-Z0-9-]/g, ""),
        stock: Number(stock) || 0,
        price_delta: Number(priceDelta) || 0,
        sort_order: base + i,
      })),
    );
    if (error) return void toast.error(error.message);
    setColorName("");
    await refresh();
    toast.success("Colour and sizes added");
  }

  async function updateRow(id: string, patch: Partial<Variant>) {
    const { error } = await supabase.from("product_variants").update(patch).eq("id", id);
    if (error) return void toast.error(error.message);
    await refresh();
  }

  async function del(id: string) {
    const { error } = await supabase.from("product_variants").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    await refresh();
  }

  const grouped = rows.reduce<Record<string, Variant[]>>((acc, v) => {
    (acc[v.color_name] ??= []).push(v);
    return acc;
  }, {});

  return (
    <div className="mt-4 rounded-2xl border border-border bg-background/60 p-4">
      <h3 className="text-sm font-extrabold">Colours, sizes & stock</h3>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Colour name" value={colorName} onChange={setColorName} placeholder="Blush Pink" />
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">Colour swatch</span>
          <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)} className="h-10 w-full rounded-2xl border border-border bg-background" />
        </label>
        <Field label="Stock per size" value={String(stock)} onChange={(v) => setStock(Number(v.replace(/\D/g, "")) || 0)} />
        <Field label="Price delta (₹)" value={String(priceDelta)} onChange={(v) => setPriceDelta(Number(v.replace(/[^\d-]/g, "")) || 0)} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {Object.entries(SIZE_PRESETS).map(([k, v]) => (
          <button key={k} type="button" onClick={() => setSizes(v)} className="rounded-full border border-border px-3 py-1 text-[11px] font-bold capitalize">
            {k}
          </button>
        ))}
        <span className="text-[11px] text-muted-foreground">|</span>
        {Array.from(new Set([...Object.values(SIZE_PRESETS).flat()])).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSizes((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))}
            className={cn("rounded-full border px-3 py-1 text-[11px] font-bold", sizes.includes(s) ? "border-transparent bg-secondary text-secondary-foreground" : "border-border")}
          >
            {s}
          </button>
        ))}
      </div>

      <button type="button" onClick={addColor} className="mt-3 rounded-full bg-primary px-4 py-2 text-[11px] font-bold text-primary-foreground">
        Add colour with {sizes.length} sizes
      </button>

      <div className="mt-4 space-y-3">
        {Object.entries(grouped).map(([c, vs]) => (
          <div key={c} className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border border-border" style={{ background: vs[0]?.color_hex }} />
              <p className="text-xs font-bold">{c}</p>
              <span className="text-[11px] text-muted-foreground">{vs.reduce((s, v) => s + v.stock, 0)} in stock</span>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {vs.map((v) => (
                <div key={v.id} className="flex items-center gap-2 rounded-xl bg-surface px-2 py-1.5">
                  <span className="w-16 shrink-0 text-[11px] font-bold">{v.size}</span>
                  <input
                    type="number"
                    defaultValue={v.stock}
                    onBlur={(e) => {
                      const n = Number(e.target.value);
                      if (n !== v.stock) updateRow(v.id, { stock: n });
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1 text-[11px]"
                  />
                  <button type="button" onClick={() => del(v.id)} className="text-[11px] font-bold text-destructive">✕</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TagPicker({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-semibold capitalize",
                on ? "border-transparent bg-secondary text-secondary-foreground" : "border-border",
              )}
            >
              {o.replace(/-/g, " ")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
