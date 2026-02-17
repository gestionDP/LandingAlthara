"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { animationVariants } from "@/lib/animations";
import { useCarouselCore } from "@/hooks/useCarouselCore";

export type CarouselProps = {
  items: ReactNode[];
  className?: string;
  showArrows?: boolean;
  showDots?: boolean;
  autoplay?: boolean;
  autoPlayInterval?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
};

export function Carousel({
  items,
  className = "",
  showArrows = true,
  showDots = true,
  autoplay = false,
  autoPlayInterval = 5000,
  pauseOnHover = true,
  loop = true,
}: CarouselProps) {
  const {
    activeIndex: currentIndex,
    setActiveIndex: setCurrentIndex,
    goNext: next,
    goPrev: prev,
    isPaused,
    setIsPaused,
  } = useCarouselCore({
    itemCount: items.length,
    autoplay,
    interval: autoPlayInterval,
    pauseOnHover,
    loop,
  });

  return (
    <div
      className={`relative ${className}`}
      onPointerEnter={pauseOnHover ? () => setIsPaused(true) : undefined}
      onPointerLeave={pauseOnHover ? () => setIsPaused(false) : undefined}
    >
      <div
        className="relative"
        aria-live={autoplay ? 'polite' : undefined}
        aria-atomic="true"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            variants={animationVariants.crossfade}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="w-full"
          >
            {items[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {showArrows && items.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-[#e6e2d7]/40 hover:text-[#e6e2d7]/80 transition-opacity duration-200"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-[#e6e2d7]/40 hover:text-[#e6e2d7]/80 transition-opacity duration-200"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {showDots && items.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 transition-all duration-200 ${
                index === currentIndex
                  ? "w-8 bg-[#e6e2d7]/80"
                  : "w-1 bg-[#e6e2d7]/20 hover:bg-[#e6e2d7]/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

