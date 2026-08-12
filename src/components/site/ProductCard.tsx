import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { discountPct, imageFor, imagePlaceholder, inr, type Product, type ProductImage } from "@/lib/catalog";
import { Stars } from "@/components/site/Stars";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  images,
  index = 0,
  compact = false,
}: {
  product: Product;
  images?: ProductImage[];
  index?: number;
  compact?: boolean;
}) {
  const discount = discountPct(product.price_inr, product.compare_at_inr);
  const wishlist = useWishlist();
  const saved = wishlist.isSaved(product.id);
  const primary = imageFor(images, product.image_key || imagePlaceholder);
  const secondary = images && images.length > 1 ? images[1]!.url : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="block focus-visible:outline-none"
      >
        <div className="relative overflow-hidden rounded-3xl bg-surface shadow-soft">
          <img
            src={primary}
            alt={`${product.name} — ${product.tagline}`}
            loading="lazy"
            width={900}
            height={1200}
            className={cn(
              "aspect-[4/5] w-full object-cover transition-all duration-700 ease-out",
              secondary ? "group-hover:opacity-0" : "group-hover:scale-[1.045]",
            )}
          />
          {secondary && (
            <img
              src={secondary}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 aspect-[4/5] w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
          {product.badge && (
            <span className="eyebrow absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-foreground">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="num-strong absolute bottom-3 left-3 rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">
              {discount}% off
            </span>
          )}
        </div>
      </Link>

      <button
        type="button"
        aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        aria-pressed={saved}
        onClick={() => wishlist.toggle(product.id)}
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 shadow-soft transition-transform active:scale-90"
      >
        <Heart
          className={cn("h-4 w-4 transition-colors", saved ? "fill-primary text-primary" : "text-muted-foreground")}
        />
      </button>

      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div className={cn("mt-3", compact ? "space-y-1" : "space-y-1.5")}>
          <h3 className="truncate text-[15px] font-semibold tracking-tight sm:text-[16px]">
            {product.name}
          </h3>
          {!compact && (
            <p className="line-clamp-1 text-xs text-muted-foreground sm:text-sm">{product.tagline}</p>
          )}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="num-strong text-[16px]">{inr(product.price_inr)}</span>
            {product.compare_at_inr && (
              <span className="text-xs text-muted-foreground line-through">
                {inr(product.compare_at_inr)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Stars rating={product.rating} />
            <span className="text-[11px] text-muted-foreground">({product.review_count})</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
