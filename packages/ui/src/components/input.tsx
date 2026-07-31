import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    className={cn(
      "rounded-md border px-3 py-2 font-normal outline-none focus-visible:ring-2 focus-visible:ring-primary",
      className,
    )}
    ref={ref}
    {...props}
  />
));

Input.displayName = "Input";
