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
