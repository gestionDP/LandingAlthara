"use client";

import { useEffect, useRef } from "react";

type Options = {
  enabled?: boolean;
  containerId: string;

  // Gate (anti-inercia)
  lockMs?: number;        // 700–1100: cuanto bloquea tras un gesto
  triggerDelta?: number;  // 8–20: umbral mínimo para considerar gesto real

  // (opcional) permitir scroll interno sin bloquear
  respectNestedScroll?: boolean;
};

function isScrollable(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  const oy = style.overflowY;
  return (oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight;
}

function findScrollableParent(start: HTMLElement | null, stopAt: HTMLElement) {
  let el: HTMLElement | null = start;
  while (el && el !== stopAt) {
    if (isScrollable(el)) return el;
    el = el.parentElement;
  }
  return null;
}

export function useSnapWheel({
  enabled = true,
  containerId,
  lockMs = 850,
  triggerDelta = 12,
  respectNestedScroll = true,
}: Options) {
  const lockedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const container = document.getElementById(containerId) as HTMLElement | null;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // Si hay scroll interno en un contenedor hijo, no secuestrar (por ejemplo, cards con overflow)
      if (respectNestedScroll) {
        const target = e.target as HTMLElement | null;
        const scrollable = findScrollableParent(target, container);
        if (scrollable) {
          const atTop = scrollable.scrollTop <= 0;
          const atBottom =
            scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1;

          // Si todavía puede scrollear dentro, dejamos el wheel en paz
          if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) return;
        }
      }

      // Mientras está bloqueado, anulamos el resto de wheel para que no salte 2 secciones
      if (lockedRef.current) {
        e.preventDefault();
        return;
      }

      // Micro deltas (trackpad) no deberían activar el gate
      if (Math.abs(e.deltaY) < triggerDelta) return;

      // Dejamos pasar ESTE wheel (scroll nativo visible),
      // y bloqueamos los siguientes durante lockMs
      lockedRef.current = true;

      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        lockedRef.current = false;
      }, lockMs);
    };

    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", onWheel as any);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [enabled, containerId, lockMs, triggerDelta, respectNestedScroll]);
}
