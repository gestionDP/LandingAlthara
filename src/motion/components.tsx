'use client';

import { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  fadeIn,
  fadeInReduced,
  slideUp,
  slideUpReduced,
  staggerContainer,
  staggerItemSlideUp,
  staggerItemFadeIn,
  hoverLift,
  hoverLiftReduced,
} from './variants';

type MotionDivProps = {
  children: ReactNode;
  className?: string;
  as?: keyof typeof motion;
};

export function FadeIn({ children, className = '' }: MotionDivProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={reduce ? fadeInReduced : fadeIn}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({ children, className = '' }: MotionDivProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={reduce ? slideUpReduced : slideUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Bloque único con stagger interno (un hijo). Para listas usar StaggerContainer + StaggerItem. */
export function Stagger({
  children,
  className = '',
}: MotionDivProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const staggerItemVariants = { staggerItemSlideUp, staggerItemFadeIn };

/** Contenedor para listas/grids con stagger. Los hijos deben ser StaggerItem o motion.div con variants. */
export function StaggerContainer({
  children,
  className = '',
}: MotionDivProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Hijo de StaggerContainer. Usar variants según preferencia (slideUp o fadeIn). */
export function StaggerItem({
  children,
  className = '',
  variant = 'slideUp',
}: MotionDivProps & { variant?: 'slideUp' | 'fadeIn' }) {
  const reduce = useReducedMotion();
  const v = reduce ? staggerItemFadeIn : (variant === 'slideUp' ? staggerItemSlideUp : staggerItemFadeIn);
  return (
    <motion.div variants={v} className={className}>
      {children}
    </motion.div>
  );
}

type HoverLiftProps = MotionDivProps & {
  scale?: boolean;
};

export function HoverLift({ children, className = '', scale = true }: HoverLiftProps) {
  const reduce = useReducedMotion();
  const variants = reduce ? hoverLiftReduced : hoverLift;
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
