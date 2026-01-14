'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

function getClosestInteractive(el: Element | null) {
  if (!el) return null;
  return el.closest('[data-cursor="view"], [data-cursor="open"], a, button');
}

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const t = useTranslations('cursor');

  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState('');

  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const onResize = () => setEnabled(window.innerWidth >= 1024);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const tick = () => {
      const el = cursorRef.current;
      if (el) {
        el.style.transform = `translate3d(${mouseRef.current.x}px, ${mouseRef.current.y}px, 0) translate(-50%, -50%)`;
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handleOver = (e: Event) => {
      const raw = e.target;
      const el =
        raw instanceof Element
          ? raw
          : raw instanceof Node
          ? raw.parentElement
          : null;

      const interactive = getClosestInteractive(el);

      if (interactive) {
        setIsHovering(true);

        if (
          interactive.matches('[data-cursor="view"], [data-cursor="view"] *')
        ) {
          setCursorText(t('view'));
        } else if (
          interactive.matches('[data-cursor="open"], [data-cursor="open"] *')
        ) {
          setCursorText(t('open'));
        } else {
          setCursorText('');
        }
      } else {
        setIsHovering(false);
        setCursorText('');
      }
    };

    const handleOut = (e: Event) => {
      const outEvt = e as PointerEvent;
      const next = outEvt.relatedTarget;

      const nextEl =
        next instanceof Element
          ? next
          : next instanceof Node
          ? next.parentElement
          : null;

      const stillInsideInteractive = getClosestInteractive(nextEl);

      if (!stillInsideInteractive) {
        setIsHovering(false);
        setCursorText('');
      }
    };

    document.addEventListener('pointerover', handleOver, true);
    document.addEventListener('pointerout', handleOut, true);

    return () => {
      document.removeEventListener('pointerover', handleOver, true);
      document.removeEventListener('pointerout', handleOut, true);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      className={[
        'fixed pointer-events-none z-[9999]',
        isHovering ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
      style={{
        left: 0,
        top: 0,
        willChange: 'transform, opacity',
      }}
    >
      {cursorText ? (
        <div className="px-3 py-1.5 bg-[#e6e2d7] text-[#0a0a0a] text-xs tracking-wide-editorial font-light rounded-sm">
          {cursorText}
        </div>
      ) : (
        <div className="relative w-15 h-15 opacity-90">
          <Image
            src="/svg/Althara-11.svg"
            alt=""
            fill
            className="object-contain"
            draggable={false}
            priority={false}
          />
        </div>
      )}
    </div>
  );
}
