/**
 * Motion tokens — única fuente de verdad para duraciones, easing y distancias.
 * Ver docs/motion-guide.md para reglas y criterios.
 */

export const easeOut = [0.22, 1, 0.36, 1] as const;
export const easeIn = [0.55, 0, 0.1, 1] as const;

export const durations = {
  /** Hover/focus: 0.12–0.18s */
  micro: 0.16,
  /** Fade/slide corto: 0.22–0.28s */
  ui: 0.26,
  /** Entrada de bloques: 0.28–0.40s */
  section: 0.32,
  /** Legacy aliases (re-export compat) */
  text: 0.26,
  media: 0.32,
  overlay: 0.26,
  hover: 0.16,
  carousel: 0.32,
} as const;

export const distances = {
  desktop: { small: 12, medium: 16, large: 20 },
  mobile: { small: 8, medium: 12, large: 16 },
} as const;

/** Stagger entre hijos: 0.04–0.08 (evitar stagger largo) */
export const stagger = {
  short: 0.04,
  medium: 0.06,
  long: 0.08,
} as const;

export function getDistance(
  size: keyof typeof distances.desktop = 'medium',
  isMobile = false
) {
  return isMobile ? distances.mobile[size] : distances.desktop[size];
}

export function getDuration(
  type: keyof typeof durations = 'ui'
): number {
  return typeof durations[type] === 'number' ? (durations[type] as number) : durations.ui;
}

export function getStaggerDelay(type: keyof typeof stagger = 'medium'): number {
  return stagger[type];
}
