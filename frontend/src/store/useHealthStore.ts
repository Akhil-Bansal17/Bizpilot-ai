import { create } from 'zustand';
import { api, ApiError } from '../api/client';
import { HealthState } from '../types';

interface HealthStore extends HealthState {
  checkHealth: () => Promise<void>;
  reset: () => void;
}

const initialState: HealthState = {
  backend: null,
  database: null,
  status: 'idle',
  errorMessage: null,
  lastChecked: null,
};

export const useHealthStore = create<HealthStore>((set) => ({
  ...initialState,

  checkHealth: async () => {
    set({ status: 'loading', errorMessage: null });
    const now = new Date().toISOString();

    try {
      // Execute health checks in parallel
      const [backendRes, dbRes] = await Promise.allSettled([
        api.getHealth(),
        api.getDBHealth(),
      ]);

      const backendData = backendRes.status === 'fulfilled' ? backendRes.value : null;
      const dbData = dbRes.status === 'fulfilled' ? dbRes.value : null;
      let overallStatus: HealthState['status'] = 'success';
      let errorMsg: string | null = null;

      if (backendRes.status === 'rejected') {
        overallStatus = 'error';
        const err = backendRes.reason;
        errorMsg = err instanceof ApiError ? err.message : 'Failed to connect to backend service';
      } else if (dbRes.status === 'rejected') {
        overallStatus = 'degraded';
        const err = dbRes.reason;
        errorMsg = err instanceof ApiError ? err.message : 'Database is currently unreachable';
      } else if (dbData?.status === 'degraded') {
        overallStatus = 'degraded';
        errorMsg = 'Database connection status is degraded';
      }

      set({
        backend: backendData,
        database: dbData,
        status: overallStatus,
        errorMessage: errorMsg,
        lastChecked: now,
      });
    } catch (err) {
      set({
        status: 'error',
        errorMessage: err instanceof Error ? err.message : 'An unexpected error occurred during health check',
        lastChecked: now,
      });
    }
  },

  reset: () => set(initialState),
}));
