import React from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Database, Server, Activity } from 'lucide-react';
import { useHealthCheck } from '../hooks/useHealthCheck';
import { formatTimestamp } from '../utils';

export const HealthStatus: React.FC = () => {
  const { backend, database, status, errorMessage, lastChecked, refreshHealth, isLoading } = useHealthCheck();

  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl border border-slate-800 transition-all duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-500">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-heading text-slate-100">System Infrastructure Health</h2>
            <p className="text-xs text-slate-400">Phase 1 Foundation Smoke Test</p>
          </div>
        </div>

        <button
          onClick={refreshHealth}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all duration-200 disabled:opacity-50"
          title="Refresh health status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-500' : ''}`} />
          <span>{isLoading ? 'Checking...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Loading State */}
      {status === 'loading' && (
        <div className="space-y-4 py-4 animate-pulse">
          <div className="h-16 bg-slate-800/50 rounded-xl"></div>
          <div className="h-16 bg-slate-800/50 rounded-xl"></div>
        </div>
      )}

      {/* Success State */}
      {status === 'success' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Backend Card */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/30 flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-slate-100">Backend API</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ONLINE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{backend?.service || 'bizpilot-ai-backend'}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">v{backend?.version || '0.1.0'}</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>

            {/* Database Card */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/30 flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-slate-100">PostgreSQL DB</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      CONNECTED
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Status: {database?.database || 'reachable'}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pool active & ping responsive</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* Degraded State */}
      {status === 'degraded' && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-300">System Degraded — Database Unreachable</h4>
            <p className="text-xs text-amber-200/80 mt-1">{errorMessage || 'Backend service is online, but database connection could not be verified.'}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-200">
          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-rose-300">Backend Connection Error</h4>
            <p className="text-xs text-rose-200/80 mt-1">{errorMessage || 'Unable to connect to the BizPilot AI FastAPI backend server.'}</p>
            <p className="text-[11px] text-rose-300/60 mt-2">Ensure FastAPI server is running on http://localhost:8000</p>
          </div>
        </div>
      )}

      {/* Footer Meta */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
        <span>Endpoints: <code className="text-slate-400">/api/v1/health</code> & <code className="text-slate-400">/api/v1/health/db</code></span>
        <span>Last checked: {formatTimestamp(lastChecked)}</span>
      </div>
    </div>
  );
};
