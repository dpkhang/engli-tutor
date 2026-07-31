import { jsx as _jsx } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "../lib/utils";
const buttonVariants = cva("inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            outline: "border border-border bg-transparent hover:bg-muted",
            ghost: "bg-transparent hover:bg-muted",
            secondary: "bg-foreground text-background hover:bg-foreground/90",
        },
        size: {
            default: "h-10 px-4",
            sm: "h-9 px-3",
            lg: "h-12 px-6 text-base",
        },
    },
    defaultVariants: { variant: "default", size: "default" },
});
export const Button = forwardRef(({ className, variant, size, ...props }, ref) => (_jsx("button", { className: cn(buttonVariants({ variant, size }), className), ref: ref, ...props })));
Button.displayName = "Button";
