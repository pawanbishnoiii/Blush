import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Icon3D } from "@/components/site/Icon3D";
import { orderDetailQuery } from "@/lib/queries";
import { inr, TRACKING_STEPS, stepIndex } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders/$orderId/")({
  head: () => ({
    meta: [
      { title: "Order details — Blush" },
      { name: "description", content: "Your Blush order details, items, delivery address and live status." },
      { property: "og:title", content: "Order details — Blush" },
      { property: "og:description", content: "Items, delivery address and live status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderDetail,
});

type OrderItem = {
  id: string;
  name: string;
  variant_label: string;
  image_key: string;
  unit_price: number;
  quantity: number;
};

function OrderDetail() {
  const { orderId } = Route.useParams();
  const qc = useQueryClient();
  const order = useQuery(orderDetailQuery(orderId));

  useEffect(() => {
    const channel = supabase
      .channel(`order-${orderId}`)
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

  if (order.isLoading) {
    return <div className="px-5 py-20 text-center text-sm text-muted-foreground">Loading order…</div>;
  }

  const o = order.data as Record<string, unknown> | null;
  if (!o) {
    return (
      <div className="flex flex-col items-center gap-3 px-5 py-24 text-center">
        <Icon3D name="search" size="2xl" />
        <p className="font-display text-lg font-bold">Order not found</p>
        <Link to="/orders" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
          Back to orders
        </Link>
      </div>
    );
  }

  const items = (o["order_items"] ?? []) as OrderItem[];
  const status = String(o["status"]);
  const idx = stepIndex(status);
  const cancellable = ["placed", "confirmed", "packed"].includes(status);

  async function cancel() {
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["order", orderId] });
    await qc.invalidateQueries({ queryKey: ["my_orders"] });
    toast.success("Order cancelled. Refund starts within 24 hours.");
  }

  async function requestReturn() {
    const { error } = await supabase.from("orders").update({ status: "returned" }).eq("id", orderId);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["order", orderId] });
    toast.success("Return requested — pickup will be scheduled.");
  }

  return (
    <div className="mx-auto w-full max-w-[900px] px-5 pb-28 pt-8 sm:px-8 md:pb-16">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <p className="eyebrow text-primary">Order</p>
          <h1 className="truncate font-display text-2xl font-extrabold tracking-tight">
            {String(o["order_code"])}
          </h1>
          <p className="text-xs capitalize text-muted-foreground">{status.replace(/_/g, " ")}</p>
        </div>
        <Link
          to="/orders/$orderId/track"
          params={{ orderId }}
          className="shrink-0 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground"
        >
          Track
        </Link>
      </div>

      {/* Progress */}
      <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-1">
          {TRACKING_STEPS.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center gap-1">
              <span
                className={cn(
                  "h-2 flex-1 rounded-full",
                  i <= idx && status !== "cancelled" ? "bg-primary" : "bg-muted",
                )}
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm font-semibold">
          {status === "cancelled" ? "Order cancelled" : TRACKING_STEPS[idx]!.label}
        </p>
        <p className="text-xs text-muted-foreground">
          {status === "cancelled" ? "Refund in progress" : TRACKING_STEPS[idx]!.note}
        </p>
      </div>

      {/* Items */}
      <section className="mt-6 space-y-3">
        {items.map((it) => (
          <div key={it.id} className="flex gap-3 rounded-3xl border border-border bg-card p-3 shadow-soft">
            <img src={it.image_key} alt={it.name} className="h-20 w-16 shrink-0 rounded-2xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{it.name}</p>
              <p className="text-xs text-muted-foreground">{it.variant_label}</p>
              <p className="mt-1 text-xs text-muted-foreground">Qty {it.quantity}</p>
            </div>
            <span className="num-strong shrink-0 text-sm">{inr(it.unit_price * it.quantity)}</span>
          </div>
        ))}
      </section>

      {/* Summary */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-display text-base font-extrabold">Summary</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <SumRow label="Subtotal" value={inr(Number(o["subtotal"]))} />
          <SumRow label="Shipping" value={Number(o["shipping"]) === 0 ? "Free" : inr(Number(o["shipping"]))} />
          <SumRow label="Total" value={inr(Number(o["total"]))} strong />
          <SumRow label="Payment" value={String(o["payment_method"]).toUpperCase()} />
        </dl>
      </section>

      {/* Address */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Icon3D name="addresses" size="sm" />
          <h2 className="font-display text-base font-extrabold">Delivery address</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {String(o["full_name"])}
          <br />
          {String(o["address_line1"])}
          {o["address_line2"] ? `, ${String(o["address_line2"])}` : ""}
          <br />
          {String(o["city"])}, {String(o["state"])} {String(o["pincode"])}
          <br />
          {String(o["phone"])}
        </p>
      </section>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        {cancellable && (
          <button
            type="button"
            onClick={cancel}
            className="rounded-full border border-destructive/40 px-5 py-3 text-sm font-bold text-destructive"
          >
            Cancel order
          </button>
        )}
        {status === "delivered" && (
          <button
            type="button"
            onClick={requestReturn}
            className="rounded-full border border-border px-5 py-3 text-sm font-bold"
          >
            Return or exchange
          </button>
        )}
        <Link to="/policies" className="rounded-full border border-border px-5 py-3 text-sm font-bold">
          Refund policy
        </Link>
      </div>
    </div>
  );
}

function SumRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={cn("text-muted-foreground", strong && "font-bold text-foreground")}>{label}</dt>
      <dd className={cn("num-strong", strong && "text-base")}>{value}</dd>
    </div>
  );
}
