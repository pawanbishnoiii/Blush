import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useMotionSettings } from "@/hooks/useMotionSettings";
import type { Banner } from "@/lib/queries";
import { cn } from "@/lib/utils";

const INTERVAL = 6000;

/**
 * Super-smooth hero slider. Slide 1 can be a muted autoplaying video sized
 * exactly like the banner frame. Keyboard accessible (arrows + dots), pausable,
 * and it stops auto-advancing under reduced motion / low-power conditions.
 */
export function HeroSlider({ banners, fallback }: { banners: Banner[]; fallback: string }) {
  const { reduced, lowPower } = useMotionSettings();
  const slides = banners.length ? banners : null;
  const count = slides?.length ?? 1;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused || reduced) return undefined;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => window.clearInterval(id);
  }, [count, paused, reduced]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  }

  return (
    <div
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured offers"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{ borderRadius: `${slides?.[index]?.corner_radius ?? 24}px` }}
      className="relative overflow-hidden shadow-lift outline-none transition-[border-radius] duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div
        className="flex aspect-[4/3] w-full sm:aspect-[16/10]"
        style={{
          transform: `translate3d(-${index * 100}%,0,0)`,
          transition: reduced ? "none" : "transform 800ms cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "transform",
        }}
      >
        {slides
          ? slides.map((b, i) => (
              <Slide key={b.id} banner={b} active={i === index} lowPower={lowPower} reduced={reduced} />
            ))
          : (
            <img
              src={fallback}
              alt="Shop your vibe — fashion, beauty and accessories"
              className="h-full w-full shrink-0 object-cover"
            />
          )}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-background/90 shadow-soft transition-transform hover:scale-105"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-background/90 shadow-soft transition-transform hover:scale-105"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
            {slides?.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`Go to slide ${i + 1}: ${b.title}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={cn(
                  "h-2.5 rounded-full bg-background/80 transition-all",
                  i === index ? "w-7 bg-primary" : "w-2.5",
                )}
              />
            ))}
            <button
              type="button"
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              onClick={() => setPaused((p) => !p)}
              className="ml-2 grid h-8 w-8 place-items-center rounded-full bg-background/90"
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Slide({
  banner,
  active,
  lowPower,
  reduced,
}: {
  banner: Banner;
  active: boolean;
  lowPower: boolean;
  reduced: boolean;
}) {
  const isVideo = banner.media_type === "video" && Boolean(banner.video_url);
  const poster = banner.image_url;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active && !reduced && !lowPower) void v.play().catch(() => undefined);
    else v.pause();
  }, [active, reduced, lowPower]);

  const media =
    isVideo && !reduced && !lowPower ? (
      <video
        ref={videoRef}
        src={banner.video_url ?? undefined}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={banner.title}
        className="h-full w-full object-cover"
      />
    ) : (
      <picture>
        {banner.mobile_image_url && (
          <source media="(max-width: 640px)" srcSet={banner.mobile_image_url} />
        )}
        <img
          src={poster}
          alt={banner.title}
          loading={active ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover"
        />
      </picture>
    );

  const body = (
    <div className="relative h-full w-full">
      {media}
      {(banner.subtitle || banner.cta_label) && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/60 to-transparent p-5 pb-14">
          <p className="font-display text-lg font-extrabold text-background drop-shadow sm:text-2xl">
            {banner.title}
          </p>
          {banner.subtitle && (
            <p className="mt-1 text-xs text-background/90 sm:text-sm">{banner.subtitle}</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full w-full shrink-0" aria-hidden={!active}>
      {banner.link_url ? (
        <Link to={banner.link_url} tabIndex={active ? 0 : -1} className="block h-full w-full">
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}
