import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Icon3D } from "@/components/site/Icon3D";
import { paymentGatewaysQuery } from "@/lib/queries";
import type { Icon3DName } from "@/lib/icons3d";

export const Route = createFileRoute("/account/payments")({
  head: () => ({
    meta: [
      { title: "Payment methods — Blush" },
      { name: "description", content: "UPI, cards, netbanking, wallets and cash on delivery available on Blush." },
      { property: "og:title", content: "Payment methods — Blush" },
      { property: "og:description", content: "See every way you can pay for your Blush order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPayments,
});

const METHOD_ICONS: { key: keyof PGFlags; label: string; icon: Icon3DName }[] = [
  { key: "supports_upi", label: "UPI", icon: "scan-pay" },
  { key: "supports_cards", label: "Cards", icon: "debit-credit-cards" },
  { key: "supports_netbanking", label: "Netbanking", icon: "bank-transfer" },
  { key: "supports_wallet", label: "Wallet", icon: "wallet" },
  { key: "supports_cod", label: "Cash on delivery", icon: "cash-on-delivery" },
];

type PGFlags = {
  supports_upi: boolean;
  supports_cards: boolean;
  supports_netbanking: boolean;
  supports_wallet: boolean;
  supports_cod: boolean;
};

function AccountPayments() {
  const gateways = useQuery(paymentGatewaysQuery);
  const enabled = (gateways.data ?? []).filter((g) => g.is_enabled);

  const available = METHOD_ICONS.filter((m) => enabled.some((g) => g[m.key]));

  return (
    <div className="mx-auto w-full max-w-[900px] px-5 pb-28 pt-6 sm:px-8 md:pb-16">
      <Link to="/account" className="text-xs font-bold text-muted-foreground">
        ← Account
      </Link>
      <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight">Payments</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose any of these at checkout. Nothing is stored on your device.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(available.length ? available : METHOD_ICONS.slice(-1)).map((m) => (
          <div key={m.key} className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft">
            <Icon3D name={m.icon} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{m.label}</p>
              <p className="truncate text-[11px] text-muted-foreground">Available at checkout</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-3xl border border-border bg-surface p-4">
        <Icon3D name="safety-security" size="md" />
        <p className="text-xs text-muted-foreground">
          All online payments run through PCI-compliant gateways. Blush never sees or stores your card or UPI
          credentials.
        </p>
      </div>
    </div>
  );
}
