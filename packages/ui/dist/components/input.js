import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
import { cn } from "../lib/utils";
export const Input = forwardRef(({ className, ...props }, ref) => (_jsx("input", { className: cn("rounded-md border px-3 py-2 font-normal outline-none focus-visible:ring-2 focus-visible:ring-primary", className), ref: ref, ...props })));
Input.displayName = "Input";
