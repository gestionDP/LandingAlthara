/**
 * Variantes Framer Motion reutilizables.
 * Usar con useReducedMotion() para elegir variante reduced cuando aplique.
 */

import { Variants } from 'framer-motion';
import {
  durations,
  easeOut,
  distances,
  stagger,
} from './tokens';

const ySlide = distances.desktop.medium;
const ySlideMobile = distances.mobile.medium;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.ui, ease: easeOut },
  },
};

export const fadeInReduced: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: ySlide },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.section, ease: easeOut },
  },
};

export const slideUpReduced: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.medium,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemSlideUp: Variants = {
  hidden: { opacity: 0, y: ySlideMobile },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.ui, ease: easeOut },
  },
};

export const staggerItemFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.ui, ease: easeOut },
  },
};

export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -2,
    scale: 1.01,
    transition: { duration: durations.micro, ease: easeOut },
  },
};

export const hoverLiftReduced = {
  rest: {},
  hover: {},
};

export const crossfade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.carousel, ease: easeOut },
  },
};
