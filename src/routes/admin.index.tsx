import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Icon3D } from "@/components/site/Icon3D";
import {
  adminCustomersQuery,
  adminOrdersQuery,
  adminReviewsQuery,
  adminVariantsQuery,
  allProductsQuery,
} from "@/lib/queries";
import { inr } from "@/lib/catalog";
import type { Icon3DName } from "@/lib/icons3d";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const orders = useQuery(adminOrdersQuery);
  const products = useQuery(allProductsQuery);
  const customers = useQuery(adminCustomersQuery);
  const reviews = useQuery(adminReviewsQuery);
  const variants = useQuery(adminVariantsQuery);

  const orderList = orders.data ?? [];
  const revenue = orderList
    .filter((o) => !["cancelled", "returned"].includes(String(o.status)))
    .reduce((sum, o) => sum + Number(o.total), 0);
  const pendingReviews = (reviews.data ?? []).filter((r) => r.status === "pending").length;
  const lowStock = (variants.data ?? []).filter((v) => v.stock > 0 && v.stock <= 5);
  const outOfStock = (variants.data ?? []).filter((v) => v.stock === 0);
  const shipments = orderList.filter((o) =>
    ["shipped", "in_transit", "out_for_delivery"].includes(String(o.status)),
  ).length;
  const returns = orderList.filter((o) => String(o.status) === "returned").length;

  const paidOrders = orderList.filter((o) => !["cancelled", "returned"].includes(String(o.status)));
  const aov = paidOrders.length ? Math.round(revenue / paidOrders.length) : 0;
  const actionNeeded = orderList.filter((o) => ["placed", "confirmed"].includes(String(o.status))).length;

  // Last 14 days of revenue for the trend bars.
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return d;
  });
  const daily = days.map((d) => {
    const next = new Date(d.getTime() + 86400000);
    const total = paidOrders
      .filter((o) => {
        const t = new Date(String(o.created_at)).getTime();
        return t >= d.getTime() && t < next.getTime();
      })
      .reduce((s, o) => s + Number(o.total), 0);
    return { date: d, total };
  });
  const peak = Math.max(1, ...daily.map((d) => d.total));

  const stats: { label: string; value: string; icon: Icon3DName }[] = [
    { label: "Revenue", value: inr(revenue), icon: "secure-payment" },
    { label: "Orders", value: String(orderList.length), icon: "my-orders" },
    { label: "Customers", value: String((customers.data ?? []).length), icon: "profile" },
    { label: "Products", value: String((products.data ?? []).length), icon: "women-fashion" },
    { label: "Shipments", value: String(shipments), icon: "fast-delivery" },
    { label: "Returns", value: String(returns), icon: "easy-returns" },
    { label: "Reviews pending", value: String(pendingReviews), icon: "camera-review" },
    { label: "Low stock", value: String(lowStock.length), icon: "filters" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
            <Icon3D name={s.icon} size="md" />
            <p className="num-strong mt-2 truncate text-xl">{s.value}</p>
            <p className="truncate text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-base font-extrabold">Revenue · last 14 days</h2>
            <p className="text-xs text-muted-foreground">
              Avg order value {inr(aov)} · {actionNeeded} order{actionNeeded === 1 ? "" : "s"} awaiting action
            </p>
          </div>
          <Link to="/admin/orders" className="shrink-0 text-xs font-bold text-primary">
            Open orders
          </Link>
        </div>
        <div className="mt-5 flex h-32 items-end gap-1.5">
          {daily.map((d) => (
            <div key={d.date.toISOString()} className="group flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div
                title={`${d.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${inr(d.total)}`}
                className="w-full rounded-t-lg bg-primary/80 transition-colors group-hover:bg-primary"
                style={{ height: `${Math.max(4, (d.total / peak) * 100)}%` }}
              />
              <span className="text-[9px] text-muted-foreground">{d.date.getDate()}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="font-display text-base font-extrabold">Latest orders</h2>
            <Link to="/admin/orders" className="shrink-0 text-xs font-bold text-primary">
              Manage
            </Link>
          </div>
          <ul className="mt-4 space-y-2">
            {orderList.slice(0, 6).map((o) => (
              <li key={o.id} className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{o.order_code}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {String(o.status).replace(/_/g, " ")} · {o.full_name}
                  </p>
                </div>
                <span className="num-strong shrink-0 text-sm">{inr(o.total)}</span>
              </li>
            ))}
            {orderList.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
          </ul>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-base font-extrabold">Inventory alerts</h2>
          <ul className="mt-4 space-y-2">
            {[...outOfStock, ...lowStock].slice(0, 8).map((v) => (
              <li key={v.id} className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{v.sku}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.color_name} · {v.size}
                  </p>
                </div>
                <span
                  className={
                    v.stock === 0
                      ? "shrink-0 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold text-destructive-foreground"
                      : "shrink-0 rounded-full bg-warning px-2.5 py-1 text-[11px] font-bold text-warning-foreground"
                  }
                >
                  {v.stock === 0 ? "Out of stock" : `${v.stock} left`}
                </span>
              </li>
            ))}
            {outOfStock.length + lowStock.length === 0 && (
              <p className="text-sm text-muted-foreground">Stock levels look healthy.</p>
            )}
          </ul>
        </section>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {(
          [
            { to: "/admin/products", label: "Add product", icon: "women-fashion" },
            { to: "/admin/categories", label: "Categories", icon: "filters" },
            { to: "/admin/brands", label: "Brands", icon: "collections" },
            { to: "/admin/banners", label: "Upload banner", icon: "collections" },
            { to: "/admin/delivery", label: "Couriers", icon: "fast-delivery" },
            { to: "/admin/reviews", label: "Moderate", icon: "camera-review" },
          ] as { to: string; label: string; icon: Icon3DName }[]
        ).map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft"
          >
            <Icon3D name={a.icon} size="md" />
            <span className="truncate text-sm font-bold">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
