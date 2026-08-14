import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Icon3D, Icon3DTile } from "@/components/site/Icon3D";
import { useAuth } from "@/hooks/useAuth";
import { myNotificationsQuery, myOrdersQuery, myProfileQuery } from "@/lib/queries";
import { MOODS } from "@/lib/taxonomy";
import { inr } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your account — Blush" },
      { name: "description", content: "Manage your Blush profile, orders, addresses, rewards and style preferences." },
      { property: "og:title", content: "Your account — Blush" },
      { property: "og:description", content: "Profile, orders, rewards and style preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

const SHORTCUTS = [
  { icon: "my-orders", label: "My Orders", to: "/orders" },
  { icon: "wishlist", label: "Wishlist", to: "/wishlist" },
  { icon: "coupons", label: "Coupons", to: "/account/coupons" },
  { icon: "addresses", label: "Addresses", to: "/account/addresses" },
  { icon: "payment-methods", label: "Payments", to: "/account" },
  { icon: "notifications", label: "Alerts", to: "/account/notifications" },
  { icon: "rewards", label: "Rewards", to: "/account/rewards" },
  { icon: "support", label: "Support", to: "/account/support" },
] as const;

function AccountPage() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
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

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="px-5 py-20 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  const p = profile.data;
  const orderList = orders.data ?? [];
  const unread = (notifications.data ?? []).filter((n) => !n.is_read).length;

  async function save() {
    const { error } = await supabase.from("profiles").upsert(
      {
        id: user!.id,
        display_name: name,
        whatsapp,
        phone: whatsapp,
        preferred_moods: moods,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) {
      toast.error(error.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["my_profile"] });
    setEditing(false);
    toast.success("Profile updated");
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 pb-28 pt-8 sm:px-8 md:pb-16">
      {/* Header */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-[2rem] border border-border p-6 shadow-soft"
        style={{ background: "var(--gradient-soft)" }}>
        <div className="flex min-w-0 items-center gap-4">
          <Icon3D name="profile" size="xl" float />
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-extrabold tracking-tight">
              {p?.display_name || "Hey there"}
            </h1>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full bg-card px-2.5 py-1 font-bold shadow-soft">
                {p?.tier ?? "Bronze"} tier
              </span>
              <span className="rounded-full bg-card px-2.5 py-1 font-bold shadow-soft">
                {p?.reward_points ?? 0} points
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold shadow-soft"
        >
          Sign out
        </button>
      </div>

      {!p?.onboarded && (
        <Link
          to="/onboarding"
          className="mt-4 flex items-center gap-3 rounded-3xl border border-primary/40 bg-card p-4 shadow-soft"
        >
          <Icon3D name="shop-by-mood" size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Finish your style setup</p>
            <p className="text-xs text-muted-foreground">2 quick steps to personalise your feed</p>
          </div>
          <span className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
            Start
          </span>
        </Link>
      )}

      {isAdmin && (
        <Link
          to="/admin"
          className="mt-4 flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft"
        >
          <Icon3D name="store" size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Admin control center</p>
            <p className="text-xs text-muted-foreground">Products, orders, banners, shipping</p>
          </div>
        </Link>
      )}

      {/* Shortcuts */}
      <div className="mt-8 grid grid-cols-4 gap-3 sm:grid-cols-8">
        {SHORTCUTS.map((s) => (
          <Link key={s.label} to={s.to}>
            <Icon3DTile name={s.icon} label={s.label} size="md" tone="blush" />
          </Link>
        ))}
      </div>

      {/* Profile card */}
      <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="font-display text-lg font-extrabold">Profile</h2>
          <button
            type="button"
            onClick={() => (editing ? save() : setEditing(true))}
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
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                My style
              </p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => {
                  const on = moods.includes(m.key);
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() =>
                        setMoods((prev) => (on ? prev.filter((x) => x !== m.key) : [...prev, m.key]))
                      }
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
              <Icon3D name="my-orders" size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{o.order_code}</p>
                <p className="text-xs capitalize text-muted-foreground">
                  {String(o.status).replace(/_/g, " ")}
                </p>
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
