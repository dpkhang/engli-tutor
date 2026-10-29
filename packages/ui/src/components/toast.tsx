"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { cn } from "../lib/utils";

type ToastTone = "default" | "success" | "error";

type ToastOptions = {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastItem = ToastOptions & {
  id: string;
  tone: ToastTone;
  durationMs: number;
  exiting?: boolean;
};

type ToastContextValue = {
  toast: (options: ToastOptions) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const EXIT_MS = 220;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const remove = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      const timer = timers.current.get(id);
      if (timer) {
        window.clearTimeout(timer);
        timers.current.delete(id);
      }
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, exiting: true } : item)),
      );
      timers.current.set(
        id,
        window.setTimeout(() => remove(id), EXIT_MS),
      );
    },
    [remove],
  );

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const item: ToastItem = {
        id,
        title: options.title,
        description: options.description,
        tone: options.tone ?? "default",
        durationMs: options.durationMs ?? 3600,
      };
      setItems((current) => [...current.slice(-2), item]);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), item.durationMs),
      );
    },
    [dismiss],
  );

  const success = useCallback(
    (title: string, description?: string) => {
      toast({ title, description, tone: "success" });
    },
    [toast],
  );

  const error = useCallback(
    (title: string, description?: string) => {
      toast({ title, description, tone: "error" });
    },
    [toast],
  );

  useEffect(
    () => () => {
      for (const timer of timers.current.values()) window.clearTimeout(timer);
      timers.current.clear();
    },
    [],
  );

  const value = useMemo(() => ({ toast, success, error }), [error, success, toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed top-4 right-4 z-[120] flex w-[min(100%-2rem,24rem)] flex-col items-end gap-2"
      >
        {items.map((item) => {
          const Icon =
            item.tone === "success" ? CircleCheck : item.tone === "error" ? CircleAlert : Info;
          return (
            <div
              key={item.id}
              role={item.tone === "error" ? "alert" : "status"}
              className={cn(
                "ui-toast pointer-events-auto relative w-full overflow-hidden rounded-xl border bg-popover/95 text-popover-foreground shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur-md",
                item.exiting ? "ui-toast-out" : "ui-toast-in",
                item.tone === "success" && "border-primary/25",
                item.tone === "error" && "border-destructive/30",
              )}
            >
              <div className="flex items-start gap-3 p-3.5 pb-3">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg",
                    item.tone === "success" && "bg-primary/10 text-primary",
                    item.tone === "error" && "bg-destructive/10 text-destructive",
                    item.tone === "default" && "bg-muted text-foreground",
                    !item.exiting && "ui-toast-icon",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.description ? (
                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  aria-label="Dismiss"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => dismiss(item.id)}
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <span
                aria-hidden
                className={cn(
                  "ui-toast-progress absolute inset-x-0 bottom-0 h-0.5 origin-left",
                  item.tone === "success" && "bg-primary",
                  item.tone === "error" && "bg-destructive",
                  item.tone === "default" && "bg-foreground/35",
                )}
                style={{ animationDuration: `${item.durationMs}ms` }}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}

export type { ToastOptions, ToastTone };
