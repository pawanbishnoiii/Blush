import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Icon3D } from "@/components/site/Icon3D";
import { orderDetailQuery } from "@/lib/queries";
import { cancelOrder } from "@/lib/orders.functions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const CANCEL_REASONS = [
  "Ordered by mistake",
  "Found a better price",
  "Delivery is taking too long",
  "Want a different size or colour",
  "Changed my mind",
];

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
  const runCancel = useServerFn(cancelOrder);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState(CANCEL_REASONS[0]!);
  const [customReason, setCustomReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

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
        <Icon3D name="order-history" size="2xl" />
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
  const cancellable = ["placed", "confirmed", "processing", "packed"].includes(status);

  async function confirmCancel() {
    const finalReason = (reason === "Other" ? customReason : reason).trim();
    if (finalReason.length < 3) {
      toast.error("Tell us why you're cancelling");
      return;
    }
    setCancelling(true);
    try {
      const res = await runCancel({ data: { orderId, reason: finalReason } });
      await qc.invalidateQueries({ queryKey: ["order", orderId] });
      await qc.invalidateQueries({ queryKey: ["my_orders"] });
      setCancelOpen(false);
      toast.success("Order cancelled", {
        description:
          res.refundStatus === "initiated"
            ? "Refund initiated — 5–7 working days to your original payment method."
            : "Nothing was charged for this cash-on-delivery order.",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel this order");
    } finally {
      setCancelling(false);
    }
  }

  async function requestReturn() {
    const { error } = await supabase.from("orders").update({ status: "returned" }).eq("id", orderId);
    if (error) {
      toast.error(error.message);
      return;
    }
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
        {status === "cancelled" && Boolean(o["cancel_reason"]) && (
          <div className="mt-4 rounded-2xl bg-surface p-4 text-xs text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Reason:</span>{" "}
              {String(o["cancel_reason"])}
            </p>
            {Boolean(o["refund_status"]) && (
              <p className="mt-1 capitalize">
                <span className="font-semibold text-foreground">Refund:</span>{" "}
                {String(o["refund_status"]).replace(/_/g, " ")}
              </p>
            )}
          </div>
        )}
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
            onClick={() => setCancelOpen(true)}
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

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-extrabold">Cancel this order?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Let us know why — it helps us fix what went wrong.
          </p>
          <div className="mt-2 space-y-2">
            {[...CANCEL_REASONS, "Other"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={cn(
                  "w-full rounded-2xl border px-4 py-2.5 text-left text-sm font-semibold transition-colors",
                  reason === r ? "border-primary bg-primary/10" : "border-border bg-card",
                )}
              >
                {r}
              </button>
            ))}
          </div>
          {reason === "Other" && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={3}
              maxLength={240}
              placeholder="Tell us more"
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          )}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setCancelOpen(false)}
              className="flex-1 rounded-full border border-border px-5 py-3 text-sm font-bold"
            >
              Keep order
            </button>
            <button
              type="button"
              disabled={cancelling}
              onClick={() => void confirmCancel()}
              className="flex-1 rounded-full bg-destructive px-5 py-3 text-sm font-bold text-destructive-foreground disabled:opacity-50"
            >
              {cancelling ? "Cancelling…" : "Confirm cancel"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
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
