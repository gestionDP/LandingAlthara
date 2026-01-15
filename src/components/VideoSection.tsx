'use client';

import { useRef, useEffect } from 'react';

interface VideoSectionProps {
  videoSrc: string;
  poster?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  overlay?: boolean;
  overlayOpacity?: number;
  className?: string;
}

export default function VideoSection({
  videoSrc,
  poster,
  autoplay = true,
  loop = true,
  muted = true,
  overlay = true,
  overlayOpacity = 0.4,
  className = 'h-screen',
}: VideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && autoplay) {
      videoRef.current.play().catch(() => {});
    }
  }, [autoplay]);

  return (
    <section className={`relative w-full  ${className}`}>
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        poster={poster}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
        Tu navegador no soporta videos HTML5.
      </video>
      {overlay && (
        <div
          className="absolute inset-0 bg-black z-10"
          style={{ opacity: overlayOpacity }}
        />
      )}
    </section>
  );
}



