import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { motion } from "motion/react";
import { Loader2, MapPin, Lock, Banknote, Smartphone, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { settingsQuery } from "@/lib/queries";
import { deliveryEstimate, imageFor, inr } from "@/lib/catalog";
import { placeOrder } from "@/lib/orders.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Esko" },
      { name: "description", content: "Secure one-page checkout with UPI, cards and cash on delivery." },
      { property: "og:title", content: "Checkout — Esko" },
      { property: "og:description", content: "Secure one-page Esko checkout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

const formSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(160),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  addressLine1: z.string().trim().min(5, "Enter your house / street").max(160),
  addressLine2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(2, "Enter your city").max(60),
  state: z.string().trim().min(2, "Enter your state").max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  paymentMethod: z.enum(["upi", "card", "cod"]),
});

type FormValues = z.infer<typeof formSchema>;

function Checkout() {
  const navigate = useNavigate();
  const { lines, clear } = useCart();
  const settings = useQuery(settingsQuery);
  const submitOrder = useServerFn(placeOrder);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { paymentMethod: "upi", addressLine2: "" },
  });

  const paymentMethod = watch("paymentMethod");
  const subtotal = cartSubtotal(lines);
  const threshold = settings.data?.free_delivery_threshold ?? 1499;
  const fee = settings.data?.shipping_fee ?? 79;
  const shipping = subtotal >= threshold ? 0 : fee;
  const total = subtotal + shipping;

  async function detectLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Location isn't available in this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lon: longitude });
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { Accept: "application/json" } },
          );
          const data = (await res.json()) as {
            address?: Record<string, string>;
            display_name?: string;
          };
          const a = data.address ?? {};
          const line1 = [a["road"], a["neighbourhood"], a["suburb"]].filter(Boolean).join(", ");
          if (line1) setValue("addressLine1", line1, { shouldValidate: true });
          const city = a["city"] ?? a["town"] ?? a["village"] ?? a["state_district"];
          if (city) setValue("city", city, { shouldValidate: true });
          if (a["state"]) setValue("state", a["state"], { shouldValidate: true });
          if (a["postcode"]) setValue("pincode", a["postcode"].slice(0, 6), { shouldValidate: true });
          toast.success("Address filled from your location", {
            description: "Check the details before placing the order.",
          });
        } catch {
          toast.error("Couldn't read that location — please type your address");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        toast.error("Location permission denied", {
          description: "You can still enter your address manually.",
        });
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  async function onSubmit(values: FormValues) {
    if (lines.length === 0) return;
    setSubmitting(true);
    try {
      const result = await submitOrder({
        data: {
          ...values,
          addressLine2: values.addressLine2 ?? "",
          ...(coords ? { latitude: coords.lat, longitude: coords.lon } : {}),
          items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        },
      });
      clear();
      navigate({ to: "/order/$code", params: { code: result.orderCode } });
    } catch (err) {
      toast.error("We couldn't place that order", {
        description: err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="surface-warm">
        <div className="mx-auto max-w-md px-5 py-28 text-center">
          <h1 className="section-type">Nothing to check out yet.</h1>
          <Link
            to="/shop"
            className="mt-8 inline-flex rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground"
          >
            Browse the collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-warm">
      <div className="mx-auto w-full max-w-[1100px] px-5 py-12 sm:px-8 lg:py-16">
        <h1 className="section-type">Checkout</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          One page. No account needed — we&apos;ll email your tracking link.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-9 grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12"
        >
          <div className="min-w-0 space-y-6">
            <Section step="01" title="Contact">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" error={errors.fullName?.message}>
                  <input {...register("fullName")} className="input-base" placeholder="Aarav Mehta" autoComplete="name" />
                </Field>
                <Field label="Mobile number" error={errors.phone?.message}>
                  <input
                    {...register("phone")}
                    className="input-base"
                    placeholder="9876543210"
                    inputMode="numeric"
                    autoComplete="tel-national"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Email" error={errors.email?.message}>
                    <input
                      {...register("email")}
                      className="input-base"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section step="02" title="Delivery address">
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                className="mb-4 inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold transition-colors hover:border-foreground/30 disabled:opacity-60"
              >
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4 text-accent" />}
                {locating ? "Detecting…" : "Use my current location"}
              </button>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="House number and street" error={errors.addressLine1?.message}>
                    <input {...register("addressLine1")} className="input-base" placeholder="14, 3rd Cross, Indiranagar" autoComplete="address-line1" />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Landmark / apartment (optional)">
                    <input {...register("addressLine2")} className="input-base" placeholder="Near Sony World Signal" autoComplete="address-line2" />
                  </Field>
                </div>
                <Field label="City" error={errors.city?.message}>
                  <input {...register("city")} className="input-base" placeholder="Bengaluru" autoComplete="address-level2" />
                </Field>
                <Field label="State" error={errors.state?.message}>
                  <input {...register("state")} className="input-base" placeholder="Karnataka" autoComplete="address-level1" />
                </Field>
                <Field label="PIN code" error={errors.pincode?.message}>
                  <input {...register("pincode")} className="input-base" placeholder="560038" inputMode="numeric" autoComplete="postal-code" />
                </Field>
                <div className="flex items-end">
                  <p className="text-xs text-muted-foreground">
                    Estimated delivery <span className="font-semibold text-foreground">{deliveryEstimate(4)}</span>
                  </p>
                </div>
              </div>
            </Section>

            <Section step="03" title="Payment">
              <div className="grid gap-3 sm:grid-cols-3">
                <PayOption
                  active={paymentMethod === "upi"}
                  icon={<Smartphone className="h-4 w-4" />}
                  label="UPI"
                  hint="GPay, PhonePe, Paytm"
                  onClick={() => setValue("paymentMethod", "upi")}
                />
                <PayOption
                  active={paymentMethod === "card"}
                  icon={<CreditCard className="h-4 w-4" />}
                  label="Card"
                  hint="Credit / debit"
                  onClick={() => setValue("paymentMethod", "card")}
                />
                <PayOption
                  active={paymentMethod === "cod"}
                  icon={<Banknote className="h-4 w-4" />}
                  label="Cash on delivery"
                  hint="Pay at your door"
                  onClick={() => setValue("paymentMethod", "cod")}
                />
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                {paymentMethod === "cod"
                  ? "Keep the exact amount ready — our courier carries a UPI QR as backup."
                  : "You'll be asked to authorise the payment on the confirmation step."}
              </p>
            </Section>
          </div>

          {/* SUMMARY */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <ul className="mt-5 space-y-4">
                {lines.map((l) => (
                  <li key={l.variantId} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                    <img
                      src={imageFor(l.imageKey)}
                      alt={l.name}
                      loading="lazy"
                      className="h-14 w-12 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{l.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {l.colorName} · {l.size} · ×{l.quantity}
                      </p>
                    </div>
                    <span className="num-strong text-sm">{inr(l.unitPrice * l.quantity)}</span>
                  </li>
                ))}
              </ul>

              <dl className="mt-6 space-y-2.5 border-t border-border pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{inr(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd>{shipping === 0 ? "Free" : inr(shipping)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <dt className="text-base font-semibold">Total</dt>
                  <dd className="num-strong text-2xl">{inr(total)}</dd>
                </div>
              </dl>

              <motion.button
                type="submit"
                disabled={submitting}
                whileTap={{ scale: 0.985 }}
                className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground shadow-lift disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Placing order…
                  </>
                ) : (
                  <>Place order · {inr(total)}</>
                )}
              </motion.button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                15-day returns · Prices include all taxes
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <span className="num-strong text-xs text-accent">{step}</span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5 [&_.input-base]:h-12 [&_.input-base]:w-full [&_.input-base]:rounded-xl [&_.input-base]:border [&_.input-base]:border-border [&_.input-base]:bg-background [&_.input-base]:px-4 [&_.input-base]:text-sm [&_.input-base]:outline-none [&_.input-base]:transition-colors focus-within:[&_.input-base]:border-accent">
        {children}
      </div>
      {error && <span className="mt-1.5 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function PayOption({
  active,
  icon,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-4 text-left transition-all",
        active ? "border-primary bg-background shadow-soft" : "border-border bg-background/50 hover:border-foreground/30",
      )}
    >
      <span className={cn("inline-flex", active ? "text-accent" : "text-muted-foreground")}>{icon}</span>
      <p className="mt-2 text-sm font-semibold">{label}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </button>
  );
}
