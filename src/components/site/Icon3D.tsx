import { motion, useReducedMotion } from "motion/react";
import { ICON_3D, icon3dLabel, type Icon3DName } from "@/lib/icons3d";
import { cn } from "@/lib/utils";

const SIZES = {
  xs: "h-7 w-7",
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-20 w-20",
  "2xl": "h-28 w-28",
} as const;

export type Icon3DSize = keyof typeof SIZES;

type Props = {
  name: Icon3DName;
  size?: Icon3DSize;
  className?: string;
  /** Decorative icons get empty alt so screen readers skip them. */
  decorative?: boolean;
  float?: boolean;
  alt?: string;
};

export function Icon3D({
  name,
  size = "md",
  className,
  decorative = true,
  float = false,
  alt,
}: Props) {
  const reduce = useReducedMotion();
  return (
    <img
      src={ICON_3D[name]}
      alt={decorative ? "" : (alt ?? icon3dLabel(name))}
      aria-hidden={decorative || undefined}
      loading="lazy"
      decoding="async"
      width={256}
      height={256}
      draggable={false}
      className={cn(
        "shrink-0 select-none object-contain",
        SIZES[size],
        float && !reduce && "animate-float-soft",
        className,
      )}
    />
  );
}

/** Icon inside a soft rounded tile — the primary category card treatment. */
export function Icon3DTile({
  name,
  label,
  size = "lg",
  tone = "blush",
  className,
}: {
  name: Icon3DName;
  label?: string;
  size?: Icon3DSize;
  tone?: "blush" | "lilac" | "peach" | "cream";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const tones = {
    blush: "bg-primary/10",
    lilac: "bg-secondary/10",
    peach: "bg-accent/15",
    cream: "bg-muted",
  } as const;

  return (
    <motion.div
      {...(reduce ? {} : { whileHover: { y: -4, scale: 1.03 } })}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}

      className={cn("flex min-w-0 flex-col items-center gap-2.5 text-center", className)}
    >
      <div
        className={cn(
          "grid aspect-square w-full place-items-center rounded-[1.5rem] p-3 shadow-soft",
          tones[tone],
        )}
      >
        <Icon3D name={name} size={size} />
      </div>
      {label && (
        <span className="line-clamp-2 text-xs font-semibold leading-tight sm:text-sm">
          {label}
        </span>
      )}
    </motion.div>
  );
}
