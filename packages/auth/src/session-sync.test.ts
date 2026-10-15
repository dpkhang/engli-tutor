import assert from "node:assert/strict";
import { test } from "node:test";
import { isAllowedSyncOrigin, resolveAllowedUrl } from "./session-sync.ts";

const allowed = ["https://harrybox.cloud", "https://app.harrybox.cloud/"];

test("keeps URLs on the marketing and workspace origins", () => {
  assert.equal(
    resolveAllowedUrl("https://app.harrybox.cloud/en/lessons?x=1", allowed),
    "https://app.harrybox.cloud/en/lessons?x=1",
  );
  assert.equal(resolveAllowedUrl("https://harrybox.cloud/en", allowed), "https://harrybox.cloud/en");
});

test("rejects other subdomains, lookalikes and relative input", () => {
  for (const raw of [
    "https://admin.harrybox.cloud/",
    "https://campaign.harrybox.cloud/",
    "https://harrybox.cloud.evil.com/",
    "http://harrybox.cloud/",
    "//app.harrybox.cloud/",
    "/en/lessons",
    "javascript:alert(1)",
    "",
  ]) {
    assert.equal(isAllowedSyncOrigin(raw, allowed), false, raw);
  }
  assert.equal(resolveAllowedUrl(null, allowed), null);
});
