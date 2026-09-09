"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, LoaderCircle, MapPin, Search } from "lucide-react";
import { cn } from "@landing-page-generator/ui";

type AddressSuggestion = {
  id: string;
  address: string;
  mainText: string;
  secondaryText: string;
};

export function AddressAutocomplete({
  id,
  value,
  disabled,
  onChange,
  onValidityChange,
}: {
  id: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onValidityChange: (valid: boolean) => void;
}) {
  const listId = useId();
  const requestRef = useRef<AbortController | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestRef.current?.abort();
    if (!open || value.trim().length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/address-autocomplete?q=${encodeURIComponent(value.trim())}`,
          {
            signal: controller.signal,
          },
        );
        const payload = (await response.json()) as {
          suggestions?: AddressSuggestion[];
          message?: string;
        };
        if (!response.ok) throw new Error(payload.message || "Address lookup failed");
        setSuggestions(payload.suggestions ?? []);
      } catch (cause) {
        if (controller.signal.aborted) return;
        setSuggestions([]);
        setError(cause instanceof Error ? cause.message : "Address lookup failed");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 320);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, value]);

  return (
    <div className="relative">
      <MapPin className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={id}
        value={value}
        disabled={disabled}
        autoComplete="street-address"
        placeholder="Start typing your address…"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={listId}
        aria-invalid={Boolean(value) && open}
        className="h-9 w-full rounded-md border border-input bg-transparent pr-10 pl-9 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/40 disabled:opacity-50 dark:bg-input/30"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          onValidityChange(false);
          setOpen(true);
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
        {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}
      </span>

      {open && (suggestions.length > 0 || error) ? (
        <div
          id={listId}
          role="listbox"
          className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-xl"
        >
          {error ? <p className="px-3 py-2 text-xs text-destructive">{error}</p> : null}
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              role="option"
              aria-selected={value === suggestion.address}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-muted",
                value === suggestion.address && "bg-primary/5",
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(suggestion.address);
                onValidityChange(true);
                setOpen(false);
                setSuggestions([]);
              }}
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{suggestion.mainText}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {suggestion.secondaryText}
                </span>
              </span>
              {value === suggestion.address ? (
                <Check className="mt-0.5 size-4 text-primary" />
              ) : null}
            </button>
          ))}
          <p className="border-t border-border px-3 py-2 text-right text-[10px] text-muted-foreground">
            Powered by Google
          </p>
        </div>
      ) : null}
    </div>
  );
}
