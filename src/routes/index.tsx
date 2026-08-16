import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductCard } from "@/components/site/ProductCard";
import { HeroSlider } from "@/components/site/HeroSlider";
import { ScrollFx, type ScrollFxVariant } from "@/components/site/ScrollFx";
import { Icon3D, Icon3DTile } from "@/components/site/Icon3D";
import { bannersQuery, faqsQuery, productsQuery } from "@/lib/queries";
import { discountPct, heroImage, type Product } from "@/lib/catalog";
import { BEAUTY, DISCOVERY, FASHION, TRUST } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blush — Online shopping for fashion, beauty & accessories" },
      {
        name: "description",
        content:
          "Shop dresses, tops, bags, jewellery, makeup and skincare at Blush. Lowest prices, fast delivery across India and easy 15-day returns.",
      },
      { property: "og:title", content: "Blush — Online shopping for fashion & beauty" },
      {
        property: "og:description",
        content: "Top deals on fashion, beauty and accessories. Fast delivery, easy returns.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Section({
  title,
  sub,
  to,
  children,
  tinted = false,
  fx = "fade-up",
}: {
  title: string;
  sub?: string;
  to?: string;
  children: React.ReactNode;
  tinted?: boolean;
  fx?: ScrollFxVariant;
}) {
  return (
    <section className={cn(tinted && "bg-surface/70")}>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-8 sm:py-10">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-extrabold tracking-tight sm:text-2xl">
              {title}
            </h2>
            {sub && <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">{sub}</p>}
          </div>
          {to && (
            <Link
              to={to}
              className="shrink-0 inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
        <ScrollFx variant={fx} className="mt-4">
          {children}
        </ScrollFx>
      </div>
    </section>
  );
}

function Grid({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {items.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} compact />
      ))}
    </div>
  );
}

function Home() {
  const products = useQuery(productsQuery);
  const faqs = useQuery(faqsQuery);
  const heroBanners = useQuery(bannersQuery("hero"));

  const all: Product[] = useMemo(() => products.data ?? [], [products.data]);
  const slides = heroBanners.data ?? [];

  const topDeals = useMemo(
    () =>
      [...all]
        .sort(
          (a, b) =>
            discountPct(b.price_inr, b.compare_at_inr) - discountPct(a.price_inr, a.compare_at_inr),
        )
        .slice(0, 8),
    [all],
  );
  const trending = useMemo(
    () => [...all].sort((a, b) => b.review_count - a.review_count).slice(0, 8),
    [all],
  );
  const newArrivals = useMemo(() => all.slice(0, 8), [all]);
  const topRated = useMemo(
    () => [...all].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 8),
    [all],
  );

  return (
    <div className="overflow-x-hidden">
      {/* CATEGORY ICON RAIL */}
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-3 sm:px-8">
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[...FASHION, ...BEAUTY].map((c) => (
              <Link
                key={c.icon}
                to="/category/$slug"
                params={{ slug: c.icon }}
                className="w-[74px] shrink-0 text-center sm:w-[96px]"
              >
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-surface sm:h-16 sm:w-16">
                  <Icon3D name={c.icon} size="sm" />
                </span>
                <span className="mt-1.5 block truncate text-[11px] font-semibold">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* OFFERS STRIP */}
      <section className="mx-auto w-full max-w-[1400px] px-4 pt-4 sm:px-8">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {DISCOVERY.map((d) => (
            <Link
              key={d.icon}
              to="/offers"
              className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5"
            >
              <Icon3D name={d.icon} size="xs" className="h-5 w-5" />
              <span className="whitespace-nowrap text-xs font-bold">{d.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="mx-auto w-full max-w-[1400px] px-4 pt-4 sm:px-8">
        <div className="overflow-hidden rounded-2xl">
          <HeroSlider banners={slides} fallback={heroImage} />
        </div>
      </section>

      <Section title="Top deals" sub="Biggest discounts live right now" to="/offers" fx="stagger-scale">
        <Grid items={topDeals} />
      </Section>

      <Section title="Trending products" sub="What everyone is buying" tinted to="/shop" fx="fade-up">
        <Grid items={trending} />
      </Section>

      <Section title="New arrivals" sub="Fresh off this week's drop" to="/shop" fx="fade-up">
        <Grid items={newArrivals} />
      </Section>

      <Section title="Shop by category" tinted fx="pop">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {FASHION.map((f) => (
            <Link key={f.icon} to="/category/$slug" params={{ slug: f.icon }}>
              <Icon3DTile name={f.icon} label={f.label} tone="peach" />
            </Link>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-9">
          {BEAUTY.map((b) => (
            <Link key={b.icon} to="/category/$slug" params={{ slug: b.icon }}>
              <Icon3DTile name={b.icon} label={b.label} tone="lilac" />
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Top rated" sub="4.5★ and above" to="/shop" fx="fade-up">
        <Grid items={topRated} />
      </Section>

      {/* TRUST */}
      <section className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-8">
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.icon} className="flex min-w-0 items-center gap-2.5">
              <Icon3D name={t.icon} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold">{t.label}</p>
                <p className="truncate text-[11px] text-muted-foreground">{t.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      {(faqs.data?.length ?? 0) > 0 && (
        <Section title="Frequently asked" tinted fx="fade-up">
          <Accordion type="single" collapsible className="mx-auto max-w-3xl">
            {(faqs.data ?? [])
              .slice(0, 6)
              .map((f: { id: string; question: string; answer: string }) => (
                <AccordionItem key={f.id} value={f.id}>
                  <AccordionTrigger className="text-left text-sm font-semibold">
                    {f.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </Section>
      )}
    </div>
  );
}
