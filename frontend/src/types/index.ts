export interface HealthStatusResponse {
  status: string;
  service: string;
  version: string;
}

export interface DBHealthStatusResponse {
  status: string;
  database: string;
}

export type HealthStateStatus = 'idle' | 'loading' | 'success' | 'error' | 'degraded';

export interface HealthState {
  backend: HealthStatusResponse | null;
  database: DBHealthStatusResponse | null;
  status: HealthStateStatus;
  errorMessage: string | null;
  lastChecked: string | null;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  last_login_at?: string | null;
}

export interface Business {
  id: string;
  owner_user_id: string;
  name: string;
  business_type: string;
  currency: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role?: string | null;
}

export interface UserProfileResponse extends User {
  businesses: Business[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  selected_business?: Business | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  business_name?: string;
  currency?: string;
  timezone?: string;
}

export interface BusinessCreateData {
  name: string;
  business_type?: string;
  currency?: string;
  timezone?: string;
}

export interface BusinessUpdateData {
  name?: string;
  business_type?: string;
  currency?: string;
  timezone?: string;
  is_active?: boolean;
}
