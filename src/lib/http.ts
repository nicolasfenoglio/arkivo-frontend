import { auth } from "./firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type Primitive = string | number | boolean | null;

type QueryValue = Primitive | Primitive[] | undefined;

export type QueryParams = Record<string, QueryValue>;

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type HttpClientOptions = Omit<RequestInit, "body" | "method"> & {
  query?: QueryParams;
  body?: unknown;
  skipAuth?: boolean;
  includeCredentials?: boolean;
};

export class HttpError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `http://${trimmed}`;
  return withProtocol.replace(/\/+$/, "");
}

function buildUrl(path: string, query?: QueryParams): string {
  const base = normalizeBaseUrl(API_URL);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (!query) return url.toString();

  for (const [key, raw] of Object.entries(query)) {
    if (raw === undefined) continue;

    const values = Array.isArray(raw) ? raw : [raw];
    for (const value of values) {
      if (value === null) {
        url.searchParams.append(key, "");
      } else {
        url.searchParams.append(key, String(value));
      }
    }
  }

  return url.toString();
}

function toHeaders(headers?: HeadersInit): Headers {
  return new Headers(headers ?? {});
}

function applyBody(headers: Headers, body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams
  ) {
    return body;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(body);
}

async function parseResponse(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";

  if (
    contentType.includes("application/json") ||
    contentType.includes("application/problem+json")
  ) {
    return res.json();
  }

  if (contentType.startsWith("text/")) {
    return res.text();
  }

  return null;
}

async function getFirebaseAccessToken(): Promise<string | null> {
  const user = auth.currentUser;

  if (!user) return null;

  return user.getIdToken();
}

async function request<T>(
  method: HttpMethod,
  path: string,
  mapper: (rawData: unknown) => T,
  options: HttpClientOptions,
): Promise<T>;

async function request<T>(
  method: HttpMethod,
  path: string,
  options?: HttpClientOptions,
): Promise<T>;

async function request<T>(
  method: HttpMethod,
  path: string,
  mapperOrOptions?: ((rawData: unknown) => T) | HttpClientOptions,
  maybeOptions?: HttpClientOptions,
): Promise<T> {
  const mapper =
    typeof mapperOrOptions === "function"
      ? mapperOrOptions
      : (data: unknown) => data as T;

  const options =
    typeof mapperOrOptions === "function"
      ? (maybeOptions ?? {})
      : (mapperOrOptions ?? {});

  const {
    query,
    body,
    skipAuth,
    headers: rawHeaders,
    includeCredentials,
    ...rest
  } = options;
  const headers = toHeaders(rawHeaders);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (!skipAuth) {
    const token = await getFirebaseAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    method,
    headers,
    body: applyBody(headers, body),
    credentials: includeCredentials ? "include" : undefined,
  });

  if (!response.ok) {
    const errorData = await parseResponse(response);
    throw new HttpError(`HTTP ${response.status}`, response.status, errorData);
  }

  return mapper(await parseResponse(response));
}

export default {
  get<T>(path: string, options?: Omit<HttpClientOptions, "body">) {
    return request<T>("GET", path, options);
  },
  getAndMap<T>(
    path: string,
    mapper: (rawData: unknown) => T,
    options?: Omit<HttpClientOptions, "body">,
  ) {
    return request<T>("GET", path, mapper, options ?? {});
  },
  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<HttpClientOptions, "body">,
  ) {
    return request<T>("POST", path, { ...(options ?? {}), body });
  },
  put<T>(
    path: string,
    body?: unknown,
    options?: Omit<HttpClientOptions, "body">,
  ) {
    return request<T>("PUT", path, { ...(options ?? {}), body });
  },
  delete<T>(path: string, options?: HttpClientOptions) {
    return request<T>("DELETE", path, options);
  },
};
