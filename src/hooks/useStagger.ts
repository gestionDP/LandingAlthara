"use client";

import { useEffect, useRef, useState } from "react";
import { getStaggerDelay, getDuration, getDistance, easeOut } from "@/lib/animations";

interface UseStaggerOptions {
  itemCount: number;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  staggerDelay?: "short" | "medium" | "long";
  duration?: number;
  distance?: number;
}

export function useStagger(options: UseStaggerOptions) {
  const {
    itemCount,
    threshold = 0.1,
    rootMargin = "0px",
    once = true,
    staggerDelay = "medium",
    duration,
    distance,
  } = options;

  const [isInView, setIsInView] = useState(false);
  const [revealedItems, setRevealedItems] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  );
  const ref = useRef<HTMLElement | null>(null);

  const finalStaggerDelay = getStaggerDelay(staggerDelay);
  const finalDuration = duration ?? getDuration("media");
  const finalDistance = distance ?? getDistance("small", false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
          
          for (let index = 0; index < itemCount; index++) {
            setTimeout(() => {
              setRevealedItems((prev) => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
            }, index * finalStaggerDelay * 1000);
          }

          if (once) {
            observer.unobserve(element);
          }
        } else if (!once && !entry.isIntersecting) {
          setIsInView(false);
          setRevealedItems(new Array(itemCount).fill(false));
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
  }, [threshold, rootMargin, once, itemCount, finalStaggerDelay, isInView]);

  return {
    ref,
    isInView,
    revealedItems,
    getItemProps: (index: number) => ({
      opacity: revealedItems[index] ? 1 : 0,
      y: revealedItems[index] ? 0 : finalDistance,
      transition: {
        duration: finalDuration,
        delay: index * finalStaggerDelay,
        ease: easeOut,
      },
    }),
  };
}

