"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useId, useMemo, useState, } from "react";
import { cn } from "../lib/utils";
const AccordionContext = createContext(null);
const AccordionItemContext = createContext(null);
function useAccordionContext() {
    const ctx = useContext(AccordionContext);
    if (!ctx)
        throw new Error("Accordion components must be used within <Accordion>");
    return ctx;
}
function useAccordionItemContext() {
    const ctx = useContext(AccordionItemContext);
    if (!ctx)
        throw new Error("AccordionItem parts must be used within <AccordionItem>");
    return ctx;
}
function toArray(value) {
    if (value == null)
        return [];
    return Array.isArray(value) ? value : [value];
}
export function Accordion({ type = "single", collapsible = true, defaultValue, value, onValueChange, className, children, }) {
    const [uncontrolled, setUncontrolled] = useState(() => toArray(defaultValue));
    const isControlled = value !== undefined;
    const openValues = isControlled ? toArray(value) : uncontrolled;
    const setOpenValues = useCallback((next) => {
        if (!isControlled)
            setUncontrolled(next);
        if (type === "single")
            onValueChange?.(next[0] ?? "");
        else
            onValueChange?.(next);
    }, [isControlled, onValueChange, type]);
    const toggle = useCallback((itemValue) => {
        const isOpen = openValues.includes(itemValue);
        if (type === "single") {
            if (isOpen) {
                if (!collapsible)
                    return;
                setOpenValues([]);
                return;
            }
            setOpenValues([itemValue]);
            return;
        }
        if (isOpen)
            setOpenValues(openValues.filter((v) => v !== itemValue));
        else
            setOpenValues([...openValues, itemValue]);
    }, [collapsible, openValues, setOpenValues, type]);
    const ctx = useMemo(() => ({ type, collapsible, openValues, toggle }), [type, collapsible, openValues, toggle]);
    return (_jsx(AccordionContext.Provider, { value: ctx, children: _jsx("div", { className: cn("divide-y divide-border border-y border-border", className), children: children }) }));
}
export function AccordionItem({ value, className, children, ...props }) {
    const { openValues } = useAccordionContext();
    const reactId = useId();
    const open = openValues.includes(value);
    const itemCtx = useMemo(() => ({
        value,
        open,
        triggerId: `${reactId}-trigger`,
        contentId: `${reactId}-content`,
    }), [value, open, reactId]);
    return (_jsx(AccordionItemContext.Provider, { value: itemCtx, children: _jsx("div", { "data-state": open ? "open" : "closed", className: cn("relative", className), ...props, children: children }) }));
}
export function AccordionTrigger({ className, children, onClick, ...props }) {
    const { toggle } = useAccordionContext();
    const { value, open, triggerId, contentId } = useAccordionItemContext();
    return (_jsxs("button", { id: triggerId, type: "button", "aria-expanded": open, "aria-controls": contentId, "data-state": open ? "open" : "closed", className: cn("relative z-10 flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left text-base font-semibold text-foreground transition-colors", className), onClick: (event) => {
            onClick?.(event);
            if (!event.defaultPrevented)
                toggle(value);
        }, ...props, children: [_jsx("span", { className: "min-w-0 flex-1", children: children }), _jsx("span", { "aria-hidden": true, className: cn("inline-flex size-6 shrink-0 items-center justify-center text-lg leading-none text-accent transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]", open && "rotate-45"), children: "+" })] }));
}
export function AccordionContent({ className, children, ...props }) {
    const { open, triggerId, contentId } = useAccordionItemContext();
    return (_jsx("div", { id: contentId, role: "region", "aria-labelledby": triggerId, "aria-hidden": !open, "data-state": open ? "open" : "closed", inert: !open ? true : undefined, className: cn("grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]", !open && "pointer-events-none"), ...props, children: _jsx("div", { className: "min-h-0 overflow-hidden", children: _jsx("div", { className: cn("max-w-3xl pb-5 text-sm leading-relaxed text-muted-foreground transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-base motion-reduce:transition-none", open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0", className), children: children }) }) }));
}
