"use client";

import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export type SegmentedOption<T extends string> = {
  id: T;
  label: ReactNode;
  badge?: string;
};

export function SegmentedSwitch<T extends string>({
  value,
  onChange,
  options,
  className,
  ariaLabel,
  disabled,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<SegmentedOption<T>>;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  );
  const count = Math.max(1, options.length);

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("relative grid h-11 rounded-full bg-muted/80 p-1", className)}
      style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-1 left-1 rounded-full bg-primary shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{
          width: `calc((100% - 0.5rem) / ${count})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={cn(
              "relative z-10 flex min-w-0 items-center justify-center gap-1.5 rounded-full px-2 font-medium transition-colors",
              count > 2 ? "text-xs sm:text-sm" : "text-sm",
              active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
              disabled && "pointer-events-none opacity-60",
            )}
          >
            <span className="truncate">{option.label}</span>
            {option.badge ? (
              <span
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-px text-[10px] font-semibold tracking-wide",
                  active
                    ? "bg-primary-foreground/18 text-primary-foreground"
                    : "bg-primary/12 text-primary",
                )}
              >
                {option.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function BillingPeriodSwitch({
  value,
  onChange,
  className,
  disabled,
}: {
  value: "monthly" | "yearly";
  onChange: (value: "monthly" | "yearly") => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <SegmentedSwitch
      value={value}
      onChange={onChange}
      ariaLabel="Billing period"
      disabled={disabled}
      className={className}
      options={[
        { id: "monthly", label: "Monthly" },
        { id: "yearly", label: "Yearly", badge: "−2 mo" },
      ]}
    />
  );
}
