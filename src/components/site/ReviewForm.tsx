import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/upload";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function ReviewForm({
  productId,
  productSlug,
  variantLabel,
}: {
  productId: string;
  productSlug: string;
  variantLabel?: string | null;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const delivered = useQuery({
    queryKey: ["can-review", productId, user?.id ?? "guest"],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("id, orders!inner(status)")
        .eq("product_id", productId)
        .eq("orders.status", "delivered")
        .limit(1);
      if (error) throw error;
      return (data ?? []).length > 0;
    },
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [city, setCity] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center">
        <p className="font-display text-base font-extrabold">Share your review</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to rate this piece and upload your photos.
        </p>
        <Link
          to="/auth"
          className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          Sign in to review
        </Link>
      </div>
    );
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const picked = Array.from(files).slice(0, 6 - photos.length);
    for (const file of picked) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only images can be uploaded");
        continue;
      }
      if (file.size > 6 * 1024 * 1024) {
        toast.error(`${file.name} is over 6MB`);
        continue;
      }
      try {
        setProgress(0);
        const url = await uploadFile("review-photos", file, setProgress, productSlug);
        setPhotos((p) => [...p, url]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setProgress(null);
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit() {
    if (title.trim().length < 3) {
      toast.error("Add a short headline");
      return;
    }
    if (body.trim().length < 10) {
      toast.error("Tell us a little more (10+ characters)");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user!.id,
      author:
        (user!.user_metadata?.["full_name"] as string | undefined) ??
        user!.email?.split("@")[0] ??
        "Blush shopper",
      city: city.trim() || null,
      rating,
      title: title.trim(),
      body: body.trim(),
      photos,
      variant_label: variantLabel ?? null,
      status: "pending",
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setTitle("");
    setBody("");
    setPhotos([]);
    setRating(5);
    await qc.invalidateQueries({ queryKey: ["product", productSlug] });
    toast.success("Thanks for the review!", {
      description: "It goes live as soon as our team approves it.",
    });
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <p className="font-display text-base font-extrabold">Write a review</p>

      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "h-6 w-6",
                (hover || rating) >= n ? "fill-accent text-accent" : "text-muted-foreground/40",
              )}
            />
          </button>
        ))}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Headline — e.g. Perfect fit, soft fabric"
        maxLength={90}
        className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={1200}
        placeholder="How is the fit, fabric and colour in real life?"
        className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City (optional)"
        maxLength={60}
        className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
      />

      {/* photos */}
      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {photos.map((url) => (
            <div key={url} className="relative">
              <img src={url} alt="" className="h-20 w-20 rounded-2xl object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => setPhotos((p) => p.filter((u) => u !== url))}
                className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-foreground text-background"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {photos.length < 6 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="grid h-20 w-20 place-items-center gap-1 rounded-2xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Camera className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Add photo</span>
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => void onFiles(e.target.files)}
        />
        {progress !== null && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={saving || progress !== null}
        onClick={() => void submit()}
        className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Post review
      </button>
    </div>
  );
}
