import { useEffect, useRef, type ReactNode } from "react";

export type ScrollFxVariant =
  | "fade-up"
  | "slide-left"
  | "slide-right"
  | "zoom"
  | "blur"
  | "flip"
  | "stagger"
  | "stagger-scale"
  | "parallax"
  | "reveal-mask"
  | "pop";

type Props = {
  children: ReactNode;
  variant?: ScrollFxVariant;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Only for `parallax` — how far (in px) the block drifts across the viewport. */
  distance?: number;
};

/**
 * GSAP + ScrollTrigger scroll choreography.
 * Loads gsap lazily on the client so SSR and reduced-motion users stay untouched.
 */
export function ScrollFx({
  children,
  variant = "fade-up",
  className,
  delay = 0,
  stagger = 0.09,
  distance = 60,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    void (async () => {
      const [gsapMod, stMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      const gsap = gsapMod.gsap ?? gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const trigger = { trigger: el, start: "top 88%", once: true };
        const ease = "power3.out";

        switch (variant) {
          case "slide-left":
            gsap.from(el, { x: -70, opacity: 0, duration: 0.9, delay, ease, scrollTrigger: trigger });
            break;
          case "slide-right":
            gsap.from(el, { x: 70, opacity: 0, duration: 0.9, delay, ease, scrollTrigger: trigger });
            break;
          case "zoom":
            gsap.from(el, { scale: 0.9, opacity: 0, duration: 1, delay, ease, scrollTrigger: trigger });
            break;
          case "blur":
            gsap.from(el, {
              filter: "blur(14px)",
              opacity: 0,
              y: 24,
              duration: 1,
              delay,
              ease,
              scrollTrigger: trigger,
            });
            break;
          case "flip":
            gsap.from(el, {
              rotateX: -35,
              transformPerspective: 900,
              transformOrigin: "50% 100%",
              opacity: 0,
              y: 40,
              duration: 1,
              delay,
              ease,
              scrollTrigger: trigger,
            });
            break;
          case "pop":
            gsap.from(el, {
              scale: 0.82,
              opacity: 0,
              duration: 0.8,
              delay,
              ease: "back.out(1.7)",
              scrollTrigger: trigger,
            });
            break;
          case "stagger":
          case "stagger-scale": {
            const kids = el.children.length === 1 ? (el.firstElementChild as HTMLElement).children : el.children;
            gsap.from(Array.from(kids), {
              y: 46,
              opacity: 0,
              ...(variant === "stagger-scale" ? { scale: 0.92 } : {}),
              duration: 0.75,
              delay,
              ease,
              stagger,
              scrollTrigger: trigger,
            });
            break;
          }
          case "parallax":
            gsap.fromTo(
              el,
              { y: distance },
              {
                y: -distance,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
              },
            );
            break;
          case "reveal-mask":
            gsap.from(el, {
              clipPath: "inset(0% 0% 100% 0%)",
              opacity: 0,
              duration: 1.1,
              delay,
              ease: "power4.out",
              scrollTrigger: trigger,
            });
            break;
          case "fade-up":
          default:
            gsap.from(el, { y: 44, opacity: 0, duration: 0.85, delay, ease, scrollTrigger: trigger });
        }
      }, el);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [variant, delay, stagger, distance]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
