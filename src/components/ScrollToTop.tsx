'use client';

import { useState, useEffect } from 'react';
import { throttle } from '@/lib/throttle';

const SCROLL_THROTTLE_MS = 120;
const VISIBILITY_THRESHOLD = 300;

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = throttle(() => {
      setIsVisible(window.scrollY > VISIBILITY_THRESHOLD);
    }, SCROLL_THROTTLE_MS);

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 md:hidden bg-althara-dark-blue text-[#e6e2d7] p-4 rounded-full shadow-xl border border-[#e6e2d7]/20 transition-all duration-300 hover:bg-althara-primary hover:scale-110 active:scale-95 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
      >
        <path
          d="M12 19V5M12 5L7 10M12 5L17 10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
