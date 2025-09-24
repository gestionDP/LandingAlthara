"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const updateMousePosition = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    if (!isMobile) {
      window.addEventListener("mousemove", updateMousePosition);
      document.addEventListener("mouseenter", handleMouseEnter);
      document.addEventListener("mouseleave", handleMouseLeave);

      const interactiveElements = document.querySelectorAll(
        "a, button, [role='button']"
      );
      interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", handleMouseEnter);
        el.addEventListener("mouseleave", handleMouseLeave);
      });
    }

    return () => {
      window.removeEventListener("resize", checkMobile);

      if (!isMobile) {
        window.removeEventListener("mousemove", updateMousePosition);
        document.removeEventListener("mouseenter", handleMouseEnter);
        document.removeEventListener("mouseleave", handleMouseLeave);

        const interactiveElements = document.querySelectorAll(
          "a, button, [role='button']"
        );
        interactiveElements.forEach((el) => {
          el.removeEventListener("mouseenter", handleMouseEnter);
          el.removeEventListener("mouseleave", handleMouseLeave);
        });
      }
    };
  }, [updateMousePosition, handleMouseEnter, handleMouseLeave, isMobile]);

  if (isMobile) {
    return null;
  }

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 bg-black rounded-full pointer-events-none z-[99999]"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      />

      <motion.div
        className="fixed top-0 left-0 w-12 h-12 border-2 border-black rounded-full pointer-events-none z-[99998]"
        animate={{
          x: mousePosition.x - 24,
          y: mousePosition.y - 24,
          scale: isHovering ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 20,
        }}
      />
    </>
  );
}
