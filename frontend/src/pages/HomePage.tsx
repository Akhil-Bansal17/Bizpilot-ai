import React from 'react';
import { HealthStatus } from '../components/HealthStatus';
import { ShieldCheck, Layers, Cpu } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-heading text-white tracking-tight">
          BizPilot AI Foundation Shell
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl">
          Phase 1 project foundation initialized. Repository layout, backend FastAPI micro-framework scaffold, database connectivity, typed API layer, and containerization are active.
        </p>
      </div>

      {/* Health Status Component */}
      <HealthStatus />

      {/* Architectural Principles Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 w-fit mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold font-heading text-slate-100">Modular Monolith</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Clean internal boundaries for API, domain logic, database, analytics, forecasting, recommendations, and AI copilot.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold font-heading text-slate-100">Deterministic Truth</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            LLM is never the source of business facts. Business metrics are calculated deterministically before LLM reasoning.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold font-heading text-slate-100">Evidence Pipeline</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Analytics & ML engines produce Evidence Packages that feed into tool-calling LLM copilot capabilities.
          </p>
        </div>
      </div>
    </div>
  );
};
