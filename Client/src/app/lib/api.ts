const API_BASE_URL = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL ?? 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function extractErrorDetail(data: JsonValue | null): string | undefined {
  if (!data || typeof data !== 'object' || !('detail' in data)) {
    return undefined;
  }

  const detail = data.detail as JsonValue;
  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    const first = detail[0];
    if (first && typeof first === 'object' && 'msg' in first && typeof first.msg === 'string') {
      return first.msg;
    }
  }

  return undefined;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);

  let data: JsonValue | null = null;
  try {
    data = (await response.json()) as JsonValue;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail = extractErrorDetail(data);
    throw new ApiError(response.status, detail ?? `Request failed: ${response.status}`, detail);
  }

  return data as T;
}

export interface UserPublic {
  id: string;
  full_name: string;
  email: string;
  auth_type: string;
  is_verified: boolean;
  profile_image_url?: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface SendOtpResponse {
  message: string;
  email: string;
}

export async function registerUser(payload: {
  full_name: string;
  email: string;
  password: string;
}): Promise<UserPublic> {
  return request<UserPublic>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: { email: string; password: string }): Promise<TokenResponse> {
  return request<TokenResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(token: string): Promise<UserPublic> {
  return request<UserPublic>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function sendOtp(email: string): Promise<SendOtpResponse> {
  return request<SendOtpResponse>('/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtpAndRegister(payload: {
  full_name: string;
  email: string;
  otp: string;
  password: string;
}): Promise<UserPublic> {
  const body = new FormData();
  body.append('full_name', payload.full_name);
  body.append('email', payload.email);
  body.append('otp', payload.otp);
  body.append('password', payload.password);

  return request<UserPublic>('/auth/verify-otp', {
    method: 'POST',
    body,
  });
}

export async function getUserById(userId: string, token?: string): Promise<UserPublic> {
  return request<UserPublic>(`/users/${userId}`, {
    method: 'GET',
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });
}

export async function patchUser(userId: string, formData: FormData, token: string): Promise<UserPublic> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  return request<UserPublic>(`/auth/users/${userId}`, {
    method: 'PATCH',
    headers,
    body: formData,
  });
}

export async function deleteUser(userId: string, token: string): Promise<void> {
  return request<void>(`/auth/users/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
