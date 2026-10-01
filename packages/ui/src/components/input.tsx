"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@engli-tutor/ui/lib/utils";

type InputProps = React.ComponentProps<"input"> & {
  clearable?: boolean;
  wrapperClassName?: string;
  clearButtonClassName?: string;
};

function Input({
  className, type, clearable = true, wrapperClassName, clearButtonClassName,
  ref, placeholder, ...props
}: InputProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const mergedRef = React.useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === "function") return ref(node);
    if (ref) ref.current = node;
  }, [ref]);
  const canClear = clearable && !props.disabled && !props.readOnly &&
    ["text", "search", "email", "password", "tel", "url"].includes(type ?? "text");

  const input = (
    <input
      {...props}
      ref={mergedRef}
      type={type}
      placeholder={canClear ? placeholder || " " : placeholder}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/40",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        canClear && "peer pr-10 [&::-webkit-search-cancel-button]:appearance-none",
        className,
      )}
    />
  );
  if (!canClear) return input;
  return (
    <span className={cn("relative block w-full min-w-0", wrapperClassName)}>
      {input}
      <button
        type="button"
        aria-label={`Clear ${props["aria-label"] || props.name || placeholder || "input"}`}
        className={cn("absolute right-2 top-1/2 z-10 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary peer-placeholder-shown:hidden", clearButtonClassName)}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          const node = inputRef.current;
          if (!node) return;
          // Use the native setter so React observes a real value change. This
          // notifies controlled inputs and registration libraries such as RHF.
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(node, "");
          node.dispatchEvent(new Event("input", { bubbles: true }));
          node.focus();
        }}
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </span>
  );
}

export { Input };
