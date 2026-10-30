export type DevicePushState =
  | "unknown"
  | "granted"
  | "default"
  | "denied"
  | "unsupported"
  | "ios-install";

export function resolveDevicePushState(input: {
  iosNeedsHomeScreen: boolean;
  canPush: boolean;
  permission: NotificationPermission | null;
}): DevicePushState {
  if (input.iosNeedsHomeScreen) return "ios-install";
  if (!input.canPush) return "unsupported";
  return input.permission ?? "unknown";
}
