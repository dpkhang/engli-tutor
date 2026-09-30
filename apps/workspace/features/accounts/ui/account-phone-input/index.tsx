"use client";

import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import PhoneInput, {
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumber,
  type Country,
  type Value,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { cn } from "@engli-tutor/ui";
import { X } from "lucide-react";
import { PhoneCountrySelect } from "../phone-country-select";

const PRIORITY_COUNTRIES: Array<Country | "|" | "..."> = [
  "VN",
  "US",
  "GB",
  "AU",
  "SG",
  "TH",
  "JP",
  "KR",
  "MY",
  "PH",
  "|",
  "...",
];

export function getPhoneValidity(value: string) {
  return !value || isValidPhoneNumber(value);
}

function nationalDigits(value?: string) {
  if (!value) return "";
  return parsePhoneNumber(value)?.nationalNumber ?? "";
}

function withCountry(national: string, country: Country): Value {
  return `+${getCountryCallingCode(country)}${national}` as Value;
}

export type AccountPhoneInputProps = {
  id: string;
  value: string;
  disabled?: boolean;
  className?: string;
  onChange: (value: string) => void;
};

export const AccountPhoneInput = memo(function AccountPhoneInput({
  id,
  value,
  disabled,
  className,
  onChange,
}: AccountPhoneInputProps) {
  const valid = useMemo(() => getPhoneValidity(value), [value]);
  const showError = Boolean(value) && !valid;
  const nationalRef = useRef(nationalDigits(value));

  useEffect(() => {
    const digits = nationalDigits(value);
    if (digits) nationalRef.current = digits;
    else if (!value) nationalRef.current = "";
  }, [value]);

  const handleChange = useCallback(
    (next?: Value) => {
      if (!next) {
        nationalRef.current = "";
        onChange("");
        return;
      }
      const digits = nationalDigits(next);
      // Keep prior national digits when the library resets to "+{code}" on country change.
      if (digits) nationalRef.current = digits;
      onChange(next);
    },
    [onChange],
  );

  const handleCountryChange = useCallback(
    (country?: Country) => {
      const digits = nationalRef.current;
      if (!country || !digits) return;
      const next = withCountry(digits, country);
      if (next !== value) onChange(next);
    },
    [onChange, value],
  );

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="relative [&_.PhoneInputInput]:pr-10">
      <PhoneInput
        id={id}
        className={cn("account-phone-input", showError && "is-invalid")}
        aria-invalid={showError || undefined}
        value={value || undefined}
        defaultCountry="VN"
        flags={flags}
        international
        countryCallingCodeEditable={false}
        countryOptionsOrder={PRIORITY_COUNTRIES}
        countrySelectComponent={PhoneCountrySelect}
        disabled={disabled}
        autoComplete="tel"
        placeholder="Phone number"
        onChange={handleChange}
        onCountryChange={handleCountryChange}
      />
      {value && !disabled ? (
        <button type="button" aria-label="Clear phone number"
          className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => { handleChange(undefined); document.getElementById(id)?.focus(); }}>
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
      </div>
      {showError ? (
        <p className="text-xs text-destructive">Enter a valid phone number</p>
      ) : null}
    </div>
  );
});
