"use client";

import { useEffect } from "react";

/** iOS Safari ignores `user-scalable=no`, so pinch zoom has to be blocked with gesture events. */
export function PreventZoom() {
  useEffect(() => {
    const blockGesture = (event: Event) => event.preventDefault();
    const blockPinch = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault();
    };

    document.addEventListener("gesturestart", blockGesture, { passive: false });
    document.addEventListener("gesturechange", blockGesture, { passive: false });
    document.addEventListener("touchmove", blockPinch, { passive: false });
    return () => {
      document.removeEventListener("gesturestart", blockGesture);
      document.removeEventListener("gesturechange", blockGesture);
      document.removeEventListener("touchmove", blockPinch);
    };
  }, []);

  return null;
}
