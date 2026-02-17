import { useEffect, useState } from "react";
import { throttle } from "@/lib/throttle";

const SCROLL_THROTTLE_MS = 120;

export function useScrollEffect(threshold: number = 50) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setIsScrolled(window.scrollY > threshold);
    }, SCROLL_THROTTLE_MS);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isScrolled;
}
