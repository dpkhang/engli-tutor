"use client";

import { WelcomeScreenView, type WelcomeScreenViewProps } from "./welcome-screen.view";

export type WelcomeScreenProps = WelcomeScreenViewProps;

export function WelcomeScreen(props: WelcomeScreenProps) {
  return <WelcomeScreenView {...props} />;
}
