'use client';

import { ReactNode, useRef } from 'react';
import { useScroll } from 'framer-motion';

type StickySceneProps = {
  id?: string;
  heightVh?: number;              // 140, 160, 220...
  overlap?: boolean;             // hace que esta escena empiece 100vh antes
  zIndex?: number;               // controla qué escena queda encima
  children: (p: { progress: any }) => ReactNode;
};

export function StickyScene({
  id,
  heightVh,
  overlap = false,
  zIndex = 0,
  children,
}: StickySceneProps) {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  return (
    <section
      id={id}
      ref={ref}
      className="relative"
      style={{
        minHeight: `${heightVh}vh`,
        marginTop: overlap ? '-100vh' : undefined, // clave del overlap
        zIndex,
      }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {children({ progress: scrollYProgress })}
      </div>
    </section>
  );
}
