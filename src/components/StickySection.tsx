"use client";

import { ReactNode, useRef, useEffect, useState } from "react";

interface StickySectionProps {
  stickyContent: ReactNode;
  scrollContent: ReactNode;
  className?: string;
  stickyClassName?: string;
  scrollClassName?: string;
}

export function StickySection({
  stickyContent,
  scrollContent,
  className = "",
  stickyClassName = "",
  scrollClassName = "",
}: StickySectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const sticky = stickyRef.current;
    if (!container || !sticky) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "0px",
      }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
        <div
          ref={stickyRef}
          className={`lg:col-span-2 ${
            isSticky ? "lg:sticky lg:top-20 lg:self-start" : ""
          } ${stickyClassName}`}
        >
          {stickyContent}
        </div>

        <div className={`lg:col-span-10 ${scrollClassName}`}>
          {scrollContent}
        </div>
      </div>
    </div>
  );
}

