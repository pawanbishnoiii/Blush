import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import gsap from "gsap";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Icon3D } from "@/components/site/Icon3D";
import { MOODS } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your account — Blush" },
      { name: "description", content: "Two quick steps and your Blush feed is personalised to your vibe." },
      { property: "og:title", content: "Set up your account — Blush" },
      { property: "og:description", content: "Two quick steps to personalise your feed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function Onboarding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [gender, setGender] = useState("Female");
  const [whatsapp, setWhatsapp] = useState("");
  const [age, setAge] = useState("");
  const [moods, setMoods] = useState<string[]>([]);
  const [size, setSize] = useState("M");

  const cardRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate({ to: "/auth", replace: true });
        return;
      }
      setUserId(data.user.id);
      const meta = data.user.user_metadata ?? {};
      setName((meta['full_name'] as string) ?? (meta['name'] as string) ?? "");
    });
  }, [navigate]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });
      gsap.from(".onb-pop", {
        y: 18,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        delay: 0.15,
        ease: "power2.out",
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        stepRef.current,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
      );
    });
    return () => ctx.revert();
  }, [step]);

  function next() {
    if (name.trim().length < 2) return toast.error("Tell us your name");
    if (!/^[6-9]\d{9}$/.test(whatsapp)) return toast.error("Enter a valid 10-digit WhatsApp number");
    const n = Number(age);
    if (!n || n < 13 || n > 99) return toast.error("Enter an age between 13 and 99");
    setStep(2);
  }

  async function finish() {
    if (!userId) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: name.trim(),
          gender,
          whatsapp,
          phone: whatsapp,
          age: Number(age),
          preferred_moods: moods,
          preferred_sizes: { default: size },
          onboarded: true,
        })
        .eq("id", userId);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["my_profile"] });
      toast.success(`You're all set, ${name.split(" ")[0]}!`);
      navigate({ to: "/", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your details");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="flex min-h-[85vh] items-center justify-center px-5 py-12"
      style={{ background: "var(--gradient-soft)" }}
    >
      <div ref={cardRef} className="w-full max-w-lg rounded-[2rem] border border-border bg-card p-7 shadow-lift">
        <div className="flex items-center gap-3">
          <Icon3D name={step === 1 ? "profile" : "shop-by-mood"} size="lg" float />
          <div className="min-w-0">
            <p className="eyebrow text-primary">Step {step} of 2</p>
            <h1 className="font-display text-2xl font-extrabold tracking-tight">
              {step === 1 ? "Tell us about you" : "Pick your vibe"}
            </h1>
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: step === 1 ? "50%" : "100%", background: "var(--gradient-primary)" }}
          />
        </div>

        <div ref={stepRef} className="mt-7">
          {step === 1 ? (
            <div className="space-y-4">
              <Field label="Your name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aanya Sharma"
                  className="onb-pop w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>

              <Field label="Gender">
                <div className="onb-pop flex flex-wrap gap-2">
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-xs font-semibold transition-all",
                        gender === g
                          ? "border-transparent bg-primary text-primary-foreground"
                          : "border-border bg-background",
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="WhatsApp number">
                <div className="onb-pop flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3">
                  <span className="text-sm text-muted-foreground">+91</span>
                  <input
                    inputMode="numeric"
                    maxLength={10}
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                    placeholder="98765 43210"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
              </Field>

              <Field label="Age">
                <input
                  inputMode="numeric"
                  maxLength={2}
                  value={age}
                  onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))}
                  placeholder="21"
                  className="onb-pop w-28 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>

              <button
                type="button"
                onClick={next}
                className="mt-2 w-full rounded-full px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow"
                style={{ background: "var(--gradient-primary)" }}
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <Field label="Moods you love">
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => {
                    const on = moods.includes(m.key);
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() =>
                          setMoods((prev) =>
                            on ? prev.filter((x) => x !== m.key) : [...prev, m.key],
                          )
                        }
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-all",
                          on
                            ? "border-transparent bg-secondary text-secondary-foreground"
                            : "border-border bg-background",
                        )}
                      >
                        <Icon3D name={m.icon} size="xs" className="h-5 w-5" />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Your usual size">
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={cn(
                        "h-10 w-12 rounded-2xl border text-xs font-bold transition-all",
                        size === s
                          ? "border-transparent bg-primary text-primary-foreground"
                          : "border-border bg-background",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-border bg-background px-5 py-3 text-sm font-bold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={finish}
                  disabled={busy}
                  className="flex-1 rounded-full px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {busy ? "Saving…" : "Start shopping"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
