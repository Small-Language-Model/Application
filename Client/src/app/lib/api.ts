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
  tokens_remaining: number;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
  subscription_tokens_per_day: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface SendOtpResponse {
  message: string;
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
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

export async function requestPasswordReset(email: string): Promise<ForgotPasswordResponse> {
  return request<ForgotPasswordResponse>('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string): Promise<ResetPasswordResponse> {
  return request<ResetPasswordResponse>('/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
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
  return request<UserPublic>(`/auth/users/${userId}`, {
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

// Billing
export interface BillingOrderRequest {
  payment_type: 'token_topup' | 'subscription';
  tokens?: number;
  subscription_plan?: string;
}

export interface BillingOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  razorpay_key_id: string;
}

export interface BillingVerifyRequest {
  order_id: string;
  payment_id: string;
  signature: string;
  payment_type: 'token_topup' | 'subscription';
  tokens?: number;
  subscription_plan?: string;
}

export interface BillingRecord {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_type: string;
  tokens_purchased: number | null;
  subscription_plan: string | null;
  subscription_days: number | null;
  order_id: string;
  payment_id: string | null;
  signature: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function createBillingOrder(payload: BillingOrderRequest, token: string): Promise<BillingOrderResponse> {
  return request<BillingOrderResponse>('/billing/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function verifyBillingPayment(payload: BillingVerifyRequest, token: string): Promise<BillingRecord> {
  return request<BillingRecord>('/billing/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function getBillingHistory(token: string): Promise<BillingRecord[]> {
  return request<BillingRecord[]>('/billing/history', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Inference
export interface GenerateRequest {
  prompt: string;
  max_new_tokens?: number;
  temperature?: number;
  top_k?: number;
  top_p?: number;
  repetition_penalty?: number;
}

export interface GenerateResponse {
  response: string;
}

export interface InferenceHealthResponse {
  model_loaded: boolean;
  device: string;
}

export interface ChatHistoryItem {
  id: string;
  user_id: string;
  prompt: string;
  response: string;
  tokens_used: number;
  created_at: string;
}

export interface ChatHistoryResponse {
  history: ChatHistoryItem[];
}

export async function generateInference(payload: GenerateRequest, token: string): Promise<GenerateResponse> {
  return request<GenerateResponse>('/inference/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function getInferenceHealth(): Promise<InferenceHealthResponse> {
  return request<InferenceHealthResponse>('/inference/health', {
    method: 'GET',
  });
}

export async function getChatHistory(token: string): Promise<ChatHistoryResponse> {
  return request<ChatHistoryResponse>('/inference/history', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
