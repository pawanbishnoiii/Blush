import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { imageFor, inr, type Product } from "@/lib/catalog";
import { Stars } from "@/components/site/Stars";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const discount = product.compare_at_inr
    ? Math.round(((product.compare_at_inr - product.price_inr) / product.compare_at_inr) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="block focus-visible:outline-none"
      >
        <div className="relative overflow-hidden rounded-3xl bg-surface shadow-soft">
          <img
            src={imageFor(product.image_key)}
            alt={`${product.name} — ${product.tagline}`}
            loading="lazy"
            width={1200}
            height={1504}
            className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
          />
          {product.badge && (
            <span className="eyebrow absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1.5 text-foreground">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="num-strong absolute right-4 top-4 rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">
              -{discount}%
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[17px] font-semibold tracking-tight">{product.name}</h3>
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{product.tagline}</p>
            <div className="mt-2 flex items-center gap-2">
              <Stars rating={product.rating} />
              <span className="text-xs text-muted-foreground">({product.review_count})</span>
            </div>
          </div>
          <div className="text-right">
            <p className="num-strong text-[17px]">{inr(product.price_inr)}</p>
            {product.compare_at_inr && (
              <p className="text-xs text-muted-foreground line-through">
                {inr(product.compare_at_inr)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
