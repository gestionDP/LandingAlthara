'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ImageOnlySectionProps {
  images: string[];
  interval?: number;
  overlay?: boolean;
  overlayOpacity?: number;
}

export default function ImageOnlySection({
  images,
  interval = 5000,
  overlay = true,
  overlayOpacity = 0.3,
}: ImageOnlySectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <section className="relative h-[60vh] w-full overflow-hidden">
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
            index === currentIndex ? 'opacity-100 z-0' : 'opacity-0 z-[-1]'
          }`}
        >
          <Image
            src={src}
            alt={`Image ${index + 1}`}
            fill
            priority={index === 0}
            className="object-cover"
            quality={95}
            sizes="100vw"
          />
          {overlay && (
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: overlayOpacity }}
            />
          )}
        </div>
      ))}
    </section>
  );
}
