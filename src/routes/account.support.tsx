import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { faqsQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Icon3D } from "@/components/site/Icon3D";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/support")({
  head: () => ({
    meta: [
      { title: "Support — Blush" },
      { name: "description", content: "Get help with your Blush orders, returns and account." },
      { property: "og:title", content: "Support — Blush" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: SupportPage,
});

const CHANNELS = [
  { icon: MessageCircle, label: "WhatsApp us", value: "+91 90000 00000", href: "https://wa.me/919000000000" },
  { icon: Mail, label: "Email us", value: "hello@blush.in", href: "mailto:hello@blush.in" },
  { icon: Phone, label: "Call us", value: "+91 90000 00000", href: "tel:+919000000000" },
];

function SupportPage() {
  const faqs = useQuery(faqsQuery);
  const { user } = useAuth();

  return (
    <div className="mx-auto w-full max-w-[800px] px-5 pb-24 pt-8 sm:px-8">
      <div className="flex items-center gap-4">
        <Icon3D name="help-center" size="xl" float />
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Support</h1>
          <p className="text-sm text-muted-foreground">We usually reply within a few hours</p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {CHANNELS.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-card p-5 text-center shadow-soft"
          >
            <c.icon className="h-5 w-5 text-primary" />
            <p className="text-sm font-bold">{c.label}</p>
            <p className="text-xs text-muted-foreground">{c.value}</p>
          </a>
        ))}
      </div>

      <Tickets userId={user?.id ?? null} />

      <section className="mt-10">
        <h2 className="font-display text-lg font-extrabold">Frequently asked</h2>
        <div className="mt-4 space-y-2">
          {(faqs.data ?? []).map((f: any) => (
            <details key={f.id} className="rounded-2xl bg-surface p-4">
              <summary className="cursor-pointer text-sm font-semibold">{f.question}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.answer}</p>
            </details>
          ))}
          {(faqs.data?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">
              Check our{" "}
              <Link to="/policies" className="font-semibold text-primary">
                policies
              </Link>{" "}
              page for shipping and returns info.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

type Ticket = {
  id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  order_code: string | null;
  admin_reply: string | null;
  created_at: string;
};

const CATEGORIES = ["order", "delivery", "refund", "payment", "product", "general"];

const inputCls =
  "w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

/** Raise and follow up on help tickets. */
function Tickets({ userId }: { userId: string | null }) {
  const qc = useQueryClient();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [orderCode, setOrderCode] = useState("");
  const [busy, setBusy] = useState(false);

  const tickets = useQuery({
    queryKey: ["support_tickets", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Ticket[]> => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("id, subject, message, category, status, order_code, admin_reply, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Ticket[];
    },
  });

  if (!userId) {
    return (
      <section className="mt-10 rounded-3xl border border-dashed border-border bg-card p-6 text-center">
        <p className="font-display text-base font-extrabold">Raise a support ticket</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to open a ticket and track our replies.
        </p>
        <Link
          to="/auth"
          className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          Sign in
        </Link>
      </section>
    );
  }

  async function submit() {
    if (subject.trim().length < 4 || message.trim().length < 10) {
      toast.error("Add a short subject and describe the issue");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: userId!,
      subject: subject.trim(),
      message: message.trim(),
      category,
      order_code: orderCode.trim() || null,
    });
    setBusy(false);
    if (error) return void toast.error(error.message);
    setSubject("");
    setMessage("");
    setOrderCode("");
    await qc.invalidateQueries({ queryKey: ["support_tickets"] });
    toast.success("Ticket raised — we'll reply soon");
  }

  return (
    <section className="mt-10">
      <h2 className="font-display text-lg font-extrabold">Raise a ticket</h2>
      <div className="mt-4 space-y-3 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c[0]!.toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <input
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            placeholder="Order code (optional)"
            className={inputCls}
          />
        </div>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className={inputCls}
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Tell us what happened"
          className={cn(inputCls, "resize-y")}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void submit()}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Sending…" : "Submit ticket"}
        </button>
      </div>

      {(tickets.data?.length ?? 0) > 0 && (
        <div className="mt-5 space-y-3">
          <h3 className="font-display text-base font-extrabold">Your tickets</h3>
          {(tickets.data ?? []).map((t) => (
            <article key={t.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <p className="truncate text-sm font-bold">{t.subject}</p>
                <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-[11px] font-bold capitalize">
                  {t.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t.category}
                {t.order_code ? ` · ${t.order_code}` : ""} ·{" "}
                {new Date(t.created_at).toLocaleDateString("en-IN")}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{t.message}</p>
              {t.admin_reply && (
                <p className="mt-3 rounded-2xl bg-surface p-3 text-sm">
                  <span className="font-bold">Blush support: </span>
                  {t.admin_reply}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
