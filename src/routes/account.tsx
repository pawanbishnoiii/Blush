import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Icon3D, Icon3DTile } from "@/components/site/Icon3D";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { myNotificationsQuery, myOrdersQuery, myProfileQuery } from "@/lib/queries";
import { MOODS } from "@/lib/taxonomy";
import { inr } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import type { Icon3DName } from "@/lib/icons3d";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your account — Blush" },
      {
        name: "description",
        content:
          "Manage your Blush profile, orders, tracking, wishlist, saved addresses, payments and support in one place.",
      },
      { property: "og:title", content: "Your account — Blush" },
      { property: "og:description", content: "Profile, orders, tracking, addresses, payments and support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

type Shortcut = { icon: Icon3DName; label: string; to: string; hint: string; authOnly?: boolean };

const SHORTCUTS: Shortcut[] = [
  { icon: "profile", label: "Profile", to: "/account", hint: "Name, contact & style", authOnly: true },
  { icon: "my-orders", label: "My Orders", to: "/orders", hint: "Track & reorder", authOnly: true },
  { icon: "track-order", label: "Track Order", to: "/track", hint: "Live shipment status" },
  { icon: "wishlist", label: "Wishlist", to: "/wishlist", hint: "Saved for later" },
  { icon: "addresses", label: "Saved Addresses", to: "/account/addresses", hint: "Home, work & more", authOnly: true },
  { icon: "payment-methods", label: "Payments", to: "/account/payments", hint: "UPI, cards & COD" },
  { icon: "coupons", label: "Coupons", to: "/account/coupons", hint: "Your offers", authOnly: true },
  { icon: "support", label: "Help & Support", to: "/account/support", hint: "We reply fast" },
];

function AccountPage() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { ids } = useWishlist();
  const profile = useQuery({ ...myProfileQuery, enabled: Boolean(user) });
  const orders = useQuery({ ...myOrdersQuery, enabled: Boolean(user) });
  const notifications = useQuery({ ...myNotificationsQuery, enabled: Boolean(user) });

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [moods, setMoods] = useState<string[]>([]);

  useEffect(() => {
    if (profile.data) {
      setName(profile.data.display_name ?? "");
      setWhatsapp(profile.data.whatsapp ?? profile.data.phone ?? "");
      setMoods(profile.data.preferred_moods ?? []);
    }
  }, [profile.data]);

  if (loading) {
    return <div className="px-5 py-20 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  const p = profile.data;
  const orderList = orders.data ?? [];
  const unread = (notifications.data ?? []).filter((n) => !n.is_read).length;

  async function save() {
    if (!user) return;
    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        display_name: name,
        whatsapp,
        phone: whatsapp,
        preferred_moods: moods,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) return void toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["my_profile"] });
    setEditing(false);
    toast.success("Profile updated");
  }

  async function signOut() {
    await qc.cancelQueries();
    await supabase.auth.signOut();
    qc.clear();
    toast.success("Signed out");
    navigate({ to: "/", replace: true });
  }

  const tiles = SHORTCUTS.filter((s) => user || !s.authOnly);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 pb-28 pt-6 sm:px-8 md:pb-16">
      {/* Identity header */}
      <div
        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-[2rem] border border-border p-5 shadow-soft sm:p-6"
        style={{ background: "var(--gradient-soft)" }}
      >
        <div className="flex min-w-0 items-center gap-4">
          <Icon3D name="profile" size="xl" float />
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-extrabold tracking-tight sm:text-2xl">
              {user ? p?.display_name || "Hey there" : "Welcome to Blush"}
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {user ? user.email : "Sign in to see orders, wishlist and addresses"}
            </p>
            {user && (
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full bg-card px-2.5 py-1 font-bold shadow-soft">{p?.tier ?? "Bronze"} tier</span>
                <span className="rounded-full bg-card px-2.5 py-1 font-bold shadow-soft">{p?.reward_points ?? 0} points</span>
              </div>
            )}
          </div>
        </div>
        {user ? (
          <button
            type="button"
            onClick={() => void signOut()}
            className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold shadow-soft"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/auth"
            className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-glow"
          >
            Login / Sign up
          </Link>
        )}
      </div>

      {user && !p?.onboarded && (
        <Link to="/onboarding" className="mt-4 flex items-center gap-3 rounded-3xl border border-primary/40 bg-card p-4 shadow-soft">
          <Icon3D name="shop-by-mood" size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Finish your style setup</p>
            <p className="text-xs text-muted-foreground">2 quick steps to personalise your feed</p>
          </div>
          <span className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">Start</span>
        </Link>
      )}

      {isAdmin && (
        <Link to="/admin" className="mt-4 flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft">
          <Icon3D name="brand-store" size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Admin control center</p>
            <p className="text-xs text-muted-foreground">Products, orders, payments, delivery</p>
          </div>
        </Link>
      )}

      {/* Quick stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Orders" value={user ? String(orderList.length) : "—"} />
        <Stat label="Wishlist" value={String(ids.size)} />
        <Stat label="Alerts" value={user ? String(unread) : "—"} />
      </div>

      {/* Shortcut grid */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-extrabold">Everything in one place</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((s) => (
            <Link
              key={s.label}
              to={s.to}
              className="flex items-center gap-3 rounded-3xl border border-border bg-card p-3 shadow-soft transition-transform active:scale-[0.98]"
            >
              <Icon3D name={s.icon} size="md" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">{s.label}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{s.hint}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {!user && (
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 text-center shadow-soft">
          <Icon3DTile name="safety-security" label="Secure login" tone="blush" size="md" />
          <p className="mt-4 text-sm font-bold">Sign in to unlock your account</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Orders, saved addresses, coupons and faster checkout — all synced across devices.
          </p>
          <Link
            to="/auth"
            className="mt-4 inline-flex rounded-full px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
            style={{ background: "var(--gradient-primary)" }}
          >
            Continue
          </Link>
        </section>
      )}

      {user && (
        <>
          {/* Profile card */}
          <section className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="font-display text-lg font-extrabold">Profile</h2>
              <button
                type="button"
                onClick={() => (editing ? void save() : setEditing(true))}
                className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >
                {editing ? "Save" : "Edit"}
              </button>
            </div>

            {editing ? (
              <div className="mt-5 space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Display name"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  placeholder="WhatsApp number"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">My style</p>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((m) => {
                      const on = moods.includes(m.key);
                      return (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => setMoods((prev) => (on ? prev.filter((x) => x !== m.key) : [...prev, m.key]))}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-semibold",
                            on ? "border-transparent bg-secondary text-secondary-foreground" : "border-border",
                          )}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <Row label="Name" value={p?.display_name ?? "—"} />
                <Row label="WhatsApp" value={p?.whatsapp ?? p?.phone ?? "—"} />
                <Row label="Gender" value={p?.gender ?? "—"} />
                <Row label="Age" value={p?.age ? String(p.age) : "—"} />
                <Row label="My style" value={(p?.preferred_moods ?? []).join(", ") || "—"} />
                <Row
                  label="Preferred size"
                  value={(p?.preferred_sizes as Record<string, string> | undefined)?.["default"] ?? "—"}
                />
              </dl>
            )}
          </section>

          {/* Recent orders */}
          <section className="mt-8">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="font-display text-lg font-extrabold">Recent orders</h2>
              <Link to="/orders" className="shrink-0 text-xs font-bold text-primary">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {orderList.slice(0, 3).map((o) => (
                <Link
                  key={o.id}
                  to="/orders/$orderId"
                  params={{ orderId: o.id }}
                  className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft"
                >
                  <Icon3D name="order-history" size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{o.order_code}</p>
                    <p className="text-xs capitalize text-muted-foreground">{String(o.status).replace(/_/g, " ")}</p>
                  </div>
                  <span className="num-strong shrink-0 text-sm">{inr(o.total)}</span>
                </Link>
              ))}
              {orderList.length === 0 && (
                <p className="text-sm text-muted-foreground">No orders yet — your first one lands here.</p>
              )}
            </div>
          </section>

          {/* Notifications */}
          <section className="mt-8">
            <h2 className="font-display text-lg font-extrabold">
              Notifications {unread > 0 && <span className="text-primary">({unread} new)</span>}
            </h2>
            <div className="mt-4 space-y-2">
              {(notifications.data ?? []).slice(0, 6).map((n) => (
                <div key={n.id} className="flex items-start gap-3 rounded-2xl bg-surface p-3">
                  <Icon3D name="notifications" size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                  </div>
                </div>
              ))}
              {(notifications.data?.length ?? 0) === 0 && (
                <p className="text-sm text-muted-foreground">Nothing new right now.</p>
              )}
            </div>
          </section>

          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-8 w-full rounded-full border border-destructive/40 px-5 py-3 text-sm font-bold text-destructive"
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-3 py-3 text-center shadow-soft">
      <p className="num-strong text-lg font-extrabold">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-surface px-4 py-3">
      <dt className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-semibold capitalize">{value}</dd>
    </div>
  );
}
