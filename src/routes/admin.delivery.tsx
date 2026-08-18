import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Copy } from "lucide-react";
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

type ShiprocketRow = DeliveryProvider & {
  api_email?: string | null;
  webhook_token?: string | null;
  webhook_url?: string | null;
};

/**
 * Shiprocket is the only live courier. Everything Shiprocket needs — panel
 * login email, the API token secret name, and the status webhook — lives here.
 */
function ShiprocketPanel({ list, onSaved }: { list: DeliveryProvider[]; onSaved: () => void }) {
  const sr = list.find((p) => p.code === "shiprocket") as ShiprocketRow | undefined;
  const [email, setEmail] = useState("");
  const [secretName, setSecretName] = useState("");
  const [token, setToken] = useState("");
  const [seeded, setSeeded] = useState(false);
  const [saving, setSaving] = useState(false);

  if (sr && !seeded) {
    setEmail(sr.api_email ?? "");
    setSecretName(sr.api_key_secret_name ?? "SHIPROCKET_API_TOKEN");
    setToken(sr.webhook_token ?? "");
    setSeeded(true);
  }

  const webhookUrl =
    typeof window === "undefined"
      ? "/api/public/webhooks/shiprocket"
      : `${window.location.origin}/api/public/webhooks/shiprocket`;

  async function save() {
    if (!sr) return;
    setSaving(true);
    const { error } = await supabase
      .from("delivery_providers")
      .update({
        api_email: email.trim() || null,
        api_key_secret_name: secretName.trim() || null,
        webhook_token: token.trim() || null,
        webhook_url: webhookUrl,
        is_enabled: true,
      } as never)
      .eq("id", sr.id);
    setSaving(false);
    if (error) return void toast.error(error.message);
    onSaved();
    toast.success("Shiprocket settings saved");
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <Icon3D name="fast-delivery" size="md" />
        <h2 className="font-display text-base font-extrabold">Shiprocket</h2>
      </div>
      {!sr ? (
        <p className="mt-3 text-sm text-muted-foreground">Shiprocket courier row is missing.</p>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Panel / API user email
            </span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="api-user@yourstore.in"
              className={cn(inputCls, "mt-1")}
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              API token secret name
            </span>
            <input
              value={secretName}
              onChange={(e) => setSecretName(e.target.value)}
              placeholder="SHIPROCKET_API_TOKEN"
              className={cn(inputCls, "mt-1")}
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Webhook auth token
            </span>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste the same token into Shiprocket"
              className={cn(inputCls, "mt-1")}
            />
          </label>
          <div className="rounded-2xl bg-surface p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Webhook URL
            </p>
            <div className="mt-1 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <code className="truncate text-[11px]">{webhookUrl}</code>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(webhookUrl);
                  toast.success("Webhook URL copied");
                }}
                className="shrink-0 rounded-full border border-border p-1.5"
                aria-label="Copy webhook URL"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="w-full rounded-full px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
          >
            {saving ? "Saving…" : "Save Shiprocket settings"}
          </button>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            In Shiprocket → Settings → API → Webhooks, paste the URL above and the same auth token.
            Status updates (picked up, in transit, out for delivery, delivered, RTO) then flow into
            order tracking automatically. Keep the API token value itself in your backend secrets —
            only the secret name is stored here.
          </p>
        </div>
      )}
    </section>
  );
}

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

  async function patch(
    p: DeliveryProvider,
    values: { priority?: number; is_enabled?: boolean },
  ) {
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
      <div className="space-y-6">
      <ShiprocketPanel list={list} onSaved={() => void refresh()} />
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
      </div>

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
