import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Icon3D } from "@/components/site/Icon3D";
import { adminVariantsQuery, allProductsQuery, productImagesQuery } from "@/lib/queries";
import { imageFor, inr, type Product } from "@/lib/catalog";
import { MOODS, VIBES } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

type Draft = {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  subcategory: string;
  gender: string;
  price_inr: number;
  compare_at_inr: number | null;
  image_key: string;
  badge: string;
  mood_tags: string[];
  vibe_tags: string[];
  occasion_tags: string[];
  is_featured: boolean;
  is_published: boolean;
  seo_title: string;
  seo_description: string;
};

const EMPTY: Draft = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  category: "fashion",
  subcategory: "",
  gender: "women",
  price_inr: 799,
  compare_at_inr: null,
  image_key: "",
  badge: "",
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
  const [draft, setDraft] = useState<Draft | null>(null);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);

  const list = useMemo(() => {
    const all = products.data ?? [];
    const needle = q.trim().toLowerCase();
    return needle ? all.filter((p) => p.name.toLowerCase().includes(needle)) : all;
  }, [products.data, q]);

  function edit(p: Product) {
    setDraft({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      category: p.category,
      subcategory: p.subcategory ?? "",
      gender: p.gender,
      price_inr: p.price_inr,
      compare_at_inr: p.compare_at_inr,
      image_key: p.image_key,
      badge: p.badge ?? "",
      mood_tags: p.mood_tags ?? [],
      vibe_tags: p.vibe_tags ?? [],
      occasion_tags: p.occasion_tags ?? [],
      is_featured: p.is_featured,
      is_published: p.is_published,
      seo_title: p.seo_title ?? "",
      seo_description: p.seo_description ?? "",
    });
  }

  async function save() {
    if (!draft) return;
    if (!draft.name.trim() || !draft.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }
    setSaving(true);
    const payload = {
      slug: draft.slug.trim(),
      name: draft.name.trim(),
      tagline: draft.tagline,
      description: draft.description,
      category: draft.category,
      subcategory: draft.subcategory || null,
      gender: draft.gender,
      price_inr: Number(draft.price_inr),
      compare_at_inr: draft.compare_at_inr ? Number(draft.compare_at_inr) : null,
      image_key: draft.image_key,
      badge: draft.badge || null,
      mood_tags: draft.mood_tags,
      vibe_tags: draft.vibe_tags,
      occasion_tags: draft.occasion_tags,
      is_featured: draft.is_featured,
      is_published: draft.is_published,
      seo_title: draft.seo_title || null,
      seo_description: draft.seo_description || null,
    };
    const res = draft.id
      ? await supabase.from("products").update(payload).eq("id", draft.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["products"] });
    toast.success(draft.id ? "Product updated" : "Product created");
    setDraft(null);
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

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products"
          className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none"
        />
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
          <h2 className="font-display text-base font-extrabold">
            {draft.id ? "Edit product" : "New product"}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Text label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v, slug: draft.slug || v.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} />
            <Text label="Slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} />
            <Text label="Tagline" value={draft.tagline} onChange={(v) => setDraft({ ...draft, tagline: v })} />
            <Text label="Badge" value={draft.badge} onChange={(v) => setDraft({ ...draft, badge: v })} />
            <Text label="Category" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} />
            <Text label="Subcategory" value={draft.subcategory} onChange={(v) => setDraft({ ...draft, subcategory: v })} />
            <Text label="Gender" value={draft.gender} onChange={(v) => setDraft({ ...draft, gender: v })} />
            <Text label="Main image URL" value={draft.image_key} onChange={(v) => setDraft({ ...draft, image_key: v })} />
            <Text
              label="Price (₹)"
              value={String(draft.price_inr)}
              onChange={(v) => setDraft({ ...draft, price_inr: Number(v.replace(/\D/g, "")) || 0 })}
            />
            <Text
              label="MRP / compare at (₹)"
              value={draft.compare_at_inr ? String(draft.compare_at_inr) : ""}
              onChange={(v) =>
                setDraft({ ...draft, compare_at_inr: v ? Number(v.replace(/\D/g, "")) : null })
              }
            />
            <Text label="SEO title" value={draft.seo_title} onChange={(v) => setDraft({ ...draft, seo_title: v })} />
            <Text
              label="SEO description"
              value={draft.seo_description}
              onChange={(v) => setDraft({ ...draft, seo_description: v })}
            />
          </div>

          <label className="mt-3 block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Description
            </span>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={3}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
            />
          </label>

          <TagPicker
            label="Moods"
            options={MOODS.map((m) => m.key)}
            value={draft.mood_tags}
            onChange={(v) => setDraft({ ...draft, mood_tags: v })}
          />
          <TagPicker
            label="Vibes"
            options={VIBES.map((v) => v.key)}
            value={draft.vibe_tags}
            onChange={(v) => setDraft({ ...draft, vibe_tags: v })}
          />
          <TagPicker
            label="Occasions"
            options={["college", "office", "party", "festive", "travel", "self-care"]}
            value={draft.occasion_tags}
            onChange={(v) => setDraft({ ...draft, occasion_tags: v })}
          />

          <div className="mt-4 flex flex-wrap gap-4">
            <Check label="Featured" checked={draft.is_featured} onChange={(v) => setDraft({ ...draft, is_featured: v })} />
            <Check label="Published" checked={draft.is_published} onChange={(v) => setDraft({ ...draft, is_published: v })} />
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save product"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-full border border-border px-5 py-2.5 text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {list.map((p) => {
          const stock = (variants.data ?? [])
            .filter((v) => v.product_id === p.id)
            .reduce((s, v) => s + v.stock, 0);
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
                  {p.category} · {inr(p.price_inr)} · {stock} in stock
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => edit(p)}
                    className="rounded-full bg-surface px-3 py-1.5 text-[11px] font-bold"
                  >
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
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="rounded-full px-3 py-1.5 text-[11px] font-bold text-destructive"
                  >
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

function Text({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none"
      />
    </label>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
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
