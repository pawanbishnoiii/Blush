import * as React from "react";
import { useCallback, useLayoutEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export interface TabItem {
  icon: React.ReactNode;
  label?: string;
  color?: string;
  badge?: number;
  /** Optional accessible name when no label is rendered. */
  ariaLabel?: string;
}

export interface AnimatedTabBarProps {
  items: TabItem[];
  /** Controlled active index. */
  activeIndex: number;
  onTabChange?: (index: number) => void;
  className?: string;
}

/**
 * Curved-notch animated tab bar. The floating bubble slides under the active
 * item and the icon lifts into it. Fully keyboard operable and motion-safe.
 */
export const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({
  items,
  activeIndex,
  onTabChange,
  className,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const offsetBorder = useCallback(() => {
    const activeItem = itemRefs.current[activeIndex];
    const menu = menuRef.current;
    const border = borderRef.current;
    if (!activeItem || !menu || !border) return;
    const item = activeItem.getBoundingClientRect();
    const bar = menu.getBoundingClientRect();
    const left = Math.round(item.left - bar.left + (item.width - border.offsetWidth) / 2);
    border.style.transform = `translate3d(${left}px, 0, 0)`;
    if (items[activeIndex]?.color) {
      border.style.setProperty("--bgColorItem", items[activeIndex].color as string);
    }
  }, [activeIndex, items]);

  useLayoutEffect(() => {
    offsetBorder();
    const onResize = () => {
      menuRef.current?.style.setProperty("--timeOut", "0s");
      offsetBorder();
      window.setTimeout(() => menuRef.current?.style.removeProperty("--timeOut"), 60);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [offsetBorder]);

  return (
    <>
      <svg className="tabbar-svg" aria-hidden="true" viewBox="0 0 202.9 45.5">
        <clipPath
          id="tabbar-clip-path"
          clipPathUnits="objectBoundingBox"
          transform="scale(0.0049285362247413 0.021978021978022)"
        >
          <path d="M6.7,45.5c5.7,0.1,14.1-0.4,23.3-4c5.7-2.3,9.9-5,18.1-10.5c10.7-7.1,11.8-9.2,20.6-14.3c5-2.9,9.2-5.2,15.2-7 c7.1-2.1,13.3-2.3,17.6-2.1c4.2-0.2,10.5,0.1,17.6,2.1c6.1,1.8,10.2,4.1,15.2,7c8.8,5,9.9,7.1,20.6,14.3c8.3,5.5,12.4,8.2,18.1,10.5 c9.2,3.6,17.6,4.2,23.3,4H6.7z" />
        </clipPath>
      </svg>

      <div ref={menuRef} className={cn("tabbar", className)}>
        {items.map((item, index) => (
          <button
            key={index}
            type="button"
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            aria-current={index === activeIndex ? "page" : undefined}
            aria-label={item.ariaLabel ?? item.label}
            className={cn("tabbar__item", index === activeIndex && "is-active")}
            onClick={() => onTabChange?.(index)}
          >
            <span className="tabbar__icon">
              <span className="relative">
                {item.icon}
                {item.badge ? (
                  <span className="num-strong absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </span>
            </span>
            {item.label && <span className="tabbar__label">{item.label}</span>}
          </button>
        ))}
        <span ref={borderRef} className="tabbar__border" aria-hidden="true" />
      </div>
    </>
  );
};