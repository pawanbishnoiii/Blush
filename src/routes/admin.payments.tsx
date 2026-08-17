import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Icon3D } from "@/components/site/Icon3D";
import { paymentGatewaysQuery, type PaymentGateway } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPayments,
});

const inputCls =
  "w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

const METHODS = [
  { key: "supports_upi", label: "UPI" },
  { key: "supports_cards", label: "Cards" },
  { key: "supports_netbanking", label: "Netbanking" },
  { key: "supports_wallet", label: "Wallet" },
  { key: "supports_cod", label: "COD" },
] as const;

function AdminPayments() {
  const qc = useQueryClient();
  const gateways = useQuery(paymentGatewaysQuery);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const list = gateways.data ?? [];
  const refresh = () => qc.invalidateQueries({ queryKey: ["payment_gateways"] });

  async function create() {
    if (!name.trim() || !code.trim()) {
      toast.error("Name and code are required");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("payment_gateways")
      .insert({ name: name.trim(), code: code.trim().toLowerCase() });
    setBusy(false);
    if (error) return void toast.error(error.message);
    setName("");
    setCode("");
    await refresh();
    toast.success("Gateway added");
  }

  async function patch(g: PaymentGateway, values: Partial<PaymentGateway>) {
    const { error } = await supabase.from("payment_gateways").update(values).eq("id", g.id);
    if (error) return void toast.error(error.message);
    await refresh();
  }

  async function remove(g: PaymentGateway) {
    const { error } = await supabase.from("payment_gateways").delete().eq("id", g.id);
    if (error) return void toast.error(error.message);
    await refresh();
    toast.success("Gateway removed");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Icon3D name="secure-payment" size="md" />
          <h2 className="font-display text-base font-extrabold">Add gateway</h2>
        </div>
        <div className="mt-4 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Gateway name" className={inputCls} />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code (e.g. razorpay)"
            className={inputCls}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void create()}
            className="w-full rounded-full px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
          >
            {busy ? "Saving…" : "Add gateway"}
          </button>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Gateways stay in demo mode until you switch them to live and add merchant credentials. Secret
            keys are never stored here — save the secret name and keep the value in your backend secrets.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        {gateways.isLoading && <p className="text-sm text-muted-foreground">Loading gateways…</p>}
        {list.map((g) => {
          const open = openId === g.id;
          return (
            <article key={g.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <button type="button" onClick={() => setOpenId(open ? null : g.id)} className="min-w-0 text-left">
                  <p className="truncate text-sm font-bold">{g.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {g.code} · {g.mode} · {g.fee_percent}% fee
                  </p>
                </button>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => void patch(g, { mode: g.mode === "live" ? "demo" : "live" })}
                    className={cn(
                      "rounded-full border border-border px-3 py-1.5 text-[11px] font-bold capitalize",
                      g.mode === "live" && "border-transparent bg-secondary text-secondary-foreground",
                    )}
                  >
                    {g.mode}
                  </button>
                  <button
                    type="button"
                    onClick={() => void patch(g, { is_enabled: !g.is_enabled })}
                    className={cn(
                      "rounded-full border border-border px-3 py-1.5 text-[11px] font-bold",
                      g.is_enabled && "border-transparent bg-primary text-primary-foreground",
                    )}
                  >
                    {g.is_enabled ? "Enabled" : "Disabled"}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {METHODS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => void patch(g, { [m.key]: !g[m.key] } as Partial<PaymentGateway>)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-[11px] font-bold",
                      g[m.key] ? "border-transparent bg-primary/15 text-primary" : "border-border text-muted-foreground",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {open && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Field label="Merchant ID" value={g.merchant_id ?? ""} onSave={(v) => void patch(g, { merchant_id: v })} />
                  <Field label="Public API key" value={g.api_key_public ?? ""} onSave={(v) => void patch(g, { api_key_public: v })} />
                  <Field
                    label="Secret name"
                    value={g.api_key_secret_name ?? ""}
                    onSave={(v) => void patch(g, { api_key_secret_name: v })}
                  />
                  <Field label="Webhook URL" value={g.webhook_url ?? ""} onSave={(v) => void patch(g, { webhook_url: v })} />
                  <Field
                    label="Fee %"
                    value={String(g.fee_percent)}
                    onSave={(v) => void patch(g, { fee_percent: Number(v) || 0 })}
                  />
                  <Field label="Notes" value={g.notes ?? ""} onSave={(v) => void patch(g, { notes: v })} />
                  <button
                    type="button"
                    onClick={() => void remove(g)}
                    className="justify-self-start rounded-full border border-destructive/40 px-3 py-1.5 text-[11px] font-bold text-destructive"
                  >
                    Delete gateway
                  </button>
                </div>
              )}
            </article>
          );
        })}
        {!gateways.isLoading && list.length === 0 && (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <Icon3D name="secure-payment" size="2xl" className="mx-auto" />
            <p className="mt-3 text-sm text-muted-foreground">No gateways configured yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  return (
    <label className="block min-w-0">
      <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => v !== value && onSave(v)}
        className={cn(inputCls, "mt-1")}
      />
    </label>
  );
}
