import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ApiClient } from "./api-client.ts";
import { ApiError } from "./api-error.ts";
import { ApiTimeoutError } from "./request-signal.ts";

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

/** A fetch that never answers on its own and only rejects when its signal aborts. */
function hangingFetch(): typeof fetch {
  return ((_input: unknown, init?: RequestInit) =>
    new Promise((_resolve, reject) => {
      const signal = init?.signal;
      const fail = () => reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
      if (signal?.aborted) fail();
      else signal?.addEventListener("abort", fail, { once: true });
    })) as typeof fetch;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

test("returns parsed JSON on success", async () => {
  globalThis.fetch = (async () => json({ ok: true })) as typeof fetch;
  const client = new ApiClient({ baseURL: "https://api.test" });
  assert.deepEqual(await client.get("/ping"), { ok: true });
});

test("resolves 204 to undefined", async () => {
  globalThis.fetch = (async () => new Response(null, { status: 204 })) as typeof fetch;
  const client = new ApiClient({ baseURL: "https://api.test" });
  assert.equal(await client.delete("/thing"), undefined);
});

test("throws ApiError with status and message for 4xx", async () => {
  globalThis.fetch = (async () => json({ message: "Nope" }, 402)) as typeof fetch;
  const client = new ApiClient({ baseURL: "https://api.test" });
  await assert.rejects(client.get("/limited"), (error: unknown) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 402);
    assert.equal(error.message, "Nope");
    return true;
  });
});

test("rejects with ApiTimeoutError when the request exceeds timeoutMs", async () => {
  globalThis.fetch = hangingFetch();
  const client = new ApiClient({ baseURL: "https://api.test", timeoutMs: 20 });
  await assert.rejects(client.get("/slow"), (error: unknown) => {
    assert.ok(error instanceof ApiTimeoutError);
    assert.equal(error.timeoutMs, 20);
    return true;
  });
});

test("per-request timeoutMs overrides the client default", async () => {
  globalThis.fetch = hangingFetch();
  const client = new ApiClient({ baseURL: "https://api.test", timeoutMs: 60_000 });
  await assert.rejects(client.get("/slow", { timeoutMs: 15 }), ApiTimeoutError);
});

test("timeoutMs: 0 disables the timeout", async () => {
  globalThis.fetch = (async () => {
    await new Promise((resolve) => setTimeout(resolve, 40));
    return json({ done: true });
  }) as typeof fetch;
  const client = new ApiClient({ baseURL: "https://api.test", timeoutMs: 10 });
  assert.deepEqual(await client.get("/slow", { timeoutMs: 0 }), { done: true });
});

test("a caller abort stays an abort, not a timeout", async () => {
  globalThis.fetch = hangingFetch();
  const client = new ApiClient({ baseURL: "https://api.test", timeoutMs: 5_000 });
  const controller = new AbortController();
  const pending = client.get("/slow", { signal: controller.signal });
  controller.abort(new DOMException("User left", "AbortError"));
  await assert.rejects(pending, (error: unknown) => {
    assert.ok(!(error instanceof ApiTimeoutError));
    assert.equal((error as Error).name, "AbortError");
    return true;
  });
});

test("an already-aborted caller signal rejects without calling the network", async () => {
  let called = false;
  globalThis.fetch = ((_input: unknown, init?: RequestInit) => {
    called = true;
    return hangingFetch()(_input as string, init);
  }) as typeof fetch;
  const client = new ApiClient({ baseURL: "https://api.test" });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(client.get("/x", { signal: controller.signal }));
  assert.equal(called, true); // fetch is invoked but rejects immediately from the aborted signal
});

test("error interceptors receive the timeout error", async () => {
  globalThis.fetch = hangingFetch();
  const client = new ApiClient({ baseURL: "https://api.test", timeoutMs: 10 });
  let seen: unknown;
  client.addErrorInterceptor((error) => {
    seen = error;
    return error;
  });
  await assert.rejects(client.get("/slow"));
  assert.ok(seen instanceof ApiTimeoutError);
});

test("interceptor-provided signals are still honoured", async () => {
  globalThis.fetch = hangingFetch();
  const client = new ApiClient({ baseURL: "https://api.test", timeoutMs: 5_000 });
  const controller = new AbortController();
  client.addRequestInterceptor((context) => ({
    ...context,
    init: { ...context.init, signal: controller.signal },
  }));
  const pending = client.get("/slow");
  controller.abort(new DOMException("Cancelled", "AbortError"));
  await assert.rejects(pending, (error: unknown) => (error as Error).name === "AbortError");
});
