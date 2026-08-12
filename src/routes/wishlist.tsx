import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Icon3D } from "@/components/site/Icon3D";
import { ProductCard } from "@/components/site/ProductCard";
import { productsQuery } from "@/lib/queries";
import { useWishlist } from "@/hooks/useWishlist";

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
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
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
