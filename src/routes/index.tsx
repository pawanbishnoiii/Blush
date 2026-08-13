import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { ScrollFx, type ScrollFxVariant } from "@/components/site/ScrollFx";
import { Stars } from "@/components/site/Stars";
import { Icon3D, Icon3DTile } from "@/components/site/Icon3D";
import { bannersQuery, faqsQuery, productsQuery, reviewsQuery } from "@/lib/queries";
import { heroImage, inr, type Product } from "@/lib/catalog";
import { BEAUTY, DISCOVERY, FASHION, MOODS, SPECIAL, TRUST, VIBES, type MoodKey } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blush — Shop your vibe: fashion, beauty & accessories" },
      {
        name: "description",
        content:
          "Mood-first shopping for girls in India. Fashion, beauty, bags, jewellery and self-care — curated by vibe, delivered fast with easy returns.",
      },
      { property: "og:title", content: "Blush — Shop your vibe" },
      {
        property: "og:description",
        content: "Fashion, beauty and accessories curated by mood. Cute, Y2K, minimal, elegant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const PRICE_EDITS = [
  { max: 299, label: "Under ₹299", icon: "offers" as const, tone: "peach" as const },
  { max: 499, label: "Under ₹499", icon: "coupons" as const, tone: "blush" as const },
  { max: 999, label: "Under ₹999", icon: "rewards" as const, tone: "lilac" as const },
];

const OCCASIONS = [
  { key: "college", label: "College", icon: "bags" as const },
  { key: "office", label: "Office", icon: "size-guide" as const },
  { key: "party", label: "Party", icon: "gifts" as const },
  { key: "festive", label: "Festive", icon: "rewards" as const },
  { key: "travel", label: "Travel", icon: "fast-delivery" as const },
  { key: "self-care", label: "Self Care", icon: "wellness" as const },
];

function Section({
  eyebrow,
  title,
  sub,
  to,
  children,
  tinted = false,
  fx = "fade-up",
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  to?: string;
  children: React.ReactNode;
  tinted?: boolean;
  fx?: ScrollFxVariant;
}) {
  return (
    <section className={cn(tinted && "bg-surface/70")}>
      <div className="mx-auto w-full max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16">
        <ScrollFx variant="blur">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              {eyebrow && <p className="eyebrow text-primary">{eyebrow}</p>}
              <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                {title}
              </h2>
              {sub && <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>}
            </div>
            {to && (
              <Link
                to={to}
                className="shrink-0 inline-flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold shadow-soft"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </ScrollFx>
        <ScrollFx variant={fx} className="mt-7">
          {children}
        </ScrollFx>
      </div>
    </section>
  );
}

function Rail({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}

function Home() {
  const reduce = useReducedMotion();
  const products = useQuery(productsQuery);
  const reviews = useQuery(reviewsQuery);
  const faqs = useQuery(faqsQuery);
  const heroBanners = useQuery(bannersQuery("home_hero"));
  const [mood, setMood] = useState<MoodKey>("cute");

  const all: Product[] = useMemo(() => products.data ?? [], [products.data]);
  const activeMood = MOODS.find((m) => m.key === mood)!;
  const banner = heroBanners.data?.[0];

  const byMood = useMemo(() => {
    const matched = all.filter(
      (p) => p.mood_tags?.includes(mood) || p.vibe_tags?.includes(mood),
    );
    return (matched.length ? matched : all).slice(0, 8);
  }, [all, mood]);

  const newArrivals = useMemo(() => all.slice(0, 8), [all]);
  const trending = useMemo(
    () => [...all].sort((a, b) => b.review_count - a.review_count).slice(0, 8),
    [all],
  );
  const forYou = useMemo(
    () => [...all].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 8),
    [all],
  );

  return (
    <div className="pb-24 md:pb-0">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-soft)" }}
          aria-hidden
        />
        <div className="mx-auto grid w-full max-w-[1400px] items-center gap-8 px-5 pb-10 pt-8 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:pt-14">
          <div className="min-w-0">
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold shadow-soft"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {banner?.subtitle ?? "New drop every Friday"}
            </motion.p>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="mt-4 font-display text-[2.6rem] font-extrabold leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl"
            >
              {banner?.title ?? "Shop your"}{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                vibe
              </span>
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base"
            >
              {activeMood.copy}
            </motion.p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={banner?.link_url ?? "/shop"}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
                style={{ background: "var(--gradient-primary)" }}
              >
                {banner?.cta_label ?? activeMood.cta} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/offers"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-bold shadow-soft"
              >
                Today&apos;s offers
              </Link>
            </div>

            {/* Mood picker */}
            <div className="mt-8">
              <p className="eyebrow text-secondary">What&apos;s your vibe today?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMood(m.key)}
                    aria-pressed={m.key === mood}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-all",
                      m.key === mood
                        ? "border-transparent bg-primary text-primary-foreground shadow-glow"
                        : "border-border bg-card shadow-soft hover:-translate-y-0.5",
                    )}
                  >
                    <Icon3D name={m.icon} size="xs" className="h-5 w-5" />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="overflow-hidden rounded-[2rem] shadow-lift">
              <ScrollFx variant="parallax" distance={26}>
                <img
                  src={banner?.image_url ?? heroImage}
                  alt={banner?.title ?? "Shop your vibe — fashion, beauty and accessories"}
                  width={1536}
                  height={1024}
                  className="w-full scale-110 object-cover"
                />
              </ScrollFx>
            </div>
            <div className="absolute -bottom-4 left-4 flex items-center gap-2 rounded-2xl bg-card/95 px-3 py-2 shadow-lift backdrop-blur">
              <Icon3D name="fast-delivery" size="sm" />
              <div className="text-[11px] leading-tight">
                <p className="font-bold">Fast delivery</p>
                <p className="text-muted-foreground">2–4 day dispatch</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DISCOVERY RAIL */}
      <section className="mx-auto w-full max-w-[1400px] px-5 pt-6 sm:px-8">
        <Rail>
          {DISCOVERY.map((d) => (
            <Link
              key={d.icon}
              to="/shop"
              className="w-[104px] shrink-0 snap-start sm:w-[128px]"
            >
              <Icon3DTile name={d.icon} label={d.label} tone="blush" />
            </Link>
          ))}
        </Rail>
      </section>

      {/* NEW ARRIVALS */}
      <Section eyebrow="Fresh in" title="New arrivals" sub="Straight off this week's drop" to="/shop" fx="stagger-scale">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {newArrivals.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </Section>

      {/* TRENDING */}
      <Section eyebrow="Everyone's buying" title="Trending now" tinted to="/shop" fx="slide-left">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {trending.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </Section>

      {/* CATEGORIES */}
      <Section eyebrow="Browse" title="Shop by category" sub="Fashion, beauty and everything cute" fx="pop">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {FASHION.map((f) => (
            <Link key={f.icon} to="/category/$slug" params={{ slug: f.icon }}>
              <Icon3DTile name={f.icon} label={f.label} tone="peach" />
            </Link>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-6 lg:grid-cols-9">
          {BEAUTY.map((b) => (
            <Link key={b.icon} to="/category/$slug" params={{ slug: b.icon }}>
              <Icon3DTile name={b.icon} label={b.label} tone="lilac" />
            </Link>
          ))}
        </div>
      </Section>

      {/* SHOP BY MOOD */}
      <Section
        eyebrow="Mood board"
        title={activeMood.headline}
        sub={`Picked for your ${activeMood.label.toLowerCase()} mood`}
        tinted
        fx="reveal-mask"
      >
        <Rail>
          {VIBES.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => {
                const m = MOODS.find((x) => x.key === v.key);
                if (m) setMood(m.key);
              }}
              className="w-[92px] shrink-0 snap-start sm:w-[112px]"
            >
              <Icon3DTile name={v.icon} label={v.label} tone="cream" />
            </button>
          ))}
        </Rail>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {byMood.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </Section>

      {/* OCCASIONS */}
      <Section eyebrow="Dress for it" title="Occasion edit" fx="flip">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {OCCASIONS.map((o) => (
            <Link key={o.key} to="/category/$slug" params={{ slug: o.key }}>
              <Icon3DTile name={o.icon} label={o.label} tone="blush" />
            </Link>
          ))}
        </div>
      </Section>

      {/* PRICE EDITS */}
      <Section eyebrow="Budget picks" title="Steals under ₹999" tinted fx="stagger">
        <div className="grid gap-4 sm:grid-cols-3">
          {PRICE_EDITS.map((edit) => {
            const items = all.filter((p) => p.price_inr <= edit.max).slice(0, 3);
            return (
              <div key={edit.label} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-center gap-3">
                  <Icon3D name={edit.icon} size="md" />
                  <div className="min-w-0">
                    <p className="font-display text-lg font-extrabold">{edit.label}</p>
                    <p className="text-xs text-muted-foreground">{items.length} picks live</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {items.map((p) => (
                    <Link
                      key={p.id}
                      to="/product/$slug"
                      params={{ slug: p.slug }}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-3 py-2 text-xs"
                    >
                      <span className="truncate font-semibold">{p.name}</span>
                      <span className="num-strong shrink-0">{inr(p.price_inr)}</span>
                    </Link>
                  ))}
                  {items.length === 0 && (
                    <p className="text-xs text-muted-foreground">Restocking soon.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* FOR YOU */}
      <Section eyebrow="For you" title="Highest rated right now" to="/shop" fx="zoom">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {forYou.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </Section>

      {/* SPECIAL */}
      <Section eyebrow="More to explore" title="Collections & extras" tinted fx="slide-right">
        <Rail>
          {SPECIAL.map((s) => (
            <Link key={s.icon} to="/shop" className="w-[104px] shrink-0 snap-start sm:w-[128px]">
              <Icon3DTile name={s.icon} label={s.label} tone="lilac" />
            </Link>
          ))}
        </Rail>
      </Section>

      {/* TRUST */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-10 sm:px-8">
        <ScrollFx variant="stagger">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft sm:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.icon} className="flex min-w-0 items-center gap-3">
              <Icon3D name={t.icon} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{t.label}</p>
                <p className="truncate text-xs text-muted-foreground">{t.hint}</p>
              </div>
            </div>
          ))}
        </div>
        </ScrollFx>
      </section>

      {/* REVIEWS */}
      {(reviews.data?.length ?? 0) > 0 && (
        <Section eyebrow="Customer love" title="Real reviews from verified buyers" tinted fx="stagger">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {(reviews.data ?? []).slice(0, 6).map((r, i: number) => (
              <Reveal key={r.id} delay={(i % 3) * 0.06}>
                <figure className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <Stars rating={r.rating} />
                  <blockquote className="mt-4 flex-1">
                    <p className="text-base font-semibold">{r.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{r.author}</span>
                    {r.city && <span>· {r.city}</span>}
                    {r.is_verified && <span className="text-success">· Verified buyer</span>}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* FAQ */}
      {(faqs.data?.length ?? 0) > 0 && (
        <Section eyebrow="Good to know" title="Frequently asked" fx="reveal-mask">
          <Accordion type="single" collapsible className="mx-auto max-w-3xl">
            {(faqs.data ?? []).slice(0, 8).map((f: { id: string; question: string; answer: string }) => (
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
