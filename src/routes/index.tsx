import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, ArrowUpRight, Plus, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { Stars } from "@/components/site/Stars";
import {
  DeliveryIcon,
  FabricIcon,
  ReturnIcon,
  SecurePayIcon,
  StitchIcon,
  SupportIcon,
  WarrantyIcon,
} from "@/components/site/BrandIcons";
import { productsQuery, reviewsQuery } from "@/lib/queries";
import { fabricImage, heroImage, imageFor, inr } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Esko — Heavyweight everyday essentials, made in India" },
      {
        name: "description",
        content:
          "Esko makes a short line of heavyweight tees, linen shirts, trousers and overshirts for Indian weather. 240 GSM cotton, 15-day returns, free delivery over ₹1,499.",
      },
      { property: "og:title", content: "Esko — Heavyweight everyday essentials" },
      {
        property: "og:description",
        content: "A short line of honestly-made clothing, cut and sewn in Tiruppur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const HOTSPOTS = [
  {
    id: "collar",
    x: 30,
    y: 22,
    title: "Ribbed collar, twin-stitched",
    body: "A 2.2 cm rib collar stitched with cotton-wrapped polyester so it recovers instead of stretching out.",
  },
  {
    id: "gsm",
    x: 62,
    y: 46,
    title: "240 GSM combed cotton",
    body: "Long-staple combed yarn, bio-washed twice. Heavier than a standard 180 GSM tee, and it drapes instead of clinging.",
  },
  {
    id: "hem",
    x: 42,
    y: 76,
    title: "Twin-needle hem",
    body: "A double row of stitching at the hem and sleeves — the seam that usually fails first, reinforced.",
  },
];

const MOODS = [
  { key: "everyday", label: "Everyday", line: "Bone tee, dark trouser. The uniform." },
  { key: "minimal", label: "Minimal", line: "One colour, one texture, nothing loud." },
  { key: "work", label: "Work", line: "Knit polo and a pressed taper." },
  { key: "travel", label: "Travel", line: "Linen that survives an eight-hour flight." },
] as const;

function Home() {
  const products = useQuery(productsQuery);
  const reviews = useQuery(reviewsQuery);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, reduce ? 0 : -60]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, reduce ? 1 : 1.06]);
  const [activeSpot, setActiveSpot] = useState<string | null>(null);
  const [mood, setMood] = useState<(typeof MOODS)[number]["key"]>("everyday");

  const featured = (products.data ?? []).filter((p) => p.is_featured);
  const all = products.data ?? [];
  const hero = featured[0] ?? all[0];
  const moodCopy = MOODS.find((m) => m.key === mood)!;

  return (
    <div className="surface-warm">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-14">
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="eyebrow text-muted-foreground">
                New — Drift Linen, shipping now
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="hero-type mt-6"
            >
              Built heavier.
              <br />
              <span className="text-accent">Worn longer.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.16 }}
              className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Six pieces. Heavier yarn, honest fabric, and a fit that survives the wash cycle —
              cut and sewn in Tiruppur for the way India actually dresses.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.24 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              {hero && (
                <Link
                  to="/product/$slug"
                  params={{ slug: hero.slug }}
                  className="group inline-flex h-14 items-center gap-3 rounded-full bg-primary px-7 text-[15px] font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  Shop {hero.name}
                  <span className="num-strong opacity-70">{inr(hero.price_inr)}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
              <Link
                to="/shop"
                className="inline-flex h-14 items-center gap-2 rounded-full border border-border bg-card/60 px-7 text-[15px] font-semibold transition-colors hover:bg-card"
              >
                Explore the collection
              </Link>
            </motion.div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
              <Stat value="240" unit="GSM" label="Cotton weight" />
              <Stat value="15" unit="day" label="Easy returns" />
              <Stat value="4.8" unit="/5" label="1,216 ratings" />
            </div>
          </div>

          <motion.div style={{ y: heroY }} className="relative min-w-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-[2rem] shadow-lift lg:rounded-[2.5rem]"
            >
              <motion.img
                style={{ scale: heroScale }}
                src={heroImage}
                alt="Esko campaign — oversized bone tee and tapered dark trousers in afternoon light"
                width={1408}
                height={1600}
                className="aspect-[7/8] w-full object-cover"
              />
            </motion.div>

            {hero && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute -bottom-5 left-4 right-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-lift backdrop-blur sm:left-6 sm:right-auto sm:w-[22rem]"
              >
                <img
                  src={imageFor(hero.image_key)}
                  alt={hero.name}
                  loading="lazy"
                  width={1200}
                  height={1504}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{hero.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{hero.tagline}</p>
                </div>
                <Link
                  to="/product/$slug"
                  params={{ slug: hero.slug }}
                  aria-label={`View ${hero.name}`}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* trust strip */}
        <div className="border-y border-border bg-card/50">
          <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-6 px-5 py-5 sm:px-8">
            <Promise icon={<DeliveryIcon className="h-5 w-5 text-accent" />} text="Free delivery over ₹1,499" />
            <Promise icon={<ReturnIcon className="h-5 w-5 text-accent" />} text="15-day no-question returns" />
            <Promise icon={<SecurePayIcon className="h-5 w-5 text-accent" />} text="UPI, cards & cash on delivery" />
            <Promise icon={<SupportIcon className="h-5 w-5 text-accent" />} text="Support 7 days a week" />
          </div>
        </div>
      </section>

      {/* STORY */}
      <section id="story" className="mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <p className="eyebrow text-accent">The reason we started</p>
          <h2 className="section-type mt-4 max-w-3xl">
            Most tees look great for three weeks. Then the collar gives up.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-20">
          <div className="space-y-10">
            {[
              {
                n: "01",
                t: "The problem",
                b: "Indian retail optimises for price per piece, not wears per piece. The result is 160 GSM fabric that pills by the second month.",
              },
              {
                n: "02",
                t: "What we changed",
                b: "We buy heavier combed yarn, wash it twice before it becomes a garment, and pre-shrink so your size stays your size.",
              },
              {
                n: "03",
                t: "How it holds up",
                b: "Twin-needle hems, cotton-wrapped thread and a ribbed collar with real recovery. Tested at 40 machine washes before launch.",
              },
              {
                n: "04",
                t: "Why people stay",
                b: "One order becomes three. 62% of Esko customers come back within four months for a second colour.",
              },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.05}>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-5 border-t border-border pt-6">
                  <span className="num-strong text-sm text-accent">{s.n}</span>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{s.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {s.b}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1} className="lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-[2rem] shadow-lift">
              <img
                src={fabricImage}
                alt="Macro detail of heavyweight cream cotton jersey with twin-needle hem"
                loading="lazy"
                width={1408}
                height={1008}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <DnaCard icon={<FabricIcon className="h-6 w-6 text-accent" />} title="Fabric" body="240 GSM combed cotton, bio-washed" />
              <DnaCard icon={<StitchIcon className="h-6 w-6 text-accent" />} title="Construction" body="Twin-needle hems, taped shoulders" />
              <DnaCard icon={<WarrantyIcon className="h-6 w-6 text-accent" />} title="Tested" body="40 wash cycles before launch" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* DISCOVER THE DETAILS */}
      <section id="details" className="border-y border-border bg-card/60">
        <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-28">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-surface shadow-lift">
              <img
                src={imageFor("terra-tee")}
                alt="Terra Oversized Tee with interactive construction details"
                loading="lazy"
                width={1200}
                height={1504}
                className="aspect-[4/5] w-full object-cover"
              />
              {HOTSPOTS.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => setActiveSpot((v) => (v === spot.id ? null : spot.id))}
                  aria-label={spot.title}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  className={cn(
                    "absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/90 shadow-soft transition-transform",
                    activeSpot === spot.id ? "scale-110 bg-accent text-accent-foreground" : "hover:scale-110",
                  )}
                >
                  <Plus
                    className={cn(
                      "h-4 w-4 transition-transform",
                      activeSpot === spot.id && "rotate-45",
                    )}
                  />
                </button>
              ))}
            </div>
          </Reveal>

          <div className="min-w-0">
            <p className="eyebrow text-accent">Discover the details</p>
            <h2 className="section-type mt-4">Tap the points. See what you&apos;re paying for.</h2>
            <div className="mt-8 space-y-3">
              {HOTSPOTS.map((spot) => {
                const open = activeSpot === spot.id;
                return (
                  <button
                    key={spot.id}
                    onClick={() => setActiveSpot((v) => (v === spot.id ? null : spot.id))}
                    className={cn(
                      "w-full rounded-2xl border p-5 text-left transition-colors",
                      open ? "border-accent bg-background" : "border-border bg-background/50 hover:bg-background",
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-base font-semibold">{spot.title}</span>
                      <ChevronDown
                        className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
                      />
                    </div>
                    <motion.p
                      initial={false}
                      animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-2 block">{spot.body}</span>
                    </motion.p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <p className="eyebrow text-accent">Why you&apos;ll love it</p>
          <h2 className="section-type mt-4 max-w-2xl">Numbers, not adjectives.</h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Reveal className="md:col-span-2">
            <div className="ink-panel flex h-full min-h-[15rem] flex-col justify-between rounded-[1.75rem] p-8">
              <p className="eyebrow opacity-70">Fabric weight</p>
              <div>
                <p className="num-strong text-6xl sm:text-7xl">240 GSM</p>
                <p className="mt-3 max-w-md text-sm opacity-80">
                  Roughly 1.4× a standard high-street tee. That extra weight is why it hangs
                  straight instead of clinging.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="flex h-full min-h-[15rem] flex-col justify-between rounded-[1.75rem] border border-border bg-card p-8">
              <p className="eyebrow text-muted-foreground">Shrinkage after 40 washes</p>
              <div>
                <p className="num-strong text-6xl text-accent">&lt;2%</p>
                <p className="mt-3 text-sm text-muted-foreground">Pre-shrunk, so your size stays your size.</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.04}>
            <div className="flex h-full min-h-[13rem] flex-col justify-between rounded-[1.75rem] border border-border bg-card p-8">
              <p className="eyebrow text-muted-foreground">Repeat customers</p>
              <div>
                <p className="num-strong text-6xl">62%</p>
                <p className="mt-3 text-sm text-muted-foreground">Order again within four months.</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="md:col-span-2">
            <div className="flex h-full min-h-[13rem] flex-col justify-between rounded-[1.75rem] border border-border bg-surface p-8">
              <p className="eyebrow text-muted-foreground">Delivery across India</p>
              <div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end">
                <p className="num-strong text-6xl">2–5 days</p>
                <p className="text-sm text-muted-foreground">
                  Metro cities in 2–3 days, rest of India in 4–5. Free above ₹1,499, ₹79 below it.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MOOD */}
      <section className="border-y border-border bg-card/60">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <p className="eyebrow text-accent">Product mood</p>
              <h2 className="section-type mt-4">What are you dressing for?</h2>
              <motion.p
                key={mood}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-4 text-lg text-muted-foreground"
              >
                {moodCopy.line}
              </motion.p>
            </div>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMood(m.key)}
                  className={cn(
                    "rounded-full border px-5 py-2.5 text-sm font-semibold transition-all",
                    mood === m.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-foreground/30",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTION */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              <p className="eyebrow text-accent">The collection</p>
              <h2 className="section-type mt-4">Six pieces. No filler.</h2>
            </div>
            <Link
              to="/shop"
              className="hidden items-center gap-2 text-sm font-semibold text-accent sm:inline-flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        {products.isLoading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {all.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* REVIEWS */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8">
          <Reveal>
            <p className="eyebrow text-accent">What customers say</p>
            <h2 className="section-type mt-4 max-w-2xl">
              4.8 average from 1,216 verified purchases.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {(reviews.data ?? []).slice(0, 6).map((r, i) => (
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
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-[900px] px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <p className="eyebrow text-accent">FAQ</p>
          <h2 className="section-type mt-4">Questions we actually get.</h2>
        </Reveal>
        <Accordion type="single" collapsible className="mt-10">
          {[
            {
              q: "How does Esko sizing run?",
              a: "Terra is a true oversized cut — take your usual size for a boxy fit, or size down for a regular fit. Shirts, polos and trousers run true to size. Every product page lists the exact fit.",
            },
            {
              q: "How long does delivery take?",
              a: "2–3 working days to metro cities and 4–5 days to the rest of India. Delivery is free above ₹1,499, otherwise ₹79. You get a tracking link the moment your parcel is packed.",
            },
            {
              q: "What is the return policy?",
              a: "15 days from delivery, on unworn pieces with tags intact. We arrange a pickup and refund to the original payment method within 5 working days.",
            },
            {
              q: "Do you offer cash on delivery?",
              a: "Yes, COD is available across serviceable PIN codes. UPI and cards are also supported at checkout.",
            },
            {
              q: "Where is Esko made?",
              a: "Cut and sewn in Tiruppur, Tamil Nadu, with fabric knitted and dyed within 30 km of the unit.",
            },
          ].map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* FINAL CTA */}
      {hero && (
        <section className="mx-auto w-full max-w-[1400px] px-5 pb-24 sm:px-8">
          <Reveal>
            <div className="ink-panel overflow-hidden rounded-[2rem] px-7 py-14 text-center sm:px-14 lg:py-20">
              <p className="eyebrow opacity-70">Start with one</p>
              <h2 className="section-type mx-auto mt-4 max-w-2xl">
                The {hero.name} is where most people begin.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm opacity-80 sm:text-base">{hero.tagline}</p>
              <Link
                to="/product/$slug"
                params={{ slug: hero.slug }}
                className="mt-9 inline-flex h-14 items-center gap-3 rounded-full bg-accent px-8 text-[15px] font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Buy now — {inr(hero.price_inr)}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </section>
      )}
    </div>
  );
}

function Stat({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div className="min-w-0">
      <p className="num-strong text-2xl sm:text-3xl">
        {value}
        <span className="text-base text-muted-foreground">{unit}</span>
      </p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Promise({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="shrink-0">{icon}</span>
      <span className="truncate text-xs font-medium sm:text-sm">{text}</span>
    </div>
  );
}

function DnaCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {icon}
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
