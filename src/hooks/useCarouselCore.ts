"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export type CarouselCoreOptions = {
  itemCount: number;
  autoplay?: boolean;
  interval?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  /** Pausa al perder foco/visibility (siempre true en core) */
};

const DEFAULT_INTERVAL = 4200;

export function useCarouselCore({
  itemCount,
  autoplay = false,
  interval = DEFAULT_INTERVAL,
  pauseOnHover = true,
  loop = true,
}: CarouselCoreOptions) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResume = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  const clearAutoplay = useCallback(() => {
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }
  }, []);

  const pauseTemporarily = useCallback(
    (ms: number) => {
      setIsPaused(true);
      clearResume();
      resumeTimeoutRef.current = setTimeout(() => setIsPaused(false), ms);
    },
    [clearResume]
  );

  const goNext = useCallback(() => {
    if (itemCount === 0) return;
    setActiveIndex((prev) => (loop ? (prev + 1) % itemCount : Math.min(prev + 1, itemCount - 1)));
  }, [itemCount, loop]);

  const goPrev = useCallback(() => {
    if (itemCount === 0) return;
    setActiveIndex((prev) => (loop ? (prev - 1 + itemCount) % itemCount : Math.max(prev - 1, 0)));
  }, [itemCount, loop]);

  const goTo = useCallback((index: number) => {
    setActiveIndex((prev) => {
      if (index < 0 || index >= itemCount) return prev;
      return index;
    });
  }, [itemCount]);

  // Pausa cuando la pestaña no es visible
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") setIsPaused(true);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Autoplay
  useEffect(() => {
    if (!autoplay || isPaused || document.visibilityState !== "visible" || itemCount <= 1) {
      clearAutoplay();
      return;
    }
    clearAutoplay();
    autoplayTimeoutRef.current = setTimeout(goNext, interval);
    return clearAutoplay;
  }, [autoplay, isPaused, interval, itemCount, goNext, clearAutoplay]);

  useEffect(() => {
    return () => {
      clearResume();
      clearAutoplay();
    };
  }, [clearResume, clearAutoplay]);

  useEffect(() => {
    setActiveIndex((prev) => (itemCount === 0 ? 0 : prev >= itemCount ? 0 : prev));
  }, [itemCount]);

  return {
    activeIndex,
    setActiveIndex: goTo,
    goNext,
    goPrev,
    goTo,
    isPaused,
    setIsPaused,
    pauseTemporarily,
  };
}
