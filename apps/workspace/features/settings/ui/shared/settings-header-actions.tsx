"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type SettingsHeaderActionsContextValue = {
  slot: HTMLElement | null;
  setSlot: (node: HTMLElement | null) => void;
};

const SettingsHeaderActionsContext =
  createContext<SettingsHeaderActionsContextValue | null>(null);

/** Shares the mobile section header's action slot with the section content. */
export function SettingsHeaderActionsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const value = useMemo(() => ({ slot, setSlot }), [slot]);
  return (
    <SettingsHeaderActionsContext.Provider value={value}>
      {children}
    </SettingsHeaderActionsContext.Provider>
  );
}

/** Callback ref for the element that hosts header actions (mobile section header). */
export function useSettingsHeaderActionsSlotRef() {
  return useContext(SettingsHeaderActionsContext)?.setSlot;
}

/** Current header action slot, or `null` when no mobile section header is mounted. */
export function useSettingsHeaderActionsSlot() {
  return useContext(SettingsHeaderActionsContext)?.slot ?? null;
}

/** Renders `children` into the mobile section header's right side, if present. */
export function SettingsHeaderActions({ children }: { children: ReactNode }) {
  const slot = useSettingsHeaderActionsSlot();
  return slot ? createPortal(children, slot) : null;
}
