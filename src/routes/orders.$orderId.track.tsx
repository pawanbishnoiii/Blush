import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Icon3D } from "@/components/site/Icon3D";
import { deliveryProvidersQuery, orderDetailQuery } from "@/lib/queries";
import { TRACKING_STEPS, stepIndex } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders/$orderId/track")({
  head: () => ({
    meta: [
      { title: "Track your order — Blush" },
      { name: "description", content: "Live tracking for your Blush order: courier, AWB, ETA and every scan." },
      { property: "og:title", content: "Track your order — Blush" },
      { property: "og:description", content: "Courier, AWB, ETA and live scans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackPage,
});

type TrackingEvent = {
  id: string;
  status: string;
  title: string;
  note: string | null;
  happened_at: string;
};

function TrackPage() {
  const { orderId } = Route.useParams();
  const qc = useQueryClient();
  const order = useQuery(orderDetailQuery(orderId));
  const providers = useQuery(deliveryProvidersQuery);

  useEffect(() => {
    const channel = supabase
      .channel(`track-${orderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tracking_events", filter: `order_id=eq.${orderId}` },
        () => qc.invalidateQueries({ queryKey: ["order", orderId] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        () => qc.invalidateQueries({ queryKey: ["order", orderId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, qc]);

  const o = order.data as Record<string, unknown> | null;

  if (order.isLoading) {
    return <div className="px-5 py-20 text-center text-sm text-muted-foreground">Loading tracking…</div>;
  }
  if (!o) {
    return (
      <div className="flex flex-col items-center gap-3 px-5 py-24 text-center">
        <Icon3D name="track-order" size="2xl" />
        <p className="font-display text-lg font-bold">Order not found</p>
        <Link to="/orders" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
          Back to orders
        </Link>
      </div>
    );
  }

  const status = String(o["status"]);
  const idx = stepIndex(status);
  const events = ((o["tracking_events"] ?? []) as TrackingEvent[]).slice().sort(
    (a, b) => new Date(b.happened_at).getTime() - new Date(a.happened_at).getTime(),
  );
  const courierCode = o["courier"] ? String(o["courier"]) : null;
  const provider = (providers.data ?? []).find(
    (p) => p.code === courierCode || p.name === courierCode,
  );
  const awb = o["tracking_number"] ? String(o["tracking_number"]) : null;
  const trackUrl =
    provider?.tracking_url_pattern && awb
      ? provider.tracking_url_pattern.replace("{awb}", awb)
      : null;

  return (
    <div className="mx-auto w-full max-w-[860px] px-5 pb-28 pt-8 sm:px-8 md:pb-16">
      <div className="flex items-center gap-4">
        <Icon3D name="track-order" size="xl" float />
        <div className="min-w-0">
          <p className="eyebrow text-primary">Tracking</p>
          <h1 className="truncate font-display text-2xl font-extrabold tracking-tight">
            {String(o["order_code"])}
          </h1>
          <p className="text-xs capitalize text-muted-foreground">{status.replace(/_/g, " ")}</p>
        </div>
      </div>

      {/* Courier card */}
      <div className="mt-6 grid gap-3 rounded-3xl border border-border bg-card p-5 shadow-soft sm:grid-cols-3">
        <Info label="Courier" value={provider?.name ?? courierCode ?? "Assigning"} />
        <Info label="AWB / Tracking" value={awb ?? "—"} />
        <Info
          label="Expected delivery"
          value={
            o["eta"]
              ? new Date(String(o["eta"])).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })
              : "Calculating"
          }
        />
        {trackUrl && (
          <a
            href={trackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:col-span-3 rounded-full bg-primary px-5 py-2.5 text-center text-xs font-bold text-primary-foreground"
          >
            Track on {provider?.name}
          </a>
        )}
      </div>

      {/* Timeline */}
      <div className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-display text-base font-extrabold">Journey</h2>
        <ol className="mt-5 space-y-0">
          {TRACKING_STEPS.map((s, i) => {
            const done = i <= idx && status !== "cancelled";
            const current = i === idx && status !== "cancelled";
            return (
              <li key={s.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                      done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      current && "shadow-glow",
                    )}
                  >
                    {i + 1}
                  </span>
                  {i < TRACKING_STEPS.length - 1 && (
                    <span className={cn("w-0.5 flex-1", done ? "bg-primary" : "bg-border")} />
                  )}
                </div>
                <div className={cn("min-w-0 pb-6", !done && "opacity-55")}>
                  <p className="text-sm font-bold">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.note}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Scans */}
      {events.length > 0 && (
        <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-base font-extrabold">Latest updates</h2>
          <ul className="mt-4 space-y-3">
            {events.map((e) => (
              <li key={e.id} className="flex gap-3">
                <Icon3D name="fast-delivery" size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{e.title}</p>
                  {e.note && <p className="text-xs text-muted-foreground">{e.note}</p>}
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(e.happened_at).toLocaleString("en-IN")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 rounded-3xl bg-surface p-5">
        <div className="flex items-center gap-2">
          <Icon3D name="addresses" size="sm" />
          <p className="text-sm font-bold">Delivering to</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {String(o["full_name"])}, {String(o["address_line1"])}, {String(o["city"])},{" "}
          {String(o["state"])} {String(o["pincode"])}
        </p>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-surface px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-semibold">{value}</p>
    </div>
  );
}
