"use client";

import { ReactNode } from "react";
import { hoverTransitions } from "@/lib/animations";
import { motion } from "framer-motion";

interface HoverUnderlineProps {
  children: ReactNode;
  className?: string;
  as?: "a" | "button" | "div";
  href?: string;
  onClick?: () => void;
}

export function HoverUnderline({
  children,
  className = "",
  as: Component = "a",
  href,
  onClick,
}: HoverUnderlineProps) {
  const baseClasses = "relative inline-block group";
  const combinedClasses = `${baseClasses} ${className}`;

  const content = (
    <>
      <span className="relative z-10">{children}</span>
      <motion.span
        className="absolute bottom-0 left-0 h-px bg-current"
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={hoverTransitions.underline}
      />
    </>
  );

  if (Component === "a" && href) {
    return (
      <a href={href} className={combinedClasses}>
        {content}
      </a>
    );
  }

  if (Component === "button") {
    return (
      <button onClick={onClick} className={combinedClasses}>
        {content}
      </button>
    );
  }

  return <div className={combinedClasses}>{content}</div>;
}



