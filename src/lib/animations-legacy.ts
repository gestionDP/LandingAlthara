/**
 * Legacy variants/transitions para compatibilidad. La fuente de verdad es @/motion.
 */
import { easeOut, durations, distances } from '@/motion/tokens';

export const animationVariants = {
  revealText: {
    hidden: { opacity: 0, y: distances.desktop.medium },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: durations.text, ease: easeOut },
    },
  },
  revealMedia: {
    hidden: { opacity: 0, y: distances.desktop.medium },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: durations.media, ease: easeOut },
    },
  },
  revealOverlay: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: durations.overlay, ease: easeOut },
    },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: durations.text, ease: easeOut },
    },
  },
  crossfade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: durations.carousel, ease: easeOut },
    },
  },
} as const;

export const hoverTransitions = {
  underline: { duration: durations.hover, ease: easeOut },
  opacity: { duration: durations.hover, ease: easeOut },
  lift: { duration: durations.hover, ease: easeOut },
} as const;
