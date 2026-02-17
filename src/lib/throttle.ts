/**
 * Throttle para scroll/resize: evita setState en cada frame.
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let last = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = ms - (now - last);
    if (remaining <= 0 || remaining > ms) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      last = now;
      fn.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        last = Date.now();
        timeout = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}
