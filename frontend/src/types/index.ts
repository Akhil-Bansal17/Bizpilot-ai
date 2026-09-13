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
