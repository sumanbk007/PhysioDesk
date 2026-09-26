import { useAuthStore } from "@/features/auth/store";
import type { ApiErrorBody } from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type QueryParams = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  body?: unknown;
  params?: QueryParams;
  formData?: FormData;
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    });
  }

  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {};
  if (!options.formData) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: options.formData
      ? options.formData
      : options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
  });

  if (res.status === 204) return undefined as T;

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const body = (data ?? {}) as ApiErrorBody;
    const code = body?.error?.code ?? "http_error";
    const detail = body?.error?.detail ?? res.statusText ?? "Request failed";

    if (res.status === 401 && token) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    throw new ApiError(res.status, code, detail);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, params?: object) =>
    request<T>("GET", path, { params: params as QueryParams }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>("PATCH", path, { body }),
  del: <T>(path: string) => request<T>("DELETE", path),
  upload: <T>(path: string, formData: FormData) =>
    request<T>("POST", path, { formData }),
  view: async (path: string): Promise<void> => {
    const token = useAuthStore.getState().token;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new ApiError(res.status, "view_error", "Could not open file.");
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, "_blank", "noopener,noreferrer");
    // Give the new tab time to load before revoking the URL
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  },
  download: async (path: string, filename: string): Promise<void> => {
    const token = useAuthStore.getState().token;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new ApiError(
        res.status,
        "download_error",
        "Could not download file.",
      );
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  },
};
