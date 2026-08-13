import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Icon3D } from "@/components/site/Icon3D";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/addresses")({
  head: () => ({
    meta: [
      { title: "Saved addresses — Blush" },
      { name: "description", content: "Manage the addresses you ship your Blush orders to." },
      { property: "og:title", content: "Saved addresses — Blush" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AddressesPage,
});

type Address = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

const myAddressesQuery = queryOptions({
  queryKey: ["my_addresses"],
  queryFn: async (): Promise<Address[]> => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Address[];
  },
});

const empty = {
  label: "Home",
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
};

function AddressesPage() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const addresses = useQuery({ ...myAddressesQuery, enabled: Boolean(user) });
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  if (loading) return <div className="px-5 py-20 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="text-sm text-muted-foreground">Sign in to manage your addresses.</p>
        <Link to="/auth" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
          Sign in
        </Link>
      </div>
    );
  }

  async function addAddress() {
    if (!form.full_name || !form.phone || !form.address_line1 || !form.city || !form.state || !form.pincode) {
      toast.error("Fill in all the required fields");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("addresses").insert({
      user_id: user!.id,
      label: form.label || "Home",
      full_name: form.full_name,
      phone: form.phone,
      address_line1: form.address_line1,
      address_line2: form.address_line2 || null,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      is_default: (addresses.data ?? []).length === 0,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Address saved");
    setForm(empty);
    setAdding(false);
    qc.invalidateQueries({ queryKey: ["my_addresses"] });
  }

  async function setDefault(id: string) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user!.id);
    const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["my_addresses"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["my_addresses"] });
  }

  return (
    <div className="mx-auto w-full max-w-[800px] px-5 pb-24 pt-8 sm:px-8">
      <div className="flex items-center gap-4">
        <Icon3D name="addresses" size="xl" float />
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Addresses</h1>
          <p className="text-sm text-muted-foreground">Where we should deliver your orders</p>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {(addresses.data ?? []).map((a) => (
          <div key={a.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{a.label}</p>
                  {a.is_default && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm">{a.full_name} · {a.phone}</p>
                <p className="text-xs text-muted-foreground">
                  {a.address_line1}
                  {a.address_line2 ? `, ${a.address_line2}` : ""}, {a.city}, {a.state} — {a.pincode}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {!a.is_default && (
                  <button
                    type="button"
                    onClick={() => setDefault(a.id)}
                    className="text-xs font-bold text-primary"
                  >
                    Set default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  className="text-xs font-bold text-muted-foreground"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
        {(addresses.data?.length ?? 0) === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
        )}
      </div>

      {adding ? (
        <div className="mt-6 space-y-3 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input-base" placeholder="Label (Home, Work…)" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
            <input className="input-base" placeholder="Full name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
            <input className="input-base" placeholder="Mobile number" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))} maxLength={10} />
            <input className="input-base sm:col-span-2" placeholder="House number and street" value={form.address_line1} onChange={(e) => setForm((f) => ({ ...f, address_line1: e.target.value }))} />
            <input className="input-base sm:col-span-2" placeholder="Landmark / apartment (optional)" value={form.address_line2} onChange={(e) => setForm((f) => ({ ...f, address_line2: e.target.value }))} />
            <input className="input-base" placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            <input className="input-base" placeholder="State" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
            <input className="input-base" placeholder="PIN code" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "") }))} maxLength={6} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={addAddress} disabled={saving} className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {saving ? "Saving…" : "Save address"}
            </button>
            <button type="button" onClick={() => { setAdding(false); setForm(empty); }} className="rounded-full border border-border px-5 py-2.5 text-sm font-bold">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={cn("mt-6 w-full rounded-full border border-dashed border-border py-3 text-sm font-bold text-muted-foreground hover:border-foreground/30")}
        >
          + Add new address
        </button>
      )}
    </div>
  );
}
