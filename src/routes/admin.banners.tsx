import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Icon3D } from "@/components/site/Icon3D";
import { allBannersQuery, type Banner } from "@/lib/queries";
import { uploadFile } from "@/lib/upload";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBanners,
});

const PLACEMENTS = ["hero", "strip", "mood", "category", "offers"];

type Draft = {
  title: string;
  subtitle: string;
  image_url: string;
  mobile_image_url: string;
  media_type: "image" | "video";
  video_url: string;
  link_url: string;
  cta_label: string;
  placement: string;
  sort_order: number;
};

const EMPTY: Draft = {
  title: "",
  subtitle: "",
  image_url: "",
  mobile_image_url: "",
  media_type: "image",
  video_url: "",
  link_url: "",
  cta_label: "",
  placement: "hero",
  sort_order: 0,
};

function AdminBanners() {
  const qc = useQueryClient();
  const banners = useQuery(allBannersQuery);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ key: string; pct: number } | null>(null);

  const list = banners.data ?? [];

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["banners"] });
  }

  async function upload(file: File, key: "image_url" | "mobile_image_url" | "video_url") {
    setBusy(true);
    setProgress({ key, pct: 0 });
    try {
      const url = await uploadFile("banners", file, (pct) => setProgress({ key, pct }));
      setDraft((d) => ({ ...d, [key]: url }));
      toast.success(key === "video_url" ? "Video uploaded" : "Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function create() {
    if (!draft.title.trim() || !draft.image_url.trim()) {
      toast.error("Title and image are required (the image is also the video poster)");
      return;
    }
    if (draft.media_type === "video" && !draft.video_url.trim()) {
      toast.error("Add a video file or URL, or switch this banner back to image");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("banners").insert({
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim() || null,
      image_url: draft.image_url.trim(),
      mobile_image_url: draft.mobile_image_url.trim() || null,
      media_type: draft.media_type,
      video_url: draft.media_type === "video" ? draft.video_url.trim() : null,
      link_url: draft.link_url.trim() || null,
      cta_label: draft.cta_label.trim() || null,
      placement: draft.placement,
      sort_order: Number(draft.sort_order) || 0,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDraft(EMPTY);
    await refresh();
    toast.success("Banner created");
  }

  async function toggle(b: Banner) {
    const { error } = await supabase
      .from("banners")
      .update({ is_active: !b.is_active })
      .eq("id", b.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
  }

  async function move(b: Banner, delta: number) {
    const { error } = await supabase
      .from("banners")
      .update({ sort_order: Math.max(0, b.sort_order + delta) })
      .eq("id", b.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
  }

  async function remove(b: Banner) {
    const { error } = await supabase.from("banners").delete().eq("id", b.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
    toast.success("Banner removed");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Icon3D name="lookbook" size="md" />
          <h2 className="font-display text-base font-extrabold">New banner</h2>
        </div>

        <div className="mt-4 space-y-3">
          <Field label="Media type">
            <div className="flex gap-2">
              {(["image", "video"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDraft({ ...draft, media_type: t })}
                  aria-pressed={draft.media_type === t}
                  className={cn(
                    pill,
                    "capitalize",
                    draft.media_type === t && "border-transparent bg-primary text-primary-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Title">
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Subtitle">
            <input
              value={draft.subtitle}
              onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Desktop image">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f, "image_url");
              }}
              className="w-full text-xs"
            />
          </Field>
          <Field label="Or paste an image URL">
            <input
              value={draft.image_url}
              onChange={(e) => setDraft({ ...draft, image_url: e.target.value })}
              placeholder="https://…"
              className={inputCls}
            />
          </Field>
          {progress?.key === "image_url" && <Progress pct={progress.pct} />}
          {draft.image_url && (
            <img src={draft.image_url} alt="Banner preview" className="h-28 w-full rounded-2xl object-cover" />
          )}
          {draft.media_type === "video" && (
            <>
              <Field label="Video file (muted autoplay, banner-sized)">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void upload(f, "video_url");
                  }}
                  className="w-full text-xs"
                />
              </Field>
              <Field label="Or paste a video URL">
                <input
                  value={draft.video_url}
                  onChange={(e) => setDraft({ ...draft, video_url: e.target.value })}
                  placeholder="https://…/hero.mp4"
                  className={inputCls}
                />
              </Field>
              {progress?.key === "video_url" && <Progress pct={progress.pct} />}
              {draft.video_url && (
                <video
                  src={draft.video_url}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="h-28 w-full rounded-2xl object-cover"
                />
              )}
            </>
          )}
          <Field label="Mobile image (optional)">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f, "mobile_image_url");
              }}
              className="w-full text-xs"
            />
          </Field>
          {progress?.key === "mobile_image_url" && <Progress pct={progress.pct} />}
          <Field label="Link URL">
            <input
              value={draft.link_url}
              onChange={(e) => setDraft({ ...draft, link_url: e.target.value })}
              placeholder="/shop"
              className={inputCls}
            />
          </Field>
          <Field label="CTA label">
            <input
              value={draft.cta_label}
              onChange={(e) => setDraft({ ...draft, cta_label: e.target.value })}
              placeholder="Shop now"
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Placement">
              <select
                value={draft.placement}
                onChange={(e) => setDraft({ ...draft, placement: e.target.value })}
                className={inputCls}
              >
                {PLACEMENTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                value={draft.sort_order}
                onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
                className={inputCls}
              />
            </Field>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => void create()}
            className="w-full rounded-full px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
          >
            {busy ? "Working…" : "Create banner"}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        {banners.isLoading && <p className="text-sm text-muted-foreground">Loading banners…</p>}
        {list.map((b) => (
          <article
            key={b.id}
            className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-card p-3 shadow-soft"
          >
            <img
              src={b.mobile_image_url ?? b.image_url}
              alt={b.title}
              className="h-16 w-24 shrink-0 rounded-2xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{b.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {b.placement} · {b.media_type === "video" ? "video" : "image"} · order {b.sort_order}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button type="button" onClick={() => void move(b, -1)} className={pill}>
                ↑
              </button>
              <button type="button" onClick={() => void move(b, 1)} className={pill}>
                ↓
              </button>
              <button
                type="button"
                onClick={() => void toggle(b)}
                className={cn(
                  pill,
                  b.is_active ? "border-transparent bg-primary text-primary-foreground" : "",
                )}
              >
                {b.is_active ? "Live" : "Off"}
              </button>
              <button
                type="button"
                onClick={() => void remove(b)}
                className={cn(pill, "border-destructive/40 text-destructive")}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
        {!banners.isLoading && list.length === 0 && (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <Icon3D name="lookbook" size="2xl" className="mx-auto" />
            <p className="mt-3 text-sm text-muted-foreground">No banners yet — create your first one.</p>
          </div>
        )}
      </section>
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";
const pill = "rounded-full border border-border px-3 py-1.5 text-[11px] font-bold";

function Progress({ pct }: { pct: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Upload progress"
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-200"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
