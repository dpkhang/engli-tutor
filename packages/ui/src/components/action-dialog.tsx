"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertTriangle, CircleCheck, Info, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "./button";
import { cn } from "../lib/utils";

type DialogTone = "default" | "danger" | "success";

type DialogOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: DialogTone;
};

type DialogState = DialogOptions & { kind: "confirm" | "inform" };

type ActionDialogContextValue = {
  confirm: (options: DialogOptions) => Promise<boolean>;
  inform: (options: DialogOptions) => Promise<void>;
};

const ActionDialogContext = createContext<ActionDialogContextValue | null>(null);

export function ActionDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const open = useCallback((state: DialogState) => {
    resolver.current?.(false);
    setDialog(state);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setDialog(null);
  }, []);

  const confirm = useCallback(
    (options: DialogOptions) => open({ ...options, kind: "confirm" }),
    [open],
  );
  const inform = useCallback(
    async (options: DialogOptions) => {
      await open({ ...options, kind: "inform" });
    },
    [open],
  );

  const tone = dialog?.tone ?? "default";
  const Icon = tone === "danger" ? AlertTriangle : tone === "success" ? CircleCheck : Info;

  return (
    <ActionDialogContext.Provider value={{ confirm, inform }}>
      {children}
      <DialogPrimitive.Root open={Boolean(dialog)} onOpenChange={(open) => !open && close(false)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-[101] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-popover p-6 text-popover-foreground shadow-2xl outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
            <DialogPrimitive.Close className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Đóng">
              <X className="size-4" />
            </DialogPrimitive.Close>
            {dialog ? (
              <>
                <div className="flex gap-4 pr-6">
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl",
                      tone === "danger"
                        ? "bg-destructive/10 text-destructive"
                        : tone === "success"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-foreground",
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="space-y-2">
                    <DialogPrimitive.Title className="text-base font-semibold">
                      {dialog.title}
                    </DialogPrimitive.Title>
                    {dialog.description ? (
                      <DialogPrimitive.Description className="text-sm leading-6 text-muted-foreground">
                        {dialog.description}
                      </DialogPrimitive.Description>
                    ) : null}
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  {dialog.kind === "confirm" ? (
                    <Button variant="outline" onClick={() => close(false)}>
                      {dialog.cancelLabel ?? "Hủy"}
                    </Button>
                  ) : null}
                  <Button
                    variant={tone === "danger" ? "destructive" : "default"}
                    onClick={() => close(true)}
                  >
                    {dialog.confirmLabel ?? (dialog.kind === "confirm" ? "Xác nhận" : "Đã hiểu")}
                  </Button>
                </div>
              </>
            ) : null}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </ActionDialogContext.Provider>
  );
}

export function useActionDialog() {
  const context = useContext(ActionDialogContext);
  if (!context) throw new Error("useActionDialog must be used inside ActionDialogProvider");
  return context;
}

export type { DialogOptions, DialogTone };
