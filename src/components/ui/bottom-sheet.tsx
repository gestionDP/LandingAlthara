"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image";
import { cn } from "@/lib/utils";

const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
);

const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

function BottomSheet({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="bottom-sheet" {...props} />;
}

function BottomSheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="bottom-sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-[rgba(141,138,138,0.50)] backdrop-blur-[6px]",
        className
      )}
      style={{ pointerEvents: "auto" }}
      {...props}
    />
  );
}

function BottomSheetContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  const isMobile = useIsMobile();
  const [isDragging, setIsDragging] = React.useState(false);
  const [startY, setStartY] = React.useState(0);
  const [currentY, setCurrentY] = React.useState(0);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentTouchY = e.touches[0].clientY;
    setCurrentY(currentTouchY);

    const deltaY = currentTouchY - startY;
    if (deltaY > 0 && contentRef.current) {
      contentRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const deltaY = currentY - startY;
    if (deltaY > 100) {
      const closeEvent = new Event("close");
      contentRef.current?.dispatchEvent(closeEvent);
    } else {
      if (contentRef.current) {
        contentRef.current.style.transform = "translateY(0)";
      }
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  if (isMobile) {
    return (
      <DialogPrimitive.Portal data-slot="bottom-sheet-portal">
        <BottomSheetOverlay />
        <DialogPrimitive.Content
          ref={contentRef}
          data-slot="bottom-sheet-content"
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 grid w-full transform-gpu bg-white",
            "max-h-[90vh] overflow-y-auto",
            "rounded-t-[20px] border-t border-gray-200",
            "transition-transform duration-200 ease-out",
            className
          )}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          {...props}
        >
          <DialogPrimitive.Title className="sr-only">
            Modal
          </DialogPrimitive.Title>

          {/* Handle para deslizar */}
          <div className="flex justify-center py-3">
            <div className="h-1 w-12 rounded-full bg-gray-600" />
          </div>

          <div className="px-4 pb-6">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  }

  return (
    <DialogPrimitive.Portal data-slot="bottom-sheet-portal">
      <BottomSheetOverlay />

      <DialogPrimitive.Content
        data-slot="bottom-sheet-content"
        className={cn(
          "bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 border p-10 shadow-lg duration-200 sm:max-w-xl",

          className
        )}
        {...props}
      >
        <DialogPrimitive.Title className="sr-only">Modal</DialogPrimitive.Title>

        {children}
      </DialogPrimitive.Content>

      {showCloseButton && (
        <DialogPrimitive.Close
          data-slot="bottom-sheet-close-desktop"
          className="fixed right-8 top-8 z-[70] flex size-12 cursor-pointer items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100"
          style={{ pointerEvents: "auto" }}
        >
          <Image
            src="/svg/closeModal.svg"
            alt="Cerrar"
            className="size-12"
            width={48}
            height={48}
          />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Portal>
  );
}

export { BottomSheet, BottomSheetContent, BottomSheetOverlay, VisuallyHidden };
