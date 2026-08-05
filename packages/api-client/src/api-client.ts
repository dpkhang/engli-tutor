import { ApiError } from "./api-error";

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

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(this.options.defaultHeaders);
    new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    if (init.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    let context: RequestContext = {
      url: this.resolveUrl(path),
      init: { credentials: this.options.credentials ?? "include", ...init, headers },
    };

    for (const interceptor of this.requestInterceptors.values()) {
      context = await interceptor(context);
    }

    try {
      let response = await fetch(context.url, context.init);
      for (const interceptor of this.responseInterceptors.values()) {
        response = await interceptor(response, context);
      }
      if (!response.ok) throw await ApiError.fromResponse(response);
      if (response.status === 204) return undefined as T;
      return response.json() as Promise<T>;
    } catch (caught) {
      let error: unknown = caught;
      for (const interceptor of this.errorInterceptors.values()) {
        error = await interceptor(error, context);
      }
      throw error;
    }
  }

  get<T>(path: string, init?: RequestInit) {
    return this.request<T>(path, { ...init, method: "GET" });
  }

  post<T>(path: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(path, { ...init, method: "POST", body: this.serialize(body) });
  }

  put<T>(path: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(path, { ...init, method: "PUT", body: this.serialize(body) });
  }

  patch<T>(path: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(path, { ...init, method: "PATCH", body: this.serialize(body) });
  }

  delete<T = void>(path: string, init?: RequestInit) {
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
