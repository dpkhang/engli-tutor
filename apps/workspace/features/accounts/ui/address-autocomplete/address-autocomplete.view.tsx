"use client";

import { memo } from "react";
import { Check, LoaderCircle, MapPin, Search } from "lucide-react";
import { cn, Input } from "@engli-tutor/ui";

export type AddressSuggestion = {
  id: string;
  address: string;
  mainText: string;
  secondaryText: string;
};

export type AddressAutocompleteViewProps = {
  id: string;
  listId: string;
  value: string;
  disabled?: boolean;
  suggestions: AddressSuggestion[];
  open: boolean;
  loading: boolean;
  error: string | null;
  onFocus: () => void;
  onChange: (value: string) => void;
  onBlur: () => void;
  onSelect: (address: string) => void;
};

export const AddressAutocompleteView = memo(function AddressAutocompleteView({
  id,
  listId,
  value,
  disabled,
  suggestions,
  open,
  loading,
  error,
  onFocus,
  onChange,
  onBlur,
  onSelect,
}: AddressAutocompleteViewProps) {
  return (
    <div className="relative">
      <MapPin className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        clearButtonClassName="right-9"
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
        className="h-9 w-full rounded-md border border-input bg-transparent pr-16 pl-9 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/40 disabled:opacity-50 dark:bg-input/30"
        onFocus={onFocus}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
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
              onClick={() => onSelect(suggestion.address)}
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
});
