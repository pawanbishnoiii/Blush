import { useEffect, useState } from "react";

export type MotionSettings = {
  /** User asked for reduced motion, or the device/network can't afford it. */
  reduced: boolean;
  /** Low-end device: few cores, low memory, or data-saver on. */
  lowPower: boolean;
  ready: boolean;
};

/**
 * Central motion policy. Every animated surface should read this instead of
 * checking `prefers-reduced-motion` on its own, so heavy effects (parallax,
 * autoplaying video, infinite loops) degrade on low-end devices too.
 */
export function useMotionSettings(): MotionSettings {
  const [state, setState] = useState<MotionSettings>({
    reduced: false,
    lowPower: false,
    ready: false,
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean; effectiveType?: string };
    };

    const compute = () => {
      const cores = nav.hardwareConcurrency ?? 8;
      const memory = nav.deviceMemory ?? 8;
      const conn = nav.connection;
      const slowNet = Boolean(conn?.saveData) || /2g/.test(conn?.effectiveType ?? "");
      const lowPower = cores <= 4 || memory <= 4 || slowNet;
      setState({ reduced: mq.matches || slowNet, lowPower, ready: true });
    };

    compute();
    mq.addEventListener("change", compute);
    return () => mq.removeEventListener("change", compute);
  }, []);

  return state;
}
