"use client";

import { Alert, AlertDescription, Button } from "@engli-tutor/ui";
import { SettingsCard, SettingsCardContent } from "./settings-card";

/** Load-failed card with a Retry action. */
export function SettingsErrorState({
  message,
  retryLabel,
  onRetry,
}: {
  message: string;
  retryLabel: string;
  onRetry: () => void;
}) {
  return (
    <SettingsCard>
      <SettingsCardContent className="pt-4">
        <Alert variant="destructive" role="alert">
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{message}</span>
            <Button type="button" variant="outline" className="h-11 w-full sm:w-auto" onClick={onRetry}>
              {retryLabel}
            </Button>
          </AlertDescription>
        </Alert>
      </SettingsCardContent>
    </SettingsCard>
  );
}
