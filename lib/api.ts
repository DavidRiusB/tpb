const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type ApiOptions = RequestInit & { json?: unknown };

export async function api<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { json, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: "include", // sends the httpOnly cookie cross-origin
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
  });

  if (!res.ok) {
    // try to surface the backend's error message
    let message = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      message = data.message ?? message;
    } catch {
      // body wasn't JSON, keep the generic message
    }
    throw new ApiError(message, res.status);
  }

  // some endpoints (logout, 204s) return no body
  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
