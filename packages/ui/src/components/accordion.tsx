"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../lib/utils";

type AccordionType = "single" | "multiple";

type AccordionContextValue = {
  type: AccordionType;
  collapsible: boolean;
  openValues: string[];
  toggle: (value: string) => void;
};

type AccordionItemContextValue = {
  value: string;
  open: boolean;
  triggerId: string;
  contentId: string;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

function useAccordionContext() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion components must be used within <Accordion>");
  return ctx;
}

function useAccordionItemContext() {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) throw new Error("AccordionItem parts must be used within <AccordionItem>");
  return ctx;
}

export type AccordionProps = {
  type?: AccordionType;
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  className?: string;
  children: ReactNode;
};

function toArray(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function Accordion({
  type = "single",
  collapsible = true,
  defaultValue,
  value,
  onValueChange,
  className,
  children,
}: AccordionProps) {
  const [uncontrolled, setUncontrolled] = useState(() => toArray(defaultValue));
  const isControlled = value !== undefined;
  const openValues = isControlled ? toArray(value) : uncontrolled;

  const setOpenValues = useCallback(
    (next: string[]) => {
      if (!isControlled) setUncontrolled(next);
      if (type === "single") onValueChange?.(next[0] ?? "");
      else onValueChange?.(next);
    },
    [isControlled, onValueChange, type],
  );

  const toggle = useCallback(
    (itemValue: string) => {
      const isOpen = openValues.includes(itemValue);

      if (type === "single") {
        if (isOpen) {
          if (!collapsible) return;
          setOpenValues([]);
          return;
        }
        setOpenValues([itemValue]);
        return;
      }

      if (isOpen) setOpenValues(openValues.filter((v) => v !== itemValue));
      else setOpenValues([...openValues, itemValue]);
    },
    [collapsible, openValues, setOpenValues, type],
  );

  const ctx = useMemo(
    () => ({ type, collapsible, openValues, toggle }),
    [type, collapsible, openValues, toggle],
  );

  return (
    <AccordionContext.Provider value={ctx}>
      <div className={cn("divide-y divide-border border-y border-border", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export type AccordionItemProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
  const { openValues } = useAccordionContext();
  const reactId = useId();
  const open = openValues.includes(value);
  const itemCtx = useMemo(
    () => ({
      value,
      open,
      triggerId: `${reactId}-trigger`,
      contentId: `${reactId}-content`,
    }),
    [value, open, reactId],
  );

  return (
    <AccordionItemContext.Provider value={itemCtx}>
      <div
        data-state={open ? "open" : "closed"}
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export type AccordionTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function AccordionTrigger({ className, children, onClick, ...props }: AccordionTriggerProps) {
  const { toggle } = useAccordionContext();
  const { value, open, triggerId, contentId } = useAccordionItemContext();

  return (
    <button
      id={triggerId}
      type="button"
      aria-expanded={open}
      aria-controls={contentId}
      data-state={open ? "open" : "closed"}
      className={cn(
        "relative z-10 flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left text-base font-semibold text-foreground transition-colors",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggle(value);
      }}
      {...props}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <span
        aria-hidden
        className={cn(
          "inline-flex size-6 shrink-0 items-center justify-center text-lg leading-none text-accent transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open && "rotate-45",
        )}
      >
        +
      </span>
    </button>
  );
}

export type AccordionContentProps = HTMLAttributes<HTMLDivElement>;

export function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  const { open, triggerId, contentId } = useAccordionItemContext();

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      aria-hidden={!open}
      data-state={open ? "open" : "closed"}
      inert={!open ? true : undefined}
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        !open && "pointer-events-none",
      )}
      {...props}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            "max-w-3xl pb-5 text-sm leading-relaxed text-muted-foreground transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-base motion-reduce:transition-none",
            open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
