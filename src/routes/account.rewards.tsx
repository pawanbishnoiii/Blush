import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { myProfileQuery } from "@/lib/queries";
import { Icon3D } from "@/components/site/Icon3D";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards — Blush" },
      { name: "description", content: "Track your Blush reward points, tier and benefits." },
      { property: "og:title", content: "Rewards — Blush" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: RewardsPage,
});

const TIERS = [
  { name: "Bronze", min: 0, perks: ["Earn 1 point per ₹100 spent", "Birthday surprise gift"] },
  { name: "Silver", min: 500, perks: ["Earn 1.5 points per ₹100", "Early access to sales", "Free shipping"] },
  { name: "Gold", min: 1500, perks: ["Earn 2 points per ₹100", "Priority support", "Exclusive drops first"] },
];

function RewardsPage() {
  const { user, loading } = useAuth();
  const profile = useQuery({ ...myProfileQuery, enabled: Boolean(user) });

  if (loading) return <div className="px-5 py-20 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="text-sm text-muted-foreground">Sign in to see your rewards.</p>
        <Link to="/auth" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
          Sign in
        </Link>
      </div>
    );
  }

  const points = profile.data?.reward_points ?? 0;
  const tier = profile.data?.tier ?? "Bronze";

  return (
    <div className="mx-auto w-full max-w-[800px] px-5 pb-24 pt-8 sm:px-8">
      <div className="flex items-center gap-4">
        <Icon3D name="rewards" size="xl" float />
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Rewards</h1>
          <p className="text-sm text-muted-foreground">Earn points on every order</p>
        </div>
      </div>

      <div
        className="mt-8 rounded-[2rem] border border-border p-6 shadow-soft"
        style={{ background: "var(--gradient-soft)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Current balance</p>
        <p className="num-strong mt-1 text-4xl">{points} pts</p>
        <p className="mt-2 text-sm font-semibold capitalize">{tier} tier</p>
      </div>

      <div className="mt-8 space-y-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={cn(
              "rounded-3xl border p-5 shadow-soft",
              t.name.toLowerCase() === tier.toLowerCase() ? "border-primary bg-card" : "border-border bg-card",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="font-display text-base font-extrabold">{t.name}</p>
              <span className="text-xs text-muted-foreground">{t.min}+ pts</span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {t.perks.map((perk) => (
                <li key={perk} className="text-sm text-muted-foreground">
                  • {perk}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
