import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Icon3D } from "@/components/site/Icon3D";
import { deliveryProvidersQuery, type DeliveryProvider } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/delivery")({
  component: AdminDelivery,
});

const inputCls =
  "w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function AdminDelivery() {
  const qc = useQueryClient();
  const providers = useQuery(deliveryProvidersQuery);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [pattern, setPattern] = useState("");
  const [minDays, setMinDays] = useState(2);
  const [maxDays, setMaxDays] = useState(6);
  const [cod, setCod] = useState(true);
  const [busy, setBusy] = useState(false);

  const list = providers.data ?? [];

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["delivery_providers"] });
  }

  async function create() {
    if (!name.trim() || !code.trim()) {
      toast.error("Name and code are required");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("delivery_providers").insert({
      name: name.trim(),
      code: code.trim().toLowerCase(),
      tracking_url_pattern: pattern.trim() || null,
      min_days: Number(minDays) || 1,
      max_days: Number(maxDays) || 7,
      supports_cod: cod,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setName("");
    setCode("");
    setPattern("");
    await refresh();
    toast.success("Courier added");
  }

  async function patch(p: DeliveryProvider, values: Record<string, unknown>) {
    const { error } = await supabase.from("delivery_providers").update(values).eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
  }

  async function remove(p: DeliveryProvider) {
    const { error } = await supabase.from("delivery_providers").delete().eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
    toast.success("Courier removed");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Icon3D name="fast-delivery" size="md" />
          <h2 className="font-display text-base font-extrabold">Add courier</h2>
        </div>
        <div className="mt-4 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Courier name" className={inputCls} />
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code (e.g. delhivery)" className={inputCls} />
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Tracking URL pattern, {awb}"
            className={inputCls}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={minDays}
              onChange={(e) => setMinDays(Number(e.target.value))}
              placeholder="Min days"
              className={inputCls}
            />
            <input
              type="number"
              value={maxDays}
              onChange={(e) => setMaxDays(Number(e.target.value))}
              placeholder="Max days"
              className={inputCls}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={cod} onChange={(e) => setCod(e.target.checked)} />
            Supports cash on delivery
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void create()}
            className="w-full rounded-full px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
          >
            {busy ? "Saving…" : "Add courier"}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        {providers.isLoading && <p className="text-sm text-muted-foreground">Loading couriers…</p>}
        {list.map((p) => (
          <article key={p.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.code} · {p.min_days}–{p.max_days} days · {p.supports_cod ? "COD" : "Prepaid only"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => void patch(p, { priority: p.priority + 1 })}
                  className="rounded-full border border-border px-3 py-1.5 text-[11px] font-bold"
                >
                  Priority {p.priority}
                </button>
                <button
                  type="button"
                  onClick={() => void patch(p, { is_enabled: !p.is_enabled })}
                  className={cn(
                    "rounded-full border border-border px-3 py-1.5 text-[11px] font-bold",
                    p.is_enabled && "border-transparent bg-primary text-primary-foreground",
                  )}
                >
                  {p.is_enabled ? "Enabled" : "Disabled"}
                </button>
                <button
                  type="button"
                  onClick={() => void remove(p)}
                  className="rounded-full border border-destructive/40 px-3 py-1.5 text-[11px] font-bold text-destructive"
                >
                  Delete
                </button>
              </div>
            </div>
            {p.tracking_url_pattern && (
              <p className="mt-2 truncate text-[11px] text-muted-foreground">{p.tracking_url_pattern}</p>
            )}
          </article>
        ))}
        {!providers.isLoading && list.length === 0 && (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <Icon3D name="fast-delivery" size="2xl" className="mx-auto" />
            <p className="mt-3 text-sm text-muted-foreground">No couriers configured yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
