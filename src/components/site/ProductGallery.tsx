import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

export type GalleryImage = { url: string; alt: string | null };

export function ProductGallery({
  images,
  activeIndex,
  onIndexChange,
  badge,
}: {
  images: GalleryImage[];
  activeIndex: number;
  onIndexChange: (i: number) => void;
  badge?: string | null;
}) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const suppress = useRef(false);

  // Keep the swipe track in sync when the index changes from outside (variant switch).
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const target = activeIndex * el.clientWidth;
    if (Math.abs(el.scrollLeft - target) < 4) return;
    suppress.current = true;
    el.scrollTo({ left: target, behavior: reduce ? "auto" : "smooth" });
    const t = setTimeout(() => (suppress.current = false), 400);
    return () => clearTimeout(t);
  }, [activeIndex, reduce]);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || suppress.current) return;
    const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
    if (i !== activeIndex && i >= 0 && i < images.length) onIndexChange(i);
  };

  const step = (delta: number) => {
    const next = (activeIndex + delta + images.length) % images.length;
    onIndexChange(next);
  };

  if (images.length === 0) return null;
  const current = images[Math.min(activeIndex, images.length - 1)]!;

  return (
    <div className="lg:sticky lg:top-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-surface shadow-soft">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <div
              key={`${img.url}-${i}`}
              className="w-full shrink-0 snap-center"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setZoom({
                  x: ((e.clientX - r.left) / r.width) * 100,
                  y: ((e.clientY - r.top) / r.height) * 100,
                });
              }}
              onMouseLeave={() => setZoom(null)}
              onClick={() => setLightbox(true)}
            >
              <img
                src={img.url}
                alt={img.alt ?? ""}
                width={900}
                height={1200}
                loading={i === 0 ? "eager" : "lazy"}
                className="aspect-[3/4] w-full cursor-zoom-in object-cover transition-transform duration-300 ease-out"
                style={
                  zoom && i === activeIndex && !reduce
                    ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                    : undefined
                }
              />
            </div>
          ))}
        </div>

        {badge && (
          <span className="eyebrow absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1.5 text-foreground">
            {badge}
          </span>
        )}

        <button
          type="button"
          aria-label="Open full screen"
          onClick={() => setLightbox(true)}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-background/90 shadow-soft"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => step(-1)}
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/90 shadow-soft sm:grid"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => step(1)}
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/90 shadow-soft sm:grid"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-background/80",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <button
              key={`thumb-${img.url}-${i}`}
              type="button"
              aria-label={`View image ${i + 1}`}
              aria-current={i === activeIndex}
              onClick={() => onIndexChange(i)}
              className={cn(
                "h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                i === activeIndex ? "border-primary" : "border-transparent opacity-70",
              )}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Product image viewer"
            className="fixed inset-0 z-[100] grid place-items-center bg-foreground/90 p-4"
            onClick={() => setLightbox(false)}
          >
            <button
              type="button"
              aria-label="Close viewer"
              className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-background"
              onClick={() => setLightbox(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <motion.img
              key={current.url}
              {...(reduce ? {} : { initial: { scale: 0.94 }, animate: { scale: 1 } })}
              src={current.url}
              alt={current.alt ?? ""}

              className="max-h-[88vh] w-auto rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
