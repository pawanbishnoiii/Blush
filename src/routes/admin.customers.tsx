import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Icon3D } from "@/components/site/Icon3D";
import { adminCustomersQuery, adminOrdersQuery } from "@/lib/queries";
import { inr } from "@/lib/catalog";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

function AdminCustomers() {
  const customers = useQuery(adminCustomersQuery);
  const orders = useQuery(adminOrdersQuery);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const orderList = orders.data ?? [];
    return (customers.data ?? []).map((c) => {
      const own = orderList.filter((o) => String(o.user_id) === String(c.id));
      const spend = own
        .filter((o) => !["cancelled", "returned"].includes(String(o.status)))
        .reduce((sum, o) => sum + Number(o.total), 0);
      return {
        id: String(c.id),
        name: (c.display_name as string | null) ?? "Guest",
        phone: (c.whatsapp as string | null) ?? (c.phone as string | null) ?? "—",
        moods: (c.preferred_moods as string[] | null) ?? [],
        tier: String(c.tier ?? "bronze"),
        points: Number(c.reward_points ?? 0),
        orders: own.length,
        spend,
      };
    });
  }, [customers.data, orders.data]);

  const filtered = rows.filter((r) => {
    const term = q.trim().toLowerCase();
    if (!term) return true;
    return r.name.toLowerCase().includes(term) || r.phone.toLowerCase().includes(term);
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Icon3D name="profile" size="md" />
          <h2 className="font-display text-base font-extrabold">Customers</h2>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or phone"
          className="ml-auto w-full max-w-xs rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="mt-5 space-y-3">
        {customers.isLoading && <p className="text-sm text-muted-foreground">Loading customers…</p>}
        {filtered.map((c) => (
          <article
            key={c.id}
            className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{c.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {c.phone} · {c.tier} · {c.points} pts
              </p>
              {c.moods.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.moods.slice(0, 4).map((m) => (
                    <span key={m} className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold capitalize">
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="num-strong text-sm">{inr(c.spend)}</p>
              <p className="text-xs text-muted-foreground">{c.orders} orders</p>
            </div>
          </article>
        ))}
        {!customers.isLoading && filtered.length === 0 && (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <Icon3D name="profile" size="2xl" className="mx-auto" />
            <p className="mt-3 text-sm text-muted-foreground">No customers match that search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
