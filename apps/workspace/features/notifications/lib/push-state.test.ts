import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveDevicePushState } from "./push-state";

test("ios-install takes priority over everything", () => {
  assert.equal(
    resolveDevicePushState({
      iosNeedsHomeScreen: true,
      canPush: false,
      permission: "granted",
    }),
    "ios-install",
  );
});

test("unsupported when push is not available", () => {
  assert.equal(
    resolveDevicePushState({
      iosNeedsHomeScreen: false,
      canPush: false,
      permission: "granted",
    }),
    "unsupported",
  );
});

test("maps each permission value", () => {
  for (const permission of ["granted", "default", "denied"] as const) {
    assert.equal(
      resolveDevicePushState({
        iosNeedsHomeScreen: false,
        canPush: true,
        permission,
      }),
      permission,
    );
  }
});

test("unknown when permission cannot be read", () => {
  assert.equal(
    resolveDevicePushState({
      iosNeedsHomeScreen: false,
      canPush: true,
      permission: null,
    }),
    "unknown",
  );
});
