/**
 * @deprecated Usar src/motion (tokens, variants, components) como única fuente de verdad.
 * Este archivo re-exporta por compatibilidad durante la migración.
 */
export {
  easeOut,
  durations,
  distances,
  stagger,
  getDistance,
  getDuration,
  getStaggerDelay,
} from '@/motion/tokens';

export { animationVariants, hoverTransitions } from './animations-legacy';
