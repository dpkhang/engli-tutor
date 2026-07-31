import { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
type AccordionType = "single" | "multiple";
export type AccordionProps = {
    type?: AccordionType;
    collapsible?: boolean;
    defaultValue?: string | string[];
    value?: string | string[];
    onValueChange?: (value: string | string[]) => void;
    className?: string;
    children: ReactNode;
};
export declare function Accordion({ type, collapsible, defaultValue, value, onValueChange, className, children, }: AccordionProps): import("react").JSX.Element;
export type AccordionItemProps = HTMLAttributes<HTMLDivElement> & {
    value: string;
};
export declare function AccordionItem({ value, className, children, ...props }: AccordionItemProps): import("react").JSX.Element;
export type AccordionTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;
export declare function AccordionTrigger({ className, children, onClick, ...props }: AccordionTriggerProps): import("react").JSX.Element;
export type AccordionContentProps = HTMLAttributes<HTMLDivElement>;
export declare function AccordionContent({ className, children, ...props }: AccordionContentProps): import("react").JSX.Element;
export {};
