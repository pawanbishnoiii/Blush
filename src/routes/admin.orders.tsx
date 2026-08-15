import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Icon3D } from "@/components/site/Icon3D";
import { adminOrdersQuery, deliveryProvidersQuery } from "@/lib/queries";
import { inr } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const FLOW = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
] as const;
const EXTRA = ["cancelled", "returned"] as const;

function AdminOrders() {
  const qc = useQueryClient();
  const orders = useQuery(adminOrdersQuery);
  const providers = useQuery(deliveryProvidersQuery);
  const [filter, setFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = (orders.data ?? []).filter((o) => filter === "all" || String(o.status) === filter);

  async function setStatus(id: string, status: string, title: string, note?: string) {
    const patch =
      status === "cancelled"
        ? {
            status,
            cancelled_at: new Date().toISOString(),
            refund_status: "processing",
            cancel_reason: note ?? "Cancelled by store",
          }
        : { status };
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) return void toast.error(error.message);
    await supabase.from("tracking_events").insert({ order_id: id, status, title, note: note ?? null });
    await qc.invalidateQueries({ queryKey: ["admin_orders"] });
    toast.success(`Marked ${title.toLowerCase()}`);
  }

  async function setRefund(id: string, refund_status: string) {
    const { error } = await supabase.from("orders").update({ refund_status }).eq("id", id);
    if (error) return void toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["admin_orders"] });
    toast.success(`Refund ${refund_status}`);
  }

  async function saveShipping(id: string, courier: string, tracking: string, eta: string) {
    const { error } = await supabase
      .from("orders")
      .update({
        courier: courier || null,
        tracking_number: tracking || null,
        eta: eta || null,
      })
      .eq("id", id);
    if (error) return void toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["admin_orders"] });
    toast.success("Shipment details saved");
  }

  return (
    <div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
        {["all", ...FLOW, ...EXTRA].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold capitalize",
              filter === s ? "border-transparent bg-primary text-primary-foreground" : "border-border bg-card",
            )}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {list.map((o) => {
          const open = openId === o.id;
          return (
            <div key={o.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : o.id)}
                className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 text-left"
              >
                <Icon3D name="order-history" size="sm" className="shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{o.order_code}</p>
                  <p className="truncate text-xs capitalize text-muted-foreground">
                    {String(o.status).replace(/_/g, " ")} · {o.full_name} · {o.city}
                  </p>
                </div>
                <span className="num-strong shrink-0 text-sm">{inr(o.total)}</span>
              </button>

              {open && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    {o.address_line1}
                    {o.address_line2 ? `, ${o.address_line2}` : ""}, {o.city}, {o.state} {o.pincode} ·{" "}
                    {o.phone}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[...FLOW, ...EXTRA].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(o.id, s, s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()))}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-[11px] font-semibold capitalize",
                          String(o.status) === s
                            ? "border-transparent bg-primary text-primary-foreground"
                            : "border-border",
                        )}
                      >
                        {s.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>

                  <ShipmentForm
                    providers={(providers.data ?? []).map((p) => p.name)}
                    courier={o.courier ?? ""}
                    tracking={o.tracking_number ?? ""}
                    eta={o.eta ?? ""}
                    onSave={(c, t, e) => saveShipping(o.id, c, t, e)}
                  />

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const i = FLOW.indexOf(String(o.status) as (typeof FLOW)[number]);
                        const next = FLOW[Math.min(i + 1, FLOW.length - 1)]!;
                        setStatus(o.id, next, next.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()));
                      }}
                      className="rounded-full bg-secondary px-4 py-2 text-[11px] font-bold text-secondary-foreground"
                    >
                      Advance tracking →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const reason = window.prompt("Cancellation reason?", "Cancelled by store");
                        if (reason === null) return;
                        setStatus(o.id, "cancelled", "Cancelled", reason);
                      }}
                      className="rounded-full border border-destructive px-4 py-2 text-[11px] font-bold text-destructive"
                    >
                      Cancel order
                    </button>
                    <span className="text-[11px] text-muted-foreground">
                      Refund: {String(o.refund_status ?? "none")}
                    </span>
                    {["processing", "refunded", "none"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRefund(o.id, r)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-[11px] font-bold capitalize",
                          o.refund_status === r ? "border-transparent bg-primary text-primary-foreground" : "border-border",
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <NoteForm onAdd={(note) => setStatus(o.id, String(o.status), "Update", note)} />
                </div>
              )}
            </div>
          );
        })}
        {list.length === 0 && <p className="text-sm text-muted-foreground">No orders in this view.</p>}
      </div>
    </div>
  );
}

function NoteForm({ onAdd }: { onAdd: (note: string) => void }) {
  const [note, setNote] = useState("");
  return (
    <div className="mt-3 flex gap-2">
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a tracking note the customer will see"
        className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-xs outline-none"
      />
      <button
        type="button"
        onClick={() => {
          if (!note.trim()) return;
          onAdd(note.trim());
          setNote("");
        }}
        className="shrink-0 rounded-full border border-border px-4 py-2 text-[11px] font-bold"
      >
        Add note
      </button>
    </div>
  );
}

function ShipmentForm({
  providers,
  courier,
  tracking,
  eta,
  onSave,
}: {
  providers: string[];
  courier: string;
  tracking: string;
  eta: string;
  onSave: (courier: string, tracking: string, eta: string) => void;
}) {
  const [c, setC] = useState(courier);
  const [t, setT] = useState(tracking);
  const [e, setE] = useState(eta);
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-4">
      <select
        value={c}
        onChange={(ev) => setC(ev.target.value)}
        className="rounded-2xl border border-border bg-background px-3 py-2.5 text-sm"
      >
        <option value="">Courier…</option>
        {providers.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <input
        value={t}
        onChange={(ev) => setT(ev.target.value)}
        placeholder="AWB / tracking no."
        className="rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
      />
      <input
        type="date"
        value={e}
        onChange={(ev) => setE(ev.target.value)}
        className="rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
      />
      <button
        type="button"
        onClick={() => onSave(c, t, e)}
        className="rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground"
      >
        Save shipment
      </button>
    </div>
  );
}
