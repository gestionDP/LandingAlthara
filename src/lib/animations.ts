export const easeOut = [0.16, 1, 0.3, 1] as const;

export const durations = {
  text: 0.55,
  media: 0.75,
  overlay: 0.35,
  hover: 0.2,
  carousel: 0.35,
} as const;

export const distances = {
  desktop: {
    small: 8,
    medium: 12,
    large: 16,
  },
  mobile: {
    small: 6,
    medium: 10,
    large: 12,
  },
} as const;

export const stagger = {
  short: 0.06,
  medium: 0.08,
  long: 0.12,
} as const;

export const animationVariants = {
  revealText: {
    hidden: { 
      opacity: 0, 
      y: distances.desktop.medium,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: durations.text,
        ease: easeOut,
      },
    },
  },
  revealMedia: {
    hidden: { 
      opacity: 0, 
      y: distances.desktop.medium,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: durations.media,
        ease: easeOut,
      },
    },
  },
  revealOverlay: {
    hidden: { 
      opacity: 0,
    },
    visible: { 
      opacity: 1,
      transition: {
        duration: durations.overlay,
        ease: easeOut,
      },
    },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: durations.text,
        ease: easeOut,
      },
    },
  },
  crossfade: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: durations.carousel,
        ease: easeOut,
      },
    },
  },
} as const;

export const hoverTransitions = {
  underline: {
    duration: durations.hover,
    ease: easeOut,
  },
  opacity: {
    duration: durations.hover,
    ease: easeOut,
  },
  lift: {
    duration: durations.hover,
    ease: easeOut,
  },
} as const;

export function getDistance(size: 'small' | 'medium' | 'large' = 'medium', isMobile = false) {
  return isMobile ? distances.mobile[size] : distances.desktop[size];
}

export function getDuration(type: 'text' | 'media' | 'overlay' | 'hover' | 'carousel' = 'text') {
  return durations[type];
}

export function getStaggerDelay(type: 'short' | 'medium' | 'long' = 'medium') {
  return stagger[type];
}

