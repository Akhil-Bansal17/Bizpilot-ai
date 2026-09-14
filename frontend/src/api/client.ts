import {
  HealthStatusResponse,
  DBHealthStatusResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  UserProfileResponse,
  Business,
  BusinessCreateData,
  BusinessUpdateData,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export class ApiError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

let onUnauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedCallback = (cb: () => void) => {
  onUnauthorizedCallback = cb;
};

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('bizpilot_token');
  const currentBusinessId = localStorage.getItem('bizpilot_business_id');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (currentBusinessId) {
    headers['X-Business-ID'] = currentBusinessId;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }

      const errorMessage =
        data?.detail || data?.error?.message || `Request failed with status ${response.status}`;
      const errorCode = data?.error?.code || 'request_failed';
      throw new ApiError(errorMessage, response.status, errorCode);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error connecting to backend API',
      0,
      'network_error'
    );
  }
}

export const api = {
  getHealth: () => request<HealthStatusResponse>('/api/v1/health'),
  getDBHealth: () => request<DBHealthStatusResponse>('/api/v1/health/db'),
  
  // Auth API
  register: (data: RegisterData) =>
    request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (credentials: LoginCredentials) =>
    request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => request<UserProfileResponse>('/api/v1/auth/me'),

  // Business API
  getBusinesses: () => request<Business[]>('/api/v1/businesses'),

  getBusinessById: (businessId: string) => request<Business>(`/api/v1/businesses/${businessId}`),

  createBusiness: (data: BusinessCreateData) =>
    request<Business>('/api/v1/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateBusiness: (businessId: string, data: BusinessUpdateData) =>
    request<Business>(`/api/v1/businesses/${businessId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
