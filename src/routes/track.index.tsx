import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Package, Search } from "lucide-react";

export const Route = createFileRoute("/track/")({
  head: () => ({
    meta: [
      { title: "Track your Esko order" },
      { name: "description", content: "Enter your Esko order code to see a live delivery timeline." },
      { property: "og:title", content: "Track your Esko order" },
      { property: "og:description", content: "Live delivery timeline for every Esko parcel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackIndex,
});

function TrackIndex() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  return (
    <div className="surface-warm">
      <div className="mx-auto max-w-md px-5 py-20 text-center sm:py-28">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-surface">
          <Package className="h-6 w-6 text-accent" />
        </span>
        <h1 className="section-type mt-6">Where is my parcel?</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Enter the order code from your confirmation email — it looks like ESK-XXXX-XXXXX.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const clean = code.trim().toUpperCase();
            if (clean.length >= 6) navigate({ to: "/track/$code", params: { code: clean } });
          }}
          className="mt-8 grid grid-cols-[minmax(0,1fr)_auto] gap-2"
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ESK-4KD9-2MQ7X"
            className="h-13 min-w-0 rounded-full border border-border bg-background px-5 text-sm outline-none transition-colors focus:border-accent"
          />
          <button
            type="submit"
            className="inline-flex h-13 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            <Search className="h-4 w-4" /> Track
          </button>
        </form>
      </div>
    </div>
  );
}
