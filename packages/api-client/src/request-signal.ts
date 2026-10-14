/** Thrown when a request exceeds its timeout (distinct from a caller-initiated abort). */
export class ApiTimeoutError extends Error {
  constructor(readonly timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = "ApiTimeoutError";
  }
}

export type RequestSignal = {
  /** Pass to `fetch`; aborts on timeout or when the caller's signal aborts. */
  signal: AbortSignal;
  /** True once the timeout (not the caller) triggered the abort. */
  timedOut: () => boolean;
  /** Always call when the request settles, to release the timer and listener. */
  dispose: () => void;
};

/**
 * Combine an optional caller signal with a timeout. `timeoutMs <= 0` disables the timeout.
 * Hand-rolled instead of `AbortSignal.any` so older Safari versions keep working.
 */
export function createRequestSignal(timeoutMs: number, callerSignal?: AbortSignal | null): RequestSignal {
  const controller = new AbortController();
  let didTimeOut = false;

  const onCallerAbort = () => controller.abort(callerSignal?.reason);
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort(callerSignal.reason);
    else callerSignal.addEventListener("abort", onCallerAbort, { once: true });
  }

  const timer =
    timeoutMs > 0
      ? setTimeout(() => {
          didTimeOut = true;
          controller.abort(new ApiTimeoutError(timeoutMs));
        }, timeoutMs)
      : undefined;

  return {
    signal: controller.signal,
    timedOut: () => didTimeOut,
    dispose: () => {
      if (timer !== undefined) clearTimeout(timer);
      callerSignal?.removeEventListener("abort", onCallerAbort);
    },
  };
}
