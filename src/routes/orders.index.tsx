import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Icon3D } from "@/components/site/Icon3D";
import { useAuth } from "@/hooks/useAuth";
import { myOrdersQuery } from "@/lib/queries";
import { inr } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "My orders — Blush" },
      { name: "description", content: "Track every Blush order — processing, shipped, out for delivery, delivered and returns." },
      { property: "og:title", content: "My orders — Blush" },
      { property: "og:description", content: "Track every order in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrdersPage,
});

const TABS = [
  { key: "all", label: "All" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
  { key: "returned", label: "Returns" },
];

function OrdersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const orders = useQuery({ ...myOrdersQuery, enabled: Boolean(user) });
  const [tab, setTab] = useState("all");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  const list = useMemo(() => {
    const all = orders.data ?? [];
    if (tab === "all") return all;
    if (tab === "processing")
      return all.filter((o) => ["placed", "confirmed", "packed", "processing"].includes(String(o.status)));
    if (tab === "shipped")
      return all.filter((o) => ["shipped", "in_transit"].includes(String(o.status)));
    return all.filter((o) => String(o.status) === tab);
  }, [orders.data, tab]);

  return (
    <div className="mx-auto w-full max-w-[1000px] px-5 pb-28 pt-8 sm:px-8 md:pb-16">
      <div className="flex items-center gap-4">
        <Icon3D name="order-history" size="xl" float />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">My orders</h1>
          <p className="text-sm text-muted-foreground">{(orders.data ?? []).length} total orders</p>
        </div>
      </div>

      <div className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all",
              tab === t.key
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {list.map((o) => {
          const items = (o.order_items ?? []) as { id: string; name: string; image_key: string; quantity: number }[];
          return (
            <Link
              key={o.id}
              to="/orders/$orderId"
              params={{ orderId: o.id }}
              className="block rounded-3xl border border-border bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">{o.order_code}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {String(o.status).replace(/_/g, " ")} ·{" "}
                    {new Date(o.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="num-strong shrink-0 text-sm">{inr(o.total)}</span>
              </div>
              <div className="mt-3 flex gap-2 overflow-hidden">
                {items.slice(0, 4).map((it) => (
                  <img
                    key={it.id}
                    src={it.image_key}
                    alt={it.name}
                    className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                  />
                ))}
                {items.length > 4 && (
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-surface text-xs font-bold">
                    +{items.length - 4}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {list.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Icon3D name="order-history" size="2xl" float />
            <p className="font-display text-lg font-bold">No orders here yet</p>
            <Link
              to="/shop"
              className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
            >
              Start shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
