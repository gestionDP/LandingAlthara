'use client';

import { useEffect, useRef } from 'react';

type Options = {
  selector?: string;
  durationMs?: number;
  enabled?: boolean;
};

export function useSnapWheel({
  selector = '.snap-slide',
  durationMs = 750,
  enabled = true,
}: Options = {}) {
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const prefersReduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) return;

    const getSlides = () =>
      Array.from(document.querySelectorAll<HTMLElement>(selector));

    const getCurrentIndex = (slides: HTMLElement[]) => {
      const y = window.scrollY;
      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;

      for (let i = 0; i < slides.length; i++) {
        const top = slides[i].getBoundingClientRect().top + window.scrollY;
        const dist = Math.abs(top - y);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      return bestIdx;
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

      const slides = getSlides();
      if (slides.length === 0) return;

      const target = e.target as HTMLElement | null;
      const scrollParent = target?.closest?.('[data-allow-scroll="true"]');
      if (scrollParent) return;

      if (isAnimatingRef.current) {
        e.preventDefault();
        return;
      }

      const dir = e.deltaY > 0 ? 1 : -1;
      const idx = getCurrentIndex(slides);
      const next = Math.min(Math.max(idx + dir, 0), slides.length - 1);

      if (next === idx) return;

      e.preventDefault();
      isAnimatingRef.current = true;

      slides[next].scrollIntoView({ behavior: 'smooth', block: 'start' });

      window.setTimeout(() => {
        isAnimatingRef.current = false;
      }, durationMs);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel as any);
  }, [selector, durationMs, enabled]);
}
