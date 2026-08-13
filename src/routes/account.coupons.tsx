import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { couponsQuery } from "@/lib/queries";
import { Icon3D } from "@/components/site/Icon3D";
import { inr } from "@/lib/catalog";

export const Route = createFileRoute("/account/coupons")({
  head: () => ({
    meta: [
      { title: "Coupons — Blush" },
      { name: "description", content: "Active Blush coupons and offers you can use at checkout." },
      { property: "og:title", content: "Coupons — Blush" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CouponsPage,
});

function CouponsPage() {
  const coupons = useQuery(couponsQuery);

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Copied ${code}`);
    } catch {
      toast.error("Couldn't copy that code");
    }
  }

  return (
    <div className="mx-auto w-full max-w-[800px] px-5 pb-24 pt-8 sm:px-8">
      <div className="flex items-center gap-4">
        <Icon3D name="coupons" size="xl" float />
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Coupons</h1>
          <p className="text-sm text-muted-foreground">{(coupons.data ?? []).length} active offers</p>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {(coupons.data ?? []).map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-4 rounded-3xl border border-dashed border-primary/40 bg-card p-5 shadow-soft">
            <div className="min-w-0">
              <p className="font-display text-lg font-extrabold tracking-tight">{c.code}</p>
              <p className="text-sm font-semibold">{c.title}</p>
              {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                Min cart {inr(c.min_cart)}
                {c.expires_at ? ` · Expires ${new Date(c.expires_at).toLocaleDateString()}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copy(c.code)}
              className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              Copy
            </button>
          </div>
        ))}
        {(coupons.data?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">No active coupons right now — check back soon.</p>
        )}
      </div>
    </div>
  );
}
