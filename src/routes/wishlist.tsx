import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Icon3D } from "@/components/site/Icon3D";
import { ProductCard } from "@/components/site/ProductCard";
import { productsQuery } from "@/lib/queries";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Variant } from "@/lib/catalog";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your wishlist — Blush" },
      { name: "description", content: "Everything you saved for later, in one cute place." },
      { property: "og:title", content: "Your wishlist — Blush" },
      { property: "og:description", content: "Everything you saved for later." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const wishlist = useWishlist();
  const products = useQuery(productsQuery);
  const saved = (products.data ?? []).filter((p) => wishlist.ids.has(p.id));

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 pb-24 pt-8 sm:px-8 md:pb-16">
      <div className="flex items-center gap-4">
        <Icon3D name="wishlist" size="xl" float />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Wishlist</h1>
          <p className="text-sm text-muted-foreground">{saved.length} saved items</p>
        </div>
      </div>

      {!wishlist.signedIn ? (
        <Empty
          title="Sign in to see your saves"
          body="Your wishlist follows you across devices once you sign in."
          cta="Sign in"
          to="/auth"
        />
      ) : saved.length === 0 ? (
        <Empty
          title="Nothing saved yet"
          body="Tap the heart on anything you love and it lands here."
          cta="Start browsing"
          to="/shop"
        />
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {saved.map((p, i) => (
            <WishlistCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function WishlistCard({ product, index }: { product: Product; index: number }) {
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const addToCart = useCart((s) => s.add);
  const [moving, setMoving] = useState(false);

  async function moveToBag() {
    setMoving(true);
    try {
      const { data: variants, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", product.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      const list = (variants ?? []) as unknown as Variant[];
      if (list.length === 1) {
        const v = list[0]!;
        addToCart({
          variantId: v.id,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          imageKey: product.image_key,
          colorName: v.color_name,
          size: v.size,
          unitPrice: product.price_inr + (v.price_delta ?? 0),
          compareAt: product.compare_at_inr,
          quantity: 1,
          maxStock: v.stock,
        });
        toast.success(`${product.name} added to bag`, {
          description: `${v.color_name} · ${v.size}`,
        });
      } else {
        navigate({ to: "/product/$slug", params: { slug: product.slug }, search: { quickadd: "1" } as any });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't move this to bag");
    } finally {
      setMoving(false);
    }
  }

  function remove() {
    wishlist.toggle(product.id);
    qc.invalidateQueries({ queryKey: ["wishlist"] });
  }

  return (
    <div className="flex flex-col gap-2">
      <ProductCard product={product} index={index} />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={moveToBag}
          disabled={moving}
          className="flex-1 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60"
        >
          {moving ? "Moving…" : "Move to bag"}
        </button>
        <button
          type="button"
          onClick={remove}
          className="rounded-full border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function Empty({ title, body, cta, to }: { title: string; body: string; cta: string; to: string }) {
  return (
    <div className="mt-16 flex flex-col items-center gap-4 text-center">
      <Icon3D name="saved-items" size="2xl" float />
      <p className="font-display text-xl font-bold">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      <Link to={to} className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
        {cta}
      </Link>
    </div>
  );
}
