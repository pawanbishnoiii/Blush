import { Suspense, lazy, useEffect, useState } from "react";

import { useMotionSettings } from "@/hooks/useMotionSettings";
import { cn } from "@/lib/utils";

const Lottie = lazy(() => import("lottie-react"));

export type LottieName = "dots" | "pulse";

const LOADERS: Record<LottieName, () => Promise<{ default: unknown }>> = {
  dots: () => import("@/lib/lottie/dots.json"),
  pulse: () => import("@/lib/lottie/pulse.json"),
};

/**
 * Motion-safe Lottie. The player and the animation JSON are both loaded
 * on demand, and nothing animates under reduced-motion or on low-power
 * devices — a static fallback renders instead.
 */
export function LottieFx({
  name,
  className,
  loop = true,
  fallback,
}: {
  name: LottieName;
  className?: string;
  loop?: boolean;
  fallback?: React.ReactNode;
}) {
  const { reduced, lowPower } = useMotionSettings();
  const [data, setData] = useState<unknown>(null);
  const disabled = reduced || lowPower;

  useEffect(() => {
    if (disabled) return;
    let alive = true;
    void LOADERS[name]()
      .then((m) => alive && setData(m.default))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [name, disabled]);

  if (disabled || !data) {
    return (
      <div className={cn("grid place-items-center", className)} aria-hidden="true">
        {fallback ?? <span className="h-2 w-2 rounded-full bg-primary" />}
      </div>
    );
  }

  return (
    <div className={cn("pointer-events-none", className)} aria-hidden="true">
      <Suspense fallback={null}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Lottie animationData={data as any} loop={loop} autoplay />
      </Suspense>
    </div>
  );
}