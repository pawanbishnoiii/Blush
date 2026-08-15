import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Icon3D } from "@/components/site/Icon3D";
import { Stars } from "@/components/site/Stars";
import { adminReviewsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

const TABS = ["pending", "approved", "rejected", "all"] as const;

function AdminReviews() {
  const qc = useQueryClient();
  const reviews = useQuery(adminReviewsQuery);
  const [tab, setTab] = useState<(typeof TABS)[number]>("pending");

  const list = (reviews.data ?? []).filter((r) => tab === "all" || r.status === tab);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["admin_reviews"] });
    await qc.invalidateQueries({ queryKey: ["reviews"] });
    toast.success(`Review ${status}`);
  }

  return (
    <div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold capitalize",
              tab === t ? "border-transparent bg-primary text-primary-foreground" : "border-border bg-card",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {reviews.isLoading && <p className="text-sm text-muted-foreground">Loading reviews…</p>}
        {list.map((r) => (
          <article key={r.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Stars rating={r.rating} />
                  <span className="truncate text-sm font-bold">{r.title}</span>
                  {r.is_verified && (
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                      Verified purchase
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.author}
                  {r.variant_label ? ` · ${r.variant_label}` : ""}
                </p>
                <p className="mt-2 text-sm leading-relaxed">{r.body}</p>
                {r.photos?.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {r.photos.map((src) => (
                      <img
                        key={src}
                        src={src}
                        alt="Customer photo"
                        className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-surface px-3 py-1.5 text-[11px] font-bold capitalize">
                  {r.status}
                </span>
                <button
                  type="button"
                  onClick={() => void setStatus(r.id, "approved")}
                  className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => void setStatus(r.id, "rejected")}
                  className="rounded-full border border-destructive/40 px-3 py-1.5 text-[11px] font-bold text-destructive"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => void setStatus(r.id, "hidden")}
                  className="rounded-full border border-border px-3 py-1.5 text-[11px] font-bold"
                >
                  Hide
                </button>
              </div>
            </div>
          </article>
        ))}
        {!reviews.isLoading && list.length === 0 && (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <Icon3D name="rate-your-experience" size="2xl" className="mx-auto" />
            <p className="mt-3 text-sm text-muted-foreground">Nothing in this queue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
