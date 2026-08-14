import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Icon3D } from "@/components/site/Icon3D";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Blush" },
      { name: "description", content: "Sign in to Blush to track orders, save favourites and unlock rewards." },
      { property: "og:title", content: "Sign in — Blush" },
      { property: "og:description", content: "Track orders, save favourites and unlock rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/account", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          return;
        }
        navigate({ to: "/onboarding", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/account", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error instanceof Error ? result.error : new Error(String(result.error));
      if (result.redirected) return;
      navigate({ to: "/account", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    }
  }

  return (
    <div
      className="flex min-h-[80vh] items-center justify-center px-5 py-12"
      style={{ background: "var(--gradient-soft)" }}
    >
      <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-7 shadow-lift">
        <div className="flex items-center gap-3">
          <Icon3D name="profile" size="lg" float />
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight">
              {mode === "signin" ? "Welcome back" : "Join Blush"}
            </h1>
            <p className="text-xs text-muted-foreground">
              Orders, wishlist and rewards in one place
            </p>
          </div>
        </div>

        {sent ? (
          <div className="mt-8 rounded-2xl bg-surface p-5 text-center">
            <Icon3D name="messages" size="xl" className="mx-auto" />
            <p className="mt-3 font-semibold">Check your email</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We sent a confirmation link to {email}. Click it to finish signing up.
            </p>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={google}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-bold shadow-soft"
            >
              Continue with Google
            </button>

            <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={submit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                aria-label="Email"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                aria-label="Password"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={busy}
                className={cn(
                  "w-full rounded-full px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60",
                )}
                style={{ background: "var(--gradient-primary)" }}
              >
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="font-bold text-primary"
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
