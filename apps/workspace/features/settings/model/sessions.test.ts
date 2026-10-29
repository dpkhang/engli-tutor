import assert from "node:assert/strict";
import { test } from "node:test";
import { describeUserAgent, sortSessions } from "./sessions";

test("describeUserAgent handles empty input", () => {
  assert.deepEqual(describeUserAgent(null), { browser: null, os: null });
  assert.deepEqual(describeUserAgent(""), { browser: null, os: null });
});

test("describeUserAgent detects common browser/OS pairs", () => {
  const cases: [string, string, string][] = [
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 Edg/120.0",
      "Edge",
      "Windows",
    ],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      "Safari",
      "macOS",
    ],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
      "Chrome",
      "macOS",
    ],
    ["Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0", "Firefox", "Linux"],
    [
      "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36 OPR/76.0",
      "Opera",
      "Android",
    ],
    [
      "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 Chrome/118.0 SamsungBrowser/23.0 Mobile Safari/537.36",
      "Samsung Internet",
      "Android",
    ],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
      "Safari",
      "iOS",
    ],
    [
      "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
      "Chrome",
      "ChromeOS",
    ],
  ];
  for (const [ua, browser, os] of cases) {
    assert.deepEqual(describeUserAgent(ua), { browser, os }, ua);
  }
});

test("sortSessions puts current first then newest activity", () => {
  const input = [
    { id: "a", updatedAt: "2026-01-01T00:00:00Z" },
    { id: "b", updatedAt: "2026-03-01T00:00:00Z" },
    { id: "c", updatedAt: "2026-02-01T00:00:00Z" },
  ];
  assert.deepEqual(
    sortSessions(input, "a").map((s) => s.id),
    ["a", "b", "c"],
  );
  assert.deepEqual(
    sortSessions(input, null).map((s) => s.id),
    ["b", "c", "a"],
  );
  assert.deepEqual(input.map((s) => s.id), ["a", "b", "c"]);
});
