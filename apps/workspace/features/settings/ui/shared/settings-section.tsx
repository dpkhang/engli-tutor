"use client";

import { useId, type ReactNode } from "react";
import { Label, cn } from "@engli-tutor/ui";

export function SettingsSection({
  title,
  description,
  icon,
  className,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className={cn("space-y-3", className)}>
      <div className="space-y-0.5">
        <h3 id={titleId} className="flex items-center gap-2 text-base font-semibold">
          {icon}
          {title}
        </h3>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export type SettingsRowControlIds = {
  controlId: string;
  labelId: string;
  descriptionId: string | undefined;
};

/** Label + description with a right-side control slot. Stacked below lg, inline on lg+. */
export function SettingsRow({
  label,
  description,
  className,
  children,
}: {
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  children: (ids: SettingsRowControlIds) => ReactNode;
}) {
  const base = useId();
  const controlId = `${base}-control`;
  const labelId = `${base}-label`;
  const descriptionId = description ? `${base}-description` : undefined;
  return (
    <div
      className={cn(
        "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6",
        className,
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <Label id={labelId} htmlFor={controlId}>
          {label}
        </Label>
        {description ? (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="shrink-0">{children({ controlId, labelId, descriptionId })}</div>
    </div>
  );
}
