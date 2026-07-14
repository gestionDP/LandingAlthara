'use client';

/** Primitivas de animación de la landing 2.0 (estilo del portfolio de referencia). */
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const maskVariants = {
  hidden: { y: '110%' },
  visible: { y: 0 },
};

/**
 * El texto sube desde detrás de una máscara invisible.
 * IMPORTANTE: el observer va en el span EXTERIOR (nunca recortado); el interior
 * anima por propagación de variants. Si se observa el interior, al estar 100%
 * recortado por overflow-hidden el IntersectionObserver no dispara jamás.
 */
export function MaskReveal({
  children,
  delay = 0,
  className,
  onMount = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** true: se revela al montar (hero); false: al entrar en viewport */
  onMount?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <span className={`block ${className ?? ''}`}>{children}</span>;
  }
  return (
    <motion.span
      className={`block overflow-hidden ${className ?? ''}`}
      initial="hidden"
      {...(onMount
        ? { animate: 'visible' }
        : { whileInView: 'visible', viewport: { once: true, amount: 'some' } })}
    >
      <motion.span
        className="block"
        variants={maskVariants}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

/** Fade + subida al entrar en viewport. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
