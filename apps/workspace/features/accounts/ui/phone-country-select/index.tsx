"use client";

import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn, Input } from "@engli-tutor/ui";
import { getCountryCallingCode, type Country } from "react-phone-number-input";
import { useWorkspaceI18n } from "@/features/i18n";

type CountryOption = {
  value?: string;
  label: string;
  divider?: boolean;
};

type FlagIconProps = {
  country?: string;
  label: string;
  aspectRatio?: number;
};

export type PhoneCountrySelectProps = {
  value?: string;
  onChange: (value?: string) => void;
  options: CountryOption[];
  disabled?: boolean;
  readOnly?: boolean;
  iconComponent: ComponentType<FlagIconProps>;
  className?: string;
  name?: string;
  "aria-label"?: string;
  onFocus?: () => void;
  onBlur?: () => void;
};

const INTERNATIONAL = "ZZ";

function callingCode(country?: string) {
  if (!country) return null;
  try {
    return `+${getCountryCallingCode(country as Country)}`;
  } catch {
    return null;
  }
}

type CountryEntry = {
  value: string;
  country?: string;
  label: string;
  code: string | null;
  searchText: string;
};

const CountryOptionRow = memo(function CountryOptionRow({
  entry,
  selected,
  FlagIcon,
  onSelect,
}: {
  entry: CountryEntry;
  selected: boolean;
  FlagIcon: ComponentType<FlagIconProps>;
  onSelect: (value: string) => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm outline-none",
        "hover:bg-primary/8 hover:text-foreground focus-visible:bg-primary/8",
        selected && "bg-primary/12 text-foreground",
      )}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onSelect(entry.value)}
    >
      <span className="PhoneInputCountryIcon inline-flex w-6 shrink-0 items-center overflow-hidden">
        <FlagIcon aria-hidden country={entry.country} label={entry.label} />
      </span>
      <span className="min-w-0 flex-1 truncate">{entry.label}</span>
      {entry.code ? (
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{entry.code}</span>
      ) : null}
      {selected ? <Check className="size-3.5 shrink-0 text-primary" /> : null}
    </button>
  );
});

export const PhoneCountrySelect = memo(function PhoneCountrySelect({
  value,
  onChange,
  options,
  disabled,
  readOnly,
  iconComponent: FlagIcon,
  className,
  name,
  onFocus,
  onBlur,
  ...rest
}: PhoneCountrySelectProps) {
  const t = useWorkspaceI18n();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuStyle, setMenuStyle] = useState<CSSProperties>();
  const deferredQuery = useDeferredValue(query);

  const selected = value || INTERNATIONAL;
  const locked = disabled || readOnly;

  const entries = useMemo<CountryEntry[]>(
    () =>
      options
        .filter((option) => !option.divider)
        .map((option) => {
          const optionValue = option.value || INTERNATIONAL;
          const code = callingCode(option.value);
          return {
            value: optionValue,
            country: option.value,
            label: option.label,
            code,
            searchText: `${option.label} ${optionValue} ${code ?? ""}`.toLowerCase(),
          };
        }),
    [options],
  );

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.value === selected) ?? entries[0],
    [entries, selected],
  );

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase().replace(/^\+/, "");
    if (!needle) return entries;
    return entries.filter((entry) => entry.searchText.includes(needle));
  }, [deferredQuery, entries]);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = 288;
    const left = Math.min(rect.left, window.innerWidth - width - 8);
    setMenuStyle({
      position: "fixed",
      top: rect.bottom + 6,
      left: Math.max(8, left),
      width,
      zIndex: 80,
    });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    onBlur?.();
  }, [onBlur]);

  const openMenu = useCallback(() => {
    if (locked) return;
    updateMenuPosition();
    setOpen(true);
    onFocus?.();
  }, [locked, onFocus, updateMenuPosition]);

  const selectValue = useCallback(
    (next: string) => {
      onChange(next === INTERNATIONAL ? undefined : next);
      close();
    },
    [close, onChange],
  );

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if ((target as Element).closest?.(`[data-phone-country-menu="${listId}"]`)) return;
      close();
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [close, listId, open]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (locked) return;
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu();
    }
  };

  const menu =
    open && menuStyle
      ? createPortal(
          <div
            data-phone-country-menu={listId}
            id={listId}
            role="listbox"
            aria-label={t("accounts.selectCountry")}
            style={menuStyle}
            className="overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
          >
            <div className="relative border-b border-border px-2 py-2">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={query}
                placeholder={t("accounts.searchCountryPlaceholder")}
                aria-label={t("accounts.searchCountries")}
                className="h-8 w-full rounded-md border border-input bg-transparent pr-10 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/40"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && filtered[0]) {
                    event.preventDefault();
                    selectValue(filtered[0].value);
                  }
                }}
              />
            </div>
            <div className="max-h-64 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                  {t("accounts.noCountries")}
                </p>
              ) : (
                filtered.map((entry) => (
                  <CountryOptionRow
                    key={entry.value}
                    entry={entry}
                    selected={entry.value === selected}
                    FlagIcon={FlagIcon}
                    onSelect={selectValue}
                  />
                ))
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={cn("PhoneInputCountry relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        name={name}
        disabled={locked}
        aria-label={rest["aria-label"] ?? t("accounts.countryCallingCode")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className="account-phone-country-trigger inline-flex h-8 min-w-0 items-center gap-1.5 rounded-md px-1 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40 disabled:opacity-50"
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="PhoneInputCountryIcon inline-flex items-center overflow-hidden">
          <FlagIcon
            aria-hidden
            country={value}
            label={selectedEntry?.label ?? t("accounts.international")}
          />
        </span>
        <ChevronDown
          className={cn("size-3.5 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {menu}
    </div>
  );
});
