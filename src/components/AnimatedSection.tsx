"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

const animationVariants: Record<string, Variants> = {
  fadeInUp: {
    hidden: { y: 100, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  fadeInDown: {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  fadeInLeft: {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  fadeInRight: {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  fadeInScale: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: keyof typeof animationVariants;
  delay?: number;
  duration?: number;
  className?: string;
  margin?: string;
  once?: boolean;
  autoAnimate?: boolean;
}

export default function AnimatedSection({
  children,
  animation = "fadeInUp",
  delay = 0,
  duration = 0.8,
  className = "",
  margin = "-50px",
  once = true,
  autoAnimate = false,
}: AnimatedSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: margin as "-50px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={animationVariants[animation]}
      initial="hidden"
      animate={autoAnimate ? "visible" : isInView ? "visible" : "hidden"}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedSequenceProps {
  children: ReactNode[];
  animation?: keyof typeof animationVariants;
  baseDelay?: number;
  delayIncrement?: number;
  duration?: number;
  className?: string;
  margin?: string;
  once?: boolean;
}

export function AnimatedSequence({
  children,
  animation = "fadeInUp",
  baseDelay = 0.2,
  delayIncrement = 0.2,
  duration = 0.8,
  className = "",
  margin = "-50px",
  once = true,
}: AnimatedSequenceProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: margin as "-50px" });

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={animationVariants[animation]}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{
            duration,
            delay: baseDelay + index * delayIncrement,
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

export function useAnimationInView(margin = "-50px", once = true) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: margin as "-50px" });

  return { ref, isInView };
}
