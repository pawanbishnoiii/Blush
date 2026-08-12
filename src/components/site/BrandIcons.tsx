type IconProps = { className?: string };

const base = "h-7 w-7 text-accent";

/** Coherent hand-drawn line icon set for Esko service promises. */
export function DeliveryIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden strokeWidth={1.6} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5h13.5v11H3z" />
      <path d="M16.5 12.5h5.7l3.8 4v4h-9.5z" />
      <circle cx="9" cy="22.5" r="2.2" />
      <circle cx="21.5" cy="22.5" r="2.2" />
      <path d="M3 20.5h3.3M11.2 20.5h8" />
    </svg>
  );
}

export function ReturnIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden strokeWidth={1.6} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 16a10 10 0 1 0 3.2-7.3" />
      <path d="M5.5 6.5v5h5" />
      <path d="M13 16.5l2.6 2.6 5-5" />
    </svg>
  );
}

export function SecurePayIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden strokeWidth={1.6} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="9" width="24" height="15" rx="3" />
      <path d="M4 14h24" />
      <path d="M13 20h6" />
      <path d="M22.5 5.5v2.5" />
    </svg>
  );
}

export function FabricIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden strokeWidth={1.6} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8c3 2.5 6 2.5 9 0s6-2.5 9 0 4.5 2.2 6 0" />
      <path d="M4 16c3 2.5 6 2.5 9 0s6-2.5 9 0 4.5 2.2 6 0" />
      <path d="M4 24c3 2.5 6 2.5 9 0s6-2.5 9 0 4.5 2.2 6 0" />
    </svg>
  );
}

export function WarrantyIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden strokeWidth={1.6} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4l10 3.5v7.8c0 6-4.2 10.2-10 12.7-5.8-2.5-10-6.7-10-12.7V7.5z" />
      <path d="M11.8 15.8l3 3 5.4-5.6" />
    </svg>
  );
}

export function SupportIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden strokeWidth={1.6} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18v-3a10 10 0 0 1 20 0v3" />
      <rect x="3.5" y="17" width="5" height="7.5" rx="2.2" />
      <rect x="23.5" y="17" width="5" height="7.5" rx="2.2" />
      <path d="M26 24.5v.8a3.2 3.2 0 0 1-3.2 3.2H18" />
    </svg>
  );
}

export function StitchIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden strokeWidth={1.6} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20c4-9 8-13.5 12-13.5S24 11 28 20" />
      <path d="M4 25h3.5M10 25h3.5M16 25h3.5M22 25h3.5" />
    </svg>
  );
}
