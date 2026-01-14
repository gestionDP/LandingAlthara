"use client";

import { useEffect, useRef, useState } from "react";
import { getDuration, getDistance, easeOut } from "@/lib/animations";

interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  type?: "text" | "media" | "overlay";
  distance?: number;
  duration?: number;
  delay?: number;
}

export function useReveal(options: UseRevealOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = "0px",
    once = true,
    type = "text",
    distance,
    duration,
    delay = 0,
  } = options;

  const [isRevealed, setIsRevealed] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  const finalDuration = duration ?? getDuration(type);
  const finalDistance = distance ?? getDistance("medium", false);

  useEffect(() => {
    const element = ref.current;
    if (!element || (once && isRevealed)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsRevealed(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, once, isRevealed]);

  return { 
    ref, 
    isRevealed,
    animationProps: {
      opacity: isRevealed ? 1 : 0,
      y: isRevealed ? 0 : finalDistance,
      transition: {
        duration: finalDuration,
        delay,
        ease: easeOut,
      },
    },
  };
}
