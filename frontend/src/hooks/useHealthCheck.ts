import { useEffect } from 'react';
import { useHealthStore } from '../store/useHealthStore';

export function useHealthCheck(autoCheck: boolean = true) {
  const { backend, database, status, errorMessage, lastChecked, checkHealth } = useHealthStore();

  useEffect(() => {
    if (autoCheck && status === 'idle') {
      checkHealth();
    }
  }, [autoCheck, status, checkHealth]);

  return {
    backend,
    database,
    status,
    errorMessage,
    lastChecked,
    refreshHealth: checkHealth,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    isDegraded: status === 'degraded',
  };
}
