"use client";

import { useEffect } from "react";

const COMPENSATION_VAR = "--scrollbar-compensation";

/**
 * Locks document scroll while `locked` is true.
 * Sets `--scrollbar-compensation` so fixed headers keep alignment when the
 * scrollbar disappears.
 */
export function useLockScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const html = document.documentElement;
    const body = document.body;
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
      compensation: html.style.getPropertyValue(COMPENSATION_VAR),
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.setProperty(COMPENSATION_VAR, `${Math.max(0, scrollbarWidth)}px`);
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.paddingRight = previous.bodyPaddingRight;
      if (previous.compensation) {
        html.style.setProperty(COMPENSATION_VAR, previous.compensation);
      } else {
        html.style.removeProperty(COMPENSATION_VAR);
      }
    };
  }, [locked]);
}
