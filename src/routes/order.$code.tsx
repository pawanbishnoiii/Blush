import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import { Check, Copy, Package, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { getOrder } from "@/lib/orders.functions";
import { imageFor, inr } from "@/lib/catalog";

export const Route = createFileRoute("/order/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.code} confirmed — Esko` },
      { name: "description", content: "Your Esko order is confirmed and on its way." },
      { property: "og:title", content: `Order ${params.code} confirmed — Esko` },
      { property: "og:description", content: "Your Esko order is confirmed and on its way." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderSuccess,
});

function OrderSuccess() {
  const { code } = Route.useParams();
  const fetchOrder = useServerFn(getOrder);
  const { data, isLoading } = useQuery({
    queryKey: ["order", code],
    queryFn: () => fetchOrder({ data: { code } }),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <div className="h-40 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="surface-warm">
        <div className="mx-auto max-w-md px-5 py-28 text-center">
          <h1 className="section-type">We couldn&apos;t find that order.</h1>
          <p className="mt-3 text-sm text-muted-foreground">Check the code and try again.</p>
          <Link to="/track" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground">
            Track an order
          </Link>
        </div>
      </div>
    );
  }

  const { order, items } = data;

  return (
    <div className="surface-warm">
      <div className="mx-auto w-full max-w-[880px] px-5 py-14 sm:px-8 lg:py-20">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
          className="grid h-16 w-16 place-items-center rounded-full bg-success/15"
        >
          <Check className="h-7 w-7 text-success" />
        </motion.span>

        <h1 className="section-type mt-6">Thank you, {order.full_name.split(" ")[0]}.</h1>
        <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
          Your order is confirmed. We&apos;ve emailed the receipt and the tracking link — your parcel
          leaves our Tiruppur facility within 24 hours.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="eyebrow text-muted-foreground">Order code</p>
            <div className="mt-2 flex items-center gap-2">
              <p className="num-strong text-lg">{order.order_code}</p>
              <button
                aria-label="Copy order code"
                onClick={() => {
                  void navigator.clipboard.writeText(order.order_code);
                  toast.success("Order code copied");
                }}
                className="grid h-8 w-8 place-items-center rounded-full border border-border"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="eyebrow text-muted-foreground">Expected delivery</p>
            <p className="mt-2 text-lg font-semibold">
              {new Date(order.eta ?? Date.now()).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">What&apos;s coming</h2>
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

          <dl className="mt-6 space-y-2.5 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{inr(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{order.shipping === 0 ? "Free" : inr(order.shipping)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <dt className="text-base font-semibold">
                Paid via {order.payment_method === "cod" ? "cash on delivery" : order.payment_method.toUpperCase()}
              </dt>
              <dd className="num-strong text-2xl">{inr(order.total)}</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-2xl bg-surface p-4 text-sm">
            <p className="font-semibold">Shipping to</p>
            <p className="mt-1 text-muted-foreground">
              {order.address_line1}
              {order.address_line2 ? `, ${order.address_line2}` : ""}, {order.city}, {order.state} {order.pincode}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/track/$code"
            params={{ code: order.order_code }}
            className="inline-flex h-13 items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift"
          >
            <Package className="h-4 w-4" /> Track this order
          </Link>
          <Link
            to="/shop"
            className="inline-flex h-13 items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-semibold"
          >
            Keep shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
