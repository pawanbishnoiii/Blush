import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import { Check, Package, Truck, Home, ClipboardList } from "lucide-react";
import { getOrder } from "@/lib/orders.functions";
import { imageFor, inr } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Tracking ${params.code} — Esko` },
      { name: "description", content: "Live delivery timeline for your Esko order." },
      { property: "og:title", content: `Tracking ${params.code} — Esko` },
      { property: "og:description", content: "Live delivery timeline for your Esko order." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackOrder,
});

const STAGES = [
  { key: "placed", label: "Order placed", icon: ClipboardList },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "packed", label: "Packed", icon: Package },
  { key: "shipped", label: "Out for delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

function TrackOrder() {
  const { code } = Route.useParams();
  const fetchOrder = useServerFn(getOrder);
  const { data, isLoading } = useQuery({
    queryKey: ["order", code],
    queryFn: () => fetchOrder({ data: { code } }),
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="surface-warm">
        <div className="mx-auto max-w-md px-5 py-28 text-center">
          <h1 className="section-type">No order matches {code}.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Double-check the code in your confirmation email.
          </p>
          <Link to="/track" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground">
            Try another code
          </Link>
        </div>
      </div>
    );
  }

  const { order, items, events } = data;
  const currentIndex = Math.max(
    0,
    STAGES.findIndex((s) => s.key === order.status),
  );

  return (
    <div className="surface-warm">
      <div className="mx-auto w-full max-w-[880px] px-5 py-14 sm:px-8 lg:py-20">
        <p className="eyebrow text-accent">Live tracking</p>
        <h1 className="section-type mt-4">{order.order_code}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {order.courier} · AWB {order.tracking_number} · arriving{" "}
          <span className="font-semibold text-foreground">
            {new Date(order.eta ?? Date.now()).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "long",
            })}
          </span>
        </p>

        {/* progress rail */}
        <div className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <ol className="relative space-y-8">
            <span className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-border" aria-hidden />
            <motion.span
              className="absolute left-[19px] top-2 w-px bg-accent"
              initial={{ height: 0 }}
              animate={{ height: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden
            />
            {STAGES.map((stage, i) => {
              const done = i <= currentIndex;
              const event = events.find((e) => e.status === stage.key);
              const Icon = stage.icon;
              return (
                <li key={stage.key} className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-4">
                  <span
                    className={cn(
                      "z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition-colors",
                      done ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 pt-1.5">
                    <p className={cn("text-sm font-semibold", !done && "text-muted-foreground")}>
                      {stage.label}
                    </p>
                    {event?.note && (
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{event.note}</p>
                    )}
                    {event?.happened_at && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(event.happened_at).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="eyebrow text-muted-foreground">Delivering to</p>
            <p className="mt-2 text-sm font-semibold">{order.full_name}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {order.address_line1}
              {order.address_line2 ? `, ${order.address_line2}` : ""}, {order.city}, {order.state}{" "}
              {order.pincode}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="eyebrow text-muted-foreground">Order value</p>
            <p className="num-strong mt-2 text-2xl">{inr(order.total)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {order.payment_method === "cod" ? "Cash on delivery" : `Paid by ${order.payment_method.toUpperCase()}`}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">In this parcel</h2>
          <ul className="mt-5 space-y-4">
            {items.map((it, i) => (
              <li key={i} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <img src={imageFor(it.image_key)} alt={it.name} loading="lazy" className="h-14 w-12 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{it.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {it.variant_label} · ×{it.quantity}
                  </p>
                </div>
                <span className="num-strong text-sm">{inr(it.unit_price * it.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
