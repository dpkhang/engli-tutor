"use client";

import type { ReactNode } from "react";
import { Button, cn } from "@landing-page-generator/ui";

export type SocialProvider = "google" | "apple" | "facebook" | "github";

export type SocialProviderItem = {
  id: SocialProvider;
  label: string;
  icon: ReactNode;
};

const PROVIDERS: SocialProviderItem[] = [
  {
    id: "google",
    label: "Google",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
  },
  {
    id: "github",
    label: "GitHub",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
        <path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.23v3.3c0 .32.22.69.83.57A12 12 0 0 0 12 .3z" />
      </svg>
    ),
  },
];

export type SocialAuthButtonsProps = {
  mode: "login" | "register";
  disabled?: boolean;
  className?: string;
};

export type SocialAuthButtonsViewProps = SocialAuthButtonsProps & {
  pending: SocialProvider | null;
  onProviderClick: (provider: SocialProviderItem) => void;
};

export function SocialAuthButtonsView({ className }: SocialAuthButtonsViewProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-2 gap-2">
        {PROVIDERS.map((provider) => (
          <Button
            key={provider.id}
            type="button"
            variant="outline"
            className="h-11 justify-start gap-2.5 bg-background px-3 opacity-60"
            disabled
            title="Coming soon"
          >
            {provider.icon}
            <span className="truncate text-sm font-medium">{provider.label}</span>
          </Button>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">Social sign-in — coming soon</p>
    </div>
  );
}
