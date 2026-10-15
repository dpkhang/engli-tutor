import { ApiError } from "./api-error";
import { ApiTimeoutError, createRequestSignal } from "./request-signal";

/** Applied to every request unless overridden via `timeoutMs`. */
export const DEFAULT_TIMEOUT_MS = 30_000;

/** `RequestInit` plus a per-request timeout override (`0` disables the timeout). */
export type ApiRequestInit = RequestInit & { timeoutMs?: number };

export type RequestContext = { url: string; init: RequestInit };
export type RequestInterceptor = (
  context: RequestContext,
) => RequestContext | Promise<RequestContext>;
export type ResponseInterceptor = (
  response: Response,
  request: RequestContext,
) => Response | Promise<Response>;
export type ErrorInterceptor = (
  error: unknown,
  request: RequestContext,
) => unknown | Promise<unknown>;

export type ApiClientOptions = {
  baseURL?: string;
  defaultHeaders?: HeadersInit;
  credentials?: RequestCredentials;
  /** Default timeout in ms for every request (`0` disables). Defaults to 30s. */
  timeoutMs?: number;
};

export class ApiClient {
  private readonly requestInterceptors = new Map<number, RequestInterceptor>();
  private readonly responseInterceptors = new Map<number, ResponseInterceptor>();
  private readonly errorInterceptors = new Map<number, ErrorInterceptor>();
  private interceptorId = 0;

  constructor(protected readonly options: ApiClientOptions = {}) {}

  addRequestInterceptor(interceptor: RequestInterceptor) {
    return this.register(this.requestInterceptors, interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    return this.register(this.responseInterceptors, interceptor);
  }

  addErrorInterceptor(interceptor: ErrorInterceptor) {
    return this.register(this.errorInterceptors, interceptor);
  }

  async request<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
    const { timeoutMs = this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS, ...fetchInit } = init;
    const headers = new Headers(this.options.defaultHeaders);
    new Headers(fetchInit.headers).forEach((value, key) => headers.set(key, value));
    if (fetchInit.body && !headers.has("Content-Type") && !(fetchInit.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    let context: RequestContext = {
      url: this.resolveUrl(path),
      init: { credentials: this.options.credentials ?? "include", ...fetchInit, headers },
    };

    for (const interceptor of this.requestInterceptors.values()) {
      context = await interceptor(context);
    }

    // The timer stays armed until the body is read, so a stalled response is cut too.
    const requestSignal = createRequestSignal(timeoutMs, context.init.signal);
    context = { ...context, init: { ...context.init, signal: requestSignal.signal } };

    try {
      let response = await fetch(context.url, context.init);
      for (const interceptor of this.responseInterceptors.values()) {
        response = await interceptor(response, context);
      }
      if (!response.ok) throw await ApiError.fromResponse(response);
      if (response.status === 204) return undefined as T;
      return (await response.json()) as T;
    } catch (caught) {
      let error: unknown = requestSignal.timedOut() ? new ApiTimeoutError(timeoutMs) : caught;
      for (const interceptor of this.errorInterceptors.values()) {
        error = await interceptor(error, context);
      }
      throw error;
    } finally {
      requestSignal.dispose();
    }
  }

  get<T>(path: string, init?: ApiRequestInit) {
    return this.request<T>(path, { ...init, method: "GET" });
  }

  post<T>(path: string, body?: unknown, init?: ApiRequestInit) {
    return this.request<T>(path, { ...init, method: "POST", body: this.serialize(body) });
  }

  put<T>(path: string, body?: unknown, init?: ApiRequestInit) {
    return this.request<T>(path, { ...init, method: "PUT", body: this.serialize(body) });
  }

  patch<T>(path: string, body?: unknown, init?: ApiRequestInit) {
    return this.request<T>(path, { ...init, method: "PATCH", body: this.serialize(body) });
  }

  delete<T = void>(path: string, init?: ApiRequestInit) {
    return this.request<T>(path, { ...init, method: "DELETE" });
  }

  private resolveUrl(path: string) {
    if (/^https?:\/\//.test(path)) return path;
    return `${this.options.baseURL?.replace(/\/$/, "") ?? ""}/${path.replace(/^\//, "")}`;
  }

  private serialize(body: unknown): BodyInit | undefined {
    if (body === undefined) return undefined;
    if (body instanceof FormData || body instanceof URLSearchParams || typeof body === "string")
      return body;
    return JSON.stringify(body);
  }

  private register<T>(collection: Map<number, T>, interceptor: T) {
    const id = ++this.interceptorId;
    collection.set(id, interceptor);
    return () => collection.delete(id);
  }
}
