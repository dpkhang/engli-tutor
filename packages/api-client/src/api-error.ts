export class ApiError<TBody = unknown> extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: TBody | null,
    readonly response: Response,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const body = await response
      .clone()
      .json()
      .catch(() => null);
    const message =
      typeof body === "object" && body && "message" in body && typeof body.message === "string"
        ? body.message
        : `Request failed (${response.status})`;
    return new ApiError(message, response.status, body, response);
  }
}
