"use client";

import {
  SocialAuthButtonsView,
  type SocialAuthButtonsProps,
} from "./social-auth-buttons.view";

export type { SocialAuthButtonsProps };

/** Social OAuth is out of scope for this release — show disabled upcoming providers. */
export function SocialAuthButtons({ mode, disabled, className }: SocialAuthButtonsProps) {
  return (
    <SocialAuthButtonsView
      mode={mode}
      disabled={disabled}
      className={className}
      pending={null}
      onProviderClick={() => {
        /* disabled */
      }}
    />
  );
}
