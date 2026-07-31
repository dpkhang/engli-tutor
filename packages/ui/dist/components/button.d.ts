import { type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes } from "react";
declare const buttonVariants: (props?: ({
    variant?: "default" | "outline" | "ghost" | "secondary" | null | undefined;
    size?: "default" | "sm" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
}
export declare const Button: import("react").ForwardRefExoticComponent<ButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
export {};
