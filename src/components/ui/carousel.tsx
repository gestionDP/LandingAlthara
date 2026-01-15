"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { animationVariants, durations } from "@/lib/animations";

interface CarouselProps {
  items: ReactNode[];
  className?: string;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function Carousel({
  items,
  className = "",
  showArrows = true,
  autoPlay = false,
  autoPlayInterval = 5000,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative ">
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

      {items.length > 1 && (
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

