"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  AddressAutocompleteView,
  type AddressSuggestion,
} from "./address-autocomplete.view";
import { useWorkspaceI18n } from "@/features/i18n";

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
  const t = useWorkspaceI18n();
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
        if (!response.ok) throw new Error(payload.message || t("accounts.addressLookupFailed"));
        setSuggestions(payload.suggestions ?? []);
      } catch (cause) {
        if (controller.signal.aborted) return;
        setSuggestions([]);
        setError(cause instanceof Error ? cause.message : t("accounts.addressLookupFailed"));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 320);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, t, value]);

  const onFocus = useCallback(() => setOpen(true), []);
  const onInputChange = useCallback(
    (next: string) => {
      onChange(next);
      onValidityChange(false);
      setOpen(true);
    },
    [onChange, onValidityChange],
  );
  const onBlur = useCallback(() => {
    window.setTimeout(() => setOpen(false), 150);
  }, []);
  const onSelect = useCallback(
    (address: string) => {
      onChange(address);
      onValidityChange(true);
      setOpen(false);
      setSuggestions([]);
    },
    [onChange, onValidityChange],
  );

  return (
    <AddressAutocompleteView
      id={id}
      listId={listId}
      value={value}
      disabled={disabled}
      suggestions={suggestions}
      open={open}
      loading={loading}
      error={error}
      onFocus={onFocus}
      onChange={onInputChange}
      onBlur={onBlur}
      onSelect={onSelect}
    />
  );
}
