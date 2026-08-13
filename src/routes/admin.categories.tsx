import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Area, Field, ImageUploader, Select, Toggle } from "@/components/admin/AdminForm";
import { Icon3D } from "@/components/site/Icon3D";
import { allCategoriesQuery } from "@/lib/queries";
import { ICON_3D_NAMES, type Icon3DName } from "@/lib/icons3d";
import type { Category } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

type Draft = {
  id?: string;
  slug: string;
  name: string;
  parent_slug: string;
  gender: string;
  icon: string;
  image_url: string;
  description: string;
  is_active: boolean;
  sort_order: number;
};

const EMPTY: Draft = {
  slug: "",
  name: "",
  parent_slug: "",
  gender: "all",
  icon: "women-fashion",
  image_url: "",
  description: "",
  is_active: true,
  sort_order: 0,
};

const GENDERS = ["all", "women", "men", "unisex", "kids"];

function AdminCategories() {
  const qc = useQueryClient();
  const categories = useQuery(allCategoriesQuery);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  const all = categories.data ?? [];
  const parents = useMemo(() => all.filter((c) => !c.parent_slug), [all]);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? all.filter((c) => c.name.toLowerCase().includes(needle)) : all;
  }, [all, q]);

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["categories"] });
  }

  async function save() {
    if (!draft.name.trim()) return void toast.error("Category name is required");
    const slug = (draft.slug || draft.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setBusy(true);
    const payload = {
      slug,
      name: draft.name.trim(),
      parent_slug: draft.parent_slug || null,
      gender: draft.gender || "all",
      icon: draft.icon || null,
      image_url: draft.image_url.trim() || null,
      description: draft.description.trim() || null,
      is_active: draft.is_active,
      sort_order: Number(draft.sort_order) || 0,
    };
    const res = draft.id
      ? await supabase.from("categories").update(payload).eq("id", draft.id)
      : await supabase.from("categories").insert(payload);
    setBusy(false);
    if (res.error) return void toast.error(res.error.message);
    setDraft(EMPTY);
    await refresh();
    toast.success(draft.id ? "Category updated" : "Category created");
  }

  async function remove(c: Category) {
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) return void toast.error(error.message);
    await refresh();
    toast.success("Category deleted");
  }

  async function toggle(c: Category) {
    const { error } = await supabase.from("categories").update({ is_active: !c.is_active }).eq("id", c.id);
    if (error) return void toast.error(error.message);
    await refresh();
  }

  async function move(c: Category, delta: number) {
    const { error } = await supabase
      .from("categories")
      .update({ sort_order: Math.max(0, c.sort_order + delta) })
      .eq("id", c.id);
    if (error) return void toast.error(error.message);
    await refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-lift">
        <h2 className="font-display text-base font-extrabold">
          {draft.id ? "Edit category" : "New category"}
        </h2>
        <div className="mt-4 grid gap-3">
          <Field label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
          <Field label="Slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} placeholder="auto from name" />
          <Select
            label="Parent category"
            value={draft.parent_slug}
            onChange={(v) => setDraft({ ...draft, parent_slug: v })}
            options={[{ value: "", label: "None (top level)" }, ...parents.map((p) => ({ value: p.slug, label: p.name }))]}
          />
          <Select label="Gender" value={draft.gender} onChange={(v) => setDraft({ ...draft, gender: v })} options={GENDERS.map((g) => ({ value: g, label: g }))} />
          <Area label="Description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} rows={2} />
          <Field label="Sort order" value={String(draft.sort_order)} onChange={(v) => setDraft({ ...draft, sort_order: Number(v.replace(/\D/g, "")) || 0 })} />

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Icon</p>
            <div className="grid max-h-48 grid-cols-6 gap-2 overflow-y-auto rounded-2xl border border-border p-2">
              {ICON_3D_NAMES.map((n) => (
                <button
                  key={n}
                  type="button"
                  title={n}
                  onClick={() => setDraft({ ...draft, icon: n })}
                  className={cn(
                    "grid place-items-center rounded-xl p-1 transition-all",
                    draft.icon === n ? "bg-primary/15 ring-2 ring-primary" : "hover:bg-surface",
                  )}
                >
                  <Icon3D name={n as Icon3DName} size="xs" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Cover image</p>
            {draft.image_url && (
              <img src={draft.image_url} alt="" className="mb-2 h-20 w-full rounded-2xl border border-border object-cover" />
            )}
            <ImageUploader
              bucket="product-images"
              folder="categories"
              label="Upload cover"
              onDone={(urls) => setDraft((d) => ({ ...d, image_url: urls[0] ?? d.image_url }))}
            />
          </div>

          <Toggle label={draft.is_active ? "Active" : "Hidden"} checked={draft.is_active} onChange={(v) => setDraft({ ...draft, is_active: v })} />
        </div>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={save} disabled={busy} className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-60">
            {busy ? "Saving…" : draft.id ? "Update category" : "Create category"}
          </button>
          {draft.id && (
            <button type="button" onClick={() => setDraft(EMPTY)} className="rounded-full border border-border px-5 py-2.5 text-xs font-bold">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search categories"
          className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none"
        />
        <p className="mt-2 text-xs text-muted-foreground">{all.length} categories</p>
        <div className="mt-3 space-y-2">
          {list.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
              <Icon3D name={(c.icon as Icon3DName) ?? "women-fashion"} size="xs" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {c.parent_slug && <span className="text-muted-foreground">{c.parent_slug} / </span>}
                  {c.name}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">{c.slug} · {c.gender ?? "all"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button type="button" onClick={() => move(c, -1)} className="rounded-full bg-surface px-2 py-1 text-[11px] font-bold">↑</button>
                <button type="button" onClick={() => move(c, 1)} className="rounded-full bg-surface px-2 py-1 text-[11px] font-bold">↓</button>
                <button
                  type="button"
                  onClick={() => setDraft({ id: c.id, slug: c.slug, name: c.name, parent_slug: c.parent_slug ?? "", gender: c.gender ?? "all", icon: c.icon ?? "women-fashion", image_url: c.image_url ?? "", description: c.description ?? "", is_active: c.is_active, sort_order: c.sort_order })}
                  className="rounded-full bg-surface px-3 py-1.5 text-[11px] font-bold"
                >
                  Edit
                </button>
                <Toggle label={c.is_active ? "On" : "Off"} checked={c.is_active} onChange={() => toggle(c)} />
                <button type="button" onClick={() => remove(c)} className="rounded-full px-2 py-1.5 text-[11px] font-bold text-destructive">✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
