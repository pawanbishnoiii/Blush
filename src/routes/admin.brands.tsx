import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Area, Field, ImageUploader, Toggle } from "@/components/admin/AdminForm";
import { allBrandsQuery } from "@/lib/queries";
import type { Brand } from "@/lib/catalog";

export const Route = createFileRoute("/admin/brands")({
  component: AdminBrands,
});

type Draft = {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logo_url: string;
  is_active: boolean;
  sort_order: number;
};

const EMPTY: Draft = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  logo_url: "",
  is_active: true,
  sort_order: 0,
};

function AdminBrands() {
  const qc = useQueryClient();
  const brands = useQuery(allBrandsQuery);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["brands"] });
  }

  async function save() {
    if (!draft.name.trim()) return void toast.error("Brand name is required");
    const slug = (draft.slug || draft.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setBusy(true);
    const payload = {
      slug,
      name: draft.name.trim(),
      tagline: draft.tagline.trim() || null,
      description: draft.description.trim() || null,
      logo_url: draft.logo_url.trim() || null,
      is_active: draft.is_active,
      sort_order: Number(draft.sort_order) || 0,
    };
    const res = draft.id
      ? await supabase.from("brands").update(payload).eq("id", draft.id)
      : await supabase.from("brands").insert(payload);
    setBusy(false);
    if (res.error) return void toast.error(res.error.message);
    setDraft(EMPTY);
    await refresh();
    toast.success(draft.id ? "Brand updated" : "Brand created");
  }

  async function remove(b: Brand) {
    const { error } = await supabase.from("brands").delete().eq("id", b.id);
    if (error) return void toast.error(error.message);
    await refresh();
    toast.success("Brand deleted");
  }

  async function toggle(b: Brand) {
    const { error } = await supabase.from("brands").update({ is_active: !b.is_active }).eq("id", b.id);
    if (error) return void toast.error(error.message);
    await refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-lift">
        <h2 className="font-display text-base font-extrabold">
          {draft.id ? "Edit brand" : "New brand"}
        </h2>
        <div className="mt-4 grid gap-3">
          <Field label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
          <Field label="Slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} placeholder="auto from name" />
          <Field label="Tagline" value={draft.tagline} onChange={(v) => setDraft({ ...draft, tagline: v })} />
          <Area label="Description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} />
          <Field label="Sort order" value={String(draft.sort_order)} onChange={(v) => setDraft({ ...draft, sort_order: Number(v.replace(/\D/g, "")) || 0 })} />
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Logo</p>
            {draft.logo_url && (
              <img src={draft.logo_url} alt="" className="mb-2 h-16 w-16 rounded-2xl border border-border object-cover" />
            )}
            <ImageUploader
              bucket="product-images"
              folder="brands"
              label="Upload logo"
              onDone={(urls) => setDraft((d) => ({ ...d, logo_url: urls[0] ?? d.logo_url }))}
            />
          </div>
          <Toggle label={draft.is_active ? "Active" : "Hidden"} checked={draft.is_active} onChange={(v) => setDraft({ ...draft, is_active: v })} />
        </div>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={save} disabled={busy} className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-60">
            {busy ? "Saving…" : draft.id ? "Update brand" : "Create brand"}
          </button>
          {draft.id && (
            <button type="button" onClick={() => setDraft(EMPTY)} className="rounded-full border border-border px-5 py-2.5 text-xs font-bold">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {(brands.data ?? []).map((b) => (
          <div key={b.id} className="flex items-center gap-3 rounded-3xl border border-border bg-card p-3 shadow-soft">
            {b.logo_url ? (
              <img src={b.logo_url} alt={b.name} className="h-12 w-12 shrink-0 rounded-2xl object-cover" />
            ) : (
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface text-sm font-black">
                {b.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{b.name}</p>
              <p className="truncate text-xs text-muted-foreground">{b.tagline ?? b.slug}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => setDraft({ id: b.id, slug: b.slug, name: b.name, tagline: b.tagline ?? "", description: b.description ?? "", logo_url: b.logo_url ?? "", is_active: b.is_active, sort_order: b.sort_order })} className="rounded-full bg-surface px-3 py-1.5 text-[11px] font-bold">
                Edit
              </button>
              <Toggle label={b.is_active ? "Active" : "Hidden"} checked={b.is_active} onChange={() => toggle(b)} />
              <button type="button" onClick={() => remove(b)} className="rounded-full px-3 py-1.5 text-[11px] font-bold text-destructive">
                Delete
              </button>
            </div>
          </div>
        ))}
        {(brands.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No brands yet.</p>}
      </div>
    </div>
  );
}
