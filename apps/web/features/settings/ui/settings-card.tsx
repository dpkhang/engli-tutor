import type { ComponentProps } from "react";
import { Card, CardContent, CardHeader, cn } from "@landing-page-generator/ui";

export function SettingsCard({ className, ...props }: ComponentProps<typeof Card>) {
  return (
    <Card className={cn("h-auto gap-0 rounded-[1.5rem] py-0 shadow-none", className)} {...props} />
  );
}

export function SettingsCardHeader({ className, ...props }: ComponentProps<typeof CardHeader>) {
  return <CardHeader className={cn("px-5 pt-4 pb-1.5", className)} {...props} />;
}

export function SettingsCardContent({ className, ...props }: ComponentProps<typeof CardContent>) {
  return <CardContent className={cn("px-5 pb-4 pt-0", className)} {...props} />;
}
