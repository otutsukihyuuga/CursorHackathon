/**
 * Auth API - calls Next.js API routes which proxy to backend.
 * Avoids CORS by keeping requests same-origin.
 */

/** Backend expects username + password (see /docs OpenAPI) */
export interface SignUpPayload {
  username: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthUser {
  id?: number;
  username: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  token?: string;
  user?: AuthUser;
  [key: string]: unknown;
}

export interface AuthError {
  message: string;
  status?: number;
  [key: string]: unknown;
}

function getErrorMessage(json: Record<string, unknown>, status: number): string {
  const msg = json.message ?? json.error;
  if (typeof msg === 'string') return msg;
  // Common 422 shape: { detail: "..." } or { detail: [{ msg: "..." }] }
  const detail = json.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as Record<string, unknown>;
    const m = first.msg ?? first.message ?? JSON.stringify(first);
    return typeof m === 'string' ? m : String(m);
  }
  // Nested errors object, e.g. { errors: { email: ["required"] } }
  const errors = json.errors as Record<string, string[]> | undefined;
  if (errors && typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0];
    const arr = firstKey ? errors[firstKey] : undefined;
    if (Array.isArray(arr) && arr[0]) return `${firstKey}: ${arr[0]}`;
  }
  return `Request failed (${status})`;
}

async function request<T>(
  path: string,
  body: object
): Promise<{ data?: T; error?: string; status: number }> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    return { error: getErrorMessage(json, res.status), status: res.status };
  }
  return { data: json as T, status: res.status };
}

export async function signUp(payload: SignUpPayload): Promise<AuthResponse> {
  const { data, error } = await request<AuthResponse>('/api/auth/signup', payload);
  if (error) throw new Error(error);
  return data ?? {};
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data, error } = await request<AuthResponse>('/api/auth/login', payload);
  if (error) throw new Error(error);
  return data ?? {};
}
